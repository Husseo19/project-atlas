from typing import Optional, List
from datetime import datetime, timezone
from src.schemas.session import SessionResponse, SubmitAnswersRequest
from src.repositories.session_repository import SessionRepository
from src.repositories.question_repository import QuestionRepository

class SessionService:
    def __init__(self, repo: SessionRepository, question_repo: QuestionRepository):
        self.repo = repo
        self.question_repo = question_repo

    async def start_session(self, user_id: str, certification_id: str) -> SessionResponse:
        questions = await self.question_repo.get_by_certification(certification_id)
        question_ids = [q.id for q in questions]
        real_cert_id = questions[0].certification_id if questions else certification_id
        return await self.repo.create(user_id, real_cert_id, question_ids)

    async def start_training_session(self, user_id: str, certification_id: str) -> SessionResponse:
        import sys
        import os
        import importlib.machinery
        
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
        algorithm_path = os.path.join(base_dir, "packages", "learning-engine", "src", "algorithm.py")
        
        loader = importlib.machinery.SourceFileLoader("algorithm", algorithm_path)
        algorithm = loader.load_module()
        
        questions = await self.question_repo.get_by_certification(certification_id)
        selected_questions = algorithm.select_training_questions(questions, user_id, certification_id, limit=50)
        question_ids = [q.id for q in selected_questions]
        
        real_cert_id = questions[0].certification_id if questions else certification_id
        return await self.repo.create(user_id, real_cert_id, question_ids, mode="training")

    async def submit_answers(self, session_id: str, request: SubmitAnswersRequest) -> Optional[SessionResponse]:
        session = await self.repo.get_by_id(session_id)
        if not session:
            return None
        
        questions = await self.question_repo.get_by_certification(session.certification_id)
        question_map = {q.id: q for q in questions}
        
        correct_count = 0
        total_questions = len(session.questions)
        
        for q_id in session.questions:
            if q_id in request.answers:
                user_answer = sorted(request.answers[q_id])
                if q_id in question_map:
                    correct_answer = sorted(question_map[q_id].correctAnswer)
                    if user_answer == correct_answer:
                        correct_count += 1
                        
        score = (correct_count / total_questions * 100) if total_questions > 0 else 0
        passed = score >= 70
        
        updates = {
            "answers": request.answers,
            "end_time": datetime.now(timezone.utc).isoformat(),
            "score": score,
            "passed": passed
        }
        
        return await self.repo.update(session_id, updates)

    async def get_session(self, session_id: str) -> Optional[SessionResponse]:
        return await self.repo.get_by_id(session_id)
