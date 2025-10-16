from langgraph.graph import StateGraph
from langchain import OpenAI
from langchain.chains import RetrievalQA
from retrievers.build_vectorstores import build_or_load_vectorstores


def create_feedback_graph():
    llm = OpenAI(model="gpt-4o-mini", temperature=0.3)
    stores = build_or_load_vectorstores()


    standards_retriever = stores["standards"].as_retriever(search_type="similarity", k=2)
    improvements_retriever = stores["improvements"].as_retriever(search_type="similarity", k=2)

    # === Node functions ===
    def intro_node(state):
        return {
            "message": (
                "👋 Welcome to the Clinical Feedback Helper.\n"
                "We’ll go through each BCCNM standard to structure feedback for your student.\n"
                "Let's begin with **Professional Responsibility and Accountability**."
            ),
            "next": "standard_node",
            "current_standard": "Professional Responsibility and Accountability"
        }

    def standard_node(state):
        qa = RetrievalQA.from_chain_type(llm=llm, retriever=standards_retriever)
        query = f"Summarize the key areas of focus and example prompts for {state['current_standard']}."
        answer = qa.run(query)
        return {
            "message": f"🔹 {answer}\n\nPlease share your observations for this area.",
            "next": "feedback_node"
        }

    def feedback_node(state):
        return {
            "message": "Thank you. I’ll analyze your feedback next to find potential strategies for improvement.",
            "next": "suggestion_node"
        }

    def suggestion_node(state):
        qa = RetrievalQA.from_chain_type(llm=llm, retriever=improvements_retriever)
        feedback = state.get("preceptor_feedback", "")
        query = f"Find improvement strategies or coaching tips relevant to: {feedback}"
        answer = qa.run(query)
        return {"message": f"💡 Suggested improvement strategies:\n{answer}", "next": "synthesis_node"}

    def synthesis_node(state):
        feedback = state.get("preceptor_feedback", "")
        suggestion = state.get("suggestion", "")
        summary = (
            f"🧾 Summary for {state['current_standard']}:\n"
            f"- Observation: {feedback}\n"
            f"- Suggestion: {suggestion}"
        )
        return {"message": summary, "next": "report_node"}

    def report_node(state):
        return {"message": "✅ All standards complete. Here’s your compiled feedback report.", "next": None}

    # === Graph Assembly ===
    g = StateGraph()
    g.add_node("intro_node", intro_node)
    g.add_node("standard_node", standard_node)
    g.add_node("feedback_node", feedback_node)
    g.add_node("suggestion_node", suggestion_node)
    g.add_node("synthesis_node", synthesis_node)
    g.add_node("report_node", report_node)

    g.set_entry_point("intro_node")
    return g
