from pydantic import BaseModel
from typing import List
from uuid import UUID

class StudyObjective(BaseModel):
    id: UUID
    certificationId: UUID
    code: str
    description: str
    weight: float

class Certification(BaseModel):
    id: UUID
    name: str
    provider: str
    version: str
    examCode: str
    objectives: List[StudyObjective]
