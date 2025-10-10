"""
Nursing Preceptor Feedback Chatbot - Refactored Version
Simplified, maintainable design with LangChain for AI-guided feedback collection
Based on BCCNM 4 Standards of Clinical Practice

Key improvements:
- Removed complex agent-based architecture in favor of conversational AI
- Simplified message handling and response processing
- Better error handling and token tracking
- Cleaner separation of concerns
- More maintainable codebase
"""

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
import csv
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


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
        "key_prompts": [
            "Can you provide an example of when the learner appropriately sought assistance?",
            "How does the learner demonstrate awareness of their scope of practice?",
            "How does the learner respond to feedback and incorporate it into their practice?",
            "Can you describe a situation where the learner identified a potential safety concern?"
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
        "key_prompts": [
            "How thorough and comprehensive are the learner's nursing assessments?",
            "Describe the learner's clinical judgment in responding to changing patient conditions.",
            "How well does the learner use assessment findings to inform their clinical decisions?",
            "Can you describe a situation where the learner modified a care plan based on patient response?"
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
        "key_prompts": [
            "Can you describe the learner's collaborative approach with other healthcare professionals?",
            "How well does the learner balance multiple patient needs and competing demands?",
            "Can you provide examples of the learner delegating tasks appropriately?",
            "Can you describe how the learner involves patients in decisions about their care?"
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
        "key_prompts": [
            "How does the learner demonstrate respect for patient privacy and confidentiality?",
            "How does the learner establish and maintain appropriate professional boundaries?",
            "How does the learner advocate for patients experiencing vulnerable circumstances?",
            "Describe situations where the learner identified moral or ethical concerns. How did they respond?"
        ]
    }
}


# ============================================================================
# MAIN CHATBOT CLASS
# ============================================================================

class NursingFeedbackChatbot:
    """
    Streamlined nursing preceptor feedback chatbot using LangChain.
    Guides preceptors through structured feedback collection based on BCCNM standards.
    """
    
    def __init__(self, api_key: str):
        """Initialize the chatbot."""
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            temperature=0.7,
            model="gpt-4o-mini",
            api_key=api_key
        )
        
        # System prompt
        self.system_prompt = self._create_system_prompt()
        
        # Message history
        self.messages: List[Any] = [SystemMessage(content=self.system_prompt)]
        
        # Session data (completely anonymized)
        self.feedback_data = {
            "session_id": f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "clinical_setting_type": None,
            "standards": {}
        }
        
        # Conversation state
        self.current_standard: Optional[str] = None
        self.standards_completed: List[str] = []
        self.conversation_phase = "greeting"  # greeting, collecting_feedback, improvement, complete
        
        # Token tracking
        self.total_tokens = 0
        self.api_calls: List[Dict[str, Any]] = []
        
        # Initialize standard data
        for std_num in STANDARDS_DATA.keys():
            self.feedback_data["standards"][std_num] = {
                "responses": [],
                "summary": "",
                "preceptor_suggestions": "",
                "ai_suggestions": []
            }
    
    def _create_system_prompt(self) -> str:
        """Create the system prompt for the LLM."""
        return """You are a professional nursing feedback assistant helping preceptors provide structured feedback based on BCCNM 4 Standards of Clinical Practice.

BCCNM STANDARDS:
1. Professional Responsibility and Accountability
2. Knowledge-Based Practice
3. Client-Focused Provision of Service
4. Ethical Practice

YOUR ROLE:
- Guide preceptors through collecting feedback for each standard
- Ask clarifying questions when responses are vague
- Keep feedback focused on observable behaviors and professional skills
- Generate summaries and improvement suggestions

PRIVACY REQUIREMENTS (CRITICAL):
- NEVER ask for names (student, preceptor, patient, staff, or facility names)
- NEVER request specific identifiable information
- If names are mentioned, politely redirect: "Let's focus on the behaviors and skills rather than specific names."
- Use generic terms: "the student", "the learner", "the team member"
- Keep all examples anonymous and behavior-focused

CONVERSATION FLOW:
1. Start by asking which standard they'd like to begin with
2. Collect initial feedback for that standard
3. Ask ONLY 1 follow-up question for clarification or depth
4. Ask if the preceptor has any suggestions for the student's improvement
5. ask ONLY 1 follow-up question for clarification or depth
6. Move to the next standard
7. After all 4 standards, generate final summary

RESPONSE STYLE:
- Professional and supportive tone
- Clear, concise questions
- Acknowledge responses before moving on
- Ask only ONE follow-up question to keep the process efficient
- After the follow-up, immediately ask for improvement suggestions
- Guide naturally through the conversation

Remember: Maintain complete anonymity and focus on professional development, not personal details."""
    
    def start_conversation(self) -> str:
        """Begin the feedback session."""
        greeting = """Hello! Thank you for taking the time to provide feedback on your nursing student.

I'll help you provide structured feedback based on the BCCNM 4 Standards of Clinical Practice. This will take about 10-15 minutes.

🔒 **Privacy Note**: This session is completely anonymous. We won't ask for any names or identifying information - just focus on behaviors and skills.

The 4 Standards we'll cover:
1. **Professional Responsibility and Accountability**
2. **Knowledge-Based Practice**
3. **Client-Focused Provision of Service**
4. **Ethical Practice**

Which standard would you like to start with? Or I can guide you through them in order."""
        
        return greeting
    
    def process_message(self, user_input: str) -> str:
        """Process user message and generate response."""
        
        # Handle special commands
        lower_input = user_input.lower().strip()
        
        if lower_input in ['quit', 'exit']:
            return self._handle_quit()
        
        if lower_input == 'progress':
            return self._show_progress()
        
        if lower_input == 'help':
            return self._show_help()
        
        if lower_input == 'tokens':
            return self._show_token_usage()
        
        # Add user message to history
        self.messages.append(HumanMessage(content=user_input))
        
        # Update conversation state based on input
        self._update_state(user_input)
        
        # Generate response using LLM
        try:
            response = self.llm.invoke(self.messages)
            
            # Extract content from response
            response_content = self._extract_response_content(response)
            
            # Track tokens
            self._track_tokens(response)
            
            # Add assistant response to history
            self.messages.append(AIMessage(content=response_content))
            
            # Store feedback if appropriate
            self._store_feedback_if_applicable(user_input, response_content)
            
            return response_content
            
        except Exception as e:
            error_msg = f"I encountered an error: {str(e)}. Please try again."
            self.messages.append(AIMessage(content=error_msg))
            return error_msg
    
    def _extract_response_content(self, response: Any) -> str:
        """Extract clean text content from LLM response."""
        
        if hasattr(response, 'content'):
            return str(response.content).strip()
        elif isinstance(response, dict) and 'content' in response:
            return str(response['content']).strip()
        else:
            return str(response).strip()
    
    def _update_state(self, user_input: str):
        """Update conversation state based on user input."""
        
        lower_input = user_input.lower()
        
        # Detect standard selection
        for std_num, std_data in STANDARDS_DATA.items():
            if std_num.lower() in lower_input or std_data["name"].lower() in lower_input:
                if self.current_standard is None or self.current_standard != std_num:
                    self.current_standard = std_num
                    self.conversation_phase = "collecting_feedback"
                break
        
        # Detect completion signals
        if any(word in lower_input for word in ['done', 'finished', 'complete', 'that\'s all']):
            if self.current_standard and self.current_standard not in self.standards_completed:
                self.standards_completed.append(self.current_standard)
                self.conversation_phase = "transition"
        
        # Check if all standards are complete
        if len(self.standards_completed) >= 4:
            self.conversation_phase = "complete"
    
    def _store_feedback_if_applicable(self, user_input: str, response: str):
        """Store feedback data when appropriate."""
        
        if self.current_standard and self.conversation_phase == "collecting_feedback":
            # Store the feedback response
            if len(user_input) > 20:  # Only store substantial responses
                self.feedback_data["standards"][self.current_standard]["responses"].append({
                    "content": user_input,
                    "timestamp": datetime.now().isoformat()
                })
    
    def _track_tokens(self, response: Any):
        """Track token usage."""
        
        tokens = 0
        
        # Try to extract token usage from response
        if hasattr(response, 'usage_metadata'):
            usage = response.usage_metadata
            if hasattr(usage, 'total_tokens'):
                tokens = usage.total_tokens
            elif isinstance(usage, dict):
                tokens = usage.get('total_tokens', 0)
        elif hasattr(response, 'response_metadata'):
            metadata = response.response_metadata
            if isinstance(metadata, dict) and 'token_usage' in metadata:
                tokens = metadata['token_usage'].get('total_tokens', 0)
        
        # Update totals
        if tokens > 0:
            self.total_tokens += tokens
            self.api_calls.append({
                "timestamp": datetime.now().isoformat(),
                "tokens": tokens
            })
    
    def _show_progress(self) -> str:
        """Show current progress."""
        
        completed = len(self.standards_completed)
        total = len(STANDARDS_DATA)
        percentage = (completed / total) * 100 if total > 0 else 0
        
        progress = f"\n📊 **Progress Report**\n\n"
        progress += f"Completed: {completed}/{total} standards ({percentage:.1f}%)\n\n"
        
        if self.standards_completed:
            progress += "✅ Completed Standards:\n"
            for std in self.standards_completed:
                progress += f"  - {std}: {STANDARDS_DATA[std]['name']}\n"
            progress += "\n"
        
        remaining = [s for s in STANDARDS_DATA.keys() if s not in self.standards_completed]
        if remaining:
            progress += "⏳ Remaining Standards:\n"
            for std in remaining:
                progress += f"  - {std}: {STANDARDS_DATA[std]['name']}\n"
        
        return progress
    
    def _show_help(self) -> str:
        """Show help information."""
        
        return """
📖 **Help & Commands**

**How it works:**
- I'll guide you through feedback for 4 BCCNM standards
- Answer questions naturally about the student's performance
- Focus on behaviors and skills (no names needed)

**Available Commands:**
- `progress` - See which standards you've completed
- `tokens` - View token usage for this session
- `help` - Show this help message
- `quit` - Exit and save feedback

**Tips:**
- Provide specific examples when possible
- Focus on observable behaviors
- Be honest and constructive
- All feedback is anonymous

Let's continue where we left off!
"""
    
    def _show_token_usage(self) -> str:
        """Show token usage statistics."""
        
        return f"""
🔢 **Token Usage Report**

Total API Calls: {len(self.api_calls)}
Total Tokens Used: {self.total_tokens:,}

Estimated Cost (GPT-4o-mini):
  ~${(self.total_tokens / 1000000) * 0.15:.4f}
"""
    
    def _handle_quit(self) -> str:
        """Handle quit command."""
        
        return "Thank you! Use 'done' in the main program to save your feedback."
    
    def generate_summary(self) -> Dict[str, Any]:
        """Generate comprehensive feedback summary using LLM."""
        
        summary_prompt = f"""Based on the feedback collected, generate a comprehensive summary for each BCCNM standard.

Feedback Data:
{json.dumps(self.feedback_data['standards'], indent=2)}

For each standard that has feedback, provide:
1. A 2-3 sentence summary of key strengths
2. A 2-3 sentence summary of areas for improvement
3. 3-4 specific, actionable improvement strategies

Format the response as structured text that can be easily parsed."""
        
        try:
            messages = [
                SystemMessage(content="You are an expert at summarizing nursing student feedback."),
                HumanMessage(content=summary_prompt)
            ]
            
            response = self.llm.invoke(messages)
            summary_text = self._extract_response_content(response)
            
            # Store the summary
            return {
                "summary_text": summary_text,
                "timestamp": datetime.now().isoformat(),
                "standards_covered": self.standards_completed
            }
            
        except Exception as e:
            return {
                "summary_text": f"Error generating summary: {str(e)}",
                "timestamp": datetime.now().isoformat(),
                "standards_covered": self.standards_completed
            }
    
    def export_to_json(self, filename: str = None) -> str:
        """Export feedback to JSON file."""
        
        if filename is None:
            filename = f"feedback_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        export_data = self.feedback_data.copy()
        export_data["summary"] = self.generate_summary()
        export_data["token_usage"] = {
            "total_tokens": self.total_tokens,
            "api_calls_count": len(self.api_calls)
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        return filename
    
    def export_to_csv(self, filename: str = None) -> str:
        """Export feedback to CSV file."""
        
        if filename is None:
            filename = f"feedback_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow(["Session ID", self.feedback_data["session_id"]])
            writer.writerow(["Date", self.feedback_data["date"]])
            writer.writerow(["Clinical Setting", self.feedback_data.get("clinical_setting_type", "Not specified")])
            writer.writerow([])
            
            # Standards feedback
            writer.writerow(["Standard", "Feedback Responses", "Response Count"])
            
            for std_num in self.standards_completed:
                std_data = self.feedback_data["standards"][std_num]
                std_name = STANDARDS_DATA[std_num]["name"]
                
                responses = std_data["responses"]
                response_texts = [r["content"] for r in responses if isinstance(r, dict)]
                
                writer.writerow([
                    f"{std_num}: {std_name}",
                    " | ".join(response_texts) if response_texts else "No feedback provided",
                    len(response_texts)
                ])
        
        return filename


# ============================================================================
# MAIN INTERFACE
# ============================================================================

def main():
    """Command-line interface for the chatbot."""
    
    print("\n" + "="*70)
    print("  NURSING PRECEPTOR FEEDBACK CHATBOT (REFACTORED)")
    print("  Based on BCCNM 4 Standards of Clinical Practice")
    print("="*70)
    print("\n🔒 PRIVACY PROTECTION:")
    print("• Completely anonymous - no names or identifiers collected")
    print("• Focus on behaviors and professional skills only")
    print("• All data is for educational purposes")
    print("\nCommands: 'progress', 'help', 'tokens', 'quit'")
    print("="*70 + "\n")
    
    # Load API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ ERROR: OPENAI_API_KEY not found in environment variables.")
        print("\nPlease create a .env file with your OpenAI API key:")
        print("OPENAI_API_KEY=your-api-key-here")
        return
    
    # Initialize chatbot
    try:
        bot = NursingFeedbackChatbot(api_key)
        print("✅ Chatbot initialized successfully!\n")
    except Exception as e:
        print(f"❌ Error initializing chatbot: {str(e)}")
        return
    
    # Start conversation
    print(bot.start_conversation())
    
    # Main conversation loop
    while True:
        try:
            user_input = input("\n👤 You: ").strip()
            
            if not user_input:
                continue
            
            # Handle quit
            if user_input.lower() in ['quit', 'exit']:
                print("\n" + "="*70)
                print("  FEEDBACK SESSION COMPLETE")
                print("="*70)
                
                # Generate summary
                print("\n📝 Generating final summary...")
                summary = bot.generate_summary()
                print("\n✅ Summary generated!")
                
                # Export data
                print("\n💾 Saving feedback...")
                json_file = bot.export_to_json()
                csv_file = bot.export_to_csv()
                
                print(f"\n✅ Feedback saved:")
                print(f"   📄 JSON: {json_file}")
                print(f"   📊 CSV: {csv_file}")
                print(f"\n🔢 Token Usage: {bot.total_tokens:,} tokens")
                print("\n👋 Thank you for providing feedback! Goodbye.")
                break
            
            # Process message
            response = bot.process_message(user_input)
            print(f"\n🤖 Assistant: {response}")
            
        except KeyboardInterrupt:
            print("\n\n⚠️  Session interrupted. Exiting...")
            break
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            print("Please try again or type 'quit' to exit.")


if __name__ == "__main__":
    main()
