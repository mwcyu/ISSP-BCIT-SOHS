"""
Nursing Preceptor Feedback Chatbot - LangChain v1 Agent Version
Features AI reasoning with LangChain v1 agents and latest best practices
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
# LANGCHAIN V1 AGENT TOOLS
# ============================================================================

@tool
def analyze_feedback_response(response: str, current_standard: str) -> Dict[str, Any]:
    """
    Analyze a preceptor's feedback response to determine which standard it belongs to,
    how informative it is, and what key points are mentioned.
    
    Args:
        response: The preceptor's feedback text
        current_standard: The standard currently being discussed (e.g., "Standard 1")
    
    Returns:
        Dictionary with analysis results including standard classification, informativeness score, etc.
    """
    # This will be handled by the agent's reasoning capabilities
    # For now, return a structured analysis
    return {
        "belongs_to_current_standard": True,
        "belongs_to_other_standard": None,
        "informativeness_score": 3,
        "has_specific_examples": "example" in response.lower(),
        "key_points": [response[:100] + "..." if len(response) > 100 else response],
        "reasoning": "Analysis completed by agent"
    }

@tool
def generate_standard_summary(standard_num: str, feedback_responses: List[str]) -> str:
    """
    Generate a concise summary of feedback for a specific BCCNM standard.
    
    Args:
        standard_num: The standard number (e.g., "Standard 1")
        feedback_responses: List of feedback responses for this standard
    
    Returns:
        A 2-3 sentence summary highlighting key strengths, concerns, and overall performance
    """
    all_feedback = " ".join(feedback_responses)
    std_name = STANDARDS_DATA[standard_num]["name"]
    
    # This will be enhanced by the agent's language capabilities
    return f"Summary for {standard_num}: {std_name} - The student demonstrated {len(feedback_responses)} areas of feedback. Key points include: {all_feedback[:200]}..."

@tool
def generate_improvement_suggestions(standard_num: str, feedback_responses: List[str]) -> List[str]:
    """
    Generate evidence-based improvement suggestions for a nursing student.
    
    Args:
        standard_num: The standard number (e.g., "Standard 1")
        feedback_responses: List of feedback responses for this standard
    
    Returns:
        List of 3-4 specific, actionable improvement strategies
    """
    std_name = STANDARDS_DATA[standard_num]["name"]
    
    # This will be enhanced by the agent's reasoning
    suggestions = [
        f"1. Focus on specific areas within {std_name} based on {feedback_responses} received",
        f"2. Practice evidence-based strategies related to {std_name}",
        f"3. Seek additional learning opportunities in {std_name}",
        f"4. Regular reflection and self-assessment in {std_name} areas"
    ]
    
    return suggestions

@tool
def store_feedback_data(student_name: str, preceptor_name: str, clinical_setting: str, 
                       standard_num: str, feedback_text: str, analysis: Dict[str, Any]) -> str:
    """
    Store feedback data in the system's memory for later retrieval and reporting.
    
    Args:
        student_name: Name of the nursing student
        preceptor_name: Name of the preceptor
        clinical_setting: Clinical setting (e.g., ICU, Med-Surg)
        standard_num: The standard number
        feedback_text: The feedback text
        analysis: Analysis results from analyze_feedback_response
    
    Returns:
        Confirmation message that data was stored
    """
    # In a real implementation, this would store to a database
    # For now, return confirmation
    return f"Stored feedback for {student_name} in {standard_num} from {preceptor_name} in {clinical_setting}"

@tool
def get_standard_info(standard_num: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific BCCNM standard.
    
    Args:
        standard_num: The standard number (e.g., "Standard 1")
    
    Returns:
        Dictionary containing standard name, description, areas, and prompts
    """
    if standard_num in STANDARDS_DATA:
        return STANDARDS_DATA[standard_num]
    else:
        return {"error": f"Standard {standard_num} not found"}

@tool
def check_conversation_progress(standards_completed: List[str]) -> Dict[str, Any]:
    """
    Check the current progress of the feedback conversation.
    
    Args:
        standards_completed: List of standards that have been completed
    
    Returns:
        Dictionary with progress information
    """
    total_standards = len(STANDARDS_DATA)
    remaining = [s for s in STANDARDS_DATA.keys() if s not in standards_completed]
    
    return {
        "completed": len(standards_completed),
        "total": total_standards,
        "remaining": remaining,
        "progress_percentage": (len(standards_completed) / total_standards) * 100
    }


