import sys; sys.path.insert(0, 'D:\\ai-ppt-os-v3\\backend')
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
            for i, sl in enumerate(slides):
                keys = list(sl.keys())
                has_quiz = 'quiz' in sl
                qcount = len(sl.get('quiz', {}).get('questions', [])) if has_quiz else 0
                print(f'Slide {i+1}: type={sl.get("component")}, keys={len(keys)}, has_quiz={has_quiz}, qcount={qcount}, has_subtitle={"subtitle" in sl}, has_script={"script" in sl}')
        else:
            print('Not found')

asyncio.run(check())
