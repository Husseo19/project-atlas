from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.session import Session

from src.middleware.auth import get_current_user
from src.schemas.auth import UserResponse
from src.config.database import get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard")
async def get_dashboard_analytics(
    user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Get all sessions for the user
        result = await db.execute(select(Session).where(Session.user_id == user.id))
        sessions_models = result.scalars().all()
        
        # Convert models to dict for the legacy processing code below
        sessions = [
            {
                "certification_id": str(s.certification_id),
                "mode": s.type,
                "end_time": s.end_time.isoformat() if s.end_time else None,
                "score": s.score,
                "start_time": s.start_time.isoformat() if s.start_time else datetime.now(timezone.utc).isoformat()
            } for s in sessions_models
        ]
        
        if not sessions:
            return {
                "certificationsEnrolled": 0,
                "examsTaken": 0,
                "averageScore": 0,
                "studyStreak": 0
            }
            
        completed_exams = [s for s in sessions if s.get('mode') == 'exam' and s.get('end_time')]
        
        # Unique certifications
        cert_ids = set([s['certification_id'] for s in sessions])
        certifications_enrolled = len(cert_ids)
        
        exams_taken = len(completed_exams)
        
        average_score = 0
        if exams_taken > 0:
            average_score = sum(s.get('score', 0) for s in completed_exams) / exams_taken
            
        # Calculate study streak
        # Sort sessions by start_time descending
        # For simplicity, we just look at unique days
        sorted_sessions = sorted(sessions, key=lambda x: x['start_time'], reverse=True)
        unique_days = []
        for s in sorted_sessions:
            try:
                # Handle ISO format strings
                dt = datetime.fromisoformat(s['start_time'].replace('Z', '+00:00'))
                day = dt.date()
                if not unique_days or unique_days[-1] != day:
                    unique_days.append(day)
            except Exception:
                continue
                
        streak = 0
        today = datetime.now(timezone.utc).date()
        
        if unique_days:
            # If the last study day was today or yesterday, start counting
            if (today - unique_days[0]).days <= 1:
                streak = 1
                for i in range(1, len(unique_days)):
                    if (unique_days[i-1] - unique_days[i]).days == 1:
                        streak += 1
                    else:
                        break
        
        return {
            "certificationsEnrolled": certifications_enrolled,
            "examsTaken": exams_taken,
            "averageScore": round(average_score),
            "studyStreak": streak
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")
