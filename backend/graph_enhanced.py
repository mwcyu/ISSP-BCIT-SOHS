import os
from typing import Literal, Dict, List
from dotenv import load_dotenv

from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.tools import create_retriever_tool


from retrievers.build_vectorstores import build_or_load_vectorstores

# Load environment variables from .env file
load_dotenv()


# ---------------------------
# Enhanced State Schema (TypedDict pattern from LangGraph docs)
# ---------------------------
class FeedbackState(TypedDict):
    """
    Extended state schema for clinical feedback workflow.
    
    Uses TypedDict pattern from LangGraph documentation for type-safe state management.
    Each field represents a different aspect of the feedback session.
    """
    messages: List  # Conversation history
    kb: str  # Current knowledge base routing ("standards" or "improvements")
    current_standard: str  # The BCCNM standard currently being addressed
    standard_context: str  # Retrieved context about the current standard
    preceptor_feedback: str  # Raw feedback from preceptor
    identified_concerns: List[str]  # Analyzed concerns/areas of improvement
    improvement_strategies: str  # Retrieved improvement strategies
    coin_summary: str  # Final COIN-format summary for current standard


# ---------------------------
# Shared setup (models, KBs)
# ---------------------------
def _load_llm():
    """Initialize LLM following LangChain docs pattern."""
    return init_chat_model("openai:gpt-4o-mini", temperature=0)

LLM = _load_llm()

STORES = build_or_load_vectorstores()

# Configure retrievers with similarity search
STANDARDS_RETRIEVER = STORES["standards"].as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)
IMPROVEMENTS_RETRIEVER = STORES["improvements"].as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}
)

# Wrap retrievers as tools for Agentic RAG
STANDARDS_TOOL = create_retriever_tool(
    STANDARDS_RETRIEVER,
    "retrieve_standards",
    "Search and return passages about BCCNM standards focus areas and prompting questions.",
)
IMPROVEMENTS_TOOL = create_retriever_tool(
    IMPROVEMENTS_RETRIEVER,
    "retrieve_improvements",
    "Search and return passages with improvement strategies for students.",
)


# ---------------------------
# Structured Output Schemas
# ---------------------------
class GradeDocuments(BaseModel):
    """Binary score for relevance check."""
    binary_score: str = Field(description="Use 'yes' if relevant, 'no' if not relevant")


class IdentifiedConcerns(BaseModel):
    """Structured output for analyzing preceptor feedback."""
    concerns: List[str] = Field(
        description="List of specific concerns or areas needing improvement mentioned by preceptor"
    )
    positive_aspects: List[str] = Field(
        description="List of positive observations or strengths mentioned by preceptor"
    )


# ---------------------------
# Helper Functions
# ---------------------------
def _with_system(messages: List, system_text: str) -> List:
    """Prepend a system message to the message list."""
    return [{"role": "system", "content": system_text}] + list(messages)


def _get_standard_context(standard_name: str) -> str:
    """
    Retrieve context documents for a specific BCCNM standard.
    Uses similarity search on the standards vectorstore.
    """
    docs = STANDARDS_RETRIEVER.invoke(standard_name)
    return "\n\n".join([doc.page_content for doc in docs])


# ---------------------------
# Core Workflow Nodes
# ---------------------------
def intro_node(state: FeedbackState) -> Dict:
    """
    Initial greeting and orientation for the preceptor.
    Loads role-specific prompt from file and generates introduction.
    """
    prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "clinical_feedback_prompt.txt")
    
    with open(prompt_path, "r", encoding="utf-8") as f:
        role_prompt = f.read()
    
    intro = LLM.invoke([
        SystemMessage(content=role_prompt),
        HumanMessage(content="Start the session (Phase 1: Introduction).")
    ])
    return {"messages": [intro]}


def set_current_standard(state: FeedbackState) -> Dict:
    """
    Extract and set the current standard being discussed.
    Retrieves relevant context from the standards KB for use in all prompts.
    """
    # Extract standard name from latest human message
    last_msg = state["messages"][-1].content if state["messages"] else ""
    
    # List of BCCNM standards
    standards_list = [
        "Professional Responsibility and Accountability",
        "Knowledge-Based Practice",
        "Client-Focused Service",
        "Ethical Practice",
    ]
    
    # Find which standard is mentioned
    current_standard = ""
    for std in standards_list:
        if std.lower() in last_msg.lower():
            current_standard = std
            break
    
    # Retrieve context for this standard
    standard_context = ""
    if current_standard:
        standard_context = _get_standard_context(current_standard)
    
    return {
        "current_standard": current_standard,
        "standard_context": standard_context
    }


