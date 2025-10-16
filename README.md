# Clinical Feedback Assistant

An AI-powered assistant that helps nursing preceptors structure feedback for students based on BCCNM (British Columbia College of Nurses & Midwives) standards using modern LangChain OSS Python patterns.

## 🎯 Features

- **Agentic RAG**: Intelligent retrieval-augmented generation that knows when to search for information vs. respond directly
- **Standards-Based**: Grounded in BCCNM Standards of Practice PDF documents
- **Structured Feedback**: Generates COIN-format (Context, Observation, Impact, Next steps) summaries
- **Interactive CLI**: Conversational interface for preceptors to input observations
- **Knowledge Base**: Two specialized retrievers for standards and improvement strategies

## 🏗️ Architecture

Built with cutting-edge LangChain patterns:

- **LangGraph**: Stateful workflow orchestration with `MessagesState`
- **Agentic RAG**: Self-correcting retrieval with document grading and query rewriting
- **Tool Execution**: Automatic tool calling via `ToolNode`
- **Structured Output**: Pydantic models for reliable LLM responses
- **Vector Search**: ChromaDB with OpenAI embeddings for semantic document retrieval

### Workflow

```
START → intro → supervisor_router → generate_query_or_respond
                                            ↓
                               should_continue (tool calls?)
                                  ↓              ↓
                          tools (execute)   generate_answer
                                  ↓
                          grade_documents
                              ↓        ↓
                   generate_answer  rewrite_question (loop)
                              ↓
                 synthesize_one_standard (COIN format)
                              ↓
                            END
```

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ISSP-BCIT-SOHS
   ```

2. **Install dependencies**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

4. **Run the application**
   ```bash
   python main.py
   ```

### First Run

On first run, the system will:

- Build vector stores from PDFs in `backend/data/`
- Cache embeddings in `backend/vectorstores/`
- Subsequent runs load from cache (fast startup)

## 📁 Project Structure

```
backend/
  ├── graph.py                 # LangGraph workflow definition (Agentic RAG)
  ├── main.py                  # CLI entry point
  ├── requirements.txt         # Python dependencies
  ├── .env                     # Environment variables (gitignored)
  ├── .env.example            # Environment template
  ├── data/                   # PDF knowledge base
  │   ├── Standards of Practice.pdf
  │   └── BCIT Nursing Practice Areas of Concern.pdf
  ├── retrievers/             # Vector store builders
  │   └── build_vectorstores.py
  ├── vectorstores/           # ChromaDB persistence (gitignored)
  │   ├── standards/
  │   └── improvements/
  └── prompts/                # System prompts
      └── clinical_feedback_prompt.txt

frontend/                     # Future web UI (placeholder)
```

## 🔧 Technical Details

### LangChain Patterns Used

This project implements the following modern LangChain patterns:

1. **Agentic RAG** (from LangChain docs)

   - LLM decides when to retrieve vs. respond
   - Document grading for relevance assessment
   - Query rewriting for improved results

2. **Tool Execution Pattern**

   ```python
   from langgraph.prebuilt import ToolNode
   tools_node = ToolNode([STANDARDS_TOOL, IMPROVEMENTS_TOOL])
   ```

3. **Structured Output**

   ```python
   class GradeDocuments(BaseModel):
       binary_score: str = Field(description="...")

   grader = LLM.with_structured_output(GradeDocuments)
   ```

4. **MessagesState**
   - Built-in message history management
   - Automatic `add_messages` reducer
   - Supports both dict and Message objects

### Vectorstore Details

- **Embedding Model**: `text-embedding-3-small` (OpenAI)
- **Chunk Size**: 1200 characters
- **Chunk Overlap**: 200 characters (16%)
- **Vector DB**: ChromaDB with SQLite persistence
- **Search Type**: Similarity search (k=3)

## 📚 BCCNM Standards Covered

1. Professional Responsibility and Accountability
2. Knowledge-Based Practice
3. Client-Focused Service
4. Ethical Practice

## 🔄 Recent Updates

**October 15, 2025** - Major upgrade to modern LangChain patterns:

- ✅ Implemented Agentic RAG workflow from LangChain docs
- ✅ Added `ToolNode` for proper tool execution
- ✅ Fixed message flow for tool calling
- ✅ Enhanced documentation with pattern sources
- ✅ Added environment variable support
- ✅ Improved error handling and type safety

See [UPGRADE_SUMMARY.md](UPGRADE_SUMMARY.md) for complete upgrade details.

## 🛠️ Development

### Running Tests

```bash
cd backend
python main.py
```

### Rebuilding Vector Stores

Delete `backend/vectorstores/` to force rebuild on next run:

```bash
rm -rf backend/vectorstores
python main.py
```

### Adding New Knowledge Sources

1. Add PDF to `backend/data/`
2. Update `PDFS` dict in `backend/retrievers/build_vectorstores.py`
3. Create retriever tool in `backend/graph.py`
4. Add to supervisor router logic

## 📖 Documentation

- **Architecture**: See `.github/copilot-instructions.md`
- **Upgrade Details**: See `UPGRADE_SUMMARY.md`
- **LangChain Patterns**: Based on `/websites/langchain_oss_python` (Context7)

## 🚧 Future Enhancements

### Planned Features

- [ ] Web UI (React frontend in `frontend/`)
- [ ] Session persistence with PostgreSQL checkpointing
- [ ] Streaming responses for real-time feedback
- [ ] LangSmith integration for observability
- [ ] Multi-agent specialization (one agent per standard)
- [ ] Human-in-the-loop for complex feedback
- [ ] Memory store for preceptor preferences

## 🤝 Contributing

This is an academic project for BCIT SOHS. Contributions welcome for educational purposes.

## 📄 License

[Add license information]

## 🙏 Acknowledgments

- BCCNM for Standards of Practice
- BCIT School of Health Sciences
- LangChain for excellent documentation
- Upstash Context7 for documentation access

---

**Built with**: LangChain, LangGraph, OpenAI, ChromaDB  
**Pattern Source**: LangChain OSS Python Documentation (via Context7)  
**Educational Use**: BCIT ACIT 3990 Project
