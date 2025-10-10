"""
Nursing Preceptor Feedback Chatbot - Intelligent Adaptive Version
Features AI reasoning checkpoints and adaptive questioning
"""

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional
import json
from datetime import datetime
import csv
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ============================================================================
# PYDANTIC MODELS FOR STRUCTURED AI ANALYSIS
# ============================================================================

class ResponseAnalysis(BaseModel):
    """AI analysis of preceptor's response"""
    belongs_to_current_standard: bool = Field(description="Does response relate to current standard being discussed?")
    belongs_to_other_standard: Optional[str] = Field(description="If not current, which standard does it belong to? (e.g., 'Standard 2')")
    informativeness_score: int = Field(description="How informative is the response? 1-5 scale (1=vague, 5=detailed with examples)")
    has_specific_examples: bool = Field(description="Does the response include specific examples or scenarios?")
    key_points: List[str] = Field(description="List of 2-4 key points from the response")
    reasoning: str = Field(description="Brief explanation of the analysis")


class ImprovementAnalysis(BaseModel):
    """AI analysis of improvement suggestions"""
    is_sufficient: bool = Field(description="Is the preceptor's improvement suggestion specific and actionable?")
    key_suggestions: List[str] = Field(description="List of improvement areas mentioned")
    reasoning: str = Field(description="Brief explanation of why sufficient or not")


# ============================================================================
# BCCNM STANDARDS DATA
# ============================================================================

