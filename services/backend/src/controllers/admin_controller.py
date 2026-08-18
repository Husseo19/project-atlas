from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import re

def sanitize_input(text: str, max_length: int = 500) -> str:
    if not text: return ""
    text = str(text)
    if len(text) > max_length: text = text[:max_length]
    return re.sub(r'[^\w\s\-\.\,\:\;]', '', text)
from typing import Any
import sys
import os
import importlib.machinery
import asyncio
import json

from src.config.database import get_db
from src.repositories.question_repository import QuestionRepository
from src.repositories.certification_repository import CertificationRepository
from src.repositories.objective_repository import ObjectiveRepository
from src.config.settings import settings
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/admin", tags=["admin"])

class GenerateQuestionRequest(BaseModel):
    certification_id: str
    objective: str = Field(..., max_length=500)

def get_question_repository(db: AsyncSession = Depends(get_db)) -> QuestionRepository:
    return QuestionRepository(db)

def get_certification_repository(db: AsyncSession = Depends(get_db)) -> CertificationRepository:
    return CertificationRepository(db)

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

    # Load ingestion.py from src folder
    loader = importlib.machinery.SourceFileLoader("question_factory.ingestion", os.path.join(pkg_dir, "src", "ingestion.py"))
    sys.modules["question_factory.ingestion"] = loader.load_module()
        
    loader = importlib.machinery.SourceFileLoader("question_factory", os.path.join(pkg_dir, "__init__.py"))
    qf = loader.load_module()
    sys.modules["question_factory"] = qf
    return qf

