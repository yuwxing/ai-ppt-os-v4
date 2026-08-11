"""
课型 Agent / Skill 注册表
========================

将"一个通用 pipeline 跑所有课型"升级为"课型识别 → 课型 Agent → Skill 组合 → 教学流程生成"。
数据驱动：新增课型 / 新增 Agent / 新增 Skill，只需在下面注册表中增加一条，无需改核心引擎。

架构对应关系（与前端 GeneratePage 的 Skill 面板一一对齐）：
  - agent: 一个"课型智能体"，代表该类课的编排单位
  - skills: 该课型会依次执行的同名 Skill（每个 skill 映射到后端一个可调用 agent / 处理函数）
"""

from enum import Enum
from typing import List, Dict

# ─────────────────────────────────────────────────────────────────────────────
# 1. 课型枚举：产品层第一层的"课型路由键"
# ─────────────────────────────────────────────────────────────────────────────
class LessonType(str, Enum):
    NEW_LESSON = "new-lesson"           # 新授课
    READING = "reading"                 # 阅读课
    LISTENING_SPEAKING = "listening-speaking"  # 听说课
    GRAMMAR = "grammar"                 # 语法课
    WRITING = "writing"                 # 写作课
    REVIEW = "review"                   # 复习课
    EXAM_REVIEW = "exam-review"         # 试卷讲评
    UNIT_INTEGRATION = "unit-integration"  # 单元整合
    AUTO = "auto"                       # 自动识别（交给 LessonRouter）

