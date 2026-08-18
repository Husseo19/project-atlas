import asyncio
from src.config.database import async_session_maker
from src.repositories.question_repository import QuestionRepository

async def test():
    async with async_session_maker() as db:
        repo = QuestionRepository(db)
        qs = await repo.get_by_certification('SC-300')
        print(f"Found {len(qs)} questions")

asyncio.run(test())
