"""
Pydantic models for structured data handling
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Literal
from datetime import datetime
from enum import Enum


class StandardName(str, Enum):
    """BCCNM Standard names"""
    PROFESSIONAL_RESPONSIBILITY = "professional_responsibility"
    KNOWLEDGE_BASED_PRACTICE = "knowledge_based_practice"
    CLIENT_FOCUSED_SERVICE = "client_focused_service"
    ETHICAL_PRACTICE = "ethical_practice"


class FeedbackQuality(str, Enum):
    """Quality assessment of feedback"""
    VAGUE = "vague"
    SPECIFIC_NO_EXAMPLE = "specific_no_example"
    SPECIFIC_WITH_EXAMPLE = "specific_with_example"


class SessionState(str, Enum):
    """Current state of feedback session"""
    INITIALIZED = "initialized"
    COLLECTING_FEEDBACK = "collecting_feedback"
    CONFIRMING_STANDARD = "confirming_standard"
    COMPLETED = "completed"
    ERROR = "error"


class FeedbackEvaluation(BaseModel):
    """Evaluation of preceptor's feedback quality"""
    is_specific: bool = Field(description="Whether feedback contains specific details")
    has_example: bool = Field(description="Whether feedback includes a concrete example")
    quality: FeedbackQuality = Field(description="Overall quality assessment")
    key_points: List[str] = Field(default_factory=list, description="Key points extracted")
    reasoning: str = Field(description="Explanation of the evaluation")


class StandardFeedback(BaseModel):
    """Feedback collected for a single BCCNM standard"""
    standard_name: StandardName
    raw_feedback: str = Field(description="Original feedback from preceptor")
    quality_evaluation: Optional[FeedbackEvaluation] = None
    summary: Optional[str] = Field(None, description="Professional summary of feedback")
    suggestion: Optional[str] = Field(None, description="Actionable suggestion for student")
    confirmed: bool = Field(default=False, description="Whether preceptor confirmed this feedback")
    timestamp: datetime = Field(default_factory=datetime.now)


class ConversationTurn(BaseModel):
    """Single turn in the conversation"""
    speaker: Literal["assistant", "preceptor"]
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)
    metadata: Optional[Dict] = None


class FeedbackSession(BaseModel):
    """Complete feedback session state"""
    session_id: str
    state: SessionState = Field(default=SessionState.INITIALIZED)
    current_standard: Optional[StandardName] = None
    current_standard_index: int = Field(default=0, ge=0, le=3)
    feedback_collected: Dict[StandardName, StandardFeedback] = Field(default_factory=dict)
    conversation_history: List[ConversationTurn] = Field(default_factory=list)
    preceptor_email: Optional[str] = None
    started_at: datetime = Field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    
    @field_validator('preceptor_email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        """Validate email format"""
        if v is not None and '@' not in v:
            raise ValueError('Invalid email format')
        return v
    
    def add_turn(self, speaker: Literal["assistant", "preceptor"], message: str, metadata: Optional[Dict] = None):
        """Add a conversation turn"""
        turn = ConversationTurn(speaker=speaker, message=message, metadata=metadata)
        self.conversation_history.append(turn)
    
    def get_standard_order(self) -> List[StandardName]:
        """Get the ordered list of standards to process"""
        return [
            StandardName.PROFESSIONAL_RESPONSIBILITY,
            StandardName.KNOWLEDGE_BASED_PRACTICE,
            StandardName.CLIENT_FOCUSED_SERVICE,
            StandardName.ETHICAL_PRACTICE
        ]
    
    def get_next_standard(self) -> Optional[StandardName]:
        """Get the next standard to process"""
        standards = self.get_standard_order()
        if self.current_standard_index < len(standards):
            return standards[self.current_standard_index]
        return None
    
    def advance_to_next_standard(self):
        """Move to the next standard"""
        self.current_standard_index += 1
        next_standard = self.get_next_standard()
        if next_standard:
            self.current_standard = next_standard
            self.state = SessionState.COLLECTING_FEEDBACK
        else:
            self.state = SessionState.COMPLETED
            self.completed_at = datetime.now()
    
    def is_complete(self) -> bool:
        """Check if all standards are completed"""
        return self.current_standard_index >= 4


class PrivacyCheckResult(BaseModel):
    """Result of privacy check"""
    is_safe: bool = Field(description="Whether text is safe (no PII)")
    detected_pii: List[str] = Field(default_factory=list, description="Types of PII detected")
    explanation: str = Field(default="", description="Explanation of findings")


class FinalReport(BaseModel):
    """Final compiled feedback report"""
    session_id: str
    generated_at: datetime = Field(default_factory=datetime.now)
    standards_feedback: Dict[str, Dict[str, str]] = Field(
        description="Feedback organized by standard"
    )
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for export"""
        return {
            "session_id": self.session_id,
            "generated_at": self.generated_at.isoformat(),
            "feedback": self.standards_feedback
        }
