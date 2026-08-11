"""
课型 Skill 差异化执行器（Lesson Skill Runner）
=============================================
V2 核心能力：让不同课型真正运行"不同的 Skill 流水线"，产出差异化的教学设计，
而不是所有课型共用同一套生成步骤。

设计：
  - 每个 Skill 是一个独立的可执行能力（基于 LLM），有明确的输入与输出结构。
  - 课型从 registry 取其 pipeline（skill 序列），SkillRunner 按顺序执行，边执行边回传进度。
  - 执行结果汇总为结构化的 lesson blueprint（教学设计中间层），供 PPT/Slide 阶段消费。

对应架构：
    Teaching Agent（课型） → Skill Layer（本模块） → Lesson Blueprint → PPT Engine
"""

import json
import asyncio
from typing import Callable, Dict, List, Any

from agents.base import BaseAgent
from agents.registry import SKILL_REGISTRY

# 常见的教学阶段 → 中文名（用于展示/flags）
STAGE_LABEL = {
    "导入": "导入",
    "呈现": "呈现",
    "操练": "操练",
    "运用": "运用",
    "产出": "产出",
    "总结": "总结",
}


def _skill_label(skill_id: str) -> str:
    meta = SKILL_REGISTRY.get(skill_id, {})
    return meta.get("label", skill_id)


class SkillContext:
    """传给 Skill 执行的上下文：课题 + 教材信息 + 已执行的 skill 产出。"""

    def __init__(self, topic, subject="", grade="", book="", textbook_content="",
                 lesson_period="", content=None):
        self.topic = topic
        self.subject = subject
        self.grade = grade
        self.book = book
        self.textbook_content = textbook_content
        self.lesson_period = lesson_period
        self.content = content or {}          # ContentAgent 已产出的基础内容
        self.results = {}                      # {skill_id: result}

    def previous(self):
        """给 LLM 的前序产出：前 2 个 skill 的结果摘要。"""
        items = list(self.results.items())
        return json.dumps(dict(items[-2:]), ensure_ascii=False)


class SkillExecutor:
    """一个 Skill 的执行器：id + 执行函数 + 返回结构化输出的 prompt 模板。"""

    def __init__(self, skill_id: str, prompt_tpl: str, output_keys: list):
        self.skill_id = skill_id
        self.prompt_tpl = prompt_tpl
        self.output_keys = output_keys

    async def execute(self, ctx: SkillContext, api_key=None) -> dict:
        prompt = self.prompt_tpl.format(
            topic=ctx.topic,
            subject=ctx.subject,
            grade=ctx.grade,
            book=ctx.book,
            textbook=ctx.textbook_content[:3000] if ctx.textbook_content else "（无教材原文，按课标通用结构）",
            period=ctx.lesson_period or "整单元",
            content=json.dumps(ctx.content, ensure_ascii=False),
            prev=ctx.previous(),
        )
        agent = _PromptAgent(api_key)
        result = await agent.json_output(prompt)
        return result if isinstance(result, dict) else {}


class _PromptAgent(BaseAgent):
    system_prompt = "你是一名资深教研员与课件设计师，擅长输出结构化教学方案（只输出JSON）。"


# ─────────────────────────────────────────────────────────────────────────────
# Skill 注册：prompt 模板（用 {占位符} 注入上下文，{prev} 为前序结果）
# 每个 skill 输出与其名称对应的教学模块结构。
# ─────────────────────────────────────────────────────────────────────────────

SKILL_EXECUTORS: Dict[str, SkillExecutor] = {}

def _register(skill_id: str, prompt_tpl: str, output_keys: list):
    SKILL_EXECUTORS[skill_id] = SkillExecutor(skill_id, prompt_tpl, output_keys)


_register("textbook-analysis", """
请分析课题「{topic}」的教材内容与知识结构。
学科：{subject} 年级:{grade} 教材:{book}
{textbook}
基础内容:{content}
返回JSON，键只允许出现在输出集合中：
{{
  "knowledge_points": ["核心知识点…","……"],
  "language_points": ["语言点/能力点…"],
  "difficulty": "本课难度描述",
  "teaching_focus": ["教学重点…"],
  "teaching_difficulties": ["教学难点…"]
}}
""", ["knowledge_points", "language_points", "difficulty", "teaching_focus", "teaching_difficulties"])

