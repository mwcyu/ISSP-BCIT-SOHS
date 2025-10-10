"""
Configuration settings for the RAG-based Clinical Feedback Helper
"""
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration"""
    
    # OpenAI Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "gpt-4o-mini")
    TEMPERATURE: float = float(os.getenv("TEMPERATURE", "0.7"))
    
    # RAG Settings
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    # Vector Store Settings
    VECTOR_STORE_PATH: str = "./vectorstore"
    COLLECTION_NAME: str = "bccnm_standards"
    
    # Session Settings
    MAX_CONVERSATION_HISTORY: int = 20
    SESSION_TIMEOUT_MINUTES: int = 60
    
    # Output Settings
    OUTPUT_DIR: str = "./feedback_reports"
    EXPORT_FORMAT: List[str] = ["json", "csv"]
    
    @classmethod
    def validate(cls):
        """Validate required configuration"""
        if not cls.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        return True


# BCCNM Standards - Knowledge Base for RAG
BCCNM_STANDARDS = {
    "professional_responsibility": {
        "name": "Professional Responsibility",
        "full_name": "Professional Responsibility and Accountability",
        "order": 1,
        "description": """This standard is all about maintaining professional standards, 
        recognizing scope of practice, managing clinical safety, and demonstrating professional conduct. 
        It includes professional accountability, honesty, transparency, recognition of personal limitations, 
        clinical safety, risk management, evidence-informed practice, self-directed learning, 
        professional conduct, respectful interactions, and self-care practices.""",
        "key_areas": [
            "Professional accountability, honesty and transparency",
            "Recognition of scope of practice and personal limitations",
            "Clinical safety and risk management",
            "Evidence-informed practice and self-directed learning",
            "Professional conduct and respectful interactions",
            "Self-care practices"
        ],
        "example_questions": [
            "How did the student demonstrate professional accountability in their practice?",
            "Can you provide an example of when the learner appropriately sought assistance?",
            "How well did the student manage clinical safety and identify potential risks?",
            "Did the student engage in evidence-based practice and self-directed learning?"
        ]
    },
    "knowledge_based_practice": {
        "name": "Knowledge-Based Practice",
        "full_name": "Knowledge-Based Practice",
        "order": 2,
        "description": """This standard focuses on clinical competence, critical thinking, 
        knowledge application, and technical skills. It encompasses clinical competence and skills, 
        critical thinking and clinical reasoning, knowledge application to patient care, 
        pharmacology and medication safety, assessment skills, and documentation quality.""",
        "key_areas": [
            "Clinical competence and technical skills",
            "Critical thinking and clinical reasoning",
            "Knowledge application to patient care",
            "Pharmacology and medication safety",
            "Assessment and documentation"
        ],
        "example_questions": [
            "How would you describe the student's clinical competence and technical skills?",
            "Can you provide an example of the student's critical thinking in a clinical situation?",
            "How well did the student apply theoretical knowledge to patient care?",
            "Were there any concerns or strengths regarding medication administration?"
        ]
    },
    "client_focused_service": {
        "name": "Client-Focused Service",
        "full_name": "Client-Focused Provision of Service",
        "order": 3,
        "description": """This standard addresses interprofessional collaboration, teamwork, 
        communication, and patient advocacy. It includes interprofessional collaboration, 
        team communication effectiveness, time management and organization, patient advocacy, 
        and care coordination.""",
        "key_areas": [
            "Interprofessional collaboration",
            "Team communication",
            "Time management and organization",
            "Patient advocacy",
            "Care coordination"
        ],
        "example_questions": [
            "How effectively did the student collaborate with the healthcare team?",
            "Can you describe the student's communication with other team members?",
            "How did the student manage their time and prioritize tasks?",
            "Did you observe any instances of patient advocacy?"
        ]
    },
    "ethical_practice": {
        "name": "Ethical Practice",
        "full_name": "Ethical Practice",
        "order": 4,
        "description": """This standard encompasses ethical decision-making, patient privacy, 
        professional boundaries, and respect for diversity. It covers patient privacy and confidentiality, 
        professional boundaries, respect for diversity and cultural sensitivity, 
        ethical decision-making, and advocacy for vulnerable populations.""",
        "key_areas": [
            "Patient privacy and confidentiality",
            "Professional boundaries",
            "Respect for diversity",
            "Ethical decision-making",
            "Advocacy for vulnerable populations"
        ],
        "example_questions": [
            "How did the student maintain patient privacy and confidentiality?",
            "Can you provide an example of the student respecting professional boundaries?",
            "Did the student demonstrate cultural sensitivity and respect for diversity?",
            "Were there any ethical situations the student handled well or needs to improve on?"
        ]
    }
}


# System Prompts
SYSTEM_PROMPT_TEMPLATE = """You are the Clinical Feedback Helper, a professional and encouraging AI assistant.

Your purpose is to help nursing preceptors provide high-quality, structured feedback on their students 
based on the four BCCNM standards of practice.

Your user is a busy nursing professional. Be concise, clear, and respectful of their time.

CRITICAL RULES:
1. PRIVACY: NEVER ask for personally identifiable information (PII) about students or patients
2. If you detect PII in a response, immediately pause and ask the preceptor to rephrase maintaining anonymity
3. SCOPE: Your role is only to facilitate feedback collection - do not provide medical advice
4. TONE: Maintain a professional, helpful, and encouraging tone at all times

WORKFLOW:
You will guide the preceptor through collecting feedback on all four BCCNM standards in order:
1. Professional Responsibility
2. Knowledge-Based Practice
3. Client-Focused Service
4. Ethical Practice

For each standard:
1. ASK: Start with a broad, open-ended question explaining what the standard covers
2. LISTEN & EVALUATE: Assess if feedback is specific and includes concrete examples
3. PROBE: If feedback is vague or lacks examples, ask clarifying questions
4. SYNTHESIZE: Generate a summary and actionable suggestion
5. CONFIRM: Present summary and suggestion for approval before moving to next standard

Context from knowledge base:
{context}

Current conversation state: {state}
"""

PRIVACY_CHECK_PROMPT = """Analyze the following text for personally identifiable information (PII).

Text: {text}

Check for:
- Patient names or initials
- Student names or initials
- Facility names or locations
- Specific dates (beyond general timeframes like "this week")
- Medical record numbers
- Room numbers or specific unit identifiers

Return "SAFE" if no PII detected, or "PII_DETECTED" with explanation if PII found."""
