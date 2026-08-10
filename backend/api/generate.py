from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from core.db import get_db
from core.auth import get_current_user
from core.subscriptions import check_usage_limit, increment_usage
from core.tasks import create_task
from core.task_store import get_task
from models.user import User
from models.ppt import PPTRecord

router = APIRouter(prefix="/api/generate", tags=["generate"])


class GenerateRequest(BaseModel):
    topic: str
    subject: str = ""
    grade: str = ""
    book: str = ""
    lesson_type: str = "新授课"
    lesson_period: str = ""
    textbook_content: str = ""
    template_id: str | None = None
    pages: int | None = None
    api_key: str | None = None


@router.post("/")
async def generate_ppt(
    req: GenerateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not await check_usage_limit(user):
        raise HTTPException(
            429, detail="今日生成次数已用完，升级Pro获取更多次数"
        )

    if not req.topic or len(req.topic.strip()) < 2:
        raise HTTPException(400, detail="请输入有效的PPT主题")

    task = await create_task(
        req.topic, str(user.id), req.template_id,
        subject=req.subject, grade=req.grade, book=req.book,
        lesson_type=req.lesson_type, lesson_period=req.lesson_period,
        textbook_content=req.textbook_content,
        api_key=req.api_key,
    )
    return {"task_id": task["id"], "status": "pending"}


@router.get("/status/{task_id}")
async def get_status(task_id: str):
    task = await get_task(task_id)
    if not task:
        raise HTTPException(404, detail="任务不存在")
    return {
        "status": task["status"],
        "file_url": task.get("file_path"),
        "file_name": task.get("file_name"),
        "download": task.get("status") == "done",
        "result": task.get("result"),
        "step": task.get("step", 0),
        "step_name": task.get("step_name", ""),
        "progress": task.get("progress", ""),
        "error": task.get("error"),
    }
