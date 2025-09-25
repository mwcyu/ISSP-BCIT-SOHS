"""
Nursing Feedback Chatbot Configuration
Defines the 8 feedback sections and their associated questions/criteria
"""

from typing import Dict, List
from pydantic import BaseModel

class FeedbackSection(BaseModel):
    """Model for a feedback section"""
    id: int
    title: str
    description: str
    key_areas: List[str]
    sample_questions: List[str]
    required_elements: List[str]

# The 8 core nursing feedback sections
FEEDBACK_SECTIONS: Dict[int, FeedbackSection] = {
    1: FeedbackSection(
        id=1,
        title="Clinical Knowledge Application",
        description="Assessment of theoretical knowledge application in clinical settings",
        key_areas=[
            "Pathophysiology understanding",
            "Medication knowledge",
            "Evidence-based practice",
            "Critical thinking skills"
        ],
        sample_questions=[
            "How did the student apply theoretical knowledge to patient care?",
            "Were there any knowledge gaps observed?",
            "How well did they integrate evidence-based practices?"
        ],
        required_elements=[
            "Specific examples of knowledge application",
            "Areas of strength",
            "Knowledge gaps identified",
            "Learning opportunities"
        ]
    ),
    
    2: FeedbackSection(
        id=2,
        title="Patient Care Skills",
        description="Hands-on patient care abilities and technical skills",
        key_areas=[
            "Assessment techniques",
            "Nursing interventions",
            "Safety protocols",
            "Documentation accuracy"
        ],
        sample_questions=[
            "How proficient were the student's assessment skills?",
            "Were nursing interventions appropriate and timely?",
            "How well did they follow safety protocols?"
        ],
        required_elements=[
            "Specific skill demonstrations",
            "Safety compliance",
            "Areas needing improvement",
            "Skill development plan"
        ]
    ),
    
    3: FeedbackSection(
        id=3,
        title="Communication and Interpersonal Skills",
        description="Professional communication with patients, families, and healthcare team",
        key_areas=[
            "Therapeutic communication",
            "Patient advocacy",
            "Team collaboration",
            "Cultural sensitivity"
        ],
        sample_questions=[
            "How effective was the student's communication with patients?",
            "Did they demonstrate therapeutic communication techniques?",
            "How well did they collaborate with the healthcare team?"
        ],
        required_elements=[
            "Communication examples",
            "Interpersonal effectiveness",
            "Areas for communication improvement",
            "Professional development goals"
        ]
    ),
    
    4: FeedbackSection(
        id=4,
        title="Critical Thinking and Decision Making",
        description="Problem-solving abilities and clinical reasoning",
        key_areas=[
            "Clinical reasoning",
            "Problem identification",
            "Solution development",
            "Outcome evaluation"
        ],
        sample_questions=[
            "How well did the student identify patient problems?",
            "Were their clinical decisions appropriate?",
            "How did they prioritize patient care needs?"
        ],
        required_elements=[
            "Decision-making examples",
            "Reasoning process evaluation",
            "Areas for improvement",
            "Critical thinking development plan"
        ]
    ),
    
    5: FeedbackSection(
        id=5,
        title="Professionalism and Ethics",
        description="Professional behavior and ethical practice standards",
        key_areas=[
            "Professional appearance",
            "Ethical decision-making",
            "Confidentiality",
            "Accountability"
        ],
        sample_questions=[
            "Did the student maintain professional standards?",
            "How did they handle ethical dilemmas?",
            "Were they accountable for their actions?"
        ],
        required_elements=[
            "Professionalism examples",
            "Ethical behavior assessment",
            "Areas needing attention",
            "Professional growth recommendations"
        ]
    ),
    
    6: FeedbackSection(
        id=6,
        title="Time Management and Organization",
        description="Efficiency in task completion and priority management",
        key_areas=[
            "Task prioritization",
            "Time efficiency",
            "Organizational skills",
            "Workload management"
        ],
        sample_questions=[
            "How well did the student manage their time?",
            "Were they able to prioritize tasks effectively?",
            "How organized were they in their approach?"
        ],
        required_elements=[
            "Time management examples",
            "Organizational strengths",
            "Efficiency improvements needed",
            "Management strategies"
        ]
    ),
    
    7: FeedbackSection(
        id=7,
        title="Learning and Professional Development",
        description="Commitment to continuous learning and self-improvement",
        key_areas=[
            "Learning initiative",
            "Self-reflection",
            "Feedback receptiveness",
            "Skill development"
        ],
        sample_questions=[
            "How receptive was the student to feedback?",
            "Did they demonstrate initiative in learning?",
            "How well do they self-reflect on their practice?"
        ],
        required_elements=[
            "Learning examples",
            "Self-improvement efforts",
            "Receptiveness to feedback",
            "Development opportunities"
        ]
    ),
    
    8: FeedbackSection(
        id=8,
        title="Overall Performance Summary",
        description="Comprehensive evaluation and future recommendations",
        key_areas=[
            "Overall strengths",
            "Key improvement areas",
            "Learning goals",
            "Career readiness"
        ],
        sample_questions=[
            "What are the student's main strengths?",
            "What are the priority areas for improvement?",
            "What are their readiness for advanced practice?"
        ],
        required_elements=[
            "Comprehensive summary",
            "Prioritized recommendations",
            "Specific action items",
            "Timeline for improvement"
        ]
    )
}

# Prompts for AI interaction
SYSTEM_PROMPTS = {
    "initial": """
    You are an AI assistant helping nursing preceptors provide comprehensive, constructive feedback to nursing students. 
    Your role is to guide preceptors through 8 structured feedback sections, ensuring they provide detailed, 
    actionable feedback for student development.
    
    Guidelines:
    1. Work through sections sequentially (1-8)
    2. Ask clarifying questions if responses are vague
    3. Request specific examples when needed
    4. Ensure all required elements are covered before moving to next section
    5. Maintain a supportive, professional tone
    6. Focus on constructive feedback and growth opportunities
    """,
    
    "clarification": """
    The response provided seems too general. Please ask for more specific details, examples, 
    or clarification to ensure comprehensive feedback.
    """,
    
    "summary": """
    Based on all the feedback provided across the 8 sections, create a comprehensive summary 
    that includes:
    1. Key strengths identified
    2. Priority areas for improvement
    3. Specific actionable recommendations
    4. Learning goals and development plan
    """
}