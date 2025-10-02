"""
RAG (Retrieval-Augmented Generation) Service
Handles vector database operations and context retrieval for nursing feedback
"""

import os
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

logger = logging.getLogger(__name__)

class RAGService:
    """
    Service for handling RAG operations including:
    - Vector database management
    - Document embedding and retrieval
    - Context enhancement for nursing feedback
    """
    
    def __init__(self):
        """Initialize RAG service with vector database and embeddings"""
        self.chroma_db_path = os.getenv("CHROMA_DB_PATH", "./data/chroma_db")
        self.embeddings = None
        self.chroma_client = None
        self.collection = None
        
    async def initialize(self):
        """Initialize the RAG service components"""
        try:
            # Initialize OpenAI embeddings
            self.embeddings = OpenAIEmbeddings()
            
            # Initialize ChromaDB
            os.makedirs(self.chroma_db_path, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(path=self.chroma_db_path)
            
            # Create or get collection for nursing feedback knowledge
            self.collection = self.chroma_client.get_or_create_collection(
                name="nursing_feedback_knowledge",
                metadata={"description": "Nursing education and feedback knowledge base"}
            )
            
            # Load initial knowledge base if empty
            if self.collection.count() == 0:
                await self._load_initial_knowledge()
                
            logger.info("RAG service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize RAG service: {str(e)}")
            raise
    
    async def _load_initial_knowledge(self):
        """Load initial nursing knowledge base into vector database"""
        try:
            # Define nursing education knowledge base
            nursing_knowledge = [
                {
                    "content": """
                    Effective nursing feedback should be specific, timely, and actionable. 
                    It should focus on behaviors and performance rather than personal characteristics.
                    Good feedback includes concrete examples and suggests specific improvements.
                    """,
                    "category": "feedback_principles",
                    "source": "nursing_education_standards"
                },
                {
                    "content": """
                    Clinical knowledge application in nursing involves integrating theoretical 
                    understanding with practical patient care. Students should demonstrate 
                    understanding of pathophysiology, pharmacology, and evidence-based practices.
                    """,
                    "category": "clinical_knowledge",
                    "source": "nursing_competency_standards"
                },
                {
                    "content": """
                    Patient care skills encompass assessment techniques, nursing interventions, 
                    safety protocols, and accurate documentation. These skills require both 
                    technical proficiency and critical thinking.
                    """,
                    "category": "patient_care",
                    "source": "nursing_skills_framework"
                },
                {
                    "content": """
                    Therapeutic communication is essential in nursing. It involves active listening, 
                    empathy, cultural sensitivity, and clear professional communication with 
                    patients, families, and healthcare team members.
                    """,
                    "category": "communication",
                    "source": "nursing_communication_standards"
                },
                {
                    "content": """
                    Critical thinking in nursing involves systematic problem-solving, clinical 
                    reasoning, and evidence-based decision making. Students should demonstrate 
                    ability to prioritize, analyze, and evaluate patient situations.
                    """,
                    "category": "critical_thinking",
                    "source": "nursing_cognitive_skills"
                },
                {
                    "content": """
                    Professional nursing behavior includes maintaining ethical standards, 
                    accountability, confidentiality, and appropriate professional appearance 
                    and conduct in all healthcare settings.
                    """,
                    "category": "professionalism",
                    "source": "nursing_professional_standards"
                },
                {
                    "content": """
                    Effective time management and organization are crucial nursing skills. 
                    This includes prioritizing tasks, managing workload, and maintaining 
                    efficiency while ensuring patient safety and quality care.
                    """,
                    "category": "time_management",
                    "source": "nursing_efficiency_standards"
                },
                {
                    "content": """
                    Continuous learning and professional development are hallmarks of excellent 
                    nursing practice. Students should demonstrate receptiveness to feedback, 
                    self-reflection, and initiative in skill development.
                    """,
                    "category": "professional_development",
                    "source": "nursing_growth_standards"
                }
            ]
            
            # Process and add documents to vector database
            documents = []
            metadatas = []
            ids = []
            
            for i, knowledge in enumerate(nursing_knowledge):
                documents.append(knowledge["content"])
                metadatas.append({
                    "category": knowledge["category"],
                    "source": knowledge["source"]
                })
                ids.append(f"nursing_knowledge_{i}")
            
            # Add to ChromaDB collection
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Loaded {len(nursing_knowledge)} knowledge documents")
            
        except Exception as e:
            logger.error(f"Failed to load initial knowledge: {str(e)}")
            raise
    
    async def retrieve_relevant_context(
        self, 
        query: str, 
        category: Optional[str] = None, 
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant context from the knowledge base
        
        Args:
            query: Search query for relevant context
            category: Optional category filter
            top_k: Number of results to return
            
        Returns:
            List of relevant context documents with metadata
        """
        try:
            # Build where clause for category filtering
            where_clause = {"category": category} if category else None
            
            # Query the collection
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k,
                where=where_clause
            )
            
            # Format results
            context_docs = []
            if results["documents"] and results["documents"][0]:
                for i, doc in enumerate(results["documents"][0]):
                    context_docs.append({
                        "content": doc,
                        "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                        "distance": results["distances"][0][i] if results["distances"] else None
                    })
            
            return context_docs
            
        except Exception as e:
            logger.error(f"Failed to retrieve context: {str(e)}")
            return []
    
    async def add_session_feedback(
        self, 
        session_id: str, 
        section_id: int, 
        feedback_content: str
    ):
        """
        Add session feedback to the knowledge base for context enrichment
        
        Args:
            session_id: Unique session identifier
            section_id: Feedback section ID
            feedback_content: The feedback content to store
        """
        try:
            doc_id = f"session_{session_id}_section_{section_id}"
            
            self.collection.add(
                documents=[feedback_content],
                metadatas=[{
                    "session_id": session_id,
                    "section_id": section_id,
                    "category": "session_feedback",
                    "source": "user_input"
                }],
                ids=[doc_id]
            )
            
            logger.info(f"Added session feedback: {doc_id}")
            
        except Exception as e:
            logger.error(f"Failed to add session feedback: {str(e)}")
    
    async def get_session_context(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve all feedback context for a specific session
        
        Args:
            session_id: The session ID to retrieve context for
            
        Returns:
            List of session feedback documents
        """
        try:
            results = self.collection.query(
                query_texts=["nursing feedback"],  # Generic query
                n_results=50,  # Get more results to filter
                where={"session_id": session_id}
            )
            
            context_docs = []
            if results["documents"] and results["documents"][0]:
                for i, doc in enumerate(results["documents"][0]):
                    context_docs.append({
                        "content": doc,
                        "metadata": results["metadatas"][0][i],
                        "section_id": results["metadatas"][0][i].get("section_id")
                    })
            
            # Sort by section_id
            context_docs.sort(key=lambda x: x.get("section_id", 0))
            return context_docs
            
        except Exception as e:
            logger.error(f"Failed to get session context: {str(e)}")
            return []
    
    async def clear_session_data(self, session_id: str):
        """
        Clear all data for a specific session
        
        Args:
            session_id: The session ID to clear
        """
        try:
            # Get all documents for this session
            results = self.collection.query(
                query_texts=["nursing feedback"],
                n_results=50,
                where={"session_id": session_id}
            )
            
            if results["ids"] and results["ids"][0]:
                # Delete all documents for this session
                self.collection.delete(ids=results["ids"][0])
                logger.info(f"Cleared session data for: {session_id}")
                
        except Exception as e:
            logger.error(f"Failed to clear session data: {str(e)}")