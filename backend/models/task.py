from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from core.db import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(50), nullable=False)
    topic = Column(String(255), nullable=False)
    subject = Column(String(50), default="")
    grade = Column(String(50), default="")
    book = Column(String(50), default="")
    lesson_type = Column(String(50), default="新授课")
    lesson_period = Column(String(50), default="")
    textbook_content = Column(Text, default="")
    template_id = Column(String(50), nullable=True)
    pages = Column(Integer, nullable=True)
    api_key = Column(String(500), nullable=True)
    status = Column(String(20), default="queued")
    step = Column(Integer, default=0)
    step_name = Column(String(200), default="")
    result = Column(JSON, nullable=True)
    file_path = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
