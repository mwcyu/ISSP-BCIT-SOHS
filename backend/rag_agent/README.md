# RAG-Based Clinical Feedback Helper

A modern, production-ready implementation of the Clinical Feedback Helper using **LangChain** with **Retrieval-Augmented Generation (RAG)** architecture.

## 🏗️ Architecture

This implementation follows best practices from the latest LangChain documentation:

### Key Components

1. **RAG-based Knowledge Retrieval**: Uses vector embeddings to retrieve relevant BCCNM standard information
2. **LangChain Expression Language (LCEL)**: Modern chain composition for better maintainability
3. **Structured Outputs**: Pydantic models for type-safe data handling
4. **Modular Design**: Clean separation of concerns across modules

### Project Structure

```
rag_agent/
├── __init__.py          # Package initialization
├── config.py            # Configuration and BCCNM standards data
├── models.py            # Pydantic models for structured data
├── vectorstore.py       # Vector store management (Chroma + OpenAI embeddings)
├── chains.py            # LangChain chains using LCEL
├── agent.py             # Core agent logic and workflow orchestration
├── utils.py             # Report generation and export utilities
└── cli.py               # Command-line interface
```

## 🚀 Features

### RAG Implementation

- **Vector Store**: ChromaDB with OpenAI embeddings for semantic search
- **Context Retrieval**: Automatically retrieves relevant BCCNM standard information
- **Smart Prompting**: Context-aware prompt generation based on retrieved knowledge

### Modern LangChain Patterns

- **LCEL Chains**: Uses LangChain Expression Language for composable chains
- **Structured Outputs**: Type-safe parsing with Pydantic models
- **Parallel Execution**: Efficient multi-chain execution where applicable
- **Message History**: Proper conversation memory management

### Core Functionality

- **4 BCCNM Standards**: Complete workflow coverage
- **Privacy Protection**: Automatic PII detection and prevention
- **Quality Assessment**: AI-powered feedback evaluation
- **Smart Probing**: Context-aware follow-up questions
- **Report Generation**: Professional feedback summaries and suggestions

## 📋 Requirements

```
langchain>=0.3.0
langchain-openai>=0.2.0
langchain-community>=0.3.0
openai>=1.0.0
chromadb>=0.4.0
pydantic>=2.0.0
python-dotenv>=1.0.0
```

## 🔧 Setup

### 1. Install Dependencies

```bash
pip install -r requirements_rag.txt
```

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```env
OPENAI_API_KEY=your_api_key_here
MODEL_NAME=gpt-4o-mini
TEMPERATURE=0.7
```

### 3. Initialize Vector Store

The vector store is automatically initialized on first run. It creates embeddings of the BCCNM standards for retrieval.

## 🎯 Usage

### Command Line Interface

```bash
cd backend
python -m rag_agent.cli
```

### Python API

```python
from rag_agent.agent import ClinicalFeedbackAgent
from rag_agent.utils import ReportExporter

# Initialize agent
agent = ClinicalFeedbackAgent()

# Start session
session_id, welcome = agent.start_session()
print(welcome)

# Process messages
response = agent.process_message("The student was very professional...")
print(response)

# Generate report when complete
if agent.current_session.is_complete():
    report = agent.generate_final_report()

    # Export report
    exporter = ReportExporter()
    files = exporter.export_report(report)
```

## 🔄 Workflow

The agent follows this structured workflow:

### 1. Session Initialization

- Generates welcome message
- Introduces first BCCNM standard
- Explains process and privacy policy

### 2. Feedback Collection Loop (for each standard)

```
ASK → LISTEN → EVALUATE → PROBE (if needed) → SYNTHESIZE → CONFIRM
```

**ASK**: Present standard with context from RAG
**LISTEN**: Receive preceptor feedback
**EVALUATE**: Assess feedback quality (specific? has example?)
**PROBE**: Ask clarifying questions if needed
**SYNTHESIZE**: Generate summary and suggestion
**CONFIRM**: Verify accuracy before proceeding

### 3. Completion

- Request email for report delivery
- Generate comprehensive report
- Export to JSON and CSV formats

## 📊 Data Models

### FeedbackSession

Tracks the entire conversation state:

