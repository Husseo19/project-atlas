from pydantic import BaseModel
from typing import List
from uuid import UUID
from enum import Enum

class QuestionType(str, Enum):
    MultipleChoice = "MultipleChoice"
    MultipleResponse = "MultipleResponse"

class Option(BaseModel):
    id: str
    text: str

class Question(BaseModel):
    id: UUID
    content: str
    type: QuestionType
    options: List[Option]
    correctAnswer: List[str]
    explanation: str
    difficulty: int
    tags: List[str]

class QuestionPool(BaseModel):
    id: UUID
    certificationId: UUID
    questions: List[Question]
    version: str
