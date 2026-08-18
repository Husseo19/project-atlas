import asyncio
import json
from src.config.database import async_session_maker
from sqlalchemy import text

async def main():
    async with async_session_maker() as session:
        result = await session.execute(text('SELECT options, correct_answers FROM questions LIMIT 10'))
        rows = result.fetchall()
        for row in rows:
            print(f"Options: {row[0]}, Correct: {row[1]}")

if __name__ == "__main__":
    asyncio.run(main())
