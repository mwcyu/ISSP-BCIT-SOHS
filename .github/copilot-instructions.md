# Clinical Feedback Assistant - Copilot Instructions

## Project Overview

This is a **LangGraph-based conversational AI assistant** that helps nursing preceptors structure feedback for students based on BCCNM (British Columbia College of Nurses & Midwives) standards. The system uses RAG (Retrieval-Augmented Generation) to retrieve relevant standards and improvement strategies from PDF documents.

## Architecture

### Core Components

- **Backend** (`backend/`): Python-based LangGraph application with CLI interface
  - `main.py`: Entry point with interactive console loop
  - `graph.py`: LangGraph state machine defining the conversation flow
  - `langgraph.json`: LangGraph deployment configuration
- **Frontend** (`frontend/`): Currently empty placeholder for future UI
- **Data** (`backend/data/`): Two PDF documents serving as knowledge base:
  - `Standards of Practice.pdf`: BCCNM nursing standards
  - `BCIT Nursing Practice Areas of Concern.pdf`: Improvement strategies

### LangGraph Flow Pattern

The application uses a **state machine pattern** with 6 nodes representing conversation stages:

1. `intro_node` → Welcomes user
2. `standard_node` → Retrieves and presents BCCNM standard via RAG
3. `feedback_node` → Collects preceptor observations
4. `suggestion_node` → Retrieves improvement strategies via RAG
5. `synthesis_node` → Combines feedback with suggestions
6. `report_node` → Finalizes the session

**Key Pattern**: Each node function returns a dict with `message`, `next` (next node), and state updates. The `main.py` loop processes nodes sequentially based on the `next` field.

### RAG Implementation

- **Vectorstores**: Two ChromaDB collections cached in `backend/vectorstores/`
  - Built on first run from PDFs in `backend/data/`
  - Uses OpenAI `text-embedding-3-small` embeddings
  - Chunk size: 1000 chars, overlap: 150 chars
  - Persistence: SQLite-backed (`chroma.sqlite3`) for efficient storage
- **Retrieval**: `RetrievalQA` chains with `similarity` search (k=2)
- **Caching**: Vectorstores persist locally in ChromaDB format; regenerated only if `chroma.sqlite3` missing

## Development Workflows

### Running the Application

```bash
cd backend
python main.py
```

Requires OpenAI API key in `.env` file (gitignored).

### Installing Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Core dependencies: `langchain`, `langgraph`, `openai`, `chromadb`, `pypdf`, `python-dotenv`

### Rebuilding Vectorstores

Delete `backend/vectorstores/` directory to force rebuild on next run.

## Code Conventions

### Import Organization

- Standard library (`os`)
- Third-party frameworks (`langchain`, `langgraph`)
- Local modules (`retrievers.build_vectorstores`)

### LangGraph State Management

- State is a **mutable dict** passed through nodes
- Common state keys: `message`, `next`, `current_standard`, `preceptor_feedback`, `suggestion`
- Nodes update state via dict merge: `state.update(node_output)`

### Naming Patterns

- Node functions: `{purpose}_node` (e.g., `feedback_node`, `standard_node`)
- Vectorstore names match PDF purpose: `standards`, `improvements`
- Private functions prefixed with `_` (e.g., `_create_vectorstore`)

## Project-Specific Patterns

### PDF Knowledge Base Pattern

Add new PDFs to `backend/data/` and update `pdfs` dict in `build_vectorstores.py`:

```python
pdfs = {
    "new_category": "data/New Document.pdf",
}
```

Then create corresponding retriever in `graph.py`:

```python
new_retriever = stores["new_category"].as_retriever(search_type="similarity", k=2)
```

### Interactive Console Pattern

User input is collected only at specific nodes (`feedback_node`). Other nodes are fully automated responses based on RAG retrieval.

### LLM Configuration

Default model: `gpt-4o-mini` with temperature `0.3` for consistent, focused responses.

## Key Files to Understand

- **`backend/graph.py`**: Complete conversation logic and RAG integration
- **`backend/retrievers/build_vectorstores.py`**: Vectorstore initialization and caching logic
- **`backend/main.py`**: Simple loop orchestration
- **`backend/langgraph.json`**: Deployment metadata for LangGraph Cloud (if used)

## Important Notes

- **No tests or CI/CD**: Project lacks automated testing infrastructure
- **Single-user CLI**: No multi-user support or web interface yet
- **OpenAI dependency**: All LLM and embedding calls require OpenAI API access
- **Windows PowerShell environment**: Development assumes PowerShell on Windows
