"""
Chatbot Service
Main service for handling conversation flow, feedback collection, and AI interactions
"""

import os
import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate

from config.feedback_sections import FEEDBACK_SECTIONS, SYSTEM_PROMPTS
from services.rag_service import RAGService

logger = logging.getLogger(__name__)

class SessionState:
    """Tracks the state of a feedback session"""
    
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.current_section = 1
        self.completed_sections = set()
        self.section_responses = {}  # section_id -> list of responses
        self.conversation_history = []  # Full conversation history
        self.created_at = datetime.now()
        self.last_updated = datetime.now()
    
    def add_message(self, role: str, content: str):
        """Add a message to conversation history"""
        self.conversation_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        self.last_updated = datetime.now()
    
    def add_section_response(self, section_id: int, response: str):
        """Add response to a specific section"""
        if section_id not in self.section_responses:
            self.section_responses[section_id] = []
        self.section_responses[section_id].append(response)
    
    def mark_section_complete(self, section_id: int):
        """Mark a section as complete"""
        self.completed_sections.add(section_id)
        # Move to next section if not at the end
        if section_id < len(FEEDBACK_SECTIONS):
            self.current_section = section_id + 1
    
    def get_progress_percentage(self) -> float:
        """Calculate completion percentage"""
        return (len(self.completed_sections) / len(FEEDBACK_SECTIONS)) * 100

