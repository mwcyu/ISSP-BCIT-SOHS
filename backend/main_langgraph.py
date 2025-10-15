"""
Nursing Preceptor Feedback Chatbot - LangGraph Refactored Version
State-based graph workflow using LangGraph for structured feedback collection
Based on BCCNM 4 Standards of Clinical Practice

MODERN LANGGRAPH PATTERNS USED (2025):
- StateGraph with TypedDict state schema
- add_messages reducer for proper message list handling
- START and END constants for entry/exit points
- Node functions return dicts (not modify state directly)
- MemorySaver for conversation persistence
- Proper type hints with Annotated types
- Conditional routing based on state

Key improvements over older patterns:
1. Messages are managed by add_messages reducer (automatically appends)
2. Nodes return update dicts instead of modifying state
3. Uses START constant instead of set_entry_point()
4. Type-safe state with TypedDict and proper annotations
5. Follows official LangGraph tutorial patterns from 2025 docs
"""

from typing import List, Optional, Dict, Any, Annotated
from typing_extensions import TypedDict
from datetime import datetime
import json
import csv
import os

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver

# Load environment variables
load_dotenv()

# ============================================================================
# PYDANTIC MODELS FOR STRUCTURED DATA
# ============================================================================

class FeedbackResponse(BaseModel):
    """Structured feedback response from preceptor"""
    content: str = Field(description="The feedback content")
    standard: str = Field(description="Which BCCNM standard this relates to")
    has_examples: bool = Field(default=False, description="Whether specific examples were provided")
    key_points: List[str] = Field(default_factory=list, description="Key points extracted from feedback")


class StandardSummary(BaseModel):
    """Summary of feedback for a standard"""
    standard: str = Field(description="Standard number")
    summary: str = Field(description="Concise summary of the feedback")
    strengths: List[str] = Field(default_factory=list, description="Key strengths identified")
    areas_for_growth: List[str] = Field(default_factory=list, description="Areas needing improvement")


class ImprovementStrategy(BaseModel):
    """Actionable improvement strategy"""
    area: str = Field(description="Area to improve")
    strategy: str = Field(description="Specific actionable strategy")
    rationale: str = Field(description="Why this strategy is beneficial")


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
# LANGGRAPH STATE DEFINITION
# ============================================================================

class FeedbackState(TypedDict):
    """State for the feedback collection graph
    
    Following LangGraph best practices with add_messages reducer for message handling
    """
    # Conversation - using add_messages reducer for proper message management
    messages: Annotated[list[BaseMessage], add_messages]
    current_input: str
    
    # Session info
    session_id: str
    date: str
    clinical_setting_type: Optional[str]
    
    # Progress tracking
    current_standard: Optional[str]
    conversation_phase: str  # greeting, collecting_feedback, improvement, transition, complete
    standards_completed: list[str]
    standards_to_review: list[str]
    
    # Feedback data
    feedback_data: Dict[str, Any]
    
    # Token tracking
    total_tokens: int
    api_calls: list[Dict[str, Any]]
    
    # Control flow
    next_action: Optional[str]  # continue, skip, next_standard, complete


# ============================================================================
# LANGGRAPH NODE FUNCTIONS
# ============================================================================

def greeting_node(state: FeedbackState) -> dict:
    """Initial greeting and setup
    
    Returns a dict with updates to merge into state
    """
    greeting = """Hello! Thank you for taking the time to provide feedback on your nursing student.

I'll help you give structured feedback based on the BCCNM 4 Standards of Clinical Practice. This will take about 10-15 minutes.

🔒 PRIVACY & ANONYMITY PROTECTION:
• No personal information is collected or stored
• No names, facility names, or patient identifiers are requested
• All feedback is anonymized and used for educational purposes only

Which standard would you like to start with?

1. Standard 1: Professional Responsibility and Accountability
2. Standard 2: Knowledge-Based Practice
3. Standard 3: Client-Focused Provision of Service
4. Standard 4: Ethical Practice

Or just tell me what area you'd like to discuss!"""
    
    # Return state updates - messages are handled by add_messages reducer
    return {
        "messages": [AIMessage(content=greeting)],
        "conversation_phase": "collecting_feedback",
        "current_standard": "Standard 1"  # Default starting point
    }


