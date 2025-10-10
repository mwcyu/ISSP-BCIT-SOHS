# RAG Clinical Feedback Helper - Architecture Diagrams

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐         ┌──────────────┐       ┌──────────────┐  │
│  │   CLI App    │         │  Python API  │       │  Future:     │  │
│  │  (cli.py)    │         │  (import)    │       │  Web/FastAPI │  │
│  └──────┬───────┘         └──────┬───────┘       └──────────────┘  │
│         │                        │                                   │
└─────────┼────────────────────────┼───────────────────────────────────┘
          │                        │
          └────────────┬───────────┘
                       │
┌──────────────────────▼───────────────────────────────────────────────┐
│                     AGENT ORCHESTRATION LAYER                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                ClinicalFeedbackAgent (agent.py)                │ │
│  │                                                                 │ │
│  │  • Session management                                          │ │
│  │  • State machine (INITIALIZED → COLLECTING → CONFIRMING →     │ │
│  │                   COMPLETED)                                   │ │
│  │  • Workflow orchestration                                      │ │
│  │  • Chain invocation                                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└───────────┬───────────────────────────────────────────────────────────┘
            │
            │  Uses
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      LANGCHAIN CHAINS LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Conversation │  │  Evaluation  │  │   Privacy    │             │
│  │    Chain     │  │    Chain     │  │    Chain     │             │
│  │ (with RAG)   │  │ (structured) │  │ (structured) │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Synthesis   │  │    Probe     │  │Standard Intro│             │
│  │    Chain     │  │    Chain     │  │    Chain     │             │
│  │              │  │  (with RAG)  │  │  (with RAG)  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                       │
└─────────┬────────────────────────┬────────────────────────────────────┘
          │                        │
          │ Retrieves context      │ Calls LLM
          ▼                        ▼
┌──────────────────────┐   ┌──────────────────────┐
│   KNOWLEDGE BASE     │   │   LLM INTEGRATION    │
├──────────────────────┤   ├──────────────────────┤
│                      │   │                      │
│  Vector Store        │   │  OpenAI GPT-4o-mini  │
│  (ChromaDB)          │   │                      │
│                      │   │  • Text generation   │
│  • BCCNM Standards   │   │  • Structured output │
│  • Key areas         │   │  • Temperature: 0.7  │
│  • Example questions │   │                      │
│  • Embeddings        │   └──────────────────────┘
│                      │
│  Embedding Model:    │
│  text-embedding-3-   │
│  small               │
└──────────────────────┘
          │
          │ Semantic Search
          ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       DATA MODELS LAYER                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Pydantic Models (models.py):                                        │
│                                                                       │
│  • FeedbackSession     - Session state management                    │
│  • StandardFeedback    - Feedback per standard                       │
│  • FeedbackEvaluation  - Quality assessment                          │
│  • PrivacyCheckResult  - PII detection result                        │
│  • FinalReport         - Compiled report                             │
│  • ConversationTurn    - Message exchange                            │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

## 🔄 Workflow Sequence Diagram

