import asyncio
import re
from src.config.database import async_session_maker
from sqlalchemy import select, update
import src.models.certification
from src.models.question import Question

async def fix_questions():
    async with async_session_maker() as session:
        result = await session.execute(select(Question).where(Question.correct_answers == []))
        broken_questions = result.scalars().all()
        
        print(f"Found {len(broken_questions)} questions with empty correct_answers.")
        
        fixed_count = 0
        for q in broken_questions:
            # Try to parse the correct answer from the explanation
            # Common patterns: "The correct answer is A", "Option B is correct", "Answer: C"
            explanation = q.explanation or ""
            
            # Simple regex to find letters A-F near keywords
            matches = re.findall(r'(?:correct answer is|option|answer:?|correct:?)\s+([A-F])', explanation, re.IGNORECASE)
            
            if not matches:
                # Try finding just a single letter at the start of the explanation like "A. This is because..."
                matches = re.findall(r'^([A-F])[\.\:]', explanation)
            
            if matches:
                # Get the first match, uppercase it
                correct_letter = matches[0].upper()
                q.correct_answers = [correct_letter]
                fixed_count += 1
            else:
                # If we really can't find it, we could default to something or leave it, but let's see.
                pass
                
        if fixed_count > 0:
            await session.commit()
            print(f"Fixed {fixed_count} questions.")
        else:
            print("Could not parse any correct answers from explanations.")

if __name__ == "__main__":
    asyncio.run(fix_questions())
