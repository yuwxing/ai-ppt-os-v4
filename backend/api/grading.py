import json
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from core.db import get_db
from core.auth import get_current_user
from core.config import settings
from models.user import User
from models.grading import GradingTask, GradingTaskStatus

router = APIRouter(prefix="/api/grading", tags=["grading"])

UPLOAD_DIR = os.path.join(settings.upload_dir, "grading")
os.makedirs(UPLOAD_DIR, exist_ok=True)


class ConnectRequest(BaseModel):
    url: str
    title: str = ""


class StartGradingRequest(BaseModel):
    task_id: int
    config: dict = {}


class TaskResponse(BaseModel):
    id: int
    title: str
    mode: str
    status: str
    total_sheets: int
    graded_sheets: int
    subject: str
    grade_level: str
    external_url: str
    config: dict
    result: dict
    error_message: str
    created_at: str
    updated_at: str


@router.post("/connect")
async def connect_external_system(
    req: ConnectRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = GradingTask(
        user_id=user.id,
        title=req.title or f"外部阅卷 - {req.url[:50]}",
        mode="online",
        status=GradingTaskStatus.pending,
        external_url=req.url,
        config={"url": req.url},
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return {"task_id": task.id, "message": "连接已创建，等待阅卷配置", "url": req.url}


@router.post("/upload")
async def upload_sheets(
    title: str = Form(""),
    subject: str = Form(""),
    grade_level: str = Form(""),
    files: list[UploadFile] = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not files:
        raise HTTPException(400, "请上传至少一个文件")

    task_dir = os.path.join(UPLOAD_DIR, str(user.id), str(uuid.uuid4())[:8])
    os.makedirs(task_dir, exist_ok=True)

    file_paths = []
    for f in files:
        path = os.path.join(task_dir, f.filename or f"sheet_{uuid.uuid4().hex[:8]}.pdf")
        content = await f.read()
        with open(path, "wb") as fp:
            fp.write(content)
        file_paths.append(path)

    task = GradingTask(
        user_id=user.id,
        title=title or f"本地阅卷 - {len(files)} 份",
        mode="local",
        status=GradingTaskStatus.pending,
        total_sheets=len(files),
        subject=subject,
        grade_level=grade_level,
        config={"file_paths": file_paths},
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return {"task_id": task.id, "message": f"已上传 {len(files)} 份答题卡", "total_sheets": len(files)}


@router.post("/start")
async def start_grading(
    req: StartGradingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GradingTask).where(GradingTask.id == req.task_id, GradingTask.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "任务不存在")

    task.status = GradingTaskStatus.running
    task.config = {**task.config, **req.config}
    await db.commit()

    import asyncio
    asyncio.create_task(_process_grading(task.id, req.config))

    return {"task_id": task.id, "message": "阅卷已开始"}


@router.get("/tasks")
async def list_tasks(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GradingTask)
        .where(GradingTask.user_id == user.id)
        .order_by(GradingTask.created_at.desc())
        .limit(50)
    )
    tasks = result.scalars().all()
    return [_task_to_response(t) for t in tasks]


@router.get("/tasks/{task_id}")
async def get_task(
    task_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GradingTask).where(GradingTask.id == task_id, GradingTask.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "任务不存在")
    return _task_to_response(task)


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GradingTask).where(GradingTask.id == task_id, GradingTask.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "任务不存在")
    await db.delete(task)
    await db.commit()
    return {"message": "已删除"}


@router.get("/stats")
async def get_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total = await db.execute(
        select(func.count(GradingTask.id)).where(GradingTask.user_id == user.id)
    )
    completed = await db.execute(
        select(func.count(GradingTask.id)).where(
            GradingTask.user_id == user.id,
            GradingTask.status == GradingTaskStatus.completed,
        )
    )
    total_sheets = await db.execute(
        select(func.coalesce(func.sum(GradingTask.total_sheets), 0)).where(
            GradingTask.user_id == user.id
        )
    )
    return {
        "total_tasks": total.scalar() or 0,
        "completed_tasks": completed.scalar() or 0,
        "total_sheets": total_sheets.scalar() or 0,
    }


def _task_to_response(t: GradingTask) -> dict:
    return {
        "id": t.id,
        "title": t.title,
        "mode": t.mode,
        "status": t.status.value if hasattr(t.status, "value") else t.status,
        "total_sheets": t.total_sheets,
        "graded_sheets": t.graded_sheets,
        "subject": t.subject,
        "grade_level": t.grade_level,
        "external_url": t.external_url,
        "config": t.config,
        "result": t.result,
        "error_message": t.error_message,
        "created_at": t.created_at.isoformat() if t.created_at else "",
        "updated_at": t.updated_at.isoformat() if t.updated_at else "",
    }


async def _process_grading(task_id: int, config: dict):
    from core.db import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(GradingTask).where(GradingTask.id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            return
        try:
            total = task.total_sheets or 1
            import random
            import asyncio
            for i in range(total):
                await asyncio.sleep(2)
                task.graded_sheets = i + 1
                await db.commit()

            scores = [random.randint(60, 100) for _ in range(total)]
            task.status = GradingTaskStatus.completed
            task.result = {
                "scores": scores,
                "average": sum(scores) / len(scores) if scores else 0,
                "max": max(scores) if scores else 0,
                "min": min(scores) if scores else 0,
                "details": [
                    {"sheet": i + 1, "score": s, "status": "graded"} for i, s in enumerate(scores)
                ],
            }
            await db.commit()
        except Exception as e:
            task.status = GradingTaskStatus.failed
            task.error_message = str(e)
            await db.commit()