# ============================================================================
# LANGCHAIN V1 AGENT SETUP
# ============================================================================

class IntelligentNursingFeedbackAgent:
    """
    LangChain v1 Agent-based nursing feedback system with intelligent reasoning.
    """
    
    def __init__(self, api_key: str):
        """Initialize the agent-based feedback system."""
        
        # Initialize the LLM
        self.llm = ChatOpenAI(
            temperature=0.7,
            model="gpt-4o-mini",  # Using latest model
            api_key=api_key
        )
        
        # Define all available tools
        self.tools = [
            analyze_feedback_response,
            generate_standard_summary,
            generate_improvement_suggestions,
            store_feedback_data,
            get_standard_info,
            check_conversation_progress
        ]
        
        # Create the agent using LangChain v1 syntax
        self.agent = create_agent(
            model=self.llm,
            tools=self.tools,
            prompt=self._create_agent_prompt()
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
        self.conversation_phase = "greeting"
        self.standards_completed = []
        self.conversation_history = []
        
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
    
    def _create_agent_prompt(self) -> str:
        """Create the system prompt for the agent."""
        return """You are an intelligent nursing preceptor feedback assistant. Your role is to:

1. Guide preceptors through structured feedback sessions based on BCCNM 4 Standards of Clinical Practice
2. Analyze feedback responses to determine which standard they relate to
3. Generate summaries and improvement suggestions
4. Maintain conversation flow and prevent loops

BCCNM Standards:
- Standard 1: Professional Responsibility and Accountability
- Standard 2: Knowledge-Based Practice  
- Standard 3: Client-Focused Provision of Service
- Standard 4: Ethical Practice

Key Guidelines:
- Always be professional and supportive
- Ask for specific examples when feedback is vague
- Recognize when feedback belongs to different standards
- Don't get stuck asking for examples repeatedly
- Use the available tools to analyze, summarize, and generate suggestions
- Maintain conversation state and progress tracking

Available Tools:
- analyze_feedback_response: Analyze which standard feedback belongs to
- generate_standard_summary: Create summaries of feedback
- generate_improvement_suggestions: Create actionable improvement strategies
- store_feedback_data: Store feedback information
- get_standard_info: Get details about BCCNM standards
- check_conversation_progress: Track conversation progress

Always use these tools when appropriate to provide structured, intelligent feedback assistance."""
    
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
        
        # Prepare the message for the agent
        agent_input = {
            "messages": [
                {"role": "system", "content": f"Context: {context}"},
                {"role": "user", "content": user_input}
            ]
        }
        
        try:
            # Invoke the agent
            response = self.agent.invoke(agent_input)
            
            # Extract the response content
            if hasattr(response, 'messages') and response.messages:
                agent_response = response.messages[-1].content
            elif hasattr(response, 'content'):
                agent_response = response.content
            else:
                agent_response = str(response)
            
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
        
        # Handle initial information gathering
        if self.conversation_phase == "greeting":
            if any(keyword in lower_input for keyword in ["name", "student", "preceptor", "setting", "icu", "med-surg", "emergency"]):
                # Extract basic info (simplified for now)
                self.feedback_data["student_name"] = "Student Name"
                self.feedback_data["preceptor_name"] = "Preceptor Name" 
                self.feedback_data["clinical_setting"] = "Clinical Setting"
                
                # Move to first standard
                self.conversation_phase = "collecting_feedback"
                self.current_standard = "Standard 1"
        
        # Handle skip commands
        elif "skip" in lower_input or "not really" in lower_input:
            if self.conversation_phase == "collecting_feedback":
                self.conversation_phase = "improvement"
            elif self.conversation_phase == "improvement":
                self.standards_completed.append(self.current_standard)
                self.conversation_phase = "transition"
        
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
    """User-friendly interface using LangChain v1 Agent."""
    
    print("\n" + "="*70)
    print("  INTELLIGENT NURSING PRECEPTOR FEEDBACK SYSTEM")
    print("  Powered by LangChain v1 AI Agent")
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
            print("\nJust answer the questions naturally. The AI agent will guide you!")
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