# ─────────────────────────────────────────────────────────────────────────────
# 2. Skill 注册表：所有可编排的"能力单元"
#    key      —— Skill id（前端显示的字符串）
#    label    —— 中文名
#    icon     —— 前端展示图标
#    category —— 归属：teaching(教学设计) / ppt(课件表达)
# ─────────────────────────────────────────────────────────────────────────────
SKILL_REGISTRY: Dict[str, Dict[str, str]] = {
    # —— 教学设计类 ——
    "textbook-analysis":        {"label": "教材分析",           "category": "teaching", "icon": "📚"},
    "knowledge-extraction":     {"label": "知识点提取",         "category": "teaching", "icon": "🧠"},
    "objective-design":         {"label": "教学目标",           "category": "teaching", "icon": "🎯"},
    "difficulty-analysis":      {"label": "重点难点",           "category": "teaching", "icon": "⚠️"},
    "situation-import":         {"label": "情境导入",           "category": "teaching", "icon": "🎬"},
    "content-presentation":     {"label": "新知呈现",           "category": "teaching", "icon": "📖"},
    "activity-design":          {"label": "课堂活动",           "category": "teaching", "icon": "🤝"},
    "question-design":          {"label": "问题链设计",         "category": "teaching", "icon": "❓"},
    "task-chain":               {"label": "任务链",             "category": "teaching", "icon": "🧩"},
    "differentiated-teaching":  {"label": "分层教学",           "category": "teaching", "icon": "🎚️"},
    "homework-design":          {"label": "作业设计",           "category": "teaching", "icon": "📋"},
    "theme-elevation":          {"label": "主题升华",           "category": "teaching", "icon": "🌈"},
    "evaluation-design":        {"label": "评价设计",           "category": "teaching", "icon": "📝"},
    # —— 阅读课专项 ——
    "reading-analysis":         {"label": "阅读文本分析",       "category": "teaching", "icon": "🔍"},
    "reading-structure":        {"label": "文章结构分析",       "category": "teaching", "icon": "🧱"},
    "reading-strategy":         {"label": "阅读策略",           "category": "teaching", "icon": "🧭"},
    # —— 写作课专项 ——
    "writing-task-analysis":    {"label": "审题分析",           "category": "teaching", "icon": "✍️"},
    "genre-analysis":           {"label": "体裁分析",           "category": "teaching", "icon": "📄"},
    "model-essay":              {"label": "范文拆解",           "category": "teaching", "icon": "📑"},
    "sentence-bank":            {"label": "句型积累",           "category": "teaching", "icon": "💬"},
    "writing-rubric":           {"label": "评分标准",           "category": "teaching", "icon": "📏"},
    # —— 听说课专项 ——
    "listening-task-analysis":  {"label": "听力任务分析",       "category": "teaching", "icon": "🎧"},
    "pronunciation-focus":      {"label": "语音难点",           "category": "teaching", "icon": "🗣️"},
    "listening-flow":           {"label": "三听流程",           "category": "teaching", "icon": "🔄"},
    "speaking-output":          {"label": "口语输出",           "category": "teaching", "icon": "💬"},
    # —— 语法课专项 ——
    "grammar-discovery":        {"label": "语法规则发现",       "category": "teaching", "icon": "🔎"},
    "grammar-practice":         {"label": "语法分层操练",       "category": "teaching", "icon": "🔁"},
    "grammar-error-focus":      {"label": "易错辨析",           "category": "teaching", "icon": "⚠️"},
    # —— PPT 表达类 ——
    "ppt-outline":              {"label": "PPT结构",            "category": "ppt", "icon": "🗂️"},
    "ppt-layout":               {"label": "版式设计",           "category": "ppt", "icon": "🖼️"},
    "ppt-slide-planning":       {"label": "分页规划",           "category": "ppt", "icon": "📑"},
    "ppt-visual-design":        {"label": "视觉设计",           "category": "ppt", "icon": "🎨"},
    "ppt-quality-check":        {"label": "课件质检",           "category": "ppt", "icon": "🔍"},
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. 课型 Agent 注册表：每种课型 = 一个 Agent + 一组必选 Skill
#    每个 skill 对应后端 orchestrator 中可执行的一个步骤。
# ─────────────────────────────────────────────────────────────────────────────
AGENT_REGISTRY: List[Dict] = [
    {
        "id": "new-lesson-agent",
        "name": "新授课智能体",
        "lesson_types": [LessonType.NEW_LESSON.value],
        "pipeline": [
            "textbook-analysis",
            "knowledge-extraction",
            "objective-design",
            "difficulty-analysis",
            "situation-import",
            "content-presentation",
            "activity-design",
            "homework-design",
            "ppt-outline",
            "ppt-quality-check",
        ],
    },
    {
        "id": "reading-agent",
        "name": "阅读课智能体",
        "lesson_types": [LessonType.READING.value],
        "pipeline": [
            "textbook-analysis",
            "reading-analysis",
            "reading-structure",
            "reading-strategy",
            "objective-design",
            "question-design",
            "activity-design",
            "differentiated-teaching",
            "homework-design",
            "ppt-outline",
            "ppt-quality-check",
        ],
    },
    {
        "id": "writing-agent",
        "name": "写作课智能体",
        "lesson_types": [LessonType.WRITING.value],
        "pipeline": [
            "textbook-analysis",
            "writing-task-analysis",
            "genre-analysis",
            "model-essay",
            "sentence-bank",
            "objective-design",
            "writing-rubric",
            "activity-design",
            "homework-design",
            "ppt-outline",
            "ppt-quality-check",
        ],
    },
    {
        "id": "listening-speaking-agent",
        "name": "听说课智能体",
        "lesson_types": [LessonType.LISTENING_SPEAKING.value],
        "pipeline": [
            "textbook-analysis",
            "objective-design",
            "listening-task-analysis",
            "pronunciation-focus",
            "listening-flow",
            "speaking-output",
            "question-design",
            "activity-design",
            "homework-design",
            "ppt-outline",
            "ppt-quality-check",
        ],
    },
    {
        "id": "grammar-agent",
        "name": "语法课智能体",
        "lesson_types": [LessonType.GRAMMAR.value],
        "pipeline": [
            "textbook-analysis",
            "knowledge-extraction",
            "objective-design",
            "difficulty-analysis",
            "grammar-discovery",
            "grammar-practice",
            "grammar-error-focus",
            "activity-design",
            "homework-design",
            "ppt-outline",
            "ppt-quality-check",
        ],
    },
    {
        "id": "review-agent",
        "name": "复习课智能体",
        "lesson_types": [LessonType.REVIEW.value, LessonType.EXAM_REVIEW.value],
        "pipeline": [
            "textbook-analysis",
            "knowledge-extraction",
            "difficulty-analysis",
            "question-design",
            "activity-design",
            "differentiated-teaching",
            "homework-design",
            "ppt-outline",
            "ppt-quality-check",
        ],
    },
    {
        "id": "unit-integration-agent",
        "name": "单元整合智能体",
        "lesson_types": [LessonType.UNIT_INTEGRATION.value],
        "pipeline": [
            "textbook-analysis",
            "knowledge-extraction",
            "objective-design",
            "difficulty-analysis",
            "task-chain",
            "theme-elevation",
            "evaluation-design",
            "homework-design",
            "ppt-outline",
            "ppt-quality-check",
        ],
    },
]


def get_agent_for_lesson_type(lesson_type) -> Dict | None:
    """按课型反查该课型对应的 Agent 配置。返回 None = 未注册。"""
    if not lesson_type:
        return None
    lt = lesson_type.value if isinstance(lesson_type, LessonType) else str(lesson_type)
    for agent in AGENT_REGISTRY:
        if lt in agent["lesson_types"]:
            return agent
    return None


def get_agent_by_id(agent_id: str) -> Dict | None:
    for agent in AGENT_REGISTRY:
        if agent["id"] == agent_id:
            return agent
    return None


def get_skill_meta(skill_id: str) -> Dict | None:
    return SKILL_REGISTRY.get(skill_id)


def available_lesson_types() -> List[Dict]:
    """给前端 GeneratePage 的课型选择卡片使用。"""
    seen = {}
    for agent in AGENT_REGISTRY:
        name = agent["name"]
        for lt in agent["lesson_types"]:
            seen[lt] = {
                "lesson_type": lt,
                "agent_id": agent["id"],
                "agent_name": name,
                "skills": [{"id": s, **SKILL_REGISTRY.get(s, {})} for s in agent["pipeline"]],
            }
    return list(seen.values())


def summarize_agent(agent: Dict) -> Dict:
    """把 Agent 配置转成前端展示结构。"""
    return {
        "id": agent["id"],
        "name": agent["name"],
        "lesson_types": agent["lesson_types"],
        "skills": [{"id": s, **SKILL_REGISTRY.get(s, {})} for s in agent["pipeline"]],
    }
