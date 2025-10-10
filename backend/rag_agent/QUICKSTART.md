# Quick Start Guide - RAG Clinical Feedback Helper

Get up and running in 5 minutes! ⚡

## 🚀 Installation

### Step 1: Install Dependencies

```powershell
cd backend
pip install -r rag_agent/requirements_rag.txt
```

### Step 2: Set Up Environment

Create a `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=your_api_key_here
MODEL_NAME=gpt-4o-mini
TEMPERATURE=0.7
```

**Get your OpenAI API key**: https://platform.openai.com/api-keys

### Step 3: Run the Demo

```powershell
python -m rag_agent.demo
```

This will run a complete simulated feedback session and show you how everything works!

## 💬 Interactive Usage

### Start the CLI

```powershell
python -m rag_agent.cli
```

### Example Conversation

```
🤖 Assistant: Welcome! I'm the Clinical Feedback Helper...

You: The student consistently asked for help before performing new procedures.

🤖 Assistant: Thank you. Could you provide a specific example of when they did this?

You: When preparing to insert a catheter, they asked me to supervise and verify technique.

🤖 Assistant: Perfect! Here's the summary: [summary]. Does this look accurate?

You: Yes, that's good.

🤖 Assistant: Great! Let's move to Knowledge-Based Practice...
```

### Special Commands

- Type `status` to see current session state
- Type `quit` or `exit` to end session

## 🔧 Using the Python API

### Basic Example

```python
from rag_agent.agent import ClinicalFeedbackAgent
from rag_agent.utils import ReportExporter

# Initialize
agent = ClinicalFeedbackAgent()

# Start session
session_id, welcome = agent.start_session()
print(welcome)

# Process messages
response = agent.process_message("The student was very professional...")
print(response)

# Continue conversation...

# Generate report when done
if agent.current_session.is_complete():
    report = agent.generate_final_report()

    # Export
    exporter = ReportExporter()
    files = exporter.export_report(report)
    print(f"Reports saved: {files}")
```

## 📊 Understanding the Workflow

The agent guides you through **4 BCCNM standards** in order:

1. **Professional Responsibility** - Accountability, scope of practice, safety
2. **Knowledge-Based Practice** - Clinical skills, critical thinking
3. **Client-Focused Service** - Teamwork, communication, advocacy
4. **Ethical Practice** - Privacy, boundaries, cultural sensitivity

### For Each Standard

```
ASK → LISTEN → EVALUATE → PROBE (if needed) → SYNTHESIZE → CONFIRM
```

The agent will:

- ✅ Ask about the standard
- ✅ Evaluate your feedback quality
- ✅ Ask clarifying questions if needed
- ✅ Generate a professional summary and suggestion
- ✅ Ask you to confirm before moving on

## 🎯 Tips for Best Results

### DO ✅

- Provide specific examples from clinical practice
- Mention concrete situations or behaviors
- Be honest about strengths and areas for improvement
- Refer to "the student" (no names needed)

### DON'T ❌

- Use vague terms like "good" or "needs work" without explanation
- Include patient names or identifying information
- Include facility names or specific locations
- Rush - take time to think of specific examples

## 📁 Output Files

After completion, you'll get:

```
feedback_reports/
├── feedback_abc12345_20251006_143022.json  # Structured data
├── feedback_abc12345_20251006_143022.csv   # Spreadsheet format
└── session_abc12345_20251006_143022.json   # Full conversation log
```

## 🔍 Troubleshooting

### "OPENAI_API_KEY not found"

- Make sure `.env` file is in the `backend` directory
- Check that the file contains `OPENAI_API_KEY=sk-...`
- Restart your terminal after creating `.env`

### "Module not found" errors

```powershell
cd backend
pip install -r rag_agent/requirements_rag.txt
```

### Vector store initialization is slow

- First run takes ~30 seconds to create embeddings
- Subsequent runs are fast (loads existing store)
- To recreate: delete `backend/vectorstore` folder

### Agent gives unexpected responses

- Check your OpenAI API quota
- Try lowering temperature: `TEMPERATURE=0.3` in `.env`
- Ensure you're using a capable model (gpt-4o-mini or better)

## 📚 What Makes This RAG-Based?

**RAG = Retrieval-Augmented Generation**

Traditional chatbot:

```
User Question → LLM → Answer
```

This RAG implementation:

```
User Question → Vector Search → Retrieve BCCNM Standards
                    ↓
              LLM + Retrieved Context → Better Answer
```

**Benefits**:

- ✅ Always has accurate BCCNM standard information
- ✅ Reduces hallucinations
- ✅ More consistent responses
- ✅ Lower token costs

## 🎓 Next Steps

- Read the full [README.md](README.md) for architecture details
- Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for deep dive
- Customize standards in `config.py`
- Build a web interface with FastAPI or Streamlit

## 🆘 Need Help?

- Check the implementation guide
- Review example outputs in the demo
- Examine the code - it's well-documented!

---

**Ready to start? Run the demo! 🎬**

```powershell
python -m rag_agent.demo
```
