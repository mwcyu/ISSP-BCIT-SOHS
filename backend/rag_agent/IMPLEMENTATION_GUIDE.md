# RAG-Based Clinical Feedback Helper - Implementation Guide

## 📚 Overview

This document provides a comprehensive guide to the RAG-based implementation of the Clinical Feedback Helper, built using the latest LangChain patterns and best practices.

## 🏗️ Architecture Design

### What is RAG (Retrieval-Augmented Generation)?

RAG is a technique that enhances LLM responses by retrieving relevant information from a knowledge base before generating a response. This implementation uses:

1. **Vector Embeddings**: Converting BCCNM standards into semantic vectors
2. **Vector Database**: Storing embeddings in ChromaDB for fast retrieval
3. **Semantic Search**: Finding relevant context based on similarity
4. **Context Injection**: Adding retrieved information to prompts

### Why RAG for This Application?

✅ **Consistent Knowledge**: BCCNM standards are embedded once, ensuring consistency
✅ **Reduced Hallucination**: LLM has access to accurate standard descriptions
✅ **Efficient Context**: Only relevant standards retrieved for each query
✅ **Scalable**: Easy to add new standards or update existing ones
✅ **Cost-Effective**: Smaller prompts vs. including all standards every time

## 📦 Module Breakdown

### 1. `config.py` - Configuration Management

**Purpose**: Centralized configuration and knowledge base

**Key Components**:

```python
class Config:
    # API and Model Settings
    OPENAI_API_KEY: str
    MODEL_NAME: str = "gpt-4o-mini"
    TEMPERATURE: float = 0.7

    # RAG Settings
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    # Vector Store
    VECTOR_STORE_PATH: str = "./vectorstore"
```

**BCCNM Standards Data Structure**:

```python
BCCNM_STANDARDS = {
    "professional_responsibility": {
        "name": "Professional Responsibility",
        "full_name": "Professional Responsibility and Accountability",
        "order": 1,
        "description": "...",
        "key_areas": [...],
        "example_questions": [...]
    },
    # ... other standards
}
```

### 2. `models.py` - Pydantic Data Models

**Purpose**: Type-safe data structures for the entire application

**Key Models**:

#### `FeedbackSession`

Tracks the complete session state:

```python
class FeedbackSession(BaseModel):
    session_id: str
    state: SessionState
    current_standard: Optional[StandardName]
    current_standard_index: int
    feedback_collected: Dict[StandardName, StandardFeedback]
    conversation_history: List[ConversationTurn]
    preceptor_email: Optional[str]
```

**Methods**:

- `get_next_standard()`: Get next standard to process
- `advance_to_next_standard()`: Move to next standard
- `is_complete()`: Check if all standards done
- `add_turn()`: Add conversation turn

#### `FeedbackEvaluation`

AI assessment of feedback quality:

```python
class FeedbackEvaluation(BaseModel):
    is_specific: bool
    has_example: bool
    quality: FeedbackQuality  # VAGUE | SPECIFIC_NO_EXAMPLE | SPECIFIC_WITH_EXAMPLE
    key_points: List[str]
    reasoning: str
```

### 3. `vectorstore.py` - Vector Store Management

**Purpose**: Manage the RAG knowledge base

**Class: `KnowledgeBase`**

#### Initialization

```python
kb = KnowledgeBase()
kb.initialize_vectorstore()
```

Creates embeddings for:

- Standard overviews
- Individual key areas
- Example questions

#### Key Methods

**`create_documents()`**:
Converts BCCNM_STANDARDS into LangChain Documents

```python
documents = [
    Document(
        page_content="Standard: Professional Responsibility...",
        metadata={"standard_key": "professional_responsibility"}
    ),
    # ... more documents
]
```

**`get_retriever(k=3)`**:
Returns a retriever for semantic search

```python
retriever = kb.get_retriever(k=3)
results = retriever.invoke("professional accountability")
```

**`retrieve_standard_context(standard_key, query)`**:
Get context for a specific standard

```python
docs = kb.retrieve_standard_context(
    "professional_responsibility",
    "accountability and honesty"
)
```

### 4. `chains.py` - LangChain Chains

**Purpose**: Define all AI chains using LCEL (LangChain Expression Language)

**Class: `FeedbackChains`**

#### Chain Patterns

All chains follow this modern LCEL pattern:

```python
chain = (
    input_preparation
    | prompt_template
    | llm
    | output_parser
)
```

#### Key Chains

**1. Conversation Chain (with RAG)**

```python
chain = (
    RunnableParallel(
        context=lambda x: format_docs(retriever.invoke(x["input"])),
        input=lambda x: x["input"],
        state=lambda x: x["state"],
        chat_history=lambda x: x["chat_history"]
    )
    | prompt
    | llm
    | StrOutputParser()
)
```

**How it works**:

