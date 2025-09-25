# Nursing Feedback AI Chatbot - Backend

## Overview
This is the backend service for an AI-powered chatbot that helps nursing preceptors provide comprehensive, constructive feedback to nursing students. The system guides preceptors through 8 structured feedback sections, ensuring thorough evaluation and actionable recommendations.

## Features
- **8 Structured Feedback Sections**: Complete evaluation framework for nursing students
- **AI-Powered Guidance**: Intelligent prompting and clarification requests
- **RAG Integration**: Context-aware responses using nursing education knowledge base
- **Progress Tracking**: Session management and completion monitoring
- **Comprehensive Summaries**: Actionable feedback reports with development plans

## Architecture
- **FastAPI**: Modern Python web framework for the REST API
- **LangChain**: LLM orchestration and prompt management
- **ChromaDB**: Vector database for RAG implementation
- **OpenAI GPT**: Large language model for intelligent conversations
- **Pydantic**: Data validation and serialization

## Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API key
- Git

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd ISSP-BCIT-SOHS/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

5. **Run the application**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.

### Key Endpoints

- `GET /api/sections` - Get all feedback sections
- `POST /api/chat` - Send message to chatbot
- `POST /api/summary` - Generate final feedback summary
- `GET /api/session/{session_id}/progress` - Get session progress
- `DELETE /api/session/{session_id}` - Reset session

## Feedback Sections

The system guides preceptors through these 8 comprehensive sections:

1. **Clinical Knowledge Application** - Theoretical knowledge in practice
2. **Patient Care Skills** - Hands-on care abilities and technical skills
3. **Communication and Interpersonal Skills** - Professional communication
4. **Critical Thinking and Decision Making** - Problem-solving and reasoning
5. **Professionalism and Ethics** - Professional behavior and ethics
6. **Time Management and Organization** - Efficiency and prioritization
7. **Learning and Professional Development** - Growth mindset and receptiveness
8. **Overall Performance Summary** - Comprehensive evaluation and recommendations

## Usage Example

### Starting a Feedback Session

```python
import requests

# Start chatting about section 1
response = requests.post("http://localhost:8000/api/chat", json={
    "session_id": "unique-session-id",
    "message": "The student demonstrated good understanding of pathophysiology when caring for the cardiac patient...",
    "section_id": 1
})

print(response.json())
```

### Getting Progress

```python
response = requests.get("http://localhost:8000/api/session/unique-session-id/progress")
print(f"Progress: {response.json()['progress_percentage']}%")
```

### Generating Final Summary

```python
response = requests.post("http://localhost:8000/api/summary", json={
    "session_id": "unique-session-id"
})

summary = response.json()['summary']
print(summary)
```

## Development

### Project Structure
```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── config/
│   ├── __init__.py
│   └── feedback_sections.py  # Feedback sections configuration
├── services/
│   ├── __init__.py
│   ├── chatbot_service.py   # Main chatbot logic
│   └── rag_service.py       # RAG and vector database service
└── data/
    └── chroma_db/          # Vector database storage (auto-created)
```

### Key Components

#### ChatbotService
- Manages conversation flow and session state
- Analyzes response quality and completeness
- Generates appropriate follow-up questions
- Orchestrates the feedback collection process

#### RAGService
- Manages vector database operations
- Stores and retrieves nursing education knowledge
- Provides context-aware responses
- Handles session data persistence

#### Feedback Sections Configuration
- Defines the 8 feedback evaluation areas
- Specifies required elements for each section
- Contains sample questions and guidance
- Provides structured evaluation framework

### Adding Custom Knowledge

To add nursing-specific knowledge to the RAG system:

1. Edit `services/rag_service.py`
2. Add new knowledge entries to the `nursing_knowledge` list in `_load_initial_knowledge()`
3. Restart the application

### Customizing Feedback Sections

To modify feedback sections:

1. Edit `config/feedback_sections.py`
2. Update the `FEEDBACK_SECTIONS` dictionary
3. Ensure all required fields are present
4. Restart the application

## Configuration

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `CHROMA_DB_PATH`: Vector database storage path (default: ./data/chroma_db)
- `LOG_LEVEL`: Logging level (default: INFO)
- `FEEDBACK_SECTIONS`: Number of feedback sections (default: 8)

### Model Settings
- **LLM Model**: GPT-3.5-turbo (configurable in `chatbot_service.py`)
- **Temperature**: 0.3 (for consistent responses)
- **Max Tokens**: 500 per response
- **Embedding Model**: OpenAI text-embedding-ada-002

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
   ```bash
   pip install -r requirements.txt
   ```

2. **OpenAI API Errors**: Check your API key and billing status

3. **Vector Database Issues**: Delete `data/chroma_db` folder and restart

4. **CORS Issues**: Frontend must run on `http://localhost:3000`

### Logging

Logs are output to console with timestamps. Adjust log level in `.env`:
```
LOG_LEVEL=DEBUG  # For detailed debugging
LOG_LEVEL=INFO   # For general information
LOG_LEVEL=ERROR  # For errors only
```

## Contributing

1. Follow PEP 8 style guidelines
2. Add comments for complex logic
3. Include type hints for all functions
4. Test new features thoroughly
5. Update documentation for API changes

## License

This project is for educational purposes as part of the ISSP-BCIT-SOHS nursing education program.