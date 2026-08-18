from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Any
import sys
import os
import importlib.machinery

from src.config.database import get_db
from src.repositories.question_repository import QuestionRepository
from src.repositories.objective_repository import ObjectiveRepository
from src.config.settings import settings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.certification import StudyObjective
from src.models.question import Question

router = APIRouter(prefix="/training", tags=["training"])

class GenerateAdaptiveRequest(BaseModel):
    objective_id: str
    wrong_answer_text: str

def get_question_repository(db: AsyncSession = Depends(get_db)) -> QuestionRepository:
    return QuestionRepository(db)

def get_objective_repository(db: AsyncSession = Depends(get_db)) -> ObjectiveRepository:
    return ObjectiveRepository(db)

def load_question_factory():
    if "question_factory" in sys.modules:
        return sys.modules["question_factory"]
    
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
    pkg_dir = os.path.join(base_dir, "packages", "question-factory")
    
    for mod_name in ["models", "providers", "generator", "factory"]:
        loader = importlib.machinery.SourceFileLoader(f"question_factory.{mod_name}", os.path.join(pkg_dir, f"{mod_name}.py"))
        sys.modules[f"question_factory.{mod_name}"] = loader.load_module()

    loader = importlib.machinery.SourceFileLoader("question_factory.ingestion", os.path.join(pkg_dir, "src", "ingestion.py"))
    sys.modules["question_factory.ingestion"] = loader.load_module()
        
    loader = importlib.machinery.SourceFileLoader("question_factory", os.path.join(pkg_dir, "__init__.py"))
    qf = loader.load_module()
    sys.modules["question_factory"] = qf
    return qf

@router.post("/generate-adaptive-question", response_model=Any)
async def generate_adaptive_question(
    request: GenerateAdaptiveRequest,
    repo: QuestionRepository = Depends(get_question_repository),
    obj_repo: ObjectiveRepository = Depends(get_objective_repository)
):
    try:
        result = await obj_repo.db.execute(select(StudyObjective).where(StudyObjective.id == request.objective_id))
        obj_model = result.scalars().first()
        if not obj_model:
            raise HTTPException(status_code=404, detail="Objective not found")
        obj_text = f"{obj_model.code}: {obj_model.description}"
        obj_certification_id = str(obj_model.certification_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch objective: {str(e)}")

    try:
        # Check cache
        misconception_tag = request.wrong_answer_text.strip().lower()
        
        cached_result = await repo.db.execute(
            select(Question)
            .where(Question.objective_id == request.objective_id)
            .where(Question.is_adaptive == True)
            .where(Question.misconception_tag == misconception_tag)
            .limit(1)
        )
        cached_model = cached_result.scalars().first()
            
        if cached_model:
            from src.repositories.question_repository import map_db_to_question
            return map_db_to_question(cached_model)
            
    except Exception as e:
        print(f"Cache check failed: {e}")

    try:
        qf = load_question_factory()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load question factory: {str(e)}")

    try:
        import asyncio
        loop = asyncio.get_event_loop()
        generated_q = await loop.run_in_executor(
            None,
            lambda: qf.generate_adaptive_question(
                objective_text=obj_text,
                wrong_answer_text=request.wrong_answer_text,
                difficulty="medium",
                api_key=settings.openai_api_key
            )
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate adaptive question: {str(e)}")

    mapped_options = [{"id": chr(65+i), "text": opt} for i, opt in enumerate(generated_q.options)]
    correct_ids = []
    for ca in generated_q.correct_answers:
        ca_clean = ca.strip()
        if len(ca_clean) == 1 and ca_clean.upper() in [o["id"] for o in mapped_options]:
            if ca_clean.upper() not in correct_ids:
                correct_ids.append(ca_clean.upper())
            continue
            
        for mo in mapped_options:
            mo_text = mo["text"].strip()
            if mo_text == ca_clean or ca_clean in mo_text or mo_text.endswith(ca_clean):
                if mo["id"] not in correct_ids:
                    correct_ids.append(mo["id"])
                break
                
    question_data = {
        "content": generated_q.content,
        "type": "MultipleChoice" if len(correct_ids) <= 1 else "MultipleResponse",
        "options": mapped_options,
        "correct_answers": correct_ids,
        "explanation": generated_q.explanation,
        "difficulty": 2,
        "tags": [],
        "certification_id": obj_certification_id,
        "objective_id": request.objective_id,
        "is_adaptive": True,
        "misconception_tag": request.wrong_answer_text.strip().lower()
    }

    try:
        saved_q = await repo.create(question_data)
        return saved_q
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save question: {str(e)}")
