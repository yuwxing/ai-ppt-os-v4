import sys; sys.path.insert(0, '.')
from core.db import async_session
from models.lesson import Lesson
from sqlalchemy import select
import asyncio, json

async def check():
    async with async_session() as s:
        r = await s.execute(select(Lesson).where(Lesson.id == 1))
        lesson = r.scalar_one_or_none()
        if lesson:
            slides = json.loads(lesson.slides_json) if lesson.slides_json else []
            print(f'Title: {lesson.title}')
            print(f'Slides count: {len(slides)}')
            for i, sl in enumerate(slides[:5]):
                print(f'  Slide {i+1}: component={sl.get("component")}, title={sl.get("title","")[:30]}')
        else:
            print('Not found')

asyncio.run(check())
