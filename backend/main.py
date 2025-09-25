"""
Main application entry point for the Nursing Feedback AI Chatbot
"""

import os
import logging
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.chatbot_service import ChatbotService
from services.rag_service import RAGService
from config.feedback_sections import FEEDBACK_SECTIONS

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Nursing Feedback AI Chatbot",
    description="AI-powered chatbot to help preceptors provide comprehensive feedback to nursing students",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
chatbot_service = None
rag_service = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup"""
    global chatbot_service, rag_service
    
    try:
        logger.info("Initializing RAG service...")
        rag_service = RAGService()
        await rag_service.initialize()
        
        logger.info("Initializing Chatbot service...")
        chatbot_service = ChatbotService(rag_service)
        
        logger.info("Application startup completed successfully")
    except Exception as e:
        logger.error(f"Failed to initialize services: {str(e)}")
        raise

# Request/Response Models
class ChatMessage(BaseModel):
    """Model for chat messages"""
    session_id: str
    message: str
    section_id: int = 1

class ChatResponse(BaseModel):
    """Model for chat responses"""
    response: str
    current_section: int
    is_section_complete: bool
    next_action: str
    feedback_summary: Dict[str, Any] = None

class FeedbackSummary(BaseModel):
    """Model for final feedback summary"""
    session_id: str

# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Nursing Feedback AI Chatbot is running"}

@app.get("/api/sections")
async def get_feedback_sections():
    """Get all feedback sections"""
    try:
        return {
            "sections": [
                {
                    "id": section.id,
                    "title": section.title,
                    "description": section.description,
                    "key_areas": section.key_areas
                }
                for section in FEEDBACK_SECTIONS.values()
            ]
        }
    except Exception as e:
        logger.error(f"Error getting feedback sections: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(message: ChatMessage):
    """Main chat endpoint"""
    try:
        if not chatbot_service:
            raise HTTPException(status_code=500, detail="Chatbot service not initialized")
        
        # Process the message through the chatbot
        response = await chatbot_service.process_message(
            session_id=message.session_id,
            message=message.message,
            section_id=message.section_id
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process message")

@app.post("/api/summary")
async def generate_summary(request: FeedbackSummary):
    """Generate comprehensive feedback summary"""
    try:
        if not chatbot_service:
            raise HTTPException(status_code=500, detail="Chatbot service not initialized")
        
        summary = await chatbot_service.generate_final_summary(request.session_id)
        return {"summary": summary}
        
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate summary")

@app.get("/api/session/{session_id}/progress")
async def get_session_progress(session_id: str):
    """Get current progress for a session"""
    try:
        if not chatbot_service:
            raise HTTPException(status_code=500, detail="Chatbot service not initialized")
        
        progress = await chatbot_service.get_session_progress(session_id)
        return {"progress": progress}
        
    except Exception as e:
        logger.error(f"Error getting session progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get session progress")

@app.delete("/api/session/{session_id}")
async def reset_session(session_id: str):
    """Reset a chat session"""
    try:
        if not chatbot_service:
            raise HTTPException(status_code=500, detail="Chatbot service not initialized")
        
        await chatbot_service.reset_session(session_id)
        return {"message": "Session reset successfully"}
        
    except Exception as e:
        logger.error(f"Error resetting session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to reset session")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )