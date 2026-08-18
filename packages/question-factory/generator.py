from .models import Question, ValidationResult
from .providers import LLMProvider
from typing import List
import re

def sanitize_input(text: str, max_length: int = 500) -> str:
    if not text:
        return ""
    text = str(text)
    if len(text) > max_length:
        text = text[:max_length]
    return re.sub(r'[^\w\s\-\.\,\:\;]', '', text)

class QuestionGenerator:
    def __init__(self, provider: LLMProvider):
        self.provider = provider

    def validate_question(self, question: Question) -> ValidationResult:
        prompt = (
            f"You are a strict Microsoft Cloud Architect QA Engineer.\n"
            f"Review this certification question for accuracy and quality:\n\n"
            f"Question: {question.content}\n"
            f"Options: {question.options}\n"
            f"Correct Answers: {question.correct_answers}\n"
            f"Explanation: {question.explanation}\n\n"
            f"RULES:\n"
            f"1. There must be exactly the right number of correct answers.\n"
            f"2. The distractors must NOT be partially correct or correct under edge cases.\n"
            f"3. The technology mentioned MUST exist in the current Microsoft ecosystem.\n"
            f"4. The explanation must clearly explain why the correct answers are right AND why the distractors are wrong.\n\n"
            f"If it passes all rules, set is_valid=true and critique='OK'.\n"
            f"If it fails ANY rule, set is_valid=false and provide a detailed critique explaining what must be fixed."
        )
        # Use low temperature for strict factual validation if provider supports it, but standard is fine
        result = self.provider.generate_structured(prompt, ValidationResult)
        return result

    def generate(self, objective_text: str, difficulty: str, previous_questions: List[str] = None) -> Question:
        objective_text = sanitize_input(objective_text)
        difficulty = sanitize_input(difficulty, 50)
        history_context = ""
        if previous_questions and len(previous_questions) > 0:
            history_str = "\n- ".join(previous_questions)
            history_context = (
                f"\n\nCRITICAL INSTRUCTION: You have already generated the following questions for this objective. "
                f"You MUST generate a completely novel scenario that tests a different angle. DO NOT repeat these themes:\n"
                f"- {history_str}"
            )

        base_prompt = (
            f"Generate a high-quality Microsoft certification exam question.\n"
            f"Objective: {objective_text}\n"
            f"Difficulty: {difficulty}"
            f"{history_context}\n\n"
            f"Ensure the question is realistic, unambiguous, and includes a detailed explanation.\n"
            f"Provide the output in the required JSON structure."
        )

        max_retries = 3
        critique_history = ""
        
        for attempt in range(max_retries):
            current_prompt = base_prompt
            if critique_history:
                current_prompt += f"\n\nPREVIOUS ATTEMPTS FAILED VALIDATION:\n{critique_history}\nFIX THESE ISSUES IN YOUR NEW GENERATION."

            result = self.provider.generate_structured(current_prompt, Question)
            if not isinstance(result, Question):
                raise ValueError("Provider did not return a valid Question instance.")

            # Run validation
            validation = self.validate_question(result)
            if validation.is_valid:
                return result
            else:
                critique_history += f"Attempt {attempt+1} Critique: {validation.critique}\n"

        # If we exhausted retries, return the last generated question anyway (or we could raise an error)
        # For bulk generation, returning the best attempt is better than crashing the pipeline
        return result

    def generate_adaptive(self, objective_text: str, wrong_answer_text: str, difficulty: str) -> Question:
        objective_text = sanitize_input(objective_text)
        wrong_answer_text = sanitize_input(wrong_answer_text, 1000)
        difficulty = sanitize_input(difficulty, 50)
        # We can also add validation here, but keeping it simple for adaptive as per plan
        prompt = (
            f"Generate a high-quality Microsoft certification exam question.\n"
            f"Objective: {objective_text}\n"
            f"Difficulty: {difficulty}\n\n"
            f"Context: The user previously answered a question on this objective incorrectly. "
            f"Their incorrect answer was: '{wrong_answer_text}'.\n\n"
            f"CRITICAL INSTRUCTION: Generate a NEW question that specifically tests the difference between the user's misconception ('{wrong_answer_text}') and the actual correct concept for this objective. "
            f"The explanation MUST clarify why the previous misunderstanding is wrong and explain the nuances.\n"
            f"Ensure the question is realistic, unambiguous, and includes a detailed explanation.\n"
            f"Provide the output in the required JSON structure."
        )
        
        max_retries = 2
        critique_history = ""
        for attempt in range(max_retries):
            current_prompt = prompt
            if critique_history:
                current_prompt += f"\n\nPREVIOUS ATTEMPTS FAILED VALIDATION:\n{critique_history}\nFIX THESE ISSUES."
                
            result = self.provider.generate_structured(current_prompt, Question)
            validation = self.validate_question(result)
            if validation.is_valid:
                return result
            else:
                critique_history += f"Critique: {validation.critique}\n"
                
        return result