1. Query retrieves relevant documents from vector store
2. Documents formatted as context string
3. Context + input + history passed to prompt
4. LLM generates response with retrieved knowledge

**2. Evaluation Chain (Structured Output)**

```python
parser = PydanticOutputParser(pydantic_object=FeedbackEvaluation)

chain = (
    {
        "feedback": lambda x: x["feedback"],
        "standard_name": lambda x: x["standard_name"],
        "format_instructions": lambda _: parser.get_format_instructions()
    }
    | prompt
    | structured_llm
    | parser
)
```

**Output**: Type-safe `FeedbackEvaluation` object

**3. Privacy Check Chain**

```python
parser = PydanticOutputParser(pydantic_object=PrivacyCheckResult)
chain = prompt | structured_llm | parser
```

**Returns**: `PrivacyCheckResult` with `is_safe`, `detected_pii`, `explanation`

**4. Synthesis Chain**
Generates summary and suggestion from feedback

**5. Probe Question Chain (with RAG)**
Generates context-aware follow-up questions

**6. Standard Introduction Chain (with RAG)**
Introduces each standard using retrieved context

### 5. `agent.py` - Core Agent Logic

**Purpose**: Orchestrate the entire workflow

**Class: `ClinicalFeedbackAgent`**

#### Workflow Methods

**`start_session()`**

```python
session_id, welcome = agent.start_session()
```

1. Creates new `FeedbackSession`
2. Generates welcome message
3. Introduces first standard
4. Returns session ID and message

**`process_message(user_message)`**

```python
response = agent.process_message("Student was professional...")
```

**Processing Flow**:

1. Add message to history
2. Check for PII → handle if detected
3. Route based on state:
   - `COLLECTING_FEEDBACK` → evaluate and probe/synthesize
   - `CONFIRMING_STANDARD` → handle confirmation
   - `COMPLETED` → handle post-completion

**State Machine**:

```
INITIALIZED
    ↓
COLLECTING_FEEDBACK ← (back if needs clarification)
    ↓
CONFIRMING_STANDARD
    ↓
COLLECTING_FEEDBACK (next standard) OR COMPLETED
    ↓
Request Email
    ↓
COMPLETED
```

#### Key Internal Methods

**`_handle_feedback_collection(feedback)`**

1. Evaluate feedback quality using evaluation chain
2. Store feedback in session
3. If quality is `SPECIFIC_WITH_EXAMPLE`:
   - Synthesize summary and suggestion
   - Move to confirming
4. Else:
   - Generate probe question
   - Stay in collecting

**`_synthesize_and_confirm(standard, feedback)`**

1. Call synthesis chain
2. Parse summary and suggestion
3. Update feedback record
4. Format confirmation message
5. Change state to `CONFIRMING_STANDARD`

**`_handle_confirmation(response)`**

1. Check if user wants to revise → go back to collecting
2. If confirmed → mark standard complete
3. Advance to next standard or request email

### 6. `utils.py` - Export Utilities

**Purpose**: Generate and export reports

**Class: `ReportExporter`**

**Methods**:

- `export_report(report, formats=['json', 'csv'])`
- `export_session(session)` - Full session with conversation history
- `format_report_for_display(report)` - Human-readable format

**Output Files**:

- `feedback_{session_id}_{timestamp}.json`
- `feedback_{session_id}_{timestamp}.csv`
- `session_{session_id}_{timestamp}.json`

### 7. `cli.py` - Command Line Interface

**Purpose**: Interactive CLI application

**Features**:

- Real-time conversation
- Status command to check progress
- Automatic report generation
- File export on completion

**Usage**:

```bash
python -m rag_agent.cli
```

## 🔄 Complete Workflow Example

### Step-by-Step Execution

```python
# 1. Initialize
agent = ClinicalFeedbackAgent()
# → Loads vector store with BCCNM standards

# 2. Start Session
session_id, welcome = agent.start_session()
# → Creates FeedbackSession
# → Generates welcome with intro chain
# → Introduces Standard 1 with RAG context

# 3. Process Feedback (Standard 1)
response = agent.process_message(
    "The student was professional and asked for help appropriately."
)
# → Privacy check: SAFE
# → Evaluation chain: VAGUE (no example)
# → Probe chain generates: "Can you provide a specific example?"

# 4. More Specific Feedback
response = agent.process_message(
    "When preparing to insert a catheter, they asked me to supervise."
)
# → Privacy check: SAFE
# → Evaluation: SPECIFIC_WITH_EXAMPLE
# → Synthesis chain generates summary and suggestion
# → State → CONFIRMING_STANDARD
# → Returns: "Here's the summary... Does this look good?"

# 5. Confirm
response = agent.process_message("Yes, that's accurate")
# → Confirmation detected
# → Mark standard as complete
# → Advance to Standard 2
# → Introduce Standard 2 with RAG context

# 6. Repeat for Standards 2, 3, 4...

# 7. Email Collection
response = agent.process_message("preceptor@health.ca")
# → Extract email
# → Session complete

# 8. Generate Report
report = agent.generate_final_report()
exporter = ReportExporter()
files = exporter.export_report(report)
```