def route_user_input(state: FeedbackState) -> str:
    """Determine which node to route to based on user input"""
    user_input = state.get("current_input", "").lower()
    phase = state["conversation_phase"]
    
    # Handle empty input (shouldn't happen but defensive)
    if not user_input:
        if phase == "complete":
            return "complete"
        return "collect_feedback"
    
    # Check for quit/exit commands
    if any(cmd in user_input for cmd in ["quit", "exit", "stop", "done"]):
        return "complete"
    
    # Check for skip commands
    if any(cmd in user_input for cmd in ["skip", "next", "not really", "no thanks"]):
        if phase == "collecting_feedback":
            return "generate_summary"
        elif phase == "improvement":
            return "transition"
    
    # Route based on phase
    if phase == "greeting" or phase == "collecting_feedback":
        return "collect_feedback"
    elif phase == "improvement":
        return "improvement_strategies"
    elif phase == "transition":
        return "transition"
    elif phase == "complete":
        return "complete"
    else:
        return "collect_feedback"


def collect_feedback_node(state: FeedbackState, llm: ChatOpenAI) -> dict:
    """Collect feedback for current standard using LLM
    
    Returns dict with state updates
    """
    current_std = state.get("current_standard")
    user_input = state.get("current_input", "")
    
    # If no current standard set, default to Standard 1
    if not current_std:
        current_std = "Standard 1"
    
    # Check if user is selecting a standard
    for std_num, std_data in STANDARDS_DATA.items():
        if std_num.lower() in user_input.lower() or std_data["name"].lower() in user_input.lower():
            current_std = std_num
            break
    
    # Get standard info
    std_info = STANDARDS_DATA[current_std]
    
    # Create prompt for feedback collection
    system_prompt = f"""You are collecting feedback for {current_std}: {std_info['name']}.

Description: {std_info['description']}

Key areas to explore:
{chr(10).join('- ' + area for area in std_info['areas'])}

PRIVACY GUIDELINES:
- NEVER ask for names (student, preceptor, patient)
- NEVER ask for facility names or locations
- Focus on behaviors, skills, and professional development
- Use generic terms like "the learner" or "the student"

Your role:
1. Ask focused questions about the standard
2. Encourage specific examples
3. Recognize when sufficient feedback has been gathered
4. Store the feedback and move to next step

Suggested prompts to use:
{chr(10).join('- ' + prompt for prompt in std_info['top_prompts'][:2])}

Keep questions conversational and supportive. Don't ask for the same information repeatedly."""
    
    # Build conversation history for context
    recent_messages = state["messages"][-5:]  # Last 5 messages
    
    # Create messages for LLM
    messages = [
        SystemMessage(content=system_prompt),
        *recent_messages,
        HumanMessage(content=user_input)
    ]
    
    # Get LLM response
    response = llm.invoke(messages)
    
    # Prepare feedback data update
    feedback_update = state["feedback_data"].copy()
    if current_std not in feedback_update:
        feedback_update[current_std] = {
            "responses": [],
            "summary": "",
            "improvement_strategies": [],
            "preceptor_suggestions": "",
            "ai_suggestions": []
        }
    
    feedback_update[current_std]["responses"].append({
        "user": user_input,
        "timestamp": datetime.now().isoformat()
    })
    
    # Track tokens
    api_calls_update = state["api_calls"].copy()
    total_tokens_update = state["total_tokens"]
    
    if hasattr(response, 'usage_metadata'):
        usage = response.usage_metadata
        total_tokens_update += getattr(usage, 'total_tokens', 0)
        api_calls_update.append({
            "operation": f"Collect Feedback - {current_std}",
            "total_tokens": getattr(usage, 'total_tokens', 0)
        })
    
    # Check if ready to move to summary (after ~3-4 responses)
    conversation_phase = state["conversation_phase"]
    if len(feedback_update[current_std]["responses"]) >= 3:
        # Ask if they want to continue or move on
        if "that's all" in user_input.lower() or "move on" in user_input.lower():
            conversation_phase = "improvement"
    
    # Return state updates
    return {
        "messages": [HumanMessage(content=user_input), AIMessage(content=response.content)],
        "feedback_data": feedback_update,
        "total_tokens": total_tokens_update,
        "api_calls": api_calls_update,
        "conversation_phase": conversation_phase,
        "current_standard": current_std  # Make sure current_standard is set
    }