class ChatbotService:
    """
    Main chatbot service that orchestrates the feedback collection process
    """
    
    def __init__(self, rag_service: RAGService):
        """
        Initialize the chatbot service
        
        Args:
            rag_service: RAG service for context retrieval
        """
        self.rag_service = rag_service
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.3,  # Lower temperature for more consistent responses
            max_tokens=500
        )
        self.sessions: Dict[str, SessionState] = {}
        
        # Minimum response requirements for each section
        self.min_response_length = 50  # Minimum characters for a complete response
        
    async def process_message(
        self, 
        session_id: str, 
        message: str, 
        section_id: int
    ) -> Dict[str, Any]:
        """
        Process a user message and generate appropriate response
        
        Args:
            session_id: Unique session identifier
            message: User's message/response
            section_id: Current feedback section
            
        Returns:
            Chatbot response with navigation instructions
        """
        try:
            # Get or create session
            session = self._get_or_create_session(session_id)
            
            # Add user message to history
            session.add_message("user", message)
            
            # Get current section info
            current_section = FEEDBACK_SECTIONS.get(section_id)
            if not current_section:
                raise ValueError(f"Invalid section ID: {section_id}")
            
            # Retrieve relevant context from RAG
            context = await self.rag_service.retrieve_relevant_context(
                query=f"{current_section.title} {message}",
                category=self._get_section_category(section_id),
                top_k=3
            )
            
            # Analyze the response quality
            response_analysis = await self._analyze_response_quality(
                message, current_section, context
            )
            
            # Generate appropriate AI response
            ai_response = await self._generate_ai_response(
                session, message, current_section, context, response_analysis
            )
            
            # Add AI response to history
            session.add_message("assistant", ai_response["content"])
            
            # Handle section progression
            if response_analysis["is_sufficient"]:
                # Add response to section and mark complete
                session.add_section_response(section_id, message)
                await self.rag_service.add_session_feedback(session_id, section_id, message)
                session.mark_section_complete(section_id)
                
                # Check if this was the last section
                if section_id >= len(FEEDBACK_SECTIONS):
                    next_action = "complete"
                    is_complete = True
                else:
                    next_action = "next_section"
                    is_complete = False
            else:
                next_action = "clarify"
                is_complete = False
            
            return {
                "response": ai_response["content"],
                "current_section": session.current_section,
                "is_section_complete": is_complete,
                "next_action": next_action,
                "feedback_summary": None
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return {
                "response": "I'm sorry, there was an error processing your message. Please try again.",
                "current_section": section_id,
                "is_section_complete": False,
                "next_action": "retry",
                "feedback_summary": None
            }
    
    def _get_or_create_session(self, session_id: str) -> SessionState:
        """Get existing session or create a new one"""
        if session_id not in self.sessions:
            self.sessions[session_id] = SessionState(session_id)
        return self.sessions[session_id]
    
    def _get_section_category(self, section_id: int) -> str:
        """Map section ID to RAG category"""
        category_mapping = {
            1: "clinical_knowledge",
            2: "patient_care",
            3: "communication",
            4: "critical_thinking",
            5: "professionalism",
            6: "time_management",
            7: "professional_development",
            8: "feedback_principles"
        }
        return category_mapping.get(section_id, "nursing_feedback")
    
    async def _analyze_response_quality(
        self, 
        message: str, 
        section: Any, 
        context: List[Dict]
    ) -> Dict[str, Any]:
        """
        Analyze if the response is sufficient to move to next section
        
        Args:
            message: User's response
            section: Current feedback section
            context: Relevant context from RAG
            
        Returns:
            Analysis of response quality
        """
        try:
            # Basic length check
            if len(message.strip()) < self.min_response_length:
                return {
                    "is_sufficient": False,
                    "reason": "too_short",
                    "suggestions": ["Please provide more detailed information"]
                }
            
            # Check for vague responses using LLM
            analysis_prompt = f"""
            Analyze this feedback response for a nursing student evaluation in the section "{section.title}".
            
            Required elements for this section: {', '.join(section.required_elements)}
            
            Response to analyze: "{message}"
            
            Determine if this response is:
            1. Specific enough (contains concrete examples)
            2. Addresses the key areas: {', '.join(section.key_areas)}
            3. Provides actionable information
            4. Is sufficiently detailed for comprehensive feedback
            
            Respond with JSON format:
            {{
                "is_sufficient": true/false,
                "missing_elements": ["list of missing required elements"],
                "suggestions": ["specific suggestions for improvement"]
            }}
            """
            
            # Get LLM analysis
            analysis_response = await self.llm.ainvoke(analysis_prompt)
            
            try:
                # Extract content from the response
                response_content = analysis_response.content if hasattr(analysis_response, 'content') else str(analysis_response)
                analysis_data = json.loads(response_content)
                return {
                    "is_sufficient": analysis_data.get("is_sufficient", False),
                    "reason": "analysis_complete",
                    "missing_elements": analysis_data.get("missing_elements", []),
                    "suggestions": analysis_data.get("suggestions", [])
                }
            except json.JSONDecodeError:
                # Fallback analysis
                return {
                    "is_sufficient": len(message.strip()) >= self.min_response_length * 2,
                    "reason": "fallback_analysis",
                    "suggestions": ["Please provide more specific examples and details"]
                }
                
        except Exception as e:
            logger.error(f"Error analyzing response quality: {str(e)}")
            return {
                "is_sufficient": False,
                "reason": "analysis_error",
                "suggestions": ["Please provide more detailed information"]
            }
    
    async def _generate_ai_response(
        self,
        session: SessionState,
        user_message: str,
        section: Any,
        context: List[Dict],
        analysis: Dict[str, Any]
    ) -> Dict[str, str]:
        """Generate appropriate AI response based on analysis"""
        
        try:
            # Build context string from RAG results
            context_str = "\n".join([
                f"- {doc['content']}" for doc in context[:2]  # Limit context
            ])
            
            if analysis["is_sufficient"]:
                # Response is good, move to next section or complete
                if section.id >= len(FEEDBACK_SECTIONS):
                    prompt = f"""
                    Thank the preceptor for completing the comprehensive feedback process.
                    Acknowledge their input for section "{section.title}" and let them know 
                    that all 8 sections are now complete. Mention that a comprehensive 
                    summary will be generated with actionable recommendations for the student.
                    
                    Keep the response encouraging and professional.
                    """
                else:
                    next_section = FEEDBACK_SECTIONS[section.id + 1]
                    prompt = f"""
                    Thank the preceptor for their detailed feedback on "{section.title}".
                    Now introduce the next section: "{next_section.title}".
                    
                    Briefly explain what this section covers: {next_section.description}
                    
                    Ask the first question about: {next_section.key_areas[0]}
                    
                    Keep the transition smooth and encouraging.
                    """
            else:
                # Need clarification or more details
                prompt = f"""
                Thank the preceptor for their input on "{section.title}".
                The response needs more detail to provide comprehensive feedback.
                
                Missing elements: {', '.join(analysis.get('missing_elements', []))}
                
                Ask specific follow-up questions to gather:
                {chr(10).join([f"- {element}" for element in section.required_elements[:2]])}
                
                Be encouraging and specific about what additional information would be helpful.
                Suggest they provide concrete examples.
                """
            
            # Add relevant context to prompt
            if context_str:
                prompt += f"\n\nRelevant guidance:\n{context_str}"
            
            # Generate response
            response = await self.llm.ainvoke(prompt)
            
            # Extract content from the response
            response_content = response.content if hasattr(response, 'content') else str(response)
            return {"content": response_content.strip()}
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return {"content": "Thank you for your input. Could you please provide more specific details and examples?"}
    
    async def generate_final_summary(self, session_id: str) -> Dict[str, Any]:
        """Generate comprehensive feedback summary for the session"""
        
        try:
            session = self.sessions.get(session_id)
            if not session:
                raise ValueError(f"Session not found: {session_id}")
            
            # Get all session feedback context
            session_context = await self.rag_service.get_session_context(session_id)
            
            # Build comprehensive prompt for summary generation
            summary_prompt = f"""
            Generate a comprehensive nursing student feedback summary based on the following 
            input across 8 evaluation sections:
            
            """
            
            # Add each section's responses
            for section_id in range(1, 9):
                section = FEEDBACK_SECTIONS[section_id]
                responses = session.section_responses.get(section_id, [])
                
                summary_prompt += f"""
                Section {section_id}: {section.title}
                Responses: {' '.join(responses) if responses else 'No response provided'}
                
                """
            
            summary_prompt += """
            Create a structured summary including:
            
            1. **Overall Strengths** (3-5 key strengths with specific examples)
            2. **Areas for Improvement** (3-5 priority areas with specific recommendations)
            3. **Actionable Development Plan** (5-7 specific action items with timelines)
            4. **Learning Goals** (3-4 SMART goals for continued growth)
            5. **Readiness Assessment** (current level and next steps for advancement)
            
            Make the summary:
            - Specific and actionable
            - Balanced (strengths and growth areas)
            - Supportive and encouraging
            - Focused on professional development
            - Include concrete next steps
            
            Format in clear sections with bullet points for easy reading.
            """
            
            # Generate summary using LLM
            summary_response = await self.llm.ainvoke(summary_prompt)
            
            # Extract content from the response
            summary_content = summary_response.content if hasattr(summary_response, 'content') else str(summary_response)
            
            return {
                "summary": summary_content,
                "session_id": session_id,
                "sections_completed": len(session.completed_sections),
                "total_sections": len(FEEDBACK_SECTIONS),
                "completion_percentage": session.get_progress_percentage(),
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating final summary: {str(e)}")
            return {
                "summary": "Error generating summary. Please contact support.",
                "error": str(e)
            }
    
    async def get_session_progress(self, session_id: str) -> Dict[str, Any]:
        """Get current progress for a session"""
        
        session = self.sessions.get(session_id)
        if not session:
            return {
                "session_found": False,
                "current_section": 1,
                "completed_sections": 0,
                "total_sections": len(FEEDBACK_SECTIONS),
                "progress_percentage": 0.0
            }
        
        return {
            "session_found": True,
            "current_section": session.current_section,
            "completed_sections": len(session.completed_sections),
            "total_sections": len(FEEDBACK_SECTIONS),
            "progress_percentage": session.get_progress_percentage(),
            "last_updated": session.last_updated.isoformat()
        }
    
    async def reset_session(self, session_id: str):
        """Reset a chat session"""
        
        # Clear from memory
        if session_id in self.sessions:
            del self.sessions[session_id]
        
        # Clear from RAG service
        await self.rag_service.clear_session_data(session_id)
        
        logger.info(f"Reset session: {session_id}")