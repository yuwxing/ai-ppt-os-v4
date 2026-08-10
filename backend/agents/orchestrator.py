from agents.content import ContentAgent
from agents.intent import IntentAgent
from agents.course_type import CourseTypeAgent
from agents.story import StoryAgent
from agents.theme_agent import ThemeAgent
from agents.slide_planner import SlidePlannerAgent
from agents.script_writer import ScriptWriterAgent
from agents.teacher_guide import TeacherGuideAgent
from agents.game_agent import GameAgent
from agents.visual import VisualStyleAgent
from agents.image_prompt import ImagePromptAgent
from agents.image import ImageAgent
from agents.animation import AnimationAgent
from agents.music import MusicAgent
from agents.assembler import PPTAssemblerAgent
from agents.homework_agent import HomeworkAgent
from agents.qa import QAAgent
from agents.template import TemplateAgent
from agents.export import ExportAgent


async def run_pipeline(topic: str, user_id: str = "demo", template_id: str | None = None, subject: str = "", grade: str = "", book: str = "", lesson_type: str = "新授课", lesson_period: str = "", textbook_content: str = "", on_step=None, api_key: str | None = None):
    if on_step: on_step(1, "📚 教材分析Agent 正在分析教材知识结构...")
    content = await ContentAgent(api_key).run(topic, subject=subject, grade=grade, book=book, lesson_type=lesson_type, lesson_period=lesson_period, textbook_content=textbook_content)

    if on_step: on_step(2, "🎯 学习目标Agent 正在制定教学目标...")
    intent = await IntentAgent(api_key).run(content)

    if on_step: on_step(3, "🧠 学情诊断Agent 正在预测学生困难点...")
    course_type = await CourseTypeAgent(api_key).run(content)

    if on_step: on_step(4, "🎬 情境创设Agent 正在设计课堂导入...")
    template_path = await TemplateAgent().run(content, course_type, intent, template_id)
    template = {"file": template_path} if template_path else None

    if on_step: on_step(5, "🧩 任务链Agent 正在设计学习任务...")
    story = await StoryAgent(api_key).run(content, course_type)

    if on_step: on_step(6, "🌈 主题升华Agent 正在设计价值引领...")
    theme_elevation = await ThemeAgent(api_key).run(content, story)

    slides = await SlidePlannerAgent(api_key).run(story)

    if on_step: on_step(7, "👨‍🏫 教学流程Agent 正在安排40分钟课堂...")
    scripts = await ScriptWriterAgent(api_key).run(slides)
    teacher = await TeacherGuideAgent(api_key).run(slides)

    if on_step: on_step(8, "🎮 游戏活动Agent 正在设计课堂互动...")
    games = await GameAgent(api_key).run(slides, teacher)

    if on_step: on_step(9, "📝 评价设计Agent 正在设计课堂评价...")
    style = await VisualStyleAgent(api_key).run(content)
    prompts = await ImagePromptAgent(api_key).run(slides, style)

    if on_step: on_step(10, "🎨 课件视觉Agent 正在设计PPT风格...")
    images = await ImageAgent(api_key).run(prompts)

    if on_step: on_step(11, "🎙️ 多媒体资源Agent 正在生成素材...")
    animations = await AnimationAgent(api_key).run(slides)
    music = await MusicAgent(api_key).run(content)

    ppt = await PPTAssemblerAgent(api_key).run(
        slides=slides, scripts=scripts, images=images,
        animations=animations, style=style, music=music,
        template=template,
    )
    ppt["template_file"] = template["file"] if template else None

    if on_step: on_step(12, "📋 作业设计Agent 正在生成分层作业...")
    homework = await HomeworkAgent(api_key).run(slides, content)
    ppt["homework"] = homework
    ppt["theme_elevation"] = theme_elevation

    if on_step: on_step(13, "🔍 质量审核Agent 正在检查教学质量...")
    checked = await QAAgent(api_key).run(ppt, template)
    checked["games"] = games
    checked["homework"] = homework
    checked["theme_elevation"] = theme_elevation
    checked["meta"] = {"subject": subject, "grade": grade, "book": book, "lesson_type": lesson_type, "lesson_period": lesson_period, "textbook_content": textbook_content}

    file_path, file_name = await ExportAgent().run(checked, topic)

    meta = {"topic": topic, "subject": subject, "grade": grade, "book": book, "lesson_type": lesson_type, "lesson_period": lesson_period}

    return {
        "topic": topic,
        "meta": meta,
        "pages": len(slides),
        "file_path": file_path,
        "file_name": file_name,
        "teacher_guide": teacher,
        "scripts": scripts,
        "games": games,
        "homework": homework,
        "theme_elevation": theme_elevation,
    }
