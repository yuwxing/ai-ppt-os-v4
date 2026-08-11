"""
课型路由（Lesson Router）
========================
职责：根据用户输入（学科 / 课型 / 课题 / 教材内容 / 模板），识别出应使用的
"课型 Agent" 与其 Skill 流水线。支持显式指定，也支持自动识别（关键字 + LLM 兜底）。

设计对应：
  用户需求层 → Teaching Router → Teaching Agent → Skill Layer
     (表单)        (本模块)        (registry断言)
"""

import re
from agents.registry import (
    LessonType,
    get_agent_for_lesson_type,
    AGENT_REGISTRY,
)


# 课型关键词表：用于 "自动识别课型"（无需额外 LLM 调用，先走规则）
_LESSON_TYPE_KEYWORDS = {
    LessonType.READING.value: ["阅读", "reading", "精读", "泛读", "课文", "语篇", "section"],
    LessonType.WRITING.value: ["写作", "作文", "writing", "书面表达", "范文", "essay"],
    LessonType.LISTENING_SPEAKING.value: ["听说", "听力", "口语", "listening", "speaking", "对话", "talk"],
    LessonType.GRAMMAR.value: ["语法", "grammar", "时态", "句型", "从句", "被动语态"],
    LessonType.REVIEW.value: ["复习", "review", "巩固", "总结单元"],
    LessonType.EXAM_REVIEW.value: ["试卷", "讲评", "exam", "错题", "试题"],
    LessonType.UNIT_INTEGRATION.value: ["单元整合", "大单元", "unit integration", "知识体系"],
}

# 学科 → 默认课型（当课型为空时的合理回退）
_SUBJECT_DEFAULT = {
    "英语": LessonType.NEW_LESSON.value,
    "语文": LessonType.READING.value,
    "数学": LessonType.NEW_LESSON.value,
}


class RouteResult:
    """一次路由的结果：选中的 Agent + 该课型会执行的 Skill 序列。"""

    def __init__(self, lesson_type, agent):
        self.lesson_type = lesson_type          # LessonType 值（字符串）
        self.agent = agent                      # registry 中的 agent 配置 dict
        self.resolved_automatically = False

    @property
    def agent_id(self):
        return self.agent["id"] if self.agent else None

    @property
    def agent_name(self):
        return self.agent["name"] if self.agent else None

    @property
    def skills(self):
        return self.agent["pipeline"] if self.agent else []

    def to_dict(self):
        return {
            "lesson_type": self.lesson_type,
            "agent_id": self.agent_id,
            "agent_name": self.agent_name,
            "skills": self.skills,
            "resolved_automatically": self.resolved_automatically,
        }


def _normalize_lesson_type(lesson_type: str) -> str | None:
    """把用户可能填写的课型文本，规整为注册表里的 LessonType 枚举值。"""
    if not lesson_type:
        return None
    lt = str(lesson_type).strip()

    # 直接匹配枚举值（英文 id）
    for member in LessonType:
        if lt == member.value or lt == member.name.lower():
            return member.value

    # 中文课型名 → 枚举
    mapping = {
        "新授课": LessonType.NEW_LESSON.value,
        "新知识": LessonType.NEW_LESSON.value,
        "阅读课": LessonType.READING.value,
        "听说课": LessonType.LISTENING_SPEAKING.value,
        "语法课": LessonType.GRAMMAR.value,
        "写作课": LessonType.WRITING.value,
        "复习课": LessonType.REVIEW.value,
        "试卷讲评": LessonType.EXAM_REVIEW.value,
        "讲评课": LessonType.EXAM_REVIEW.value,
        "单元整合": LessonType.UNIT_INTEGRATION.value,
    }
    return mapping.get(lt)


def _auto_detect_lesson_type(subject: str, topic: str, textbook_content: str) -> str | None:
    """规则式自动识别课型：扫描课题 + 教材内容中的关键词。"""
    haystack = " ".join([topic or "", textbook_content or "", subject or ""]).lower()
    for lesson_type, keywords in _LESSON_TYPE_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in haystack:
                return lesson_type
    # 兜底：按学科默认
    for subj, default in _SUBJECT_DEFAULT.items():
        if subj in (subject or "") or subj in topic or "":
            return default
    return None


def route_lesson(subject: str = "", grade: str = "",
                 lesson_type: str = "", topic: str = "",
                 textbook_content: str = "", template: str = "") -> RouteResult:
    """
    核心路由入口。

    优先级：
      1. 显式课型（用户在前端选择了课型）
      2. template 指定（如 manatee = 阅读公开课范式）
      3. 自动识别（课题/教材内容关键词）
      4. 兜底到 'new-lesson'
    """
    # 1) 显式课型
    resolved = _normalize_lesson_type(lesson_type)
    if resolved == LessonType.AUTO.value:
        resolved = None

    # 2) template 特殊映射（公开课/阅读范式 → 阅读课）
    if not resolved and template:
        low = template.lower()
        if "manatee" in low or "reading" in low or "公开课" in str(template):
            resolved = LessonType.READING.value

    # 3) 自动识别
    auto_resolved = not resolved
    if auto_resolved:
        resolved = _auto_detect_lesson_type(subject, topic, textbook_content)

    # 4) 兜底
    if not resolved:
        resolved = LessonType.NEW_LESSON.value

    agent = get_agent_for_lesson_type(resolved)
    if agent is None:
        agent = get_agent_for_lesson_type(LessonType.NEW_LESSON.value)

    result = RouteResult(lesson_type=resolved, agent=agent)
    result.resolved_automatically = auto_resolved
    return result


def list_agents() -> list:
    """列出全部可路由的课型 Agent（给前端"课型选择"面板）。"""
    return AGENT_REGISTRY
