"""
Nursing Preceptor Feedback Chatbot - Cleaned Version
Fixed syntax errors and structural issues
"""

from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.tools import tool
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
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
        "prompts": [
            "How well does the learner recognize their scope of practice limitations?",
            "How does the learner respond when unsure about procedures or medications?",
            "Describe the learner's approach to seeking help and guidance when needed.",
            "How well does the learner maintain professional boundaries with patients and families?",
            "How does the learner handle confidential patient information?",
            "Describe the learner's punctuality, attendance, and overall professional demeanor.",
            "How well does the learner communicate with the healthcare team?",
            "How does the learner respond to feedback and constructive criticism?"
        ]
    },
    "Standard 2": {
        "name": "Knowledge-Based Practice",
        "description": "This standard focuses on how the nursing student applies their clinical knowledge to provide evidence-informed patient care.",
        "prompts": [
            "How thorough and comprehensive are the learner's nursing assessments?",
            "Describe the learner's clinical judgment in responding to changing patient conditions.",
            "How well does the learner use assessment findings to inform their clinical decisions?",
            "Can you describe a situation where the learner modified a care plan based on patient response?",
            "How well does the learner understand medication actions, side effects, and interactions?",
            "Describe the learner's ability to prioritize patient care activities.",
            "How does the learner demonstrate knowledge of anatomy, physiology, and pathophysiology?",
            "How well does the learner document patient care and communicate findings?"
        ]
    },
    "Standard 3": {
        "name": "Client-Focused Provision of Service",
        "description": "This standard emphasizes patient-centered care, cultural competence, therapeutic relationships, and individualized care planning.",
        "prompts": [
            "How does the learner establish rapport and therapeutic relationships with patients?",
            "Describe how the learner shows respect for patient dignity and autonomy.",
            "How well does the learner involve patients in care planning and decision-making?",
            "How does the learner demonstrate cultural sensitivity and competence?",
            "Describe the learner's approach to patient and family education.",
            "How does the learner respond to patient concerns and emotional needs?",
            "How well does the learner advocate for patient needs and preferences?",
            "Describe how the learner adapts care approaches for different patient populations."
        ]
    },
    "Standard 4": {
        "name": "Ethical Practice",
        "description": "This standard covers ethical decision-making, respect for patient rights, and moral sensitivity in nursing practice.",
        "prompts": [
            "How does the learner demonstrate respect for patient rights and dignity?",
            "Describe a situation where the learner faced an ethical dilemma and how they handled it.",
            "How well does the learner maintain patient confidentiality and privacy?",
            "How does the learner show respect for diverse values, beliefs, and practices?",
            "Describe the learner's approach to obtaining informed consent.",
            "How does the learner handle situations involving vulnerable populations?",
            "How well does the learner recognize and respond to ethical issues in practice?",
            "How does the learner demonstrate integrity and honesty in their practice?"
        ]
    }
}


# ============================================================================
# MAIN NURSING FEEDBACK CLASS
# ============================================================================

