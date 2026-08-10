from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agents.slide_deck import generate_deck
from agents.english_topic_ppt import generate_english_topic_ppt

router = APIRouter(prefix="/api/agent", tags=["agent"])

TOOLS = [
    {
        "id": "english-topic-ppt",
        "name": "英语话题课件（母版占位符+动画）",
        "short_description": "按初中英语话题课件 SOP 生成完整 PPTX，含母版占位符、Fade 动画、点击出答案",
        "type": "skill",
        "keywords": ["英语", "话题", "课件", "english", "topic", "ppt", "pptx", "动物", "食物", "购物", "运动", "旅行", "节日"],
    },
    {
        "id": "english-reading-lesson",
        "name": "英语阅读公开课课件（manatee 范式）",
        "short_description": "按公开课阅读课 12 步范式生成课件：悬念导入、阅读四任务链（扫读/细读/听读/朗读）、语法聚焦、写作输出、情感升华",
        "type": "skill",
        "keywords": ["阅读课", "公开课", "课文", "reading", "manatee", "阅读", "section b", "英语课文", "海牛", "精读", "泛读"],
    },
    {
        "id": "baoyu-slide-deck",
        "name": "PPT幻灯片生成",
        "short_description": "根据主题生成 HTML 幻灯片，支持多种视觉风格",
        "type": "mcp",
        "keywords": ["ppt", "slide", "deck", "幻灯片", "演示", "演示文稿", "课件", "slides", "presentation"],
    },
    {
        "id": "baoyu-translate",
        "name": "翻译/多语言",
        "short_description": "将内容翻译为多种语言",
        "type": "prompt",
        "keywords": ["翻译", "translate", "多语言", "英文", "中文", "语言"],
    },
    {
        "id": "baoyu-diagram",
        "name": "图表/架构图",
        "short_description": "绘制架构图、流程图、思维导图等",
        "type": "prompt",
        "keywords": ["图表", "架构图", "流程图", "diagram", "思维导图", "可视化"],
    },
    {
        "id": "baoyu-xiaohongshu",
        "name": "小红书图文",
        "short_description": "生成小红书风格图文卡片",
        "type": "mcp",
        "keywords": ["小红书", "xhs", "社媒", "图文", "卡片", "social"],
    },
]

class RunTaskRequest(BaseModel):
    task: str
    topic: str = ""
    subject: str = ""
    grade: str = ""
    textbook_content: str = ""
    template: str = ""  # "manatee" 公开课阅读课范式；留空则自动识别

class RunTaskResponse(BaseModel):
    success: bool
    agent: str
    matched_tool: str | None = None
    result: dict | None = None
    error: str | None = None


def _detect_intent(task: str, subject: str = "") -> list[str]:
    low = task.lower()
    subj = (subject or "").lower()
    intents = []

    # 英语话题课件（最高优先级：学科=英语 + 课件/PPT/话题）
    eng_kw = ["英语", "english"]
    ppt_kw = ["课件", "ppt", "topic", "话题", "幻灯片"]
    if any(k in subj for k in eng_kw) or any(k in low for k in eng_kw):
        if any(k in low for k in ppt_kw) or any(k in subj for k in eng_kw):
            intents.append("english-topic-ppt")

    # 英语阅读课/公开课 → manatee 范式（在 english-topic-ppt 之上追加更精确的意图）
    reading_kw = ["阅读课", "公开课", "课文", "reading", "精读", "泛读", "manatee", "阅读", "section b", "sectionb"]
    if any(k in subj for k in eng_kw) or any(k in low for k in eng_kw):
        if any(k in low for k in reading_kw) or any(k in subj for k in ["阅读"]):
            intents.append("english-reading-lesson")

    # 通用 slide-deck（英语话题课件未命中时才走这里）
    sd_kw = ["ppt", "slide", "deck", "幻灯片", "演示", "演示文稿", "课件", "slides", "presentation"]
    if any(kw in low for kw in sd_kw) and "english-topic-ppt" not in intents:
        intents.append("slide-deck")

    tr_kw = ["翻译", "translate", "多语言", "翻译成"]
    if any(kw in low for kw in tr_kw):
        intents.append("translate")
    diag_kw = ["图表", "架构图", "流程图", "diagram", "思维导图", "图"]
    if any(kw in low for kw in diag_kw):
        intents.append("diagram")
    return intents


@router.post("/discover")
async def agent_discover(body: dict):
    query = (body.get("query") or body.get("task") or "").lower()
    limit = min(body.get("limit", 5), 20)
    scored = []
    for t in TOOLS:
        kw = " ".join(t["keywords"]).lower()
        score = 0.0
        # 空格分词（英文）
        for word in query.split():
            if word and word in kw:
                score += 0.3
        # 中文/子串匹配
        for k in t["keywords"]:
            k = k.lower()
            if k and k in query:
                score += 0.6
        if score > 0:
            scored.append((score, t))
    scored.sort(key=lambda x: x[0], reverse=True)
    results = [{"name": t["name"], "id": t["id"], "short_description": t["short_description"], "type": t["type"], "score": round(s, 2)} for s, t in scored[:limit]]
    return {"query": query, "results": results, "count": len(results)}


@router.post("/run-task", response_model=RunTaskResponse)
async def agent_run_task(req: RunTaskRequest):
    task = req.task.strip()
    if not task:
        raise HTTPException(400, detail="task is required")

    intents = _detect_intent(task, req.subject)
    if req.template:
        intents.append(req.template)
    intents = list(dict.fromkeys(intents))

    # 英语阅读课/公开课 → manatee 范式（最高优先级）
    if "english-reading-lesson" in intents or req.template == "manatee":
        try:
            result = await generate_english_topic_ppt(
                topic=req.topic or task[:60],
                grade=req.grade,
                author="",
                subject=req.subject,
                textbook_content=req.textbook_content,
                template="manatee",
            )
            return RunTaskResponse(
                success=True,
                agent="Agent-First",
                matched_tool="english-reading-lesson",
                result=result,
            )
        except Exception as e:
            return RunTaskResponse(
                success=False,
                agent="Agent-First",
                matched_tool="english-reading-lesson",
                error=f"英语阅读公开课课件生成失败: {e}",
            )

    # 英语话题课件（PPTX 产出，优先于通用 slide-deck）
    if "english-topic-ppt" in intents:
        try:
            result = await generate_english_topic_ppt(
                topic=req.topic or task[:60],
                grade=req.grade,
                author="",
                subject=req.subject,
                textbook_content=req.textbook_content,
            )
            return RunTaskResponse(
                success=True,
                agent="Agent-First",
                matched_tool="english-topic-ppt",
                result=result,
            )
        except Exception as e:
            return RunTaskResponse(
                success=False,
                agent="Agent-First",
                matched_tool="english-topic-ppt",
                error=f"英语话题课件生成失败: {e}",
            )

    if "slide-deck" in intents:
        content = req.textbook_content or req.task
        deck = generate_deck(
            content=content,
            topic=req.topic or task[:40],
        )
        return RunTaskResponse(
            success=True,
            agent="Agent-First",
            matched_tool="baoyu-slide-deck",
            result={
                "type": "slide-deck",
                "deck_id": deck["deck_id"],
                "topic": deck["topic"],
                "style": deck["style"],
                "language": deck["language"],
                "slide_count": deck["slide_count"],
                "outline": deck["outline"],
                "html": deck["html"],
            },
        )

    return RunTaskResponse(
        success=False,
        agent="Agent-First",
        error=f"未找到匹配的任务类型。检测到的意图: {intents or '无'}。试试描述中包含 PPT/幻灯片/翻译/图表 等关键词。",
    )