```
Preceptor          Agent              Chains           Vector Store      LLM
    │                │                   │                  │             │
    │  Start         │                   │                  │             │
    ├───────────────►│                   │                  │             │
    │                │ intro_chain       │                  │             │
    │                ├──────────────────►│   retrieve       │             │
    │                │                   ├─────────────────►│             │
    │                │                   │◄─────────────────┤             │
    │                │                   │    invoke        │             │
    │                │                   ├─────────────────────────────►│
    │                │                   │◄────────────────────────────┤
    │◄───────────────┤ Welcome message   │                  │             │
    │                │                   │                  │             │
    │  "Student was  │                   │                  │             │
    │   professional"│                   │                  │             │
    ├───────────────►│                   │                  │             │
    │                │ privacy_chain     │                  │             │
    │                ├──────────────────►│    (no RAG)      │             │
    │                │                   ├─────────────────────────────►│
    │                │                   │◄────────────────────────────┤
    │                │◄──────────────────┤ SAFE             │             │
    │                │                   │                  │             │
    │                │ evaluation_chain  │                  │             │
    │                ├──────────────────►│    (no RAG)      │             │
    │                │                   ├─────────────────────────────►│
    │                │                   │◄────────────────────────────┤
    │                │◄──────────────────┤ VAGUE            │             │
    │                │                   │                  │             │
    │                │ probe_chain       │                  │             │
    │                ├──────────────────►│   retrieve       │             │
    │                │                   ├─────────────────►│             │
    │                │                   │◄─────────────────┤             │
    │                │                   │    invoke        │             │
    │                │                   ├─────────────────────────────►│
    │                │                   │◄────────────────────────────┤
    │◄───────────────┤ "Can you provide  │                  │             │
    │                │  an example?"     │                  │             │
    │                │                   │                  │             │
    │  "When inserting│                  │                  │             │
    │   catheter..."  │                  │                  │             │
    ├───────────────►│                   │                  │             │
    │                │ evaluation_chain  │                  │             │
    │                ├──────────────────►│                  │             │
    │                │◄──────────────────┤ SPECIFIC_WITH_   │             │
    │                │                   │ EXAMPLE          │             │
    │                │                   │                  │             │
    │                │ synthesis_chain   │                  │             │
    │                ├──────────────────►│                  │             │
    │                │◄──────────────────┤ summary +        │             │
    │                │                   │ suggestion       │             │
    │◄───────────────┤ Present summary   │                  │             │
    │                │ for confirmation  │                  │             │
    │                │                   │                  │             │
    │  "Yes, good"   │                   │                  │             │
    ├───────────────►│                   │                  │             │
    │                │ Advance to next   │                  │             │
    │                │ standard          │                  │             │
    │◄───────────────┤ Next standard intro                  │             │
    │                │                   │                  │             │
    [Repeat for remaining 3 standards]
```

## 🏛️ Module Dependencies

```
cli.py
  └── agent.py
        ├── chains.py
        │     ├── vectorstore.py
        │     │     └── config.py
        │     └── models.py
        ├── models.py
        │     └── config.py
        ├── vectorstore.py
        │     └── config.py
        └── utils.py
              └── models.py

demo.py
  └── agent.py (same as above)
        └── utils.py
```

## 🎨 RAG Implementation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    RAG FLOW DIAGRAM                              │
└──────────────────────────────────────────────────────────────────┘

User Query: "Tell me about Professional Responsibility"
    │
    ▼
┌─────────────────────────────────┐
│  1. Query Embedding             │
│  OpenAI text-embedding-3-small  │
│  Query → [1536-dim vector]      │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  2. Vector Similarity Search    │
│  ChromaDB                       │
│  Find top-k similar documents   │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  3. Retrieved Documents (k=3)   │
│                                 │
│  Doc 1: Professional            │
│         Responsibility overview │
│  Doc 2: Key area - Accountability
│  Doc 3: Example questions       │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  4. Format Context              │
│  Concatenate doc contents       │
│  Add metadata                   │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  5. Prompt Construction         │
│  System: You are...             │
│  Context: [retrieved docs]      │
│  History: [conversation]        │
│  User: [query]                  │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  6. LLM Generation              │
│  GPT-4o-mini                    │
│  Temperature: 0.7               │
└──────────────┬──────────────────┘
               │
               ▼
         Response to User
