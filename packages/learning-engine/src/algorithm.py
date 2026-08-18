import random
from typing import List, Any

def select_training_questions(questions: List[Any], user_id: str, certification_id: str, limit: int = 50):
    if len(questions) > limit:
        return random.sample(questions, limit)
    shuffled = list(questions)
    random.shuffle(shuffled)
    return shuffled
