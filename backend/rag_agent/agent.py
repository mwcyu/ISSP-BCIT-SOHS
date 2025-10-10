"""
Core agent logic for the Clinical Feedback Helper
Orchestrates the conversation flow and feedback collection process
"""
from typing import Optional, Dict, Any
from langchain_core.messages import HumanMessage, AIMessage
from .models import (
    FeedbackSession, 
    SessionState, 
    StandardName, 
    StandardFeedback,
    FeedbackQuality,
    FinalReport
)
from .chains import FeedbackChains, parse_synthesis_output
from .vectorstore import KnowledgeBase
from .config import BCCNM_STANDARDS
import uuid


class ClinicalFeedbackAgent:
    """Main agent for managing feedback collection sessions"""
    
    def __init__(self):
        self.kb = KnowledgeBase()
        self.kb.initialize_vectorstore()
        self.chains = FeedbackChains(self.kb)
        
        # Initialize all chains
        self.conversation_chain = self.chains.create_conversation_chain()
        self.evaluation_chain = self.chains.create_evaluation_chain()
        self.privacy_chain = self.chains.create_privacy_check_chain()
        self.synthesis_chain = self.chains.create_synthesis_chain()
        self.probe_chain = self.chains.create_probe_question_chain()
        self.intro_chain = self.chains.create_introduction_chain()
        self.standard_intro_chain = self.chains.create_standard_introduction_chain()
        self.final_report_chain = self.chains.create_final_report_chain()
        
        self.current_session: Optional[FeedbackSession] = None
    
    def start_session(self) -> tuple[str, str]:
        """Start a new feedback session
        
        Returns:
            tuple: (session_id, welcome_message)
        """
        session_id = str(uuid.uuid4())
        self.current_session = FeedbackSession(
            session_id=session_id,
            state=SessionState.INITIALIZED
        )
        
        # Generate welcome message
        welcome = self.intro_chain.invoke({})
        self.current_session.add_turn("assistant", welcome)
        
        # Automatically start first standard
        first_standard = self.current_session.get_next_standard()
        self.current_session.current_standard = first_standard
        self.current_session.state = SessionState.COLLECTING_FEEDBACK
        
        # Generate introduction for first standard
        standard_name = BCCNM_STANDARDS[first_standard.value]['full_name']
        standard_intro = self.standard_intro_chain.invoke({
            "standard_name": standard_name
        })
        
        self.current_session.add_turn("assistant", standard_intro)
        
        full_message = f"{welcome}\n\n{standard_intro}"
        
        return session_id, full_message
    
    def process_message(self, user_message: str) -> str:
        """Process a user message and return response
        
        Args:
            user_message: Message from the preceptor
            
        Returns:
            str: Agent's response
        """
        if self.current_session is None:
            return "Error: No active session. Please start a new session."
        
        # Add user message to history
        self.current_session.add_turn("preceptor", user_message)
        
        # Check for privacy concerns
        privacy_result = self.privacy_chain.invoke({"text": user_message})
        if not privacy_result.is_safe:
            response = self._handle_privacy_violation(privacy_result.explanation)
            self.current_session.add_turn("assistant", response)
            return response
        
        # Route based on current state
        if self.current_session.state == SessionState.COLLECTING_FEEDBACK:
            response = self._handle_feedback_collection(user_message)
        elif self.current_session.state == SessionState.CONFIRMING_STANDARD:
            response = self._handle_confirmation(user_message)
        elif self.current_session.state == SessionState.COMPLETED:
            response = self._handle_post_completion(user_message)
        else:
            response = "I'm not sure how to proceed. Let's continue with the feedback."
        
        self.current_session.add_turn("assistant", response)
        return response
    
    def _handle_feedback_collection(self, feedback: str) -> str:
        """Handle initial feedback collection for current standard"""
        
        current_standard = self.current_session.current_standard
        standard_info = BCCNM_STANDARDS[current_standard.value]
        
        # Evaluate feedback quality
        evaluation = self.evaluation_chain.invoke({
            "feedback": feedback,
            "standard_name": standard_info['full_name']
        })
        
        # Store initial feedback
        if current_standard not in self.current_session.feedback_collected:
            self.current_session.feedback_collected[current_standard] = StandardFeedback(
                standard_name=current_standard,
                raw_feedback=feedback,
                quality_evaluation=evaluation
            )
        else:
            # Append to existing feedback
            existing = self.current_session.feedback_collected[current_standard]
            existing.raw_feedback += f"\n\n{feedback}"
            existing.quality_evaluation = evaluation
        
        # Decide next action based on quality
        if evaluation.quality == FeedbackQuality.SPECIFIC_WITH_EXAMPLE:
            # Good quality - generate summary and suggestion
            return self._synthesize_and_confirm(current_standard, feedback)
        else:
            # Need more information - probe
            probe_question = self.probe_chain.invoke({
                "standard_name": standard_info['full_name'],
                "feedback": feedback,
                "evaluation_reason": evaluation.reasoning,
                "quality": evaluation.quality.value
            })
            return probe_question
    
    def _synthesize_and_confirm(self, standard: StandardName, feedback: str) -> str:
        """Generate summary and suggestion, then ask for confirmation"""
        
        standard_info = BCCNM_STANDARDS[standard.value]
        
        # Generate synthesis
        synthesis_output = self.synthesis_chain.invoke({
            "standard_name": standard_info['full_name'],
            "feedback": feedback
        })
        
        parsed = parse_synthesis_output(synthesis_output)
        
        # Update feedback record
        feedback_record = self.current_session.feedback_collected[standard]
        feedback_record.summary = parsed['summary']
        feedback_record.suggestion = parsed['suggestion']
        
        # Change state to confirming
        self.current_session.state = SessionState.CONFIRMING_STANDARD
        
        # Format confirmation message
        confirmation_msg = f"""Thank you for that detailed feedback. Based on our discussion, here is what I've captured:

**Summary for {standard_info['full_name']}:**
{parsed['summary']}

**Suggested Action for Student:**
{parsed['suggestion']}

Does this accurately capture your feedback, or would you like to make any changes?"""
        
        return confirmation_msg
    
    def _handle_confirmation(self, response: str) -> str:
        """Handle preceptor's confirmation or revision request"""
        
        response_lower = response.lower()
        
        # Check if preceptor wants to revise
        if any(word in response_lower for word in ['change', 'revise', 'different', 'no', 'incorrect']):
            # Go back to collecting feedback
            self.current_session.state = SessionState.COLLECTING_FEEDBACK
            return "I understand. Please provide the feedback you'd like me to capture instead, and I'll update the summary."
        
        # Assume confirmation if positive indicators
        if any(word in response_lower for word in ['yes', 'correct', 'good', 'accurate', 'fine', 'ok', 'looks good']):
            # Mark as confirmed
            current_standard = self.current_session.current_standard
            self.current_session.feedback_collected[current_standard].confirmed = True
            
            # Move to next standard
            self.current_session.advance_to_next_standard()
            
            if self.current_session.is_complete():
                # All standards complete
                return self._request_email()
            else:
                # Introduce next standard
                next_standard = self.current_session.current_standard
                standard_info = BCCNM_STANDARDS[next_standard.value]
                
                intro = self.standard_intro_chain.invoke({
                    "standard_name": standard_info['full_name']
                })
                
                return f"Great! Let's move on.\n\n{intro}"
        
        # Unclear response - ask for clarification
        return "Just to confirm - does this summary accurately capture your feedback? Please respond with 'yes' to continue, or let me know what you'd like to change."
    
    def _handle_privacy_violation(self, explanation: str) -> str:
        """Handle detected PII in feedback"""
        return f"""I noticed that your response may contain personally identifiable information (PII). 

For privacy reasons, please rephrase your feedback without including:
- Specific names (patient or student)
- Facility names or locations
- Specific dates
- Medical record numbers or room numbers

You can refer to 'the student' and 'the patient' instead. Please provide your feedback again."""
    
    def _request_email(self) -> str:
        """Request preceptor's email for final report"""
        message = self.final_report_chain.invoke({})
        return message
    
    def _handle_post_completion(self, message: str) -> str:
        """Handle messages after session completion"""
        
        # Check if message contains email
        if '@' in message:
            # Extract email (simple approach)
            words = message.split()
            email = next((word for word in words if '@' in word), None)
            
            if email:
                self.current_session.preceptor_email = email.strip('.,;:')
                return f"Thank you! I've recorded your email as {self.current_session.preceptor_email}. Your feedback report will be compiled and sent shortly. Is there anything else you'd like to add or modify?"
        
        return "Thank you for your time today. Your feedback has been recorded. If you have any questions or need to make changes, please let me know."
    
    def generate_final_report(self) -> FinalReport:
        """Generate the final feedback report"""
        
        if self.current_session is None or not self.current_session.is_complete():
            raise ValueError("Cannot generate report: session not complete")
        
        standards_feedback = {}
        
        for standard, feedback in self.current_session.feedback_collected.items():
            standard_info = BCCNM_STANDARDS[standard.value]
            standards_feedback[standard_info['full_name']] = {
                "summary": feedback.summary or "",
                "suggestion": feedback.suggestion or "",
                "raw_feedback": feedback.raw_feedback
            }
        
        report = FinalReport(
            session_id=self.current_session.session_id,
            standards_feedback=standards_feedback
        )
        
        return report
    
    def get_session_state(self) -> Optional[Dict[str, Any]]:
        """Get current session state for debugging/monitoring"""
        if self.current_session is None:
            return None
        
        return {
            "session_id": self.current_session.session_id,
            "state": self.current_session.state.value,
            "current_standard": self.current_session.current_standard.value if self.current_session.current_standard else None,
            "progress": f"{self.current_session.current_standard_index}/4",
            "standards_completed": list(self.current_session.feedback_collected.keys())
        }
