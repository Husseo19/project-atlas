from pydantic import BaseModel, Field
from typing import List, Literal, Optional

class OptionItem(BaseModel):
    id: str = Field(description="The option identifier, e.g., 'opt_0', 'opt_1', or 'A', 'B'.")
    text: str = Field(description="The display text for this option.")

class CitationItem(BaseModel):
    title: str = Field(description="The title of the official Microsoft Learn article.")
    url: str = Field(description="The canonical URL to the Microsoft Learn documentation.")
    description: Optional[str] = Field(default="", description="Summary snippet of the article.")

class Question(BaseModel):
    content: str = Field(description="The full scenario text and prompt of the question.")
    type: Literal["MultipleChoice", "MultipleResponse", "DragAndDrop", "FillInTheBlank"] = Field(
        default="MultipleChoice",
        description="The exam question format: MultipleChoice (single select), MultipleResponse (multi select), DragAndDrop (ordered sequence/matching), or FillInTheBlank (hotspot dropdown with ___ blanks)."
    )
    options: List[OptionItem] = Field(description="A list of possible answers / dropdown choices / draggable items with id and text.")
    correct_answers: List[str] = Field(description="The list of correct option IDs (e.g. ['opt_1'] or ['opt_0', 'opt_3']).")
    explanation: str = Field(description="A comprehensive technical explanation proving the correct choice and specifically refuting distractors.")
    learn_search_queries: Optional[List[str]] = Field(default=[], description="1 to 2 precise procedural search query strings to retrieve official Microsoft Learn articles.")
    difficulty: Optional[int] = Field(default=2, description="Difficulty level 1-3.")

class StudyObjective(BaseModel):
    code: str = Field(description="The code of the study objective, e.g., 'MS-102.1.1'.")
    description: str = Field(description="The description of the study objective.")
    weight: float = Field(description="The weight or importance of the objective, e.g. 10.0 for 10%.")

class StudyObjectiveList(BaseModel):
    objectives: List[StudyObjective] = Field(description="A list of study objectives extracted from the syllabus.")

class SyllabusExtractionResult(BaseModel):
    certification_name: str = Field(description="The full name of the certification, e.g., 'Microsoft 365 Administrator'.")
    certification_code: str = Field(description="The code for the certification, e.g., 'MS-102'.")
    objectives: List[StudyObjective] = Field(description="A list of study objectives extracted from the syllabus.")

class ValidationResult(BaseModel):
    is_valid: bool = Field(description="Whether the question is perfectly accurate, unambiguous, and structurally valid.")
    critique: str = Field(description="If not valid, detailed feedback on what needs to be fixed. If valid, 'OK'.")
