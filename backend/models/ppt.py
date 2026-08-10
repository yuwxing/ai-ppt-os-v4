from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from core.db import Base


class PPTRecord(Base):
    __tablename__ = "ppt_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(255), nullable=False)
    pages = Column(Integer, default=0)
    file_path = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    status = Column(String(20), default="completed")
    slides_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