def generate_summary_node(state: FeedbackState, llm: ChatOpenAI) -> dict:
    """Generate summary for current standard
    
    Returns dict with state updates
    """
    current_std = state["current_standard"]
    std_data = state["feedback_data"][current_std]
    
    # Compile all responses
    all_responses = "\n".join([resp["user"] for resp in std_data["responses"]])
    
    # Create summary prompt
    prompt = f"""Based on the following feedback for {current_std}: {STANDARDS_DATA[current_std]['name']}, create a concise summary.

Feedback:
{all_responses}

Create a professional summary that:
1. Highlights key strengths
2. Identifies areas for growth
3. Maintains anonymity (no names, no specific locations)
4. Is clear and actionable

Provide the summary in 2-3 paragraphs."""
    
    messages = [
        SystemMessage(content="You are a nursing education expert creating feedback summaries."),
        HumanMessage(content=prompt)
    ]
    
    response = llm.invoke(messages)
    
    # Prepare updates
    feedback_update = state["feedback_data"].copy()
    feedback_update[current_std]["summary"] = response.content
    
    # Track tokens
    api_calls_update = state["api_calls"].copy()
    total_tokens_update = state["total_tokens"]
    
    if hasattr(response, 'usage_metadata'):
        usage = response.usage_metadata
        total_tokens_update += getattr(usage, 'total_tokens', 0)
        api_calls_update.append({
            "operation": f"Generate Summary - {current_std}",
            "total_tokens": getattr(usage, 'total_tokens', 0)
        })
    
    # Add message to user
    summary_msg = f"""Great! Here's a summary of the feedback for {current_std}:

{response.content}

Would you like me to suggest some improvement strategies for this standard?"""
    
    return {
        "feedback_data": feedback_update,
        "total_tokens": total_tokens_update,
        "api_calls": api_calls_update,
        "conversation_phase": "improvement",
        "messages": [AIMessage(content=summary_msg)]
    }


def improvement_strategies_node(state: FeedbackState, llm: ChatOpenAI) -> dict:
    """Generate improvement strategies
    
    Returns dict with state updates
    """
    current_std = state["current_standard"]
    std_data = state["feedback_data"][current_std]
    summary = std_data["summary"]
    user_input = state["current_input"].lower()
    
    feedback_update = state["feedback_data"].copy()
    api_calls_update = state["api_calls"].copy()
    total_tokens_update = state["total_tokens"]
    conversation_phase = state["conversation_phase"]
    
    # Check if user wants suggestions
    if any(word in user_input for word in ["yes", "sure", "okay", "please"]):
        # Create improvement prompt
        prompt = f"""Based on this feedback summary for {current_std}, suggest 3-5 specific, actionable improvement strategies for the nursing student.

Summary:
{summary}

Create practical strategies that:
1. Are specific and measurable
2. Build on existing strengths
3. Address areas for growth
4. Are achievable within clinical practice
5. Maintain focus on professional development

Format: Numbered list with brief rationale for each."""
        
        messages = [
            SystemMessage(content="You are a nursing education expert creating development plans."),
            HumanMessage(content=prompt)
        ]
        
        response = llm.invoke(messages)
        
        # Store strategies
        feedback_update[current_std]["ai_suggestions"] = [response.content]
        
        # Track tokens
        if hasattr(response, 'usage_metadata'):
            usage = response.usage_metadata
            total_tokens_update += getattr(usage, 'total_tokens', 0)
            api_calls_update.append({
                "operation": f"Improvement Strategies - {current_std}",
                "total_tokens": getattr(usage, 'total_tokens', 0)
            })
        
        response_msg = f"""Here are some suggested improvement strategies:

{response.content}

Do you have any additional suggestions you'd like to add?"""
        
        return {
            "feedback_data": feedback_update,
            "total_tokens": total_tokens_update,
            "api_calls": api_calls_update,
            "messages": [AIMessage(content=response_msg)]
        }
    else:
        # User declined suggestions
        response_msg = "No problem! Let's move on."
        return {
            "messages": [AIMessage(content=response_msg)],
            "conversation_phase": "transition"
        }


def transition_node(state: FeedbackState) -> dict:
    """Handle transition between standards
    
    Returns dict with state updates
    """
    current_std = state["current_standard"]
    
    # Mark current standard as completed
    standards_completed = state["standards_completed"].copy()
    if current_std not in standards_completed:
        standards_completed.append(current_std)
    
    # Find next standard
    remaining = [s for s in STANDARDS_DATA.keys() if s not in standards_completed]
    
    if remaining:
        next_std = remaining[0]
        std_info = STANDARDS_DATA[next_std]
        
        transition_msg = f"""Would you like to provide feedback for {next_std}: {std_info['name']}?

{std_info['description']}

Type 'yes' to continue, or 'skip' to move on."""
        
        return {
            "messages": [AIMessage(content=transition_msg)],
            "current_standard": next_std,
            "conversation_phase": "collecting_feedback",
            "standards_completed": standards_completed
        }
    else:
        # All standards completed
        completion_msg = f"""Thank you! You've completed feedback for all standards.

Your feedback has been recorded for:
{chr(10).join('✓ ' + std for std in standards_completed)}

Would you like to export this feedback? (yes/no)"""
        
        return {
            "messages": [AIMessage(content=completion_msg)],
            "conversation_phase": "complete",
            "standards_completed": standards_completed
        }


