from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from .base import Base

class Certification(Base):
    __tablename__ = 'certifications'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    version = Column(String, nullable=False, default="latest")
    exam_code = Column(String, nullable=False, unique=True)
    
    objectives = relationship("StudyObjective", back_populates="certification", cascade="all, delete-orphan")

class StudyObjective(Base):
    __tablename__ = 'study_objectives'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    certification_id = Column(UUID(as_uuid=True), ForeignKey('certifications.id', ondelete="CASCADE"), nullable=False)
    code = Column(String, nullable=False)
    description = Column(String, nullable=False)
    weight = Column(Integer)
    parent_id = Column(UUID(as_uuid=True), ForeignKey('study_objectives.id', ondelete="CASCADE"), nullable=True)

    certification = relationship("Certification", back_populates="objectives")
