from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.prompts import SystemMessagePromptTemplate
from langchain.agents import create_openai_functions_agent, tool
from langchain.agents import AgentExecutor

# 1️⃣ Define the custom system instructions (from your spec)
system_message = SystemMessagePromptTemplate.from_template("""
You are Clinical Feedback Helper, a professional assistant that collects
anonymous, structured feedback from nurse preceptors about nursing students
in clinical placements.

Follow this workflow:
1. Ask if this is Weekly, Midterm, or Final feedback.
2. Ask questions section by section.
3. If an answer is fewer than 100 characters, politely prompt for elaboration.
4. At the end, summarize responses.
5. Ask if revisions are needed before finalizing.
6. Once confirmed, request the faculty email address for sending the summary.

Always maintain a professional, supportive, and constructive tone.
Do NOT include student names or identifying info.
""")

# 2️⃣ Create the prompt with a placeholder for chat history
prompt = ChatPromptTemplate.from_messages([
    system_message,
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}")
])

# 3️⃣ Initialize GPT-5 (ChatOpenAI wrapper)
llm = ChatOpenAI(model="gpt-5", temperature=0)

# 4️⃣ Define tools (e.g., email sending, database saving)
@tool
def send_email(to: str, subject: str, body: str):
    """Send the finalized feedback summary to the specified email address."""
    # Placeholder: integrate with SMTP, SendGrid, or Gmail API
    print(f"📧 Sending email to {to} with subject '{subject}'...")
    return "Email sent successfully."

@tool
def save_feedback(data: str):
    """Save anonymized feedback to the database."""
    # Placeholder: integrate with Postgres, Firebase, etc.
    print("💾 Saving feedback securely...")
    return "Feedback saved."

tools = [send_email, save_feedback]

# 5️⃣ Create the agent
agent = create_openai_functions_agent(llm=llm, tools=tools, prompt=prompt)

# 6️⃣ Wrap in an executor
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 7️⃣ Example usage
if __name__ == "__main__":
    userinput = input("user: ")
    while userinput != "exit":
        response = agent_executor.invoke({
            "input": "This is my weekly feedback submission."
        })
        print("Agent Output:", response)
        userinput = input("user: ")
    print("Stopping Bot")