def complete_node(state: FeedbackState) -> dict:
    """Final completion and export
    
    Returns dict with state updates
    """
    completion_msg = f"""Thank you for providing comprehensive feedback!

📊 Session Summary:
- Session ID: {state['session_id']}
- Standards Completed: {len(state['standards_completed'])}/4
- Total Tokens Used: {state['total_tokens']:,}

Your feedback will help the nursing student grow and develop their professional practice."""
    
    return {
        "messages": [AIMessage(content=completion_msg)],
        "conversation_phase": "complete"
    }


# ============================================================================
# LANGGRAPH WORKFLOW
# ============================================================================

def create_feedback_graph(llm: ChatOpenAI) -> StateGraph:
    """Create the LangGraph workflow for feedback collection
    
    Uses modern LangGraph patterns with START/END constants and proper state management
    """
    
    # Create graph with FeedbackState schema
    workflow = StateGraph(FeedbackState)
    
    # Add nodes with LLM bound where needed
    workflow.add_node("collect_feedback", lambda state: collect_feedback_node(state, llm))
    workflow.add_node("generate_summary", lambda state: generate_summary_node(state, llm))
    workflow.add_node("improvement_strategies", lambda state: improvement_strategies_node(state, llm))
    workflow.add_node("transition", transition_node)
    workflow.add_node("complete", complete_node)
    
    # Set entry point - go directly to collect_feedback (greeting handled separately)
    workflow.add_edge(START, "collect_feedback")
    
    workflow.add_conditional_edges(
        "collect_feedback",
        route_user_input,
        {
            "collect_feedback": "collect_feedback",
            "generate_summary": "generate_summary",
            "transition": "transition",
            "complete": "complete"
        }
    )
    
    workflow.add_conditional_edges(
        "generate_summary",
        route_user_input,
        {
            "improvement_strategies": "improvement_strategies",
            "transition": "transition",
            "complete": "complete"
        }
    )
    
    workflow.add_conditional_edges(
        "improvement_strategies",
        route_user_input,
        {
            "improvement_strategies": "improvement_strategies",
            "transition": "transition",
            "complete": "complete"
        }
    )
    
    workflow.add_conditional_edges(
        "transition",
        route_user_input,
        {
            "collect_feedback": "collect_feedback",
            "complete": "complete"
        }
    )
    
    workflow.add_edge("complete", END)
    
    return workflow


# ============================================================================
# MAIN APPLICATION CLASS
# ============================================================================

class LangGraphFeedbackChatbot:
    """Feedback chatbot using LangGraph state machine"""
    
    def __init__(self, api_key: str):
        """Initialize the chatbot with LangGraph"""
        self.llm = ChatOpenAI(
            temperature=0.7,
            model="gpt-4o-mini",
            api_key=api_key
        )
        
        # Create workflow
        workflow = create_feedback_graph(self.llm)
        
        # Compile with memory
        self.memory = MemorySaver()
        self.app = workflow.compile(checkpointer=self.memory)
        
        # Initialize state
        self.thread_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.state = {
            "messages": [],
            "current_input": "",
            "session_id": self.thread_id,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "clinical_setting_type": None,
            "current_standard": "Standard 1",  # Default to Standard 1
            "conversation_phase": "collecting_feedback",  # Start in collecting phase
            "standards_completed": [],
            "standards_to_review": list(STANDARDS_DATA.keys()),
            "feedback_data": {},
            "total_tokens": 0,
            "api_calls": [],
            "next_action": None
        }
    
    def start_conversation(self) -> str:
        """Start the conversation - just return greeting without invoking graph"""
        greeting = """Hello! Thank you for taking the time to provide feedback on your nursing student.

I'll help you give structured feedback based on the BCCNM 4 Standards of Clinical Practice. This will take about 10-15 minutes.

🔒 PRIVACY & ANONYMITY PROTECTION:
• No personal information is collected or stored
• No names, facility names, or patient identifiers are requested
• All feedback is anonymized and used for educational purposes only

Which standard would you like to start with?

1. Standard 1: Professional Responsibility and Accountability
2. Standard 2: Knowledge-Based Practice
3. Standard 3: Client-Focused Provision of Service
4. Standard 4: Ethical Practice

Or just tell me what area you'd like to discuss!"""
        
        # Add greeting to messages
        self.state["messages"].append(AIMessage(content=greeting))
        return greeting
    
    def process_message(self, user_input: str) -> str:
        """Process user message through the graph
        
        Uses modern LangGraph invoke pattern with proper state updates
        """
        # Update state with user input - don't modify messages directly
        # The add_messages reducer will handle message appending in nodes
        self.state["current_input"] = user_input
        
        # Run through graph
        config = {"configurable": {"thread_id": self.thread_id}}
        try:
            result = self.app.invoke(self.state, config)
            self.state = result
            
            # Get last AI message
            for msg in reversed(result["messages"]):
                if isinstance(msg, AIMessage):
                    return msg.content
            
            return "I'm processing your response..."
        except Exception as e:
            error_msg = f"I encountered an error: {str(e)}. Please try again."
            # Return error message without modifying state directly
            return error_msg
    
    def export_to_json(self, filename: str = None) -> str:
        """Export feedback to JSON"""
        if filename is None:
            filename = f"feedback_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        export_data = {
            "session_id": self.state["session_id"],
            "date": self.state["date"],
            "clinical_setting_type": self.state.get("clinical_setting_type"),
            "standards_completed": self.state["standards_completed"],
            "feedback_data": self.state["feedback_data"],
            "token_usage": {
                "total_tokens": self.state["total_tokens"],
                "api_calls": self.state["api_calls"]
            }
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        return filename
    
    def export_to_csv(self, filename: str = None) -> str:
        """Export feedback to CSV"""
        if filename is None:
            filename = f"feedback_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            
            writer.writerow(["Session ID", self.state["session_id"]])
            writer.writerow(["Date", self.state["date"]])
            writer.writerow([])
            
            writer.writerow(["Standard", "Summary", "Improvement Strategies"])
            
            for std_num in self.state["standards_completed"]:
                std_data = self.state["feedback_data"].get(std_num, {})
                std_name = STANDARDS_DATA[std_num]["name"]
                
                summary = std_data.get('summary', 'N/A')
                improvements = std_data.get('preceptor_suggestions', '')
                if std_data.get('ai_suggestions'):
                    improvements += " | " + " | ".join(std_data['ai_suggestions'])
                
                writer.writerow([
                    f"{std_num}: {std_name}",
                    summary,
                    improvements
                ])
        
        return filename


