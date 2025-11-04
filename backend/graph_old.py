from typing import Literal, Dict, List
from pydantic import BaseModel, Field

from langgraph.graph import StateGraph, START, END
from langgraph.graph import MessagesState  # graph state with `messages` list
from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import create_retriever_tool


from retrievers.build_vectorstores import build_or_load_vectorstores


# ---------------------------
# Shared setup (models, KBs)
# ---------------------------
def _load_llm():
    # Follows docs pattern for OSS init_chat_model
    # e.g. "openai:gpt-4o" / "openai:gpt-4o-mini"
    return init_chat_model("openai:gpt-4o-mini", temperature=0)

LLM = _load_llm()

STORES = build_or_load_vectorstores()
STANDARDS_RETRIEVER = STORES["standards"].as_retriever(search_kwargs={"k": 3})
IMPROVEMENTS_RETRIEVER = STORES["improvements"].as_retriever(search_kwargs={"k": 3})

# Wrap retrievers as tools (Agentic RAG tutorial)
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
# Grader schema (Agentic RAG)
# ---------------------------
GRADE_PROMPT = (
    "You are a grader assessing relevance of a retrieved document to a user question.\n"
    "Document:\n{context}\n\nQuestion: {question}\n"
    "If the document contains keywords or semantic meaning related to the question, "
    "return binary_score='yes', else 'no'."
)

class GradeDocuments(BaseModel):
    binary_score: str = Field(description="Use 'yes' if relevant, 'no' if not relevant")


def _with_system(messages: List[dict], system_text: str) -> List[dict]:
    # Ensure a system message is prepended (MessagesState accepts dict role/content)
    return [{"role": "system", "content": system_text}, *messages]


# ---------------------------
# Nodes (Agentic RAG tutorial)
# ---------------------------
def supervisor_router(state: MessagesState) -> Dict:
    """
    Tiny supervisor: decide which KB/tool to expose based on the intent.
    For simplicity, we look for keywords in the latest user message.
    In a richer system, you'd wrap sub-agents as tools (see supervisor tutorial).
    """
    last = state["messages"][-1].content if state["messages"] else ""
    if any(k in last.lower() for k in ["improve", "strategy", "suggestion", "needs to", "could they"]):
        # Expose improvements tool
        response = (
            LLM.bind_tools([IMPROVEMENTS_TOOL])
            .invoke(_with_system(state["messages"], "Use the improvements retriever tool when needed."))
        )
        return {"messages": [response], "kb": "improvements"}
    else:
        # Default to standards tool
        response = (
            LLM.bind_tools([STANDARDS_TOOL])
            .invoke(_with_system(state["messages"], "Use the standards retriever tool when needed."))
        )
        return {"messages": [response], "kb": "standards"}


def generate_query_or_respond(state: MessagesState) -> Dict:
    """
    Core agent step: model chooses to call the attached retriever tool or respond directly.
    Tool attachment is based on 'kb' decided by the supervisor_router.
    """
    kb = state.get("kb", "standards")
    tool = IMPROVEMENTS_TOOL if kb == "improvements" else STANDARDS_TOOL
    response = LLM.bind_tools([tool]).invoke(state["messages"])
    return {"messages": [response]}


def grade_documents(state: MessagesState) -> Literal["generate_answer", "rewrite_question"]:
    """
    Decide whether retrieved docs (tool result) are relevant.
    We follow the agentic-rag ‘grading’ pattern (structured output). 
    """
    # In a real system you'd parse tool result content; for simplicity, grade the last assistant/tool content.
    question = next((m.content for m in state["messages"] if m.type == "human"), "")
    context = state["messages"][-1].content if state["messages"] else ""
    prompt = GRADE_PROMPT.format(question=question, context=context)

    grader = _load_llm()
    decision = grader.with_structured_output(GradeDocuments).invoke([{"role": "user", "content": prompt}])
    return "generate_answer" if decision.binary_score == "yes" else "rewrite_question"


REWRITE_PROMPT = (
    "Look at the user input and improve the search query to better match the user's intent. "
    "Return just the rewritten query."
)

def rewrite_question(state: MessagesState) -> Dict:
    # Ask model to rewrite; then add it as a new HumanMessage
    rewriter = _load_llm()
    rewritten = rewriter.invoke([{"role": "user", "content": REWRITE_PROMPT + "\n\n" + state["messages"][0].content}])
    return {"messages": [HumanMessage(content=rewritten.content)]}


ANSWER_PROMPT = (
    "Use the retrieved context (from tools) to answer the user's request concisely. "
    "If context is insufficient, say you don't know."
)

def generate_answer(state: MessagesState) -> Dict:
    system_text = ANSWER_PROMPT
    answer = LLM.invoke(_with_system(state["messages"], system_text))
    return {"messages": [answer]}


# ---------------------------
# Conversation scaffold nodes (Clinical Feedback Helper phases)
# ---------------------------
def intro_node(state: MessagesState) -> Dict:
    with open("prompts/clinical_feedback_prompt.txt", "r", encoding="utf-8") as f:
        role_prompt = f.read()
    intro = LLM.invoke([
        SystemMessage(content=role_prompt),
        HumanMessage(content="Start the session (Phase 1: Introduction).")
    ])
    return {"messages": [intro]}

def synthesize_one_standard(state: MessagesState) -> Dict:
    """
    Take the latest human observation and the latest suggested improvement from tool-grounded answer,
    and synthesize a short COIN-style summary for the current standard.
    """
    sys = (
        "Synthesize a concise COIN-style summary with one observation and one actionable suggestion. "
        "Do not include PII. Keep it under 120 words."
    )
    out = LLM.invoke(_with_system(state["messages"], sys))
    return {"messages": [out]}


# ---------------------------
# Build the graph
# ---------------------------
def create_feedback_graph():
    g = StateGraph(MessagesState)

    # Phase 1: intro
    g.add_node("intro", intro_node)

    # Phase 2: agentic RAG loop
    g.add_node("supervisor_router", supervisor_router)     # decide which KB/tool to bind
    g.add_node("generate_query_or_respond", generate_query_or_respond)
    g.add_node("grade_documents", grade_documents)         # conditional edge function
    g.add_node("rewrite_question", rewrite_question)
    g.add_node("generate_answer", generate_answer)
    g.add_node("synthesize_one_standard", synthesize_one_standard)

    # Edges
    g.add_edge(START, "intro")
    g.add_edge("intro", "supervisor_router")
    g.add_edge("supervisor_router", "generate_query_or_respond")
    g.add_conditional_edges("grade_documents", grade_documents, {
        "generate_answer": "generate_answer",
        "rewrite_question": "rewrite_question",
    })
    g.add_edge("generate_query_or_respond", "grade_documents")
    g.add_edge("rewrite_question", "generate_query_or_respond")
    g.add_edge("generate_answer", "synthesize_one_standard")
    g.add_edge("synthesize_one_standard", END)

    g.set_entry_point("intro")
    return g
