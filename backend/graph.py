import os
from typing import Literal, Dict, List
from dotenv import load_dotenv

from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from langgraph.graph import StateGraph, START, END
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.documents import Document

from retrievers.build_vectorstores import build_or_load_vectorstores

# Load environment variables from .env file
load_dotenv()


# ---------------------------
# State Definition (reference.langchain.com/python pattern)
# ---------------------------
class FeedbackState(TypedDict):
    """
    State for clinical feedback workflow.
    Pattern from: https://python.langchain.com/docs/tutorials/rag
    """
    current_standard: str  # Current BCCNM standard being discussed
    preceptor_feedback: str  # Raw feedback from preceptor
    context: List[Document]  # Retrieved documents related to current standard
    concerns: List[str]  # Identified concerns/areas of improvement
    suggestions: str  # Improvement suggestions from knowledge base
    synthesis: str  # Final COIN-format summary


# ---------------------------
# Shared setup (models, KBs)
# ---------------------------
def _load_llm():
    """Initialize LLM with consistent settings."""
    return init_chat_model("openai:gpt-4o-mini", temperature=0)

LLM = _load_llm()
STORES = build_or_load_vectorstores()


# ---------------------------
# Node 1: Retrieve context for current standard
# Pattern: https://python.langchain.com/docs/tutorials/rag
# ---------------------------
def retrieve_standard_context(state: FeedbackState) -> Dict:
    """
    Retrieve relevant documents for the current standard.
    This context will be used throughout the workflow.
    """
    standard = state["current_standard"]
    
    # Search standards KB for relevant documents
    retrieved_docs = STORES["standards"].similarity_search(
        standard,
        k=5  # Get top 5 most relevant documents
    )
    
    return {"context": retrieved_docs}


# ---------------------------
# Node 2: Analyze preceptor feedback for concerns
# NEW: Identifies areas of improvement from feedback
# ---------------------------
class ConcernAnalysis(BaseModel):
    """Structured output for concern identification."""
    concerns: List[str] = Field(
        description="List of specific concerns or areas needing improvement mentioned in the feedback"
    )

def analyze_concerns(state: FeedbackState) -> Dict:
    """
    Analyze preceptor's feedback to identify concerns and areas of improvement.
    Uses structured output for reliable extraction.
    
    Pattern: https://python.langchain.com/docs/how_to/structured_output
    """
    feedback = state["preceptor_feedback"]
    standard = state["current_standard"]
    
    # Get context as formatted string
    context_text = "\n\n".join(doc.page_content for doc in state["context"])
    
    analysis_prompt = f"""You are analyzing feedback from a nursing preceptor about a student's performance.

Standard: {standard}

Relevant BCCNM Standards Context:
{context_text}

Preceptor's Feedback:
{feedback}

Identify specific concerns, areas of improvement, or gaps in the student's practice. 
Be specific and focus on actionable items. If the feedback is entirely positive, return an empty list.
"""
    
    # Use structured output for reliable parsing
    structured_llm = LLM.with_structured_output(ConcernAnalysis)
    analysis = structured_llm.invoke([{"role": "user", "content": analysis_prompt}])
    
    return {"concerns": analysis.concerns}


# ---------------------------
# Node 3: Retrieve improvement suggestions
# ---------------------------
def retrieve_suggestions(state: FeedbackState) -> Dict:
    """
    Retrieve improvement strategies based on identified concerns.
    Uses the concerns to search the improvements KB.
    """
    concerns = state["concerns"]
    
    if not concerns:
        # No concerns identified, no suggestions needed
        return {"suggestions": "No specific areas of concern identified. Continue current practices."}
    
    # Combine concerns into search query
    query = " ".join(concerns)
    
    # Search improvements KB
    improvement_docs = STORES["improvements"].similarity_search(query, k=3)
    
    # Format suggestions
    suggestions_text = "\n\n".join(doc.page_content for doc in improvement_docs)
    
    return {"suggestions": suggestions_text}


# ---------------------------
# Node 4: Synthesize COIN-format summary
# ---------------------------
def synthesize_feedback(state: FeedbackState) -> Dict:
    """
    Generate final COIN-format summary combining all information.
    
    COIN Format:
    - Context: The practice standard being addressed
    - Observation: What the preceptor observed
    - Impact: Significance for patient care/learning
    - Next steps: Actionable improvement strategies
    """
    standard = state["current_standard"]
    feedback = state["preceptor_feedback"]
    concerns = state["concerns"]
    suggestions = state["suggestions"]
    context_text = "\n\n".join(doc.page_content for doc in state["context"])
    
    synthesis_prompt = f"""You are synthesizing clinical feedback for nursing education.

Standard: {standard}

BCCNM Standards Context:
{context_text}

Preceptor's Original Feedback:
{feedback}

Identified Concerns/Areas for Improvement:
{', '.join(concerns) if concerns else 'None identified'}

Relevant Improvement Strategies:
{suggestions}

Create a concise COIN-style summary:
- **Context**: The {standard} standard being addressed
- **Observation**: Specific behaviors/actions the preceptor observed
- **Impact**: Why this matters for patient care and student learning
- **Next Steps**: Specific, actionable strategies for improvement (if concerns exist) or reinforcement (if positive)

Requirements:
- No personally identifiable information (PII)
- Maximum 300 words
- Professional, constructive tone
- Specific and actionable
- Balance concerns with strengths when both exist
"""
    
    response = LLM.invoke([{"role": "user", "content": synthesis_prompt}])
    
    return {"synthesis": response.content}


# ---------------------------
# Build the simplified graph
# Pattern: https://python.langchain.com/docs/tutorials/rag
# ---------------------------
def create_feedback_graph():
    """
    Simplified clinical feedback workflow.
    
    Flow (Linear):
    1. retrieve_standard_context → Get relevant standards documents
    2. analyze_concerns → Extract concerns from preceptor feedback
    3. retrieve_suggestions → Get improvement strategies for concerns
    4. synthesize_feedback → Create COIN-format summary
    
    This is much simpler than the previous agentic architecture:
    - No complex routing or tool calling
    - No document grading loops
    - Straight-through processing
    - Context retrieved once and used throughout
    """
    # Initialize graph with custom state
    graph = StateGraph(FeedbackState)

    # Add nodes in sequence
    graph.add_node("retrieve_standard_context", retrieve_standard_context)
    graph.add_node("analyze_concerns", analyze_concerns)
    graph.add_node("retrieve_suggestions", retrieve_suggestions)
    graph.add_node("synthesize_feedback", synthesize_feedback)

    # Define linear flow
    graph.add_edge(START, "retrieve_standard_context")
    graph.add_edge("retrieve_standard_context", "analyze_concerns")
    graph.add_edge("analyze_concerns", "retrieve_suggestions")
    graph.add_edge("retrieve_suggestions", "synthesize_feedback")
    graph.add_edge("synthesize_feedback", END)

    # Compile and return
    return graph.compile()