def analyze_feedback(state: FeedbackState) -> Dict:
    """
    Analyze preceptor's feedback to identify concerns and areas of improvement.
    
    This node uses structured output (Pydantic) to reliably extract:
    - Specific concerns or areas needing improvement
    - Positive observations or strengths
    
    Uses the standard context to ground the analysis in BCCNM standards.
    """
    # Get the latest preceptor feedback
    preceptor_msg = ""
    for msg in reversed(state["messages"]):
        if hasattr(msg, 'type') and msg.type == "human":
            preceptor_msg = msg.content
            break
    
    # Build analysis prompt with standard context
    analysis_prompt = f"""You are analyzing clinical feedback for nursing students based on BCCNM standards.

**Current Standard**: {state.get('current_standard', 'Not specified')}

**Standard Context**:
{state.get('standard_context', 'No context available')}

**Preceptor's Feedback**:
{preceptor_msg}

Based on this feedback, identify:
1. **Concerns**: Specific areas where the student needs improvement or is not meeting the standard
2. **Positive Aspects**: Strengths or areas where the student is meeting or exceeding the standard

Be specific and reference the BCCNM standard context when applicable."""

    # Use structured output for reliable parsing
    analyzer = LLM.with_structured_output(IdentifiedConcerns)
    analysis = analyzer.invoke([{"role": "user", "content": analysis_prompt}])
    
    return {
        "preceptor_feedback": preceptor_msg,
        "identified_concerns": analysis.concerns
    }


def supervisor_router(state: FeedbackState) -> Dict:
    """
    Route to appropriate KB based on workflow stage.
    After analysis, always route to improvements for strategies.
    """
    # After feedback analysis, route to improvements KB
    if state.get("identified_concerns"):
        return {"kb": "improvements"}
    else:
        # Default to standards KB
        return {"kb": "standards"}


def generate_query_or_respond(state: FeedbackState) -> Dict:
    """
    Core agent step: LLM decides whether to call retriever tool or respond directly.
    Includes standard context in all prompts for grounded responses.
    """
    kb = state.get("kb", "standards")
    tool = IMPROVEMENTS_TOOL if kb == "improvements" else STANDARDS_TOOL
    
    # Build context-aware system message
    system_msg = f"""You are a clinical feedback assistant helping nursing preceptors.

**Current BCCNM Standard**: {state.get('current_standard', 'Not specified')}

**Standard Details**:
{state.get('standard_context', 'No context available')}

**Identified Concerns** (areas needing improvement):
{chr(10).join(f'- {c}' for c in state.get('identified_concerns', [])) if state.get('identified_concerns') else 'None identified yet'}

Use the retriever tool when you need specific guidance or strategies. Provide responses grounded in BCCNM standards."""

    # Bind appropriate tool and invoke with context
    response = LLM.bind_tools([tool]).invoke(
        _with_system(state["messages"], system_msg)
    )
    return {"messages": [response]}


def should_continue(state: FeedbackState) -> Literal["tools", "grade_documents"]:
    """
    Router function: decide whether to execute tools or grade results.
    Checks if the last message contains tool calls.
    """
    last_message = state["messages"][-1]
    
    # If LLM made tool calls, execute them
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "tools"
    
    # Otherwise, proceed to grade the documents
    return "grade_documents"


GRADE_PROMPT = (
    "You are a grader assessing relevance of a retrieved document to a user question.\n"
    "Document:\n{context}\n\nQuestion: {question}\n"
    "If the document contains keywords or semantic meaning related to the question, "
    "return binary_score='yes', else 'no'."
)

def grade_documents(state: FeedbackState) -> Literal["generate_answer", "rewrite_question"]:
    """
    Grade retrieved documents for relevance using structured output.
    """
    # Extract question from human messages
    question = ""
    for msg in state["messages"]:
        if hasattr(msg, 'type') and msg.type == "human":
            question = msg.content
            break
    
    # Get context from tool messages (retrieval results)
    context = ""
    for msg in reversed(state["messages"]):
        if hasattr(msg, 'type') and msg.type == "tool":
            context = msg.content
            break
    
    # If no tool results, just generate answer
    if not context:
        return "generate_answer"
    
    # Format grading prompt
    prompt = GRADE_PROMPT.format(question=question, context=context)
    
    # Use structured output with Pydantic model
    grader = LLM.with_structured_output(GradeDocuments)
    decision = grader.invoke([{"role": "user", "content": prompt}])
    
    # Route based on relevance assessment
    return "generate_answer" if decision.binary_score == "yes" else "rewrite_question"


REWRITE_PROMPT = (
    "Look at the input and try to reason about the underlying semantic intent / meaning.\n"
    "Here is the initial question:\n"
    "------- \n"
    "{question}\n"
    "------- \n"
    "Formulate an improved question that will retrieve better results:"
)

def rewrite_question(state: FeedbackState) -> Dict:
    """
    Rewrite user question for better retrieval results.
    """
    messages = state["messages"]
    original_question = messages[0].content if messages else ""
    
    prompt = REWRITE_PROMPT.format(question=original_question)
    rewritten = LLM.invoke([{"role": "user", "content": prompt}])
    
    return {"messages": [HumanMessage(content=rewritten.content)]}