# ============================================================================
# MAIN INTERFACE
# ============================================================================

def main():
    """Main interface for LangGraph-based feedback system"""
    
    print("\n" + "="*70)
    print("  NURSING PRECEPTOR FEEDBACK SYSTEM - LangGraph Edition")
    print("  State-based workflow powered by LangGraph")
    print("="*70)
    print("\n🔒 PRIVACY & ANONYMITY PROTECTION:")
    print("• No personal information is collected or stored")
    print("• No names, facility names, or patient identifiers are requested")
    print("• All feedback is anonymized and used for educational purposes only")
    print("• Session data is identified only by anonymous session ID")
    print("\nThis system uses LangGraph to create a structured, stateful")
    print("conversation flow for collecting nursing feedback.")
    print("\nCommands: 'quit' to exit, 'help' for assistance, 'tokens' to see usage")
    print("="*70 + "\n")
    
    # Load API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found in environment variables.")
        print("Please create a .env file with your OpenAI API key:")
        print("OPENAI_API_KEY=your-api-key-here")
        return
    
    bot = LangGraphFeedbackChatbot(api_key)
    
    print("\n" + bot.start_conversation())
    
    while True:
        user_input = input("\nYou: ").strip()
        
        if not user_input:
            continue
        
        if user_input.lower() == 'quit':
            # Check if user wants to export
            if bot.state["standards_completed"]:
                export_choice = input("\nWould you like to export your feedback? (yes/no): ").strip().lower()
                if export_choice == 'yes':
                    json_file = bot.export_to_json()
                    csv_file = bot.export_to_csv()
                    print(f"\n✅ Feedback exported:")
                    print(f"   JSON: {json_file}")
                    print(f"   CSV: {csv_file}")
            
            print("\nThank you! Goodbye.")
            break
        
        if user_input.lower() == 'help':
            print("\n📖 HELP:")
            print("• Answer questions naturally")
            print("• The system will guide you through each standard")
            print("• Type 'skip' to move to the next standard")
            print("• Type 'quit' to exit and export your feedback")
            print("• Type 'tokens' to see API usage statistics")
            continue
        
        if user_input.lower() == 'tokens':
            print(f"\n🔢 TOKEN USAGE:")
            print(f"   Total API Calls: {len(bot.state['api_calls'])}")
            print(f"   Total Tokens Used: {bot.state['total_tokens']:,}")
            print(f"   Standards Completed: {len(bot.state['standards_completed'])}/4")
            continue
        
        response = bot.process_message(user_input)
        print(f"\nBot: {response}")


if __name__ == "__main__":
    main()