class IntelligentNursingFeedbackAgent:
    """Intelligent nursing preceptor feedback system using LangChain v1 agents."""
    
    def __init__(self, openai_api_key: str):
        self.openai_api_key = openai_api_key
        
        # Conversation state
        self.conversation_phase = "greeting"
        self.current_standard = "Standard 1"
        self.standards_completed = []
        self.conversation_history = []
        
        # Token usage tracking
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_tokens = 0
        self.api_calls = []
        
        # Feedback data storage
        self.feedback_data = {
            "session_id": f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "date": datetime.now().isoformat(),
            "clinical_setting_type": None,
            "standards": {std: {"responses": [], "summary": "", "preceptor_suggestions": "", "ai_suggestions": []} 
                        for std in STANDARDS_DATA.keys()}
        }
        
        # Initialize the LangChain agent
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=openai_api_key,
            temperature=0.7
        )
        
        # Create agent with tools
        self.agent = self._create_agent()
    
    def _create_agent(self):
        """Create the LangChain v1 agent with tools."""
        # Define the agent prompt
        system_prompt = self._create_agent_prompt()
        
        # Create the agent using LangChain v1 pattern
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "{input}")
        ])
        
        # Simple chain for now - can be enhanced with tools later
        agent = prompt | self.llm
        return agent
    
    def _create_agent_prompt(self) -> str:
        """Create the system prompt for the agent."""
        return """You are an intelligent nursing preceptor feedback assistant. Your role is to:

1. Guide preceptors through structured feedback sessions based on BCCNM 4 Standards of Clinical Practice
2. Ask relevant questions and provide supportive guidance
3. Help create constructive feedback for nursing students
4. Maintain a professional, supportive tone throughout

BCCNM Standards:
- Standard 1: Professional Responsibility and Accountability
- Standard 2: Knowledge-Based Practice  
- Standard 3: Client-Focused Provision of Service
- Standard 4: Ethical Practice

PRIVACY AND ANONYMITY GUIDELINES:
- NEVER ask for names (student, preceptor, or any other person)
- NEVER ask for specific patient information or identifiers
- NEVER ask for specific facility names or locations
- Focus on clinical behaviors, skills, and professional development
- Use generic terms like "the student" or "the learner"
- If names are mentioned, redirect to focus on behaviors and skills
- Maintain complete anonymity throughout the conversation

Key Guidelines:
- Always be professional and supportive
- Ask for specific examples ONCE when feedback is vague, before moving on
- Provide helpful prompts when users need guidance
- Don't repeat the same questions multiple times
- Only ask 1 follow up question if preceptor response isn't satisfactory
- Focus on constructive feedback that helps student growth
- Protect privacy and maintain anonymity at all times

Always respond with clean, readable text. Provide natural, conversational responses that are easy to read and understand."""
    
    def start_conversation(self) -> str:
        """Begin the feedback session."""
        greeting = """Hello! Thank you for taking the time to provide feedback on your nursing student.

I'll help you give structured feedback based on the BCCNM 4 Standards of Clinical Practice. This will take about 10-15 minutes.

🔒 **PRIVACY NOTICE**: This session is completely anonymous. We do not collect or store any personal information including names, facility names, or patient identifiers. All feedback is anonymized and used solely for educational purposes.

To get started, please tell me about the clinical setting type (e.g., ICU, Med-Surg, Emergency, etc.) so I can provide relevant guidance. You can also share any general context about the learning environment.

Remember: Focus on clinical behaviors, skills, and professional development rather than specific individuals or situations."""
        
        return greeting
    
    def process_message(self, user_input: str) -> str:
        """Main message processing using LangChain v1 agent."""
        
        self.conversation_history.append({"role": "user", "content": user_input})
        
        # Create context for the agent
        context = {
            "conversation_phase": self.conversation_phase,
            "current_standard": self.current_standard,
            "standards_completed": self.standards_completed,
            "conversation_history": self.conversation_history[-5:],  # Last 5 messages for context
            "feedback_data": self.feedback_data
        }
        
        try:
            # Invoke the agent
            response = self.agent.invoke({"input": user_input})
            
            # Extract the response content - handle different response formats
            agent_response = ""
            
            # Handle LangChain agent response formats
            if hasattr(response, 'content'):
                # Direct content response (AIMessage object)
                agent_response = response.content
            elif isinstance(response, dict):
                # Dictionary response format
                if 'content' in response:
                    agent_response = response['content']
                else:
                    # Fallback for unknown dict format
                    agent_response = "I understand. Please continue with your feedback about the student's clinical performance."
            else:
                # Fallback - try to extract content from object
                if hasattr(response, '__dict__'):
                    # Check if it's a response object with content attribute
                    obj_dict = response.__dict__
                    if 'content' in obj_dict:
                        agent_response = obj_dict['content']
                    else:
                        agent_response = str(response)
                else:
                    agent_response = str(response)
            
            # Clean up the response string
            if isinstance(agent_response, str):
                # Remove common object string representations
                if agent_response.startswith("content=") and "additional_kwargs=" in agent_response:
                    # Extract just the content part from object string representation
                    import re
                    content_match = re.search(r'content="([^"]*)"', agent_response)
                    if content_match:
                        agent_response = content_match.group(1)
                    else:
                        content_match = re.search(r"content='([^']*)'", agent_response)
                        if content_match:
                            agent_response = content_match.group(1)
                
                # Clean up escape characters and ensure proper formatting
                agent_response = agent_response.replace('\\"', '"').replace("\\'", "'").strip()
                
                # If the response is still problematic, provide a fallback
                if not agent_response or len(agent_response) < 10 or agent_response.startswith('{'):
                    agent_response = "I understand. Please continue with your feedback about the student's clinical performance."
            
            # Track token usage if available
            self._track_token_usage(response, "Agent Processing")
            
            # Update conversation state based on response
            self._update_conversation_state(user_input, agent_response)
            
            self.conversation_history.append({"role": "assistant", "content": agent_response})
            return agent_response
            
        except Exception as e:
            error_response = f"I encountered an error processing your message: {str(e)}. Please try again."
            self.conversation_history.append({"role": "assistant", "content": error_response})
            return error_response
    
    def _update_conversation_state(self, user_input: str, agent_response: str):
        """Update conversation state based on user input and agent response."""
        lower_input = user_input.lower()
        
        # Handle initial information gathering - only clinical setting type, no names
        if self.conversation_phase == "greeting":
            if any(keyword in lower_input for keyword in ["setting", "icu", "med-surg", "emergency", "clinical", "unit", "department"]):
                # Extract only clinical setting type (anonymized)
                clinical_keywords = ["icu", "med-surg", "emergency", "surgical", "medical", "pediatric", "psychiatric", "rehabilitation", "outpatient", "community"]
                for keyword in clinical_keywords:
                    if keyword in lower_input:
                        self.feedback_data["clinical_setting_type"] = keyword.title()
                        break
                else:
                    self.feedback_data["clinical_setting_type"] = "General Clinical Setting"
                
                # Move to first standard
                self.conversation_phase = "collecting_feedback"
                self.current_standard = "Standard 1"
        
        # Handle transitions
        elif "yes" in lower_input and self.conversation_phase == "transition":
            remaining = [s for s in STANDARDS_DATA.keys() if s not in self.standards_completed]
            if remaining:
                self.current_standard = remaining[0]
                self.conversation_phase = "collecting_feedback"
    
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
            
            # Display concise token usage
            print(f"\n🔢 TOKEN USAGE - {operation_name}:")
            print(f"   Tokens used: {total_tokens} (Input: {input_tokens}, Output: {output_tokens})")
            print(f"   Running total: {self.total_tokens}")
        else:
            # Provide estimated token count for operations without detailed usage
            estimated_tokens = len(str(response)) // 4  # Rough estimate: ~4 chars per token
            self.total_tokens += estimated_tokens
            print(f"\n🔢 TOKEN USAGE - {operation_name} (estimated):")
            print(f"   Estimated tokens: {estimated_tokens}")
            print(f"   Running total: {self.total_tokens}")
        
        print("-" * 50)
    
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
            
            writer.writerow(["Session ID", self.feedback_data.get("session_id", "N/A")])
            writer.writerow(["Clinical Setting Type", self.feedback_data.get("clinical_setting_type", "N/A")])
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
    print("  INTELLIGENT NURSING PRECEPTOR FEEDBACK SYSTEM - FIXED VERSION")
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
    
    bot = IntelligentNursingFeedbackAgent(api_key)
    
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