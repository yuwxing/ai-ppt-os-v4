from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from core.config import settings

engine = create_async_engine(settings.database_url, echo=settings.debug)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    async with engine.begin() as conn:
        from models.user import User
        from models.ppt import PPTRecord
        from models.subscription import Subscription, UsageRecord
        from models.lesson import Lesson
        from models.grading import GradingTask
        from models.task import Task
        await conn.run_sync(Base.metadata.create_all)
