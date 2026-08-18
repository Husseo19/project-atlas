from pydantic import BaseModel, Field
from typing import List

class Question(BaseModel):
    content: str = Field(description="The text of the question.")
    options: List[str] = Field(description="A list of possible answers.")
    correct_answers: List[str] = Field(description="A list of the correct answers from the options.")
    explanation: str = Field(description="An explanation of why the correct answers are correct and the others are incorrect.")

class StudyObjective(BaseModel):
    code: str = Field(description="The code of the study objective, e.g., 'AZ-900.1.1'.")
    description: str = Field(description="The description of the study objective.")
    weight: float = Field(description="The weight or importance of the objective, e.g. 10.0 for 10%.")

class StudyObjectiveList(BaseModel):
    objectives: List[StudyObjective] = Field(description="A list of study objectives extracted from the syllabus.")

class SyllabusExtractionResult(BaseModel):
    certification_name: str = Field(description="The full name of the certification, e.g., 'Azure Fundamentals'.")
    certification_code: str = Field(description="The code for the certification, e.g., 'AZ-900'.")
    objectives: List[StudyObjective] = Field(description="A list of study objectives extracted from the syllabus.")

class ValidationResult(BaseModel):
    is_valid: bool = Field(description="Whether the question is perfectly accurate and valid.")
    critique: str = Field(description="If not valid, detailed feedback on what needs to be fixed. If valid, 'OK'.")
