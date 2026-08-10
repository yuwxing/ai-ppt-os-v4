from sqlalchemy import select
from core.db import async_session
from models.task import Task


async def get_task(tid: str) -> dict | None:
    async with async_session() as session:
        result = await session.execute(select(Task).where(Task.id == tid))
        task = result.scalar_one_or_none()
        if not task:
            return None
        return {
            "id": task.id,
            "status": task.status,
            "step": task.step,
            "step_name": task.step_name,
            "result": task.result,
            "file_path": task.file_path,
            "file_name": task.file_name,
            "error": task.error,
            "progress": "",
        }


async def update_task(tid: str, **kwargs):
    async with async_session() as session:
        result = await session.execute(select(Task).where(Task.id == tid))
        task = result.scalar_one_or_none()
        if task:
            for key, val in kwargs.items():
                setattr(task, key, val)
            await session.commit()


async def get_task_dict(tid: str) -> dict | None:
    async with async_session() as session:
        result = await session.execute(select(Task).where(Task.id == tid))
        task = result.scalar_one_or_none()
        if not task:
            return None
        return {
            "id": task.id,
            "topic": task.topic,
            "user_id": task.user_id,
            "template_id": task.template_id,
            "pages": task.pages,
            "subject": task.subject,
            "grade": task.grade,
            "book": task.book,
            "lesson_type": task.lesson_type,
            "lesson_period": task.lesson_period,
            "textbook_content": task.textbook_content,
            "api_key": task.api_key,
        }
