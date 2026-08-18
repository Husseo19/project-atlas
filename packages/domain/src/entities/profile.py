from pydantic import BaseModel
from typing import Dict
from uuid import UUID

class MasteryProfile(BaseModel):
    id: UUID
    userId: UUID
    certificationId: UUID
    objectiveMastery: Dict[UUID, float]
    overallMastery: float
    readinessScore: float

class UserProgress(BaseModel):
    id: UUID
    userId: UUID
    certificationId: UUID
    sessionsCompleted: int
    averageScore: float
    streak: int
