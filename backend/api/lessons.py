import json, os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from core.auth import get_current_user
from core.db import get_db
from models.user import User
from models.lesson import Lesson
from pydantic import BaseModel

router = APIRouter(prefix="/api/lessons", tags=["lessons"])


class LessonCreate(BaseModel):
    title: str
    subject: str = ""
    grade: str = ""
    textbook: str = ""
    unit: str = ""
    template_style: str = "story-magic"
    slides: list = []


class LessonUpdate(BaseModel):
    title: str | None = None
    subject: str | None = None
    grade: str | None = None
    textbook: str | None = None
    unit: str | None = None
    template_style: str | None = None
    slides: list | None = None
    status: str | None = None


@router.get("/template/default")
async def get_default_template(user: User = Depends(get_current_user)):
    template_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "templates",
        "education",
        "新人教七年级下册 unit 8 once-upon-a-time",
    )
    filepath = os.path.join(template_dir, "lesson.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="默认模板未找到")
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
    meta = data.get("meta", {})
    return {
        "title": meta.get("title", ""),
        "subject": meta.get("subject", ""),
        "grade": meta.get("grade", ""),
        "textbook": meta.get("textbook", ""),
        "unit": meta.get("unit", ""),
        "template_style": data.get("design", {}).get("theme_name", "story-magic"),
        "slides": data.get("slides", []),
    }


@router.get("")
async def list_lessons(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Lesson).where(Lesson.user_id == user.id).order_by(Lesson.updated_at.desc())
    )
    lessons = result.scalars().all()
    return [
        {
            "id": l.id,
            "title": l.title,
            "subject": l.subject,
            "grade": l.grade,
            "textbook": l.textbook,
            "unit": l.unit,
            "slide_count": l.slide_count,
            "status": l.status,
            "template_style": l.template_style,
            "created_at": l.created_at.isoformat() if l.created_at else None,
            "updated_at": l.updated_at.isoformat() if l.updated_at else None,
        }
        for l in lessons
    ]


@router.get("/{lesson_id}")
async def get_lesson(
    lesson_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Lesson).where(Lesson.id == lesson_id, Lesson.user_id == user.id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {
        "id": lesson.id,
        "title": lesson.title,
        "subject": lesson.subject,
        "grade": lesson.grade,
        "textbook": lesson.textbook,
        "unit": lesson.unit,
        "template_style": lesson.template_style,
        "slides": json.loads(lesson.slides_json) if lesson.slides_json else [],
        "slide_count": lesson.slide_count,
        "status": lesson.status,
        "created_at": lesson.created_at.isoformat() if lesson.created_at else None,
        "updated_at": lesson.updated_at.isoformat() if lesson.updated_at else None,
    }


@router.post("/")
async def create_lesson(
    data: LessonCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lesson = Lesson(
        user_id=user.id,
        title=data.title,
        subject=data.subject,
        grade=data.grade,
        textbook=data.textbook,
        unit=data.unit,
        template_style=data.template_style,
        slides_json=json.dumps(data.slides, ensure_ascii=False),
        slide_count=len(data.slides),
        status="draft",
    )
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return {"id": lesson.id, "message": "课件创建成功"}


@router.put("/{lesson_id}")
async def update_lesson(
    lesson_id: int,
    data: LessonUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Lesson).where(Lesson.id == lesson_id, Lesson.user_id == user.id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if data.title is not None:
        lesson.title = data.title
    if data.subject is not None:
        lesson.subject = data.subject
    if data.grade is not None:
        lesson.grade = data.grade
    if data.textbook is not None:
        lesson.textbook = data.textbook
    if data.unit is not None:
        lesson.unit = data.unit
    if data.template_style is not None:
        lesson.template_style = data.template_style
    if data.slides is not None:
        lesson.slides_json = json.dumps(data.slides, ensure_ascii=False)
        lesson.slide_count = len(data.slides)
    if data.status is not None:
        lesson.status = data.status

    await db.commit()
    return {"message": "课件更新成功"}


@router.delete("/{lesson_id}")
async def delete_lesson(
    lesson_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Lesson).where(Lesson.id == lesson_id, Lesson.user_id == user.id)
    )
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    await db.delete(lesson)
    await db.commit()
    return {"message": "课件已删除"}
