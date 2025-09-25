# Nursing Feedback AI Chatbot - ISSP-BCIT-SOHS

## 🏥 Project Overview

This AI-powered chatbot helps nursing preceptors provide comprehensive, constructive feedback to nursing students. The system guides preceptors through 8 structured feedback sections, ensuring thorough evaluation and actionable recommendations for student development.

## ✨ Key Features

- **8 Structured Feedback Sections**: Complete evaluation framework covering all aspects of nursing practice
- **AI-Guided Conversations**: Intelligent prompting and clarification requests for comprehensive feedback
- **RAG-Enhanced Responses**: Context-aware interactions using nursing education knowledge base
- **Progress Tracking**: Real-time session management and completion monitoring
- **Actionable Summaries**: Detailed reports with specific improvement recommendations
- **User-Friendly Interface**: Intuitive chat interface for easy preceptor interaction

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **FastAPI**: Modern Python web framework for REST API
- **LangChain**: LLM orchestration and prompt management
- **ChromaDB**: Vector database for RAG (Retrieval-Augmented Generation)
- **OpenAI GPT**: Large language model for intelligent conversations
- **Pydantic**: Data validation and serialization

### Frontend (Next.js/React)
- **Next.js**: React framework with TypeScript support
- **Tailwind CSS**: Utility-first styling framework
- **React Components**: Interactive chat interface
- **State Management**: Session and progress tracking

## 📚 Feedback Sections

The system evaluates nursing students across these 8 comprehensive areas:

1. **Clinical Knowledge Application** - Theoretical knowledge in practice
2. **Patient Care Skills** - Hands-on care abilities and technical skills  
3. **Communication & Interpersonal Skills** - Professional communication
4. **Critical Thinking & Decision Making** - Problem-solving and clinical reasoning
5. **Professionalism & Ethics** - Professional behavior and ethical practice
6. **Time Management & Organization** - Efficiency and task prioritization
7. **Learning & Professional Development** - Growth mindset and skill development
8. **Overall Performance Summary** - Comprehensive evaluation and recommendations

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- OpenAI API key
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Run setup script**
   ```bash
   # Windows
   setup.bat
   
   # Linux/Mac
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Add OpenAI API key**
   Edit `.env` file:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

4. **Start the backend**
   ```bash
   python main.py
   ```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

Frontend will be available at `http://localhost:3000`

## 📖 Usage Guide

### For Preceptors

1. **Start a New Session**: Open the application and begin with Section 1
2. **Provide Detailed Feedback**: Share specific examples and observations
3. **Respond to AI Prompts**: Answer clarifying questions for comprehensive feedback
4. **Progress Through Sections**: Complete all 8 evaluation areas
5. **Review Summary**: Get actionable recommendations for student development

### Example Workflow

```
Preceptor Input: "The student showed good knowledge of cardiac medications."

AI Response: "That's a great start! Could you provide specific examples of:
- Which cardiac medications they demonstrated knowledge about?
- How did they apply this knowledge in patient care?
- Were there any areas where they needed guidance?"

Preceptor Input: "They correctly identified ACE inhibitors and beta-blockers for heart failure patients, understood the rationale for dosing, but needed help with drug interaction monitoring."

AI Response: "Excellent detail! This shows strong foundational knowledge with opportunity for growth in pharmacovigilance. Ready to move to Section 2: Patient Care Skills?"
```

## 🔧 Development

### Project Structure
```
ISSP-BCIT-SOHS/
├── README.md                    # Main project documentation
├── backend/                     # Python/FastAPI backend
│   ├── main.py                 # Application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── config/                 # Configuration files
│   ├── services/               # Core business logic
│   └── data/                   # Vector database storage
└── frontend/                   # Next.js frontend
    ├── app/                    # Next.js app directory
    ├── components/             # React components
    ├── lib/                    # Utility functions
    └── public/                 # Static assets
```

### API Endpoints

- `GET /api/sections` - Get all feedback sections
- `POST /api/chat` - Send message to chatbot  
- `POST /api/summary` - Generate comprehensive summary
- `GET /api/session/{id}/progress` - Get session progress
- `DELETE /api/session/{id}` - Reset session

### Testing

**Backend Testing**:
```bash
cd backend
python test_chatbot.py
```

**API Testing**:
```bash
cd backend  
python api_client_example.py
```

## 🎯 How It Works

### 1. **Intelligent Conversation Flow**
The AI guides preceptors through structured feedback collection, asking clarifying questions when responses are too vague and ensuring all required elements are covered.

### 2. **Quality Analysis** 
Each response is analyzed for completeness, specificity, and actionable content. The system requests additional details when needed.

### 3. **Context-Aware Responses**
RAG (Retrieval-Augmented Generation) provides nursing-specific context and best practices to enhance AI responses.

### 4. **Progressive Structure**
Only moves to the next section after current section requirements are met, ensuring comprehensive coverage.

### 5. **Actionable Summaries**
Generates detailed reports with specific recommendations, learning goals, and development plans.

## 🛠️ Customization

### Adding New Feedback Sections
Edit `backend/config/feedback_sections.py` to modify or add sections.

### Customizing AI Behavior
Modify prompts in `backend/services/chatbot_service.py` to adjust conversation style.

### Adding Knowledge Base Content
Update `backend/services/rag_service.py` to add nursing-specific knowledge.

## 🔒 Security & Privacy

- API key stored securely in environment variables
- Session data isolated and removable
- No persistent storage of sensitive student information
- CORS configured for secure frontend communication

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow coding standards and add comments
4. Test thoroughly
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

## 📝 License

This project is developed for educational purposes as part of the ISSP-BCIT-SOHS nursing education program.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting sections in backend/README.md
2. Review API documentation at `http://localhost:8000/docs`
3. Test with provided example scripts
4. Create an issue with detailed error information

## 🎓 Educational Context

This tool supports nursing education by:
- Standardizing feedback quality across preceptors
- Ensuring comprehensive student evaluation  
- Providing structured development recommendations
- Facilitating consistent learning outcomes
- Supporting evidence-based nursing education practices