STANDARDS_DATA = {
    "Standard 1": {
        "name": "Professional Responsibility and Accountability",
        "description": "This standard focuses on how the nursing student maintains professional standards, recognizes their scope of practice, manages clinical safety, and demonstrates professional conduct.",
        "areas": [
            "Professional accountability, honesty and transparency",
            "Recognition of scope of practice and personal limitations",
            "Clinical safety and risk management",
            "Evidence-informed practice and self-directed learning",
            "Professional conduct and respectful interactions",
            "Self-care practices"
        ],
        "top_prompts": [
            "Can you provide an example of when the learner appropriately sought assistance?",
            "How does the learner demonstrate awareness of their scope of practice?",
            "How does the learner respond to feedback and incorporate it into their practice?",
            "Can you describe a situation where the learner identified a potential or actual safety concern?"
        ],
        "additional_prompts": [
            "How well does the learner recognize situations that require consultation or escalation?",
            "How does the learner manage stress during clinical practice?",
            "What examples show the learner's understanding of others' roles and responsibilities?",
            "How effectively does the learner communicate with different members of the team?",
            "Does the learner come to you with a plan, or do you find that you need to suggest the plan for them?",
            "What evidence shows the learner's commitment to ongoing professional development?",
            "Are there any concerns around professionalism?"
        ]
    },
    "Standard 2": {
        "name": "Knowledge-Based Practice",
        "description": "This standard evaluates how the nursing student applies clinical knowledge, demonstrates critical thinking and clinical reasoning, and provides evidence-informed patient care.",
        "areas": [
            "Clinical competence and skill application",
            "Critical thinking, clinical reasoning and clinical judgment",
            "Knowledge synthesis and application",
            "Individualized patient care and education",
            "Pharmacology knowledge and safe medication practice",
            "Comprehensive reporting and accurate documentation"
        ],
        "top_prompts": [
            "How thorough and comprehensive are the learner's nursing assessments?",
            "Describe the learner's clinical judgment in responding to changing patient conditions.",
            "How well does the learner use assessment findings to inform their clinical decisions?",
            "Can you describe a situation where the learner modified a care plan based on patient response?"
        ],
        "additional_prompts": [
            "Can you describe a situation where the learner prioritized individual's receiving care?",
            "How quickly does the learner recognize and act on urgent safety concerns?",
            "How well did the learner tailor their practice to specific individuals with a focus on their needs?",
            "Can you provide an example of the learner identifying patterns or connections in data?",
            "How does the learner evaluate whether nursing interventions are effective?",
            "Can you describe how the learner anticipates potential complications or risks?",
            "What examples show the learner's understanding of drug actions, interactions, and side effects?",
            "How does the learner adapt their teaching to patients' understanding levels?",
            "Describe the learner's ability to apply theoretical concepts to clinical situations.",
            "Describe the learner's ability to communicate patient information in written and verbal reports."
        ]
    },
    "Standard 3": {
        "name": "Client-Focused Provision of Service",
        "description": "This standard assesses how the nursing student collaborates with the healthcare team, coordinates care, manages time effectively, and advocates for patients.",
        "areas": [
            "Interprofessional collaboration",
            "Team communication and conflict resolution",
            "Anticipatory planning and continuity of care",
            "Time management and organization",
            "Delegation and patient advocacy"
        ],
        "top_prompts": [
            "Can you describe the learner's collaborative approach with other healthcare professionals?",
            "How well does the learner balance multiple patient needs and competing demands?",
            "Can you provide examples of the learner delegating tasks appropriately?",
            "Can you describe how the learner involves patients in decisions about their care?"
        ],
        "additional_prompts": [
            "Describe the learner's approach to resolving conflicts or disagreements within the team.",
            "Can you provide examples of the learner consulting with team members to adjust care plans?",
            "Can you describe the learner's approach to coordinating multiple services or interventions?",
            "Describe the learner's approach to following up on delegated tasks.",
            "Can you describe situations where the learner connected patients with appropriate resources?"
        ]
    },
    "Standard 4": {
        "name": "Ethical Practice",
        "description": "This standard examines how the nursing student upholds ethical principles, maintains professional boundaries, respects diversity, and advocates for vulnerable patients.",
        "areas": [
            "Confidentiality maintenance and privacy protection",
            "Equitable care delivery and respect for diversity",
            "Therapeutic boundaries and professional relationship limits",
            "Identification of ethical issues",
            "Anti-oppressive practices and advocacy",
            "Patient autonomy and informed consent"
        ],
        "top_prompts": [
            "How does the learner demonstrate respect for patient privacy and confidentiality?",
            "How does the learner establish and maintain appropriate professional boundaries?",
            "How does the learner advocate for patients experiencing vulnerable circumstances?",
            "Describe situations where the learner identified moral or ethical concerns. How did they respond?"
        ],
        "additional_prompts": [
            "Describe the learner's ability to separate personal values from professional practice.",
            "How does the learner use therapeutic communication to build relationships with patients?",
            "Describe the learner's approach to caring for marginalized or underserved patients.",
            "How does the learner empower patients to participate in their health decisions?",
            "How well does the learner adapt their approach for patients with cognitive or physical limitations?",
            "How does the learner create an environment where patients feel culturally safe?"
        ]
    }
}


# ============================================================================
# INTELLIGENT CHATBOT CLASS
# ============================================================================

class IntelligentNursingFeedbackBot:
    """
    Enhanced chatbot with AI reasoning checkpoints and adaptive questioning.
    """
    
    def __init__(self, api_key: str):
        """Initialize the chatbot."""
        
        # Main conversation model
        self.llm = ChatOpenAI(
            temperature=0.7,
            model_name="gpt-3.5-turbo",
            openai_api_key=api_key
        )
        
        # Analysis model (for structured reasoning)
        self.analysis_llm = ChatOpenAI(
            temperature=0.2,  # Lower temp for more consistent analysis
            model_name="gpt-3.5-turbo",
            openai_api_key=api_key
        )
        
        # Feedback storage
        self.feedback_data = {
            "student_name": "",
            "preceptor_name": "",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "clinical_setting": "",
            "standards": {}
        }
        
        # Conversation state
        self.current_standard = None
        self.conversation_phase = "greeting"  # greeting, collecting_feedback, improvement, transition
        self.standards_completed = []
        self.conversation_history = []
        self.example_requests_count = 0  # Track how many times we've asked for examples
        
        # Token usage tracking
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_tokens = 0
        self.api_calls = []
        
        # Initialize all standards
        for std_num in STANDARDS_DATA.keys():
            self.feedback_data["standards"][std_num] = {
                "responses": [],
                "summary": "",
                "improvement_strategies": [],
                "preceptor_suggestions": "",
                "ai_suggestions": []
            }
    
    def start_conversation(self) -> str:
        """Begin the feedback session."""
        greeting = """Hello! Thank you for taking the time to provide feedback on your nursing student.

I'll help you give structured feedback based on the BCCNM 4 Standards of Clinical Practice. This will take about 10-15 minutes.

First, could you please tell me:
1. The student's name
2. Your name (preceptor)
3. The clinical setting (e.g., ICU, Med-Surg, Emergency)

You can share all three at once or one at a time."""
        
        self.conversation_history.append({"role": "assistant", "content": greeting})
        return greeting
    
    def process_message(self, user_input: str) -> str:
        """Main message processing with intelligent routing."""
        
        self.conversation_history.append({"role": "user", "content": user_input})
        
        # Handle initial information gathering
        if self.conversation_phase == "greeting":
            response = self._handle_initial_info(user_input)
        
        # Handle standard-specific feedback
        elif self.conversation_phase == "collecting_feedback":
            response = self._handle_feedback_collection(user_input)
        
        # Handle improvement suggestions
        elif self.conversation_phase == "improvement":
            response = self._handle_improvement_phase(user_input)
        
        # Handle transitions between standards
        elif self.conversation_phase == "transition":
            response = self._handle_transition(user_input)
        
        else:
            response = "I'm not sure what to ask next. Type 'help' for options."
        
        self.conversation_history.append({"role": "assistant", "content": response})
        return response
    
    def _handle_initial_info(self, user_input: str) -> str:
        """Extract initial information about student, preceptor, and setting."""
        
        lower_input = user_input.lower()
        
        # Try to extract names and setting
        if not self.feedback_data["student_name"]:
            # Simple extraction - in production, use more sophisticated NLP
            self.feedback_data["student_name"] = "Extracted from input"  # Placeholder
            self.feedback_data["preceptor_name"] = "Extracted from input"
            self.feedback_data["clinical_setting"] = "Extracted from input"
        
        # Move to first standard
        self.conversation_phase = "collecting_feedback"
        self.current_standard = "Standard 1"
        
        return self._introduce_standard("Standard 1")
    
    def _introduce_standard(self, standard_num: str) -> str:
        """Introduce a standard with description and key questions."""
        
        std = STANDARDS_DATA[standard_num]
        
        intro = f"""
{'='*70}
{standard_num}: {std['name']}
{'='*70}

{std['description']}

KEY FOCUS AREAS:
"""
        
        for i, area in enumerate(std['areas'][:4], 1):
            intro += f"  {i}. {area}\n"
        
        intro += f"\nKEY PROMPTING QUESTIONS:\n"
        
        for i, prompt in enumerate(std['top_prompts'], 1):
            intro += f"  {i}. {prompt}\n"
        
        intro += f"\n{'='*70}\n"
        intro += "\nPlease share your observations about the learner's performance in this area. Feel free to address any or all of the questions above."
        
        return intro
    
    def _track_token_usage(self, response, operation_name: str):
        """Track and display token usage for API calls."""
        input_tokens = 0
        output_tokens = 0
        total_tokens = 0
        
        # Handle different response formats
        if hasattr(response, 'usage_metadata'):
            usage = response.usage_metadata
            if hasattr(usage, 'input_tokens'):
                input_tokens = usage.input_tokens
                output_tokens = usage.output_tokens
                total_tokens = usage.total_tokens
            elif isinstance(usage, dict):
                input_tokens = usage.get('input_tokens', 0)
                output_tokens = usage.get('output_tokens', 0)
                total_tokens = usage.get('total_tokens', 0)
        elif hasattr(response, 'usage'):
            usage = response.usage
            if hasattr(usage, 'input_tokens'):
                input_tokens = usage.input_tokens
                output_tokens = usage.output_tokens
                total_tokens = usage.total_tokens
            elif isinstance(usage, dict):
                input_tokens = usage.get('input_tokens', 0)
                output_tokens = usage.get('output_tokens', 0)
                total_tokens = usage.get('total_tokens', 0)
        elif isinstance(response, dict) and 'usage' in response:
            usage = response['usage']
            input_tokens = usage.get('input_tokens', 0)
            output_tokens = usage.get('output_tokens', 0)
            total_tokens = usage.get('total_tokens', 0)
        
        # Only track if we found token usage data
        if total_tokens > 0:
            # Update totals
            self.total_input_tokens += input_tokens
            self.total_output_tokens += output_tokens
            self.total_tokens += total_tokens
            
            # Store API call info
            self.api_calls.append({
                "operation": operation_name,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": total_tokens
            })
            
            # Display token usage
            print(f"\n🔢 TOKEN USAGE - {operation_name}:")
            print(f"   Input tokens: {input_tokens}")
            print(f"   Output tokens: {output_tokens}")
            print(f"   Total tokens: {total_tokens}")
            print(f"   Running total: {self.total_tokens}")
            print("-" * 50)
        else:
            # Fallback: try to estimate tokens (rough approximation)
            if hasattr(response, 'content'):
                content = response.content
            elif isinstance(response, dict) and 'content' in response:
                content = response['content']
            else:
                content = str(response)
            
            # Rough estimation: ~4 characters per token
            estimated_tokens = len(content) // 4
            if estimated_tokens > 0:
                self.total_tokens += estimated_tokens
                self.api_calls.append({
                    "operation": f"{operation_name} (estimated)",
                    "input_tokens": estimated_tokens // 2,
                    "output_tokens": estimated_tokens // 2,
                    "total_tokens": estimated_tokens
                })
                
                print(f"\n🔢 TOKEN USAGE - {operation_name} (estimated):")
                print(f"   Estimated tokens: {estimated_tokens}")
                print(f"   Running total: {self.total_tokens}")
                print("-" * 50)
    
    def _handle_feedback_collection(self, user_input: str) -> str:
        """Handle feedback with AI analysis and adaptive follow-up."""
        
        # Store the raw response
        self.feedback_data["standards"][self.current_standard]["responses"].append({
            "raw_feedback": user_input,
            "timestamp": datetime.now().isoformat()
        })
        
        # AI REASONING CHECKPOINT: Analyze the response
        analysis = self._analyze_response(user_input, self.current_standard)
        
        # Store analysis
        self.feedback_data["standards"][self.current_standard]["responses"][-1]["analysis"] = analysis.model_dump()
        
        response = ""
        
        # Check if response belongs to different standard
        if not analysis.belongs_to_current_standard and analysis.belongs_to_other_standard:
            # Extract the standard key (e.g., "Standard 4" from "Standard 4: Ethical Practice")
            other_standard_key = analysis.belongs_to_other_standard.split(':')[0].strip()
            if other_standard_key in STANDARDS_DATA:
                response += f"Thank you for that feedback! I noticed this relates more to {other_standard_key} ({STANDARDS_DATA[other_standard_key]['name']}). I'll note that there, and we'll cover it in more detail when we get to that standard.\n\n"
                # Store in correct standard too
                if other_standard_key in self.feedback_data["standards"]:
                    self.feedback_data["standards"][other_standard_key]["responses"].append({
                        "raw_feedback": user_input,
                        "note": "Mentioned during another standard",
                        "timestamp": datetime.now().isoformat()
                    })
        
        # Acknowledge the response
        response += "Thank you for that feedback. "
        
        # Check for skip commands or refusal to provide examples
        lower_input = user_input.lower()
        if "skip" in lower_input or "not really" in lower_input or "no" in lower_input:
            # User wants to skip or can't provide examples - move to summary
            response += "No problem! Let me summarize what you've shared so far.\n\n"
            
            # Generate summary
            summary = self._generate_standard_summary(self.current_standard)
            self.feedback_data["standards"][self.current_standard]["summary"] = summary
            
            response += f"SUMMARY OF YOUR FEEDBACK:\n{summary}\n\n"
            response += f"{'='*70}\n"
            response += "Now, thinking about areas for growth: How do you think the student could improve in this area? What specific strategies or actions would be helpful?"
            
            # Move to improvement phase
            self.conversation_phase = "improvement"
            self.example_requests_count = 0  # Reset counter
            return response
        
        # ADAPTIVE FOLLOW-UP based on informativeness
        if analysis.informativeness_score <= 2:
            # Response was not very informative
            self.example_requests_count += 1
            
            # Prevent infinite loops - if we've asked for examples 3 times, move on
            if self.example_requests_count >= 3:
                response += "I understand you may not have specific examples readily available. Let me summarize what you've shared so far.\n\n"
                
                # Generate summary
                summary = self._generate_standard_summary(self.current_standard)
                self.feedback_data["standards"][self.current_standard]["summary"] = summary
                
                response += f"SUMMARY OF YOUR FEEDBACK:\n{summary}\n\n"
                response += f"{'='*70}\n"
                response += "Now, thinking about areas for growth: How do you think the student could improve in this area? What specific strategies or actions would be helpful?"
                
                # Move to improvement phase
                self.conversation_phase = "improvement"
                self.example_requests_count = 0  # Reset counter
            else:
                response += "To help me understand better, could you provide a bit more detail? "
                
                if not analysis.has_specific_examples:
                    response += "A specific example or situation would be really helpful.\n\n"
                    response += "Or, would you like me to ask you some more specific prompting questions? (yes/no)"
                else:
                    response += "\nOr, would you like me to ask you some more specific prompting questions? (yes/no)"
        
        elif not analysis.has_specific_examples:
            # Informative but lacks examples
            self.example_requests_count += 1
            
            # Prevent infinite loops
            if self.example_requests_count >= 2:
                response += "That's helpful information. Let me summarize what you've shared.\n\n"
                
                # Generate summary
                summary = self._generate_standard_summary(self.current_standard)
                self.feedback_data["standards"][self.current_standard]["summary"] = summary
                
                response += f"SUMMARY OF YOUR FEEDBACK:\n{summary}\n\n"
                response += f"{'='*70}\n"
                response += "Now, thinking about areas for growth: How do you think the student could improve in this area? What specific strategies or actions would be helpful?"
                
                # Move to improvement phase
                self.conversation_phase = "improvement"
                self.example_requests_count = 0  # Reset counter
            else:
                response += "That's helpful. Could you provide a specific example or situation that illustrates this?"
        
        else:
            # Good response with examples - move to summary and improvement
            response += "That's really helpful, thank you!\n\n"
            
            # Generate summary
            summary = self._generate_standard_summary(self.current_standard)
            self.feedback_data["standards"][self.current_standard]["summary"] = summary
            
            response += f"SUMMARY OF YOUR FEEDBACK:\n{summary}\n\n"
            response += f"{'='*70}\n"
            response += "Now, thinking about areas for growth: How do you think the student could improve in this area? What specific strategies or actions would be helpful?"
            
            # Move to improvement phase
            self.conversation_phase = "improvement"
            self.example_requests_count = 0  # Reset counter
        
        return response
    
    def _handle_improvement_phase(self, user_input: str) -> str:
        """Handle improvement suggestions with AI analysis."""
        
        # Store preceptor's suggestions
        self.feedback_data["standards"][self.current_standard]["preceptor_suggestions"] = user_input
        
        # AI REASONING CHECKPOINT: Analyze improvement suggestions
        analysis = self._analyze_improvement_suggestions(user_input)
        
        response = "Thank you for those suggestions. "
        
        if not analysis.is_sufficient:
            # Provide AI-generated suggestions
            ai_suggestions = self._generate_improvement_suggestions(self.current_standard)
            self.feedback_data["standards"][self.current_standard]["ai_suggestions"] = ai_suggestions
            
            response += "Here are some additional evidence-based strategies that might help:\n\n"
            for i, suggestion in enumerate(ai_suggestions, 1):
                response += f"{i}. {suggestion}\n"
            
            response += "\nWould you like to add any of these to your recommendations, or shall we move on?"
        else:
            response += "Those are excellent, specific strategies.\n\n"
        
        # Mark standard as complete
        self.standards_completed.append(self.current_standard)
        
        # Check if more standards remain
        remaining = [s for s in STANDARDS_DATA.keys() if s not in self.standards_completed]
        
        if remaining:
            response += f"\n✓ {self.current_standard} complete! ({len(self.standards_completed)}/4 standards)\n"
            response += f"Remaining: {', '.join(remaining)}\n\n"
            response += "Would you like to continue to the next standard? (yes/no)"
            self.conversation_phase = "transition"
        else:
            response += "\n🎉 All 4 standards complete! Generating final report..."
            response = self._generate_final_report()
        
        return response
    
    def _handle_transition(self, user_input: str) -> str:
        """Handle transition between standards."""
        
        lower_input = user_input.lower()
        
        if "yes" in lower_input or "sure" in lower_input or "continue" in lower_input:
            # Move to next standard
            remaining = [s for s in STANDARDS_DATA.keys() if s not in self.standards_completed]
            if remaining:
                self.current_standard = remaining[0]
                self.conversation_phase = "collecting_feedback"
                self.example_requests_count = 0  # Reset counter for new standard
                return self._introduce_standard(self.current_standard)
        else:
            # Preceptor wants to stop
            return self._generate_final_report()
    
    def _analyze_response(self, response: str, current_standard: str) -> ResponseAnalysis:
        """AI reasoning checkpoint: Analyze preceptor's response."""
        
        parser = PydanticOutputParser(pydantic_object=ResponseAnalysis)
        
        prompt = ChatPromptTemplate.from_template(
            """You are analyzing feedback from a nurse preceptor about a nursing student.

Current Standard Being Discussed: {standard_name} - {standard_description}

Preceptor's Response: {response}

BCCNM Standards Reference:
- Standard 1: Professional Responsibility and Accountability (scope of practice, safety, professional conduct, accountability)
- Standard 2: Knowledge-Based Practice (clinical knowledge, critical thinking, assessments, care planning, pharmacology)
- Standard 3: Client-Focused Provision of Service (collaboration, time management, delegation, patient advocacy)
- Standard 4: Ethical Practice (privacy, confidentiality, professional boundaries, ethical decision-making, respect for diversity)

Analyze this response and determine:
1. Does it relate to the current standard being discussed?
2. If not, which BCCNM standard does it relate to? Return ONLY the standard key (e.g., "Standard 4", not "Standard 4: Ethical Practice")
3. How informative is it? (1=very vague, 5=detailed with specific examples)
4. Does it include specific examples or scenarios?
5. What are the key points mentioned?

Key indicators for Standard 4 (Ethical Practice):
- Privacy, confidentiality, professional boundaries
- Ethical decision-making, moral concerns
- Respect for diversity, cultural safety
- Patient autonomy, informed consent
- Anti-oppressive practices, advocacy for vulnerable patients

{format_instructions}
"""
        )
        
        std = STANDARDS_DATA[current_standard]
        
        messages = prompt.format_messages(
            standard_name=f"{current_standard}: {std['name']}",
            standard_description=std['description'],
            response=response,
            format_instructions=parser.get_format_instructions()
        )
        
        try:
            output = self.analysis_llm.invoke(messages)
            self._track_token_usage(output, f"Response Analysis - {current_standard}")
            return parser.parse(output.content)
        except:
            # Fallback if parsing fails
            return ResponseAnalysis(
                belongs_to_current_standard=True,
                belongs_to_other_standard=None,
                informativeness_score=3,
                has_specific_examples=False,
                key_points=["Feedback provided"],
                reasoning="Analysis failed, using defaults"
            )
    
    def _analyze_improvement_suggestions(self, suggestions: str) -> ImprovementAnalysis:
        """AI reasoning checkpoint: Analyze improvement suggestions."""
        
        parser = PydanticOutputParser(pydantic_object=ImprovementAnalysis)
        
        prompt = ChatPromptTemplate.from_template(
            """Analyze these improvement suggestions from a preceptor:

Suggestions: {suggestions}

Determine:
1. Are these suggestions specific and actionable? (not just "needs to improve" but actual strategies)
2. What key improvement areas are mentioned?

Good suggestions include: specific actions, timelines, resources, measurable goals
Poor suggestions: vague statements like "do better" or "needs work"

{format_instructions}
"""
        )
        
        messages = prompt.format_messages(
            suggestions=suggestions,
            format_instructions=parser.get_format_instructions()
        )
        
        try:
            output = self.analysis_llm.invoke(messages)
            self._track_token_usage(output, "Improvement Analysis")
            return parser.parse(output.content)
        except:
            return ImprovementAnalysis(
                is_sufficient=True,
                key_suggestions=[suggestions],
                reasoning="Analysis failed, accepting as-is"
            )
    
    def _generate_standard_summary(self, standard_num: str) -> str:
        """Generate AI summary of feedback for this standard."""
        
        responses = self.feedback_data["standards"][standard_num]["responses"]
        all_feedback = "\n".join([r["raw_feedback"] for r in responses])
        
        prompt = f"""Summarize this preceptor feedback about a nursing student for {standard_num}: {STANDARDS_DATA[standard_num]['name']}

Feedback: {all_feedback}

Provide a concise 2-3 sentence summary highlighting:
- Key strengths
- Areas of concern (if any)
- Overall performance level

Be specific and reference examples when mentioned."""
        
        summary = self.llm.invoke(prompt)
        self._track_token_usage(summary, f"Summary Generation - {standard_num}")
        return summary.content
    
    def _generate_improvement_suggestions(self, standard_num: str) -> List[str]:
        """Generate AI-powered improvement suggestions."""
        
        responses = self.feedback_data["standards"][standard_num]["responses"]
        all_feedback = "\n".join([r["raw_feedback"] for r in responses])
        
        prompt = f"""Based on this preceptor feedback about a nursing student's performance in {standard_num}: {STANDARDS_DATA[standard_num]['name']}

Feedback: {all_feedback}

Generate 3-4 specific, actionable improvement strategies. Each should be:
- Concrete and measurable
- Evidence-based
- Achievable for a nursing student
- Directly related to the feedback

Format as a numbered list."""
        
        suggestions_response = self.llm.invoke(prompt)
        self._track_token_usage(suggestions_response, f"Improvement Suggestions - {standard_num}")
        suggestions_text = suggestions_response.content
        
        # Parse into list
        suggestions = [s.strip() for s in suggestions_text.split('\n') if s.strip() and any(c.isdigit() for c in s[:3])]
        return suggestions[:4]
    
    def _generate_final_report(self) -> str:
        """Generate comprehensive final report."""
        
        report = f"""
{'='*70}
COMPREHENSIVE PRECEPTOR FEEDBACK REPORT
{'='*70}

Student: {self.feedback_data.get('student_name', 'N/A')}
Preceptor: {self.feedback_data.get('preceptor_name', 'N/A')}
Clinical Setting: {self.feedback_data.get('clinical_setting', 'N/A')}
Date: {self.feedback_data['date']}

Standards Completed: {len(self.standards_completed)}/4

"""
        
        for std_num in self.standards_completed:
            std_data = self.feedback_data["standards"][std_num]
            std_info = STANDARDS_DATA[std_num]
            
            report += f"\n{'='*70}\n"
            report += f"{std_num}: {std_info['name']}\n"
            report += f"{'='*70}\n\n"
            
            report += f"SUMMARY:\n{std_data['summary']}\n\n"
            
            report += f"IMPROVEMENT STRATEGIES:\n"
            if std_data['preceptor_suggestions']:
                report += f"Preceptor's Suggestions: {std_data['preceptor_suggestions']}\n\n"
            
            if std_data['ai_suggestions']:
                report += "Additional Recommendations:\n"
                for i, sug in enumerate(std_data['ai_suggestions'], 1):
                    report += f"  {i}. {sug}\n"
            
            report += "\n"
        
        report += f"\n{'='*70}\n"
        report += "Feedback session complete! Files have been saved.\n"
        report += f"{'='*70}\n"
        
        # Add token usage summary
        report += f"\n{'='*70}\n"
        report += "TOKEN USAGE SUMMARY\n"
        report += f"{'='*70}\n"
        report += f"Total API Calls: {len(self.api_calls)}\n"
        report += f"Total Input Tokens: {self.total_input_tokens:,}\n"
        report += f"Total Output Tokens: {self.total_output_tokens:,}\n"
        report += f"Total Tokens Used: {self.total_tokens:,}\n\n"
        
        report += "Breakdown by Operation:\n"
        for call in self.api_calls:
            report += f"  • {call['operation']}: {call['total_tokens']} tokens ({call['input_tokens']} in, {call['output_tokens']} out)\n"
        
        report += f"\n{'='*70}\n"
        
        # Save files
        self.export_to_json()
        self.export_to_csv()
        
        return report
    
    def export_to_json(self, filename: str = None) -> str:
        """Export to JSON."""
        if filename is None:
            filename = f"feedback_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        # Add token usage data to export
        export_data = self.feedback_data.copy()
        export_data["token_usage"] = {
            "total_input_tokens": self.total_input_tokens,
            "total_output_tokens": self.total_output_tokens,
            "total_tokens": self.total_tokens,
            "api_calls": self.api_calls
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        return filename
    
    def export_to_csv(self, filename: str = None) -> str:
        """Export to CSV."""
        if filename is None:
            filename = f"feedback_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            writer.writerow(["Student", self.feedback_data.get("student_name", "N/A")])
            writer.writerow(["Preceptor", self.feedback_data.get("preceptor_name", "N/A")])
            writer.writerow(["Date", self.feedback_data["date"]])
            writer.writerow([])
            
            writer.writerow(["Standard", "Summary", "Improvement Strategies"])
            
            for std_num in self.standards_completed:
                std_data = self.feedback_data["standards"][std_num]
                std_name = STANDARDS_DATA[std_num]["name"]
                
                improvements = std_data['preceptor_suggestions']
                if std_data['ai_suggestions']:
                    improvements += " | " + " | ".join(std_data['ai_suggestions'])
                
                writer.writerow([
                    f"{std_num}: {std_name}",
                    std_data['summary'],
                    improvements
                ])
        
        return filename


# ============================================================================
# MAIN INTERFACE
# ============================================================================

def main():
    """User-friendly interface."""
    
    print("\n" + "="*70)
    print("  INTELLIGENT NURSING PRECEPTOR FEEDBACK SYSTEM")
    print("="*70)
    print("\nThis system uses AI to help structure your feedback and")
    print("suggest improvement strategies for nursing students.")
    print("\nCommands: 'quit' to exit, 'help' for assistance, 'tokens' to see usage")
    print("="*70 + "\n")
    
    # Load API key from environment variable
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found in environment variables.")
        print("Please create a .env file with your OpenAI API key:")
        print("OPENAI_API_KEY=your-api-key-here")
        return
    
    bot = IntelligentNursingFeedbackBot(api_key)
    
    print("\n" + bot.start_conversation())
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if not user_input:
            continue
        
        if user_input.lower() == 'quit':
            print("\nThank you! Goodbye.")
            break
        
        if user_input.lower() == 'help':
            print("\nJust answer the questions naturally. The AI will guide you!")
            continue
        
        if user_input.lower() == 'tokens':
            print(f"\n🔢 CURRENT TOKEN USAGE:")
            print(f"   Total API Calls: {len(bot.api_calls)}")
            print(f"   Total Input Tokens: {bot.total_input_tokens:,}")
            print(f"   Total Output Tokens: {bot.total_output_tokens:,}")
            print(f"   Total Tokens Used: {bot.total_tokens:,}")
            continue
        
        response = bot.process_message(user_input)
        print(f"\nBot: {response}")


if __name__ == "__main__":
    main()