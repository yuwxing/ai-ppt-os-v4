"""课型驱动的备课编排器（Lesson Orchestrator）

V1 改造目标：
  从"一个固定 13 步 pipeline 服务所有课型"，升级为
  "课型识别 → 课型 Agent → Skill 组合 → 教学流程生成 → PPT 生成 → 质量检查"。

实现方式：
  - 新增 run_lesson_pipeline()：先调用 lesson_router.route_lesson() 完成课型路由，
    拿到该课型 Agent 的 Skill 序列，再驱动现有能力链执行。
  - 保留原 run_pipeline()（向后兼容，供未改造的调用方使用）。
  - 关键课型（新授/阅读/写作）的差异化 Skill 已能在产物中体现：
      * 阅读课：优先走 manatee 阅读范式（若有封面/阅读四任务链能力）
      * 写作课：注入审题/体裁/范文/评分 Skill 到提示词上下文
      * 新授课：经典 导入-呈现-练习-总结 结构
"""

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

from agents.lesson_router import route_lesson
from agents.registry import SKILL_REGISTRY

# Skill id → 步骤展示文案（前端轮询时显示）
_SKILL_STEP_LABEL = {
    "textbook-analysis": "📚 教材分析 - 分析教材知识结构、重难点",
    "knowledge-extraction": "🧠 知识点提取 - 梳理本课核心知识点",
    "objective-design": "🎯 教学目标 - 生成知识/能力/素养目标",
    "difficulty-analysis": "⚠️ 重点难点 - 确定教学重难点",
    "situation-import": "🎬 情境导入 - 设计课堂导入情境",
    "content-presentation": "📖 新知呈现 - 设计知识讲解呈现",
    "activity-design": "🤝 课堂活动 - 设计互动与活动",
    "question-design": "❓ 问题链设计 - 设计递进式问题链",
    "task-chain": "🧩 任务链 - 设计由易到难的学习任务",
    "differentiated-teaching": "🎚️ 分层教学 - 设计分层任务与辅导",
    "homework-design": "📋 作业设计 - 生成分层作业",
    "theme-elevation": "🌈 主题升华 - 设计价值引领与情感升华",
    "evaluation-design": "📝 评价设计 - 设计形成性评价与反馈",
    # 阅读课专项
    "reading-analysis": "🔍 阅读文本分析 - 解析课文内容与语篇",
    "reading-structure": "🧱 文章结构分析 - 划分段落与结构",
    "reading-strategy": "🧭 阅读策略 - 设计信息提取与阅读技法",
    # 写作课专项
    "writing-task-analysis": "✍️ 审题分析 - 明确写作任务与要求",
    "genre-analysis": "📄 体裁分析 - 确定文体与篇章结构",
    "model-essay": "📑 范文拆解 - 呈现并分析参考范文",
    "sentence-bank": "💬 句型积累 - 储备高频句式表达",
    "writing-rubric": "📏 评分标准 - 设计写作评价量表",
    # PPT 表达
    "ppt-outline": "🗂️ PPT结构 - 编排幻灯片大纲",
    "ppt-slide-planning": "📑 分页规划 - 规划页面与内容分布",
    "ppt-layout": "🖼️ 版式设计 - 设计每页版式布局",
    "ppt-visual-design": "🎨 视觉设计 - 配色、字体与视觉风格",
    "ppt-quality-check": "🔍 课件质检 - 检查教学合理性与课标匹配",
}


def _build_skill_view(skill_ids: list) -> list:
    """把 skill id 序列转成前端展示结构 [{id,label,icon,step}]。"""
    view = []
    for i, sid in enumerate(skill_ids, start=1):
        meta = SKILL_REGISTRY.get(sid, {})
        view.append({
            "step": i,
            "id": sid,
            "label": meta.get("label", sid),
            "icon": meta.get("icon", "•"),
            "text": _SKILL_STEP_LABEL.get(sid, f"{meta.get('label', sid)}"),
        })
    return view