def generate_answer(state: FeedbackState) -> Dict:
    """
    Generate final answer using retrieved context.
    Includes standard context and identified concerns in the system prompt.
    """
    system_prompt = f"""You are a helpful assistant for nursing preceptors.

**Current BCCNM Standard**: {state.get('current_standard', 'Not specified')}

**Standard Context**:
{state.get('standard_context', 'No context available')}

**Identified Student Concerns**:
{chr(10).join(f'- {c}' for c in state.get('identified_concerns', [])) if state.get('identified_concerns') else 'None identified'}

Use the retrieved context (from tools) to answer the user's request concisely.
Provide specific, actionable strategies that address the identified concerns.
Ground all suggestions in BCCNM standards.
If the context is insufficient, acknowledge the limitation and provide your best guidance.
Keep responses focused and actionable."""

    answer = LLM.invoke(_with_system(state["messages"], system_prompt))
    return {"messages": [answer]}


def synthesize_one_standard(state: FeedbackState) -> Dict:
    """
    Synthesize feedback and suggestions into a structured COIN-style summary.
    Uses all collected context: standard details, concerns, and strategies.
    """
    system_prompt = f"""You are synthesizing clinical feedback for nursing preceptors.

**BCCNM Standard**: {state.get('current_standard', 'Not specified')}

**Standard Context**:
{state.get('standard_context', 'No context available')}

**Identified Concerns/Areas for Improvement**:
{chr(10).join(f'- {c}' for c in state.get('identified_concerns', [])) if state.get('identified_concerns') else 'None identified'}

**Preceptor's Original Feedback**:
{state.get('preceptor_feedback', 'No feedback provided')}

Create a concise COIN-style summary:
- **Context**: The practice standard being addressed and the clinical situation
- **Observation**: What the preceptor observed (both strengths and concerns)
- **Impact**: Significance for patient care/learning and alignment with BCCNM standards
- **Next steps**: Actionable improvement strategies based on retrieved guidance

**Requirements**:
- No personally identifiable information (PII)
- Maximum 150 words
- Professional, constructive tone
- Specific and actionable
- Grounded in BCCNM {state.get('current_standard', 'standard')} context"""

    synthesis = LLM.invoke(_with_system(state["messages"], system_prompt))
    
    return {
        "messages": [synthesis],
        "coin_summary": synthesis.content
    }


# ---------------------------
# Build the graph (LangGraph StateGraph pattern)
# ---------------------------
def create_feedback_graph():
    """
    Construct the enhanced clinical feedback assistant graph.
    
    New workflow with analysis node and context-aware prompts:
    1. intro → welcome preceptor
    2. set_current_standard → extract standard and retrieve context
    3. analyze_feedback → identify concerns and positive aspects
    4. supervisor_router → route to improvements KB
    5. generate_query_or_respond → LLM with context-aware prompts
    6. tools → execute retriever tools (if needed)
    7. grade_documents → assess retrieval relevance
    8. generate_answer → generate contextual response
    9. synthesize_one_standard → create COIN summary with full context
    """
    # Initialize graph with custom state schema
    graph = StateGraph(FeedbackState)

    # Create tool node for automatic tool execution
    tools_node = ToolNode([STANDARDS_TOOL, IMPROVEMENTS_TOOL])

    # Add all nodes
    graph.add_node("intro", intro_node)
    graph.add_node("set_current_standard", set_current_standard)
    graph.add_node("analyze_feedback", analyze_feedback)
    graph.add_node("supervisor_router", supervisor_router)
    graph.add_node("generate_query_or_respond", generate_query_or_respond)
    graph.add_node("tools", tools_node)
    graph.add_node("rewrite_question", rewrite_question)
    graph.add_node("generate_answer", generate_answer)
    graph.add_node("synthesize_one_standard", synthesize_one_standard)

    # Define edges (workflow connections)
    graph.add_edge(START, "intro")
    graph.add_edge("intro", "set_current_standard")
    graph.add_edge("set_current_standard", "analyze_feedback")
    graph.add_edge("analyze_feedback", "supervisor_router")
    graph.add_edge("supervisor_router", "generate_query_or_respond")
    
    # Conditional edge: check if tools need execution
    graph.add_conditional_edges(
        "generate_query_or_respond",
        should_continue,
        {
            "tools": "tools",
            "grade_documents": "generate_answer",  # No tools = direct answer
        }
    )
    
    # After tools execute, grade the retrieved documents
    graph.add_conditional_edges(
        "tools",
        grade_documents,
        {
            "generate_answer": "generate_answer",
            "rewrite_question": "rewrite_question",
        }
    )
    
    # Rewrite loop: try retrieval again with improved query
    graph.add_edge("rewrite_question", "generate_query_or_respond")
    
    # Final synthesis and completion
    graph.add_edge("generate_answer", "synthesize_one_standard")
    graph.add_edge("synthesize_one_standard", END)

    # Compile and return executable graph
    return graph.compile()