## 🎯 Key Design Decisions

### 1. RAG vs. Traditional Prompting

**Traditional Approach**:

```python
# Include all standards in every prompt
prompt = f"""
You are a feedback helper. Here are all 4 standards:
{STANDARD_1_FULL_TEXT}
{STANDARD_2_FULL_TEXT}
{STANDARD_3_FULL_TEXT}
{STANDARD_4_FULL_TEXT}

User question: {question}
"""
```

**Problems**: Large prompts, high token cost, context dilution

**RAG Approach**:

```python
# Retrieve only relevant standards
retriever = kb.get_retriever()
relevant_docs = retriever.invoke(question)
context = format_docs(relevant_docs)

prompt = f"""
You are a feedback helper.
Relevant context: {context}  # Only 2-3 relevant sections

User question: {question}
"""
```

**Benefits**: Smaller prompts, focused context, lower cost

### 2. State Management with Pydantic

Why Pydantic models instead of dictionaries?

- ✅ Type safety
- ✅ Validation
- ✅ IDE autocomplete
- ✅ Easy serialization
- ✅ Self-documenting

### 3. LCEL Chain Composition

Why LCEL over legacy chains?

```python
# Old way (deprecated)
chain = LLMChain(llm=llm, prompt=prompt)

# New way (LCEL)
chain = prompt | llm | output_parser
```

- ✅ More readable
- ✅ Composable
- ✅ Supports streaming
- ✅ Better error handling
- ✅ Future-proof

### 4. Structured Outputs

Why `PydanticOutputParser`?

- ✅ Guarantees valid JSON
- ✅ Type-safe results
- ✅ Automatic retry on parse errors
- ✅ Clear error messages

## 🧪 Testing the Implementation

### Quick Test

```bash
cd backend
python -m rag_agent.demo
```

### Manual Testing

```bash
python -m rag_agent.cli

# Special commands:
# - 'status': View current session state
# - 'quit': Exit session
```

### Programmatic Test

```python
from rag_agent.agent import ClinicalFeedbackAgent

agent = ClinicalFeedbackAgent()
session_id, welcome = agent.start_session()

# Simulate conversation
messages = [
    "The student demonstrated excellent accountability...",
    "Yes, that summary looks good",
    # ... etc
]

for msg in messages:
    response = agent.process_message(msg)
    print(response)

# Check completion
if agent.current_session.is_complete():
    report = agent.generate_final_report()
```

## 🔍 Debugging

### View Session State

```python
state = agent.get_session_state()
print(state)
# {
#   'session_id': 'abc123...',
#   'state': 'collecting_feedback',
#   'current_standard': 'professional_responsibility',
#   'progress': '1/4',
#   'standards_completed': []
# }
```

### Inspect Vector Store

```python
kb = KnowledgeBase()
kb.initialize_vectorstore()

# Test retrieval
docs = kb.retrieve_context("professional accountability", k=3)
for doc in docs:
    print(doc.page_content)
    print(doc.metadata)
```

### Check Chain Output

```python
chains = FeedbackChains(kb)
eval_chain = chains.create_evaluation_chain()

result = eval_chain.invoke({
    "feedback": "Student was good",
    "standard_name": "Professional Responsibility"
})
print(result)  # FeedbackEvaluation object
```

## 📊 Performance Considerations

### Token Usage

- **With RAG**: ~500-1000 tokens per turn
- **Without RAG**: ~2000-3000 tokens per turn

### Response Time

- Vector retrieval: ~50-100ms
- LLM call: ~1-3 seconds
- Total: ~1-3 seconds per message

### Cost Optimization

- Use `gpt-4o-mini` instead of `gpt-4` (10x cheaper)
- Limit retrieval to k=3 documents
- Cache embeddings in vector store

## 🚀 Deployment Considerations

### Production Checklist

- [ ] Set up persistent vector store
- [ ] Configure proper logging
- [ ] Add error recovery
- [ ] Implement session persistence
- [ ] Set up monitoring
- [ ] Configure rate limiting
- [ ] Add authentication (if web-based)
- [ ] Set up automated backups

### Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...

# Optional
MODEL_NAME=gpt-4o-mini
TEMPERATURE=0.7
VECTOR_STORE_PATH=./vectorstore
OUTPUT_DIR=./feedback_reports
```

## 📚 Further Reading

- [LangChain RAG Tutorial](https://python.langchain.com/docs/tutorials/rag/)
- [LCEL Documentation](https://python.langchain.com/docs/expression_language/)
- [Pydantic Models](https://docs.pydantic.dev/)
- [ChromaDB](https://docs.trychroma.com/)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)

---

**Happy Building! 🚀**
