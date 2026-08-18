from pydantic import BaseModel
from typing import List, Optional

class OptionSchema(BaseModel):
    id: str
    text: str

class QuestionResponse(BaseModel):
    id: str
    content: str
    type: str
    options: List[OptionSchema]
    correctAnswer: List[str]
    explanation: str
    difficulty: int
    tags: List[str]
    certification_id: str
    objective_id: Optional[str] = None
    is_adaptive: bool = False
    misconception_tag: Optional[str] = None
