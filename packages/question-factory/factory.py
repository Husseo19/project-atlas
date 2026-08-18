from .generator import QuestionGenerator
from .providers import OpenAIProvider
from .models import Question

from typing import List

def generate_question(objective_text: str, difficulty: str, api_key: str = None, previous_questions: List[str] = None) -> Question:
    """
    Primary entry point to generate a Microsoft certification exam question.
    """
    provider = OpenAIProvider(api_key=api_key)
    generator = QuestionGenerator(provider=provider)
    return generator.generate(objective_text=objective_text, difficulty=difficulty, previous_questions=previous_questions)

def generate_adaptive_question(objective_text: str, wrong_answer_text: str, difficulty: str, api_key: str = None) -> Question:
    """
    Generate an adaptive question targeting a specific misconception.
    """
    provider = OpenAIProvider(api_key=api_key)
    generator = QuestionGenerator(provider=provider)
    return generator.generate_adaptive(objective_text=objective_text, wrong_answer_text=wrong_answer_text, difficulty=difficulty)
