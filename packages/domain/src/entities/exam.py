from pydantic import BaseModel
from typing import List, Dict, Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

class ExamBlueprint(BaseModel):
    id: UUID
    certificationId: UUID
    totalQuestions: int
    passingScore: int
    timeLimit: int
    distribution: Dict[UUID, float]

class SessionMode(str, Enum):
    Adaptive = "Adaptive"
    Sequential = "Sequential"

class ExamSession(BaseModel):
    id: UUID
    userId: UUID
    blueprintId: UUID
    questions: List[UUID]
    answers: Dict[UUID, List[str]]
    startTime: datetime
    endTime: Optional[datetime] = None
    score: Optional[float] = None
    passed: Optional[bool] = None

class TrainingSession(BaseModel):
    id: UUID
    userId: UUID
    objectiveId: Optional[UUID] = None
    mode: SessionMode
    questions: List[UUID]
    answers: Dict[UUID, List[str]]
    startTime: datetime
