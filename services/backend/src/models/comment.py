from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid
from .base import Base

class QuestionComment(Base):
    __tablename__ = 'question_comments'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey('questions.id', ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False) # Refers to Supabase Auth user
    content = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    parent_id = Column(UUID(as_uuid=True), ForeignKey('question_comments.id', ondelete="CASCADE"), nullable=True)
