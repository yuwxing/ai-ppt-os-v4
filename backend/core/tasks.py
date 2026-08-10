import asyncio
import uuid
from core.db import async_session
from models.task import Task


async def create_task(topic: str, user_id: str, template_id: str | None = None, pages: int | None = None, subject: str = "", grade: str = "", book: str = "", lesson_type: str = "新授课", lesson_period: str = "", textbook_content: str = "", api_key: str | None = None):
    task_id = str(uuid.uuid4())
    async with async_session() as session:
        task = Task(
            id=task_id,
            user_id=user_id,
            topic=topic,
            subject=subject,
            grade=grade,
            book=book,
            lesson_type=lesson_type,
            lesson_period=lesson_period,
            textbook_content=textbook_content,
            template_id=template_id,
            pages=pages,
            api_key=api_key,
            status="queued",
        )
        session.add(task)
        await session.commit()

    from workers.ppt_worker import run_worker as worker_run
    asyncio.create_task(worker_run(task_id))
    return {"id": task_id, "status": "queued"}
