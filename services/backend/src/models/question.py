from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from .base import Base

class Question(Base):
    __tablename__ = 'questions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = Column(String, nullable=False)
    type = Column(String, nullable=False)
    options = Column(JSONB, nullable=False)
    correct_answers = Column(JSONB, nullable=False)
    explanation = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    tags = Column(JSONB)
    certification_id = Column(UUID(as_uuid=True), ForeignKey('certifications.id', ondelete="CASCADE"), nullable=False)
    objective_id = Column(UUID(as_uuid=True), ForeignKey('study_objectives.id', ondelete="CASCADE"), nullable=False)
    is_adaptive = Column(Boolean, default=False)
    misconception_tag = Column(String)
