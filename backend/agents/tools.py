from typing import List

from langchain_core.tools import tool
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# We pass concrete retrievers in at runtime; these "tools" are factories over callables.

def make_rag_answerer(llm: ChatOpenAI, system_template: str, retriever):
    """
    Minimal RAG per docs: retriever.get_relevant_documents(query) -> compose context -> llm.invoke([...])
    """
    def answer(query: str) -> str:
        docs: List[Document] = retriever.get_relevant_documents(query)
        context = "\n---\n".join(d.page_content for d in docs)
        messages = [
            SystemMessage(content=system_template.format(context=context)),
            HumanMessage(content=query)
        ]
        resp = llm.invoke(messages)
        return resp.content if hasattr(resp, "content") else str(resp)
    return answer

def bind_tool_from_callable(fn, name: str, description: str):
    """
    Wrap a simple callable as a LangChain tool so the LLM (or code) can call it uniformly.
    """
    @tool(name=name)
    def _tool(query: str) -> str:
        """{desc}""".format(desc=description)
        return fn(query)
    return _tool
