from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, JSON, Float
from core.db import Base
import enum


class GradingTaskStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class GradingTask(Base):
    __tablename__ = "grading_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    mode = Column(String(50), nullable=False, default="local")
    status = Column(Enum(GradingTaskStatus), default=GradingTaskStatus.pending)
    total_sheets = Column(Integer, default=0)
    graded_sheets = Column(Integer, default=0)
    subject = Column(String(100), default="")
    grade_level = Column(String(100), default="")
    external_url = Column(String(500), default="")
    config = Column(JSON, default=dict)
    result = Column(JSON, default=dict)
    error_message = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