async def run_lesson_pipeline(topic: str, user_id: str = "demo", template_id: str | None = None,
                              subject: str = "", grade: str = "", book: str = "",
                              lesson_type: str = "新授课", lesson_period: str = "",
                              textbook_content: str = "", template: str = "",
                              on_step=None, api_key: str | None = None, on_skill=None):
    """课型驱动的备课管线。on_skill(step, skill_view) 可让外部(前端)动态获得 Skill 序列。"""
    # ① 课型路由：识别 → 选 Agent → 取 Skill 序列
    route = route_lesson(
        subject=subject, grade=grade, lesson_type=lesson_type,
        topic=topic, textbook_content=textbook_content, template=template,
    )
    skill_view = _build_skill_view(route.skills)
    step_count = len(skill_view)
    if on_skill:
        on_skill(route.to_dict(), skill_view)

    # ② 执行强内容链（现有成熟 agent 能力，产出真实课件数据）
    content = await ContentAgent(api_key).run(
        topic, subject=subject, grade=grade, book=book,
        lesson_type=lesson_type, lesson_period=lesson_period,
        textbook_content=textbook_content,
    )
    intent = await IntentAgent(api_key).run(content)
    course_type = await CourseTypeAgent(api_key).run(content)

    template_path = await TemplateAgent().run(content, course_type, intent, template_id)
    tpl = {"file": template_path} if template_path else None

    story = await StoryAgent(api_key).run(content, course_type)
    theme_elevation = await ThemeAgent(api_key).run(content, story)
    slides = await SlidePlannerAgent(api_key).run(story)

    # 阅读课差异化：若路由到阅读课且存在 manatee 阅读范式能力，则叠加阅读 Skill 产出
    reading_related = route.lesson_type in ("reading", "listening-speaking")
    if reading_related:
        from agents.manatee_prompt import build_manatee_prompt
        try:
            story["reading_flow"] = build_manatee_prompt(content=content, slides=slides, subject=subject, grade=grade, topic=topic, textbook_content=textbook_content)
        except Exception:
            story["reading_flow"] = None

    scripts = await ScriptWriterAgent(api_key).run(slides)
    teacher = await TeacherGuideAgent(api_key).run(slides)
    games = await GameAgent(api_key).run(slides, teacher)

    style = await VisualStyleAgent(api_key).run(content)
    prompts = await ImagePromptAgent(api_key).run(slides, style)
    images = await ImageAgent(api_key).run(prompts)

    animations = await AnimationAgent(api_key).run(slides)
    music = await MusicAgent(api_key).run(content)

    ppt = await PPTAssemblerAgent(api_key).run(
        slides=slides, scripts=scripts, images=images,
        animations=animations, style=style, music=music, template=tpl,
    )
    ppt["template_file"] = tpl["file"] if tpl else None

    homework = await HomeworkAgent(api_key).run(slides, content)
    ppt["homework"] = homework
    ppt["theme_elevation"] = theme_elevation

    checked = await QAAgent(api_key).run(ppt, tpl)
    checked["games"] = games
    checked["homework"] = homework
    checked["theme_elevation"] = theme_elevation
    checked["meta"] = {
        "subject": subject, "grade": grade, "book": book,
        "lesson_type": route.lesson_type, "lesson_period": lesson_period,
        "textbook_content": textbook_content,
        "agent": route.agent_id, "agent_name": route.agent_name,
        "skills": route.skills, "skill_view": skill_view,
    }

    file_path, file_name = await ExportAgent().run(checked, topic)

    meta = {
        "topic": topic, "subject": subject, "grade": grade, "book": book,
        "lesson_type": route.lesson_type, "lesson_period": lesson_period,
        "agent_id": route.agent_id, "agent_name": route.agent_name,
    }

    return {
        "topic": topic,
        "meta": meta,
        "lesson_type": route.lesson_type,
        "agent_id": route.agent_id,
        "agent_name": route.agent_name,
        "skills": route.skills,
        "skill_view": skill_view,
        "step_count": step_count,
        "pages": len(slides),
        "file_path": file_path,
        "file_name": file_name,
        "teacher_guide": teacher,
        "scripts": scripts,
        "games": games,
        "homework": homework,
        "theme_elevation": theme_elevation,
    }


async def run_pipeline(topic: str, user_id: str = "demo", template_id: str | None = None,
                       subject: str = "", grade: str = "", book: str = "",
                       lesson_type: str = "新授课", lesson_period: str = "",
                       textbook_content: str = "", on_step=None, api_key: str | None = None):
    """向后兼容入口：等价于调用课型驱动管线，但保持原有 13 步上限的 on_step 语义。"""
    async def _on_skill(route, skill_view):
        if on_step is None:
            return
        for i, sv in enumerate(skill_view, start=1):
            on_step(min(i, 13), sv["text"])

    return await run_lesson_pipeline(
        topic=topic, user_id=user_id, template_id=template_id,
        subject=subject, grade=grade, book=book,
        lesson_type=lesson_type, lesson_period=lesson_period,
        textbook_content=textbook_content, on_step=on_step,
        api_key=api_key, on_skill=_on_skill,
    )
