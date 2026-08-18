from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.middleware.auth import get_current_user
from src.schemas.auth import UserResponse
from src.config.database import get_db
from src.models.comment import QuestionComment

router = APIRouter(prefix="/community", tags=["community"])

class CommentRequest(BaseModel):
    content: str
    parent_id: Optional[str] = None

class CommentResponse(BaseModel):
    id: str
    question_id: str
    user_id: str
    content: str
    created_at: str
    parent_id: Optional[str] = None

@router.get("/questions/{question_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    question_id: str, 
    user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(
            select(QuestionComment)
            .where(QuestionComment.question_id == question_id)
            .order_by(QuestionComment.created_at)
        )
        models = result.scalars().all()
        
        return [
            {
                "id": str(m.id),
                "question_id": str(m.question_id),
                "user_id": str(m.user_id),
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else "",
                "parent_id": str(m.parent_id) if m.parent_id else None
            } for m in models
        ]
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch comments")

@router.post("/questions/{question_id}/comments", response_model=CommentResponse)
async def create_comment(
    question_id: str, 
    request: CommentRequest, 
    user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        new_comment = QuestionComment(
            question_id=question_id,
            user_id=user.id,
            content=request.content,
            parent_id=request.parent_id
        )
        db.add(new_comment)
        await db.commit()
        await db.refresh(new_comment)
        
        return {
            "id": str(new_comment.id),
            "question_id": str(new_comment.question_id),
            "user_id": str(new_comment.user_id),
            "content": new_comment.content,
            "created_at": new_comment.created_at.isoformat() if new_comment.created_at else "",
            "parent_id": str(new_comment.parent_id) if new_comment.parent_id else None
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to create comment")
