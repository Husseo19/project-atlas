from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid
from .base import Base

class Session(Base):
    __tablename__ = 'sessions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    certification_id = Column(UUID(as_uuid=True), ForeignKey('certifications.id', ondelete="CASCADE"), nullable=False)
    questions = Column(JSONB, nullable=False)
    answers = Column(JSONB, nullable=False, default={})
    start_time = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    end_time = Column(DateTime(timezone=True), nullable=True)
    score = Column(Float, nullable=True)
    passed = Column(Boolean, nullable=True)
    type = Column(String, nullable=False, default="exam")