```

## 🔄 State Machine Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    SESSION STATE MACHINE                          │
└──────────────────────────────────────────────────────────────────┘

         ┌──────────────────┐
         │   INITIALIZED    │ (start_session called)
         └────────┬─────────┘
                  │
                  │ Introduce Standard 1
                  ▼
         ┌─────────────────────────┐
         │  COLLECTING_FEEDBACK    │
         │  (Standard N)           │
         └─────────┬───────────────┘
                   │
                   │ Receive feedback
                   │ Evaluate quality
                   │
                   ├─ VAGUE? ─────────────────┐
                   │                          │
                   ├─ SPECIFIC_NO_EXAMPLE? ───┤ Generate probe question
                   │                          │ Stay in COLLECTING
                   │                          │
                   │ SPECIFIC_WITH_EXAMPLE    │
                   ▼                          │
         ┌─────────────────────────┐          │
         │ CONFIRMING_STANDARD     │          │
         └─────────┬───────────────┘          │
                   │                          │
                   │                          │
                   ├─ Needs revision? ────────┘
                   │
                   │ Confirmed
                   ▼
         ┌──────────────────┐
         │  Advance Index   │
         └────────┬─────────┘
                  │
                  ├─ More standards? ─► Back to COLLECTING (next std)
                  │
                  │ All complete
                  ▼
         ┌──────────────────┐
         │    COMPLETED     │
         └────────┬─────────┘
                  │
                  │ Request email
                  │ Generate report
                  ▼
              [SESSION END]
```

## 🔌 Chain Connection Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   CHAIN ORCHESTRATION                            │
└─────────────────────────────────────────────────────────────────┘

                    ClinicalFeedbackAgent
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   Session Start      Process Message    Generate Report
        │                   │                   │
        │                   │                   │
        ▼                   ▼                   ▼
  intro_chain         Route by State      ReportExporter
        +                   │
standard_intro_chain        │
                            ├─► privacy_chain
                            │        │
                            │        ├─ PII? → Return warning
                            │        │
                            │        ▼ SAFE
                            │
                            ├─► evaluation_chain
                            │        │
                            │        ▼ Quality assessment
                            │
                            ├─► probe_chain (if needed)
                            │        │
                            │        OR
                            │        │
                            ├─► synthesis_chain
                            │        │
                            │        ▼ summary + suggestion
                            │
                            └─► final_report_chain

Each chain follows LCEL pattern:
    input_prep | prompt | llm | output_parser
```

## 💾 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

User Input (String)
    │
    ▼
ConversationTurn (Pydantic)
    │
    ▼
FeedbackSession.add_turn()
    │
    ▼
Privacy Check → PrivacyCheckResult (Pydantic)
    │
    │ If safe
    ▼
Quality Evaluation → FeedbackEvaluation (Pydantic)
    │                      │
    │                      ├─ is_specific: bool
    │                      ├─ has_example: bool
    │                      ├─ quality: FeedbackQuality (Enum)
    │                      └─ key_points: List[str]
    │
    ▼
StandardFeedback (Pydantic)
    │                      │
    │                      ├─ raw_feedback: str
    │                      ├─ quality_evaluation: FeedbackEvaluation
    │                      ├─ summary: Optional[str]
    │                      └─ suggestion: Optional[str]
    │
    ▼
FeedbackSession.feedback_collected
    │
    │ After all standards
    ▼
FinalReport (Pydantic)
    │
    ▼
Export (JSON/CSV)
    │
    ▼
Files on disk
```

## 🗃️ Vector Store Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    VECTOR STORE LAYOUT                           │
└─────────────────────────────────────────────────────────────────┘

ChromaDB Collection: "bccnm_standards"
│
├─ Document 1: Professional Responsibility (Overview)
│   ├─ page_content: "Standard: Professional Responsibility..."
│   ├─ embedding: [1536-dim vector]
│   └─ metadata: {
│        "standard_key": "professional_responsibility",
│        "standard_name": "Professional Responsibility",
│        "order": 1,
│        "type": "standard_overview"
│      }
│
├─ Document 2: Professional Responsibility (Key Area 1)
│   ├─ page_content: "Professional accountability..."
│   ├─ embedding: [1536-dim vector]
│   └─ metadata: {
│        "standard_key": "professional_responsibility",
│        "key_area": "Professional accountability...",
│        "type": "key_area"
│      }
│
├─ Document 3-6: Professional Responsibility (Other Key Areas)
│
├─ Document 7-10: Knowledge-Based Practice
│
├─ Document 11-14: Client-Focused Service
│
└─ Document 15-18: Ethical Practice

Total: ~16-20 documents
```

---

**These diagrams illustrate the complete architecture of the RAG-based Clinical Feedback Helper system.**