- Session ID and timestamps
- Current standard being discussed
- Feedback collected for each standard
- Conversation history
- Session state (initialized, collecting, confirming, completed)

### StandardFeedback

Stores feedback for one standard:

- Raw feedback from preceptor
- Quality evaluation
- Professional summary
- Actionable suggestion
- Confirmation status

### FeedbackEvaluation

AI assessment of feedback quality:

- Specificity (detailed vs vague)
- Example presence (concrete clinical situation)
- Quality classification
- Key points extraction

## 🧠 RAG Implementation Details

### Knowledge Base

The vector store contains:

- All 4 BCCNM standards with full descriptions
- Key areas for each standard
- Example questions for preceptors
- Guidance for evaluation

### Retrieval Strategy

- **Semantic Search**: Finds most relevant context for queries
- **Filtered Search**: Can retrieve specific standard information
- **Top-K Retrieval**: Configurable number of documents (default: 3)

### Chain Architecture

1. **Conversation Chain**: Main interaction with RAG context
2. **Evaluation Chain**: Structured output for feedback assessment
3. **Privacy Chain**: PII detection with structured output
4. **Synthesis Chain**: Generate summaries and suggestions
5. **Probe Chain**: Context-aware follow-up questions
6. **Standard Introduction Chain**: Introduce each standard with RAG

## 🔒 Privacy & Security

### Automatic PII Detection

- Scans all preceptor input for personally identifiable information
- Detects names, facilities, specific dates, medical records
- Prompts for rephrasing if PII detected

### Data Storage

- Only anonymous feedback stored
- Session IDs used instead of identifying information
- No patient or student names collected

## 📈 Export Formats

### JSON Format

```json
{
  "session_id": "abc123...",
  "generated_at": "2025-10-06T...",
  "feedback": {
    "Professional Responsibility": {
      "summary": "...",
      "suggestion": "...",
      "raw_feedback": "..."
    }
  }
}
```

### CSV Format

Columns: Session ID, Generated At, Standard, Summary, Suggestion, Raw Feedback

## 🛠️ Configuration

All settings in `config.py`:

```python
# Model Settings
MODEL_NAME = "gpt-4o-mini"
TEMPERATURE = 0.7

# RAG Settings
EMBEDDING_MODEL = "text-embedding-3-small"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

# Vector Store
VECTOR_STORE_PATH = "./vectorstore"
COLLECTION_NAME = "bccnm_standards"
```

## 🧪 Testing

```bash
# Run with test mode
python -m rag_agent.cli

# Check session status during conversation
You: status

# View agent state
from rag_agent.agent import ClinicalFeedbackAgent
agent = ClinicalFeedbackAgent()
agent.start_session()
print(agent.get_session_state())
```

## 📚 LangChain Patterns Used

### 1. LCEL (LangChain Expression Language)

```python
chain = (
    RunnableParallel(
        context=retriever,
        input=lambda x: x["input"]
    )
    | prompt
    | llm
    | output_parser
)
```

### 2. Structured Outputs with Pydantic

```python
parser = PydanticOutputParser(pydantic_object=FeedbackEvaluation)
chain = prompt | llm | parser
```

### 3. Message History Management

```python
MessagesPlaceholder(variable_name="chat_history")
```

### 4. Retrieval-Augmented Generation

```python
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
context = retriever.invoke(query)
```

## 🔮 Future Enhancements

- [ ] Web interface with Streamlit/FastAPI
- [ ] Multi-session management
- [ ] Advanced analytics dashboard
- [ ] Email integration for report delivery
- [ ] Multi-language support
- [ ] Enhanced privacy filters
- [ ] Custom standard templates

## 📖 References

- [LangChain Documentation](https://python.langchain.com/docs/get_started/introduction)
- [LangChain Expression Language](https://python.langchain.com/docs/expression_language/)
- [RAG Tutorial](https://python.langchain.com/docs/tutorials/rag/)
- [Structured Outputs](https://python.langchain.com/docs/how_to/structured_output/)

## 📝 License

Part of the ISSP-BCIT-SOHS project.

---

**Built with LangChain 🦜🔗 | Powered by OpenAI 🤖 | Healthcare Education 🏥**
