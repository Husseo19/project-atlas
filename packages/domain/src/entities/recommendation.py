from pydantic import BaseModel
from typing import List
from uuid import UUID

class LearningRecommendation(BaseModel):
    id: UUID
    userId: UUID
    recommendedObjectives: List[UUID]
    reason: str