@router.post("/generate-question", response_model=Any)
async def generate_question_endpoint(
    request: GenerateQuestionRequest,
    repo: QuestionRepository = Depends(get_question_repository)
):
    try:
        qf = load_question_factory()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load question factory: {str(e)}")
        
    try:
        # factory.generate_question returns a Question Pydantic model
        safe_objective = sanitize_input(request.objective)
        generated_q = qf.generate_question(
            objective_text=safe_objective,
            difficulty="medium",
            api_key=settings.openai_api_key
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate question: {str(e)}")
        
    question_data = {
        "content": generated_q.content,
        "type": "MultipleChoice",
        "options": [opt.model_dump() for opt in generated_q.options],
        "correctAnswer": generated_q.correct_answer,
        "explanation": generated_q.explanation,
        "difficulty": 2,
        "tags": [],
        "certification_id": request.certification_id
    }
    
    try:
        saved_q = await repo.create(question_data)
        return saved_q
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save question: {str(e)}")

@router.post("/upload-syllabus")
async def upload_syllabus(
    file: UploadFile = File(...),
    cert_repo: CertificationRepository = Depends(get_certification_repository),
    obj_repo: ObjectiveRepository = Depends(get_objective_repository)
):
    try:
        qf = load_question_factory()
        from question_factory.ingestion import SyllabusIngestor
        from question_factory.providers import OpenAIProvider
        
        provider = OpenAIProvider(api_key=settings.openai_api_key)
        ingestor = SyllabusIngestor(provider)
        
        pdf_bytes = await file.read()
        extraction_result = ingestor.ingest_pdf_bytes(pdf_bytes)
        
        cert = await cert_repo.get_by_code_or_name(extraction_result.certification_code, extraction_result.certification_name)
        created = False
        if not cert:
            cert = await cert_repo.create(code=extraction_result.certification_code, name=extraction_result.certification_name)
            created = True
            
        if not created:
            await obj_repo.delete_by_certification(cert.id)

        objectives_to_save = [
            {
                "certification_id": cert.id,
                "code": obj.code,
                "description": obj.description,
                "weight": obj.weight
            }
            for obj in extraction_result.objectives
        ]
        await obj_repo.create_many(objectives_to_save)
        
        return {
            "result": extraction_result.model_dump(),
            "created": created,
            "certification_id": cert.id
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to ingest syllabus: {str(e)}")

class IngestUrlRequest(BaseModel):
    url: str

@router.post("/ingest-url")
async def ingest_url(
    request: IngestUrlRequest,
    cert_repo: CertificationRepository = Depends(get_certification_repository),
    obj_repo: ObjectiveRepository = Depends(get_objective_repository)
):
    try:
        import httpx
        
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(request.url)
            response.raise_for_status()
            pdf_bytes = response.content

        qf = load_question_factory()
        from question_factory.ingestion import SyllabusIngestor
        from question_factory.providers import OpenAIProvider
        
        provider = OpenAIProvider(api_key=settings.openai_api_key)
        ingestor = SyllabusIngestor(provider)
        
        extraction_result = ingestor.ingest_pdf_bytes(pdf_bytes)
        
        cert = await cert_repo.get_by_code_or_name(extraction_result.certification_code, extraction_result.certification_name)
        created = False
        if not cert:
            cert = await cert_repo.create(code=extraction_result.certification_code, name=extraction_result.certification_name)
            created = True
            
        if not created:
            await obj_repo.delete_by_certification(cert.id)

        objectives_to_save = [
            {
                "certification_id": cert.id,
                "code": obj.code,
                "description": obj.description,
                "weight": obj.weight
            }
            for obj in extraction_result.objectives
        ]
        await obj_repo.create_many(objectives_to_save)
        
        return {
            "result": extraction_result.model_dump(),
            "created": created,
            "certification_id": cert.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest URL: {str(e)}")

@router.get("/generate-questions-bulk")
async def generate_questions_bulk(
    certification_id: str,
    count: int = 50,
    cert_repo: CertificationRepository = Depends(get_certification_repository),
    obj_repo: ObjectiveRepository = Depends(get_objective_repository),
    repo: QuestionRepository = Depends(get_question_repository)
):
    async def event_generator():
        objectives = await obj_repo.get_by_certification(certification_id)
        if not objectives:
            yield f"data: {json.dumps({'error': 'No objectives found for this certification. Please upload a syllabus first.'})}\n\n"
            yield f"data: {json.dumps({'status': 'Complete'})}\n\n"
            return

        try:
            qf = load_question_factory()
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            yield f"data: {json.dumps({'status': 'Complete'})}\n\n"
            return
            
        yield f"data: {json.dumps({'status': 'Started', 'total': count})}\n\n"
        
        for i in range(count):
            obj = objectives[i % len(objectives)]
            obj_text = f"{obj.get('code')}: {obj.get('description')}"
            
            try:
                loop = asyncio.get_event_loop()
                
                # Fetch recent questions for deduplication
                recent_qs = await repo.get_by_objective(obj["id"], limit=10)
                previous_questions = [q.content for q in recent_qs] if recent_qs else []

                safe_obj_text = sanitize_input(obj_text, 1000)
                generated_q = await loop.run_in_executor(
                    None,
                    lambda: qf.generate_question(
                        objective_text=safe_obj_text,
                        difficulty="medium",
                        api_key=settings.openai_api_key,
                        previous_questions=previous_questions
                    )
                )
                
                mapped_options = [{"id": chr(65+i), "text": opt} for i, opt in enumerate(generated_q.options)]
                correct_ids = []
                for ca in generated_q.correct_answers:
                    ca_clean = ca.strip()
                    if len(ca_clean) == 1 and ca_clean.upper() in [o["id"] for o in mapped_options]:
                        if ca_clean.upper() not in correct_ids:
                            correct_ids.append(ca_clean.upper())
                        continue
                        
                    for mo in mapped_options:
                        # Try exact match, or check if LLM output is contained in the option (ignoring prefix)
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
                    "certification_id": certification_id,
                    "objective_id": obj["id"],
                    "is_adaptive": False
                }
                
                await repo.create(question_data)
                
                yield f"data: {json.dumps({'progress': i + 1, 'total': count, 'current_objective': obj.get('code')})}\n\n"
                await asyncio.sleep(1) # Rate limit protection
            except Exception as e:
                import traceback
                traceback.print_exc()
                yield f"data: {json.dumps({'error': str(e), 'progress': i + 1, 'total': count})}\n\n"
                
        yield f"data: {json.dumps({'status': 'Complete'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