_register("knowledge-extraction", """
基于题意与如下分析提炼本节课需要讲清楚的核心知识清单。
课题：「{topic}」  学科:{subject} 年级:{grade}
教材:{textbook}
返回JSON：
{{
  "key_concepts": ["概念/语法/结构…"],
  "prerequisites": ["学生需具备的前置知识…"],
  "extensions": ["拓展点…"]
}}
""", ["key_concepts", "prerequisites", "extensions"])

_register("objective-design", """
请为课题「{topic}」(学科:{subject}年级:{grade})设计三维教学目标。
{prev}
返回JSON：
{{
  "knowledge": ["知识目标…"],
  "skills": ["能力目标…"],
  "thinking": ["思维/素养目标…"],
  "culture": ["情感态度/文化目标…"]
}}
""", ["knowledge", "skills", "thinking", "culture"])

_register("difficulty-analysis", """
确定课题「{topic}」的教学重点与难点。
{prev}
返回JSON：
{{
  "key_points": ["重点…"],
  "hard_points": ["难点…"],
  "breakthrough": "突出重点、化解难点的方法…"
}}
""", ["key_points", "hard_points", "breakthrough"])

_register("situation-import", """
为课题「{topic}」设计一个能激发学生兴趣的情境导入。
{prev}
返回JSON：
{{
  "scenario": "导入情境描述…",
  "question": "引发思考的导入问题…",
  "resources": ["可用导入素材…"]
}}
""", ["scenario", "question", "resources"])

_register("content-presentation", """
为课题「{topic}」设计新知呈现的具体讲解框架（按本次课型风格）。
{prev}
返回JSON：
{{
  "presentation_steps": ["讲解步骤1…","…"],
  "examples": ["示例/例句…"],
  "key_board": "板书要点…"
}}
""", ["presentation_steps", "examples", "key_board"])

_register("activity-design", """
为课题「{topic}」设计课堂活动(含互动形式与时间)。
{prev}
返回JSON：
{{
  "activities": ["活动1…","…"],
  "interaction": "师生活动形式…",
  "time_allocation": "各环节时间分配…"
}}
""", ["activities", "interaction", "time_allocation"])

_register("question-design", """
为课题「{topic}」设计由易到难的问题链。
{prev}
返回JSON：
{{
  "question_chain": ["记忆型→理解型→应用型→分析型…"],
  "critical_thinking": ["开放性思维问题…"]
}}
""", ["question_chain", "critical_thinking"])

_register("task-chain", """
为课题「{topic}」设计一个由易到难的学习任务链。
{prev}
返回JSON：
{{
  "task_chain": ["任务1(基础)…","…","任务N(迁移)…"]
}}
""", ["task_chain"])

_register("differentiated-teaching", """
为课题「{topic}」设计分层教学安排。
{prev}
返回JSON：
{{
  "foundation": ["基础层…"],
  "advanced": ["提高层…"],
  "extension": ["拓展层…"]
}}
""", ["foundation", "advanced", "extension"])

_register("homework-design", """
为课题「{topic}」设计分层作业。
{prev}
返回JSON：
{{
  "basic": ["基础作业…"],
  "expanded": ["拓展作业…"],
  "practice": ["实践作业…"]
}}
""", ["basic", "expanded", "practice"])

_register("theme-elevation", """
为课题「{topic}」设计价值引领与情感升华环节。
{prev}
返回JSON：{{"theme": "主题升华要点…", "quote": "升华语句…"}}
""", ["theme", "quote"])

_register("evaluation-design", """
为课题「{topic}」设计形成性评价与课堂反馈方式。
{prev}
返回JSON：
{{
  "formative": ["过程性评价…"],
  "feedback": ["课堂反馈…"]
}}
""", ["formative", "feedback"])

# ── 阅读课专项 ──
_register("reading-analysis", """
这是一节阅读课。请对课题「{topic}」的文本做阅读专题分析(学科:{subject}年级:{grade})。
{textbook}
{prev}
返回JSON：
{{
  "text_type": "文体/语篇类型…",
  "main_idea": "主旨大意…",
  "paragraphs": [{{"title":"段落标题","idea":"段落大意"}}],
  "vocabulary": {{"key_words":["核心词…"],"phrases":["词组…"],"long_sentences":["长难句…"]}}
}}
""", ["text_type", "main_idea", "paragraphs", "vocabulary"])

_register("reading-structure", """
对课题「{topic}」的阅读文本做结构分析(阅读课)。
{prev}
返回JSON：
{{
  "structure": "整体结构(如 起承转合 / 总分总…)",
  "flow_map": ["结构示意1…","…"],
  "cohesion": "逻辑衔接与过渡手法…"
}}
""", ["structure", "flow_map", "cohesion"])

_register("reading-strategy", """
为课题「{topic}」设计阅读策略指导(阅读课)。
{prev}
返回JSON：
{{
  "strategies": ["扫读→寻读→细读→推断…"],
  "pre": ["Pre-reading 任务…"],
  "while": ["While-reading 任务…"],
  "post": ["Post-reading 任务…"]
}}
""", ["strategies", "pre", "while", "post"])

# ── 写作课专项 ──
_register("writing-task-analysis", """
这是一节写作课。请审题分析课题「{topic}」的写作任务(学科:{subject}年级:{grade})。
{prev}
返回JSON：
{{
  "task_type": "写作文体(如 记叙文/议论文/应用文…)",
  "requirements": ["写作要求…"],
  "key_points": ["审题要点/得分点…"]
}}
""", ["task_type", "requirements", "key_points"])

_register("genre-analysis", """
对课题「{topic}」写作任务做体裁与结构分析(写作课)。
{prev}
返回JSON：
{{
  "genre": "体裁…",
  "structure": {{"intro":"开头…","body":"正文…","conclusion":"结尾…"}},
  "features": ["该体裁语言特征…"]
}}
""", ["genre", "structure", "features"])

_register("model-essay", """
为课题「{topic}」提供一篇参考范文并做拆解(写作课)。
{prev}
返回JSON：
{{
  "model": "参考范文原文…",
  "analysis": ["亮点拆解…"],
  "imitating": ["可仿写要点…"]
}}
""", ["model", "analysis", "imitating"])

_register("sentence-bank", """
为课题「{topic}」整理高分句式积累(写作课)。
{prev}
返回JSON：
{{
  "sentence_bank": {"开头":"…","中间":"…","结尾":"…","高级":"…"}
}}
""", ["sentence_bank"])

_register("writing-rubric", """
为课题「{topic}」设计写作评分量表(写作课)。
{prev}
返回JSON：
{{
  "rubric": [{{"dimension":"内容","weight":"40%","criteria":"…"}}]
}}
""", ["rubric"])


# ── PPT 表达 ──
_register("ppt-outline", """
根据前面的教学设计结果，为课题「{topic}」输出 PPT 大纲(每页一句话)。
{prev}
返回JSON：
{{
  "outline": ["封面","…","总结"]
}}
""", ["outline"])

_register("ppt-quality-check", """
请检查前面的教学设计与 PPT 大纲是否符合课标、逻辑是否连贯、是否有明显缺失。
{prev}
返回JSON：
{{
  "issues": ["问题…"],
  "suggestions": ["改进建议…"],
  "passed": true
}}
""", ["issues", "suggestions", "passed"])


def supported_skill(skill_id: str) -> bool:
    return skill_id in SKILL_EXECUTORS


async def run_skills(skill_ids: List[str], ctx: SkillContext,
                     on_step: Callable[[int, str], None] = None,
                     api_key: str | None = None) -> Dict[str, Any]:
    """
    按课型 pipeline 顺序执行 Skills，产出结构化 blueprint。
    ctx.results 会被逐项填充；返回与 ctx.results 一致。
    """
    executed = []
    for i, sid in enumerate(skill_ids, start=1):
        exe = SKILL_EXECUTORS.get(sid)
        if not exe:
            continue
        label = _skill_label(sid)
        if on_step:
            on_step(i, f"{exe_id_icon(sid)} {label} - 正在执行…")
        try:
            result = await exe.execute(ctx, api_key=api_key)
        except Exception:
            result = {}
        if result:
            ctx.results[sid] = result
        executed.append(sid)
    return ctx.results


def exe_id_icon(skill_id: str) -> str:
    meta = SKILL_REGISTRY.get(skill_id, {})
    return meta.get("icon", "•")
