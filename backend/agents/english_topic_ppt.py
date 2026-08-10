"""English Topic PPT Agent — 英语话题课件自动生成

当用户请求“英语话题课件 / 英语 PPT”时，Agent 自动发现本技能并执行：
  1. 用 DeepSeek LLM 按技能 SOP（15 模块）生成结构化 JSON 内容
  2. 调用 build_pptx.py 生成 .pptx（使用母版占位符）
  3. 调用 add_animations.py（纯 Python）添加 Fade 动画 + 点击出答案
  4. 返回 PPTX 文件下载信息

依赖：
  - DeepSeek API Key（settings.deepseek_api_key）
  - Managed Python（build_pptx.py / add_animations.py 的运行环境）
  - add_animations.py 用 lxml 直接写 timing XML，跨平台、无需 Office / PowerPoint COM
  - 技能目录（SKILL_DIR）含 template.pptx + scripts/
"""
import asyncio
import json
import os
import shutil
import subprocess
import sys
import uuid
from datetime import datetime

from core.config import settings
from core.deepseek import deepseek_json
from agents.manatee_prompt import MANATEE_SYSTEM_PROMPT, build_manatee_user_msg

# ── 路径配置 ──
SKILL_DIR = r"C:\Users\user\.workbuddy\skills\english-topic-ppt"
TEMPLATE_PATH = os.path.join(SKILL_DIR, "template.pptx")
BUILD_SCRIPT = os.path.join(SKILL_DIR, "scripts", "build_pptx.py")
ADD_ANIM_SCRIPT = os.path.join(SKILL_DIR, "scripts", "add_animations.py")
PYTHON_EXE = r"C:\Users\user\.workbuddy\binaries\python\versions\3.13.12\python.exe"
OUTPUT_DIR = settings.output_dir

# ── LLM System Prompt：指导模型按 SOP 生成 JSON ──
SYSTEM_PROMPT = """你是一位资深初中英语教研专家。请根据用户给出的话题/单元信息，按照以下标准 SOP 生成一份完整的英语话题课件 JSON。

## 15 模块 SOP（必须按顺序）
1. 封面 Cover：大标题（英文口号）+ 副标题（中文·学段·单元）
2. 学习目标 Objectives：3-5 条，使用动词开头
3. 话题导入 Lead-in：2-3 个热身问题 + 一句引导语
4. Task 1 词汇：6 个核心词（中英对照），每词配图
5. Brain storm：6-8 个拓展词（近义/反义/相关词性）
6. Let's read：3-4 道阅读理解题（英文问题+中文答案，点击出答案）
7. Culture Link：该话题的文化链接（问题+事实）
8. Task 2 详读/对话：4 组 Q&A（英文问题+英文答案，点击出答案）+ Tips
9. 功能表达：3 组交际句型（问 vs 答）
10. Task 3 任务/讨论：2-3 个情景任务 + 限时
11. 媒体页：相关视频/音频内容 + 媒体占位符
12. 思维导图/解析：结构化知识梳理（点击出答案）
13. 阅读策略/秘籍：3-4 条方法总结
14. 作业 Homework：2-3 项分层作业
15. 情感升华：1-2 句正向升华
16. 致谢：Thanks for listening!

## JSON 格式（严格遵循，不要加 markdown 代码块标记）
{
  "meta": { "topic_en": "...", "topic_cn": "...", "author": "", "grade": "...", "cover_title": "...", "cover_subtitle": "..." },
  "titles": { "objectives": "...", "lead_in": "...", "culture": "...", "expressions": "...", "media": "...", "analysis": "...", "homework": "..." },
  "objectives": ["...", "..."],
  "lead_in": { "questions": ["?", "?"], "intro": "..." },
  "task1": { "label": "Task 1", "desc": "...", "items": [{"word":"...", "cn":"..."}, ...6 items] },
  "brainstorm": { "title": "Brain storm", "items": [{"word":"...", "cn":"..."}, ...6-8 items] },
  "lets_read": { "title": "Let's read", "items": [{"en":"...", "cn":"..."}, ...3-4 items] },
  "culture": { "question": "...", "fact": "..." },
  "task2": { "label": "Task 2", "tag": "...", "lines": [{"speaker":"Q1:", "text":"...", "answer":"..."}, ...4 items], "tips": "..." },
  "expressions": { "ask": ["...", "..."], "answer": ["...", "..."] },
  "task3": { "label": "Task 3", "tag": "...", "time_limit": "限时 X mins", "scenes": ["...", "..."] },
  "listening_intro": "...",
  "listening": [{ "title":"...", "stem":"...", "question":"...", "options":["...","...","..."], "source":"...", "script":"...", "tip":"..." }],
  "tips_summary": { "title": "...", "items": ["...", "..."] },
  "closing": { "lines": ["...", "..."] },
  "homework": { "items": ["...", "..."] },
  "thanks": "Thanks for listening!"
}

## 内容要求
- 所有英文内容必须语法正确、适合初中水平
- 中英双语：标题中英对照，关键词中英对照
- 内容紧扣话题，不要泛泛而谈
- Task 2 的 lines 用 Q1:/Q2:/Q3:/Q4: 作为 speaker
- listening 数组只放 1 个条目
- closing.lines 放 2 句：第一句英文升华，第二句英文行动号召
"""


def _manatee_to_standard(data: dict) -> dict:
    """把 manatee（公开课阅读课）17 模块 JSON 映射为 build_pptx.py 兼容的 16 模块格式。

    build_pptx.py 渲染的模块：cover / objectives / lead_in / task1(词汇卡) /
    brainstorm / lets_read(题+答案) / culture / task2(对话补全) / expressions /
    task3(任务) / listening(媒体) / analysis(听力解析) / tips_summary /
    homework / closing / thanks。
    """
    meta = data.get("meta", {})
    titles = data.get("titles", {})
    out = {
        "meta": meta,
        "titles": {
            "objectives": titles.get("objectives", "学习目标  Objectives"),
            "lead_in": titles.get("lead_in", "人物导入  Lead-in"),
            "culture": titles.get("theme", "主题呈现"),
            "expressions": titles.get("grammar", "语法聚焦  Grammar Focus"),
            "media": titles.get("task3", "Task 3 · 听读填表"),
            "analysis": titles.get("task4", "Task 4 · 朗读质疑"),
            "homework": titles.get("homework", "课后作业  Homework"),
            "cover_pic": "封面主视觉图（建议：与课文主题相关的图片）",
            "lead_in_pic": "导入人物图（建议：文中人物/主角图片）",
            "culture_pic": "主题配图（建议：文章主题场景图）",
            "media_note": "课文音频（mp3，点击媒体占位符插入本地文件）",
        },
        "objectives": data.get("objectives", []),
        "lead_in": {
            "questions": [data.get("lead_in", {}).get("question", "")],
            "intro": (data.get("lead_in", {}).get("character", "")
                      + ("：" + data["lead_in"]["point"] if data.get("lead_in", {}).get("point") else "")),
        },
        "culture": {
            "question": data.get("theme", {}).get("title", ""),
            "fact": data.get("theme", {}).get("subtitle", ""),
        },
        # Task 1 扫读 T/F → lets_read（题 + 答案）
        "lets_read": {
            "title": titles.get("task1", "Task 1 · 快速阅读（T/F）"),
            "items": [
                {"en": it.get("text", ""), "cn": f"({it.get('answer', '')})"}
                for it in data.get("task1", {}).get("items", [])
            ],
        },
        # Task 2 细读问答 → task2（lines）
        "task2": {
            "label": "Task 2",
            "tag": titles.get("task2", "细读理解"),
            "lines": [
                {"speaker": f"Q{i+1}:", "text": it.get("q", ""), "answer": it.get("a", "")}
                for i, it in enumerate(data.get("task2", {}).get("items", []))
            ],
            "tips": "带着问题回到原文，用笔划出关键句和支撑细节。",
        },
        # 语法聚焦 → expressions（ask/answer 两栏：结构 vs 用法）
        "expressions": _grammar_to_expressions(data.get("grammar", {})),
        # Exercise 1 + 2 → task3（作为机械/交际练习任务）
        "task3": {
            "label": "练习巩固",
            "tag": "Exercise",
            "time_limit": "",
            "scenes": [
                *([data["exercise1"]["instruction"]] if data.get("exercise1", {}).get("instruction") else []),
                *([data["exercise2"]["instruction"]] if data.get("exercise2", {}).get("instruction") else []),
                *([d.get("q", "") for d in data.get("why", [])] if data.get("why") else []),
            ],
        },
        # Task 3 听读填表 → listening（media 页 + 解析页）
        "listening_intro": titles.get("task3", "Task 3 · 听读填表"),
        "listening": _task3_to_listening(data.get("task3", {}), titles.get("task3", "Task 3 · 听读填表")),
        # Task 4 朗读质疑 + 关键结构 → tips_summary
        "tips_summary": {
            "title": titles.get("task4", "Task 4 · 朗读质疑"),
            "items": [
                data.get("task4", {}).get("instruction", ""),
                "Key Structures：" + data.get("task4", {}).get("key_structure", ""),
                *([f"Quote：{data.get('quote', {}).get('saying', '')}" + (f"  {data['quote'].get('action','')}" if data.get('quote', {}).get('action') else "")] if data.get("quote") else []),
            ],
        },
        # Summary → 附加在 tips_summary 后（若有）
        "homework": {
            "items": data.get("homework", {}).get("items", []),
        },
        "closing": {"lines": data.get("closing", {}).get("lines", [])},
        "thanks": data.get("thanks", "Thanks for listening!"),
    }

    # Summary / 讨论 / 写作：追加到作业说明中，避免丢失
    summary = data.get("summary", {})
    disc = data.get("discussion", {})
    writing = data.get("writing", {})
    extra = []
    if summary.get("key_structures"):
        extra.append(f"Summary Key structures：{summary['key_structures']}")
    for a in summary.get("actions", []):
        extra.append(f"Summary 行动：{a}")
    if disc.get("title"):
        extra.append(f"讨论 {disc['title']}：{'；'.join(disc.get('model', []))}")
    if writing.get("topic"):
        extra.append(
            f"写作任务 {writing.get('topic', '')}：{writing.get('requirement', '')}"
            + ("；连接词：" + "；".join(writing.get("scaffold", [])) if writing.get("scaffold") else "")
        )
    if extra:
        out["homework"]["items"] = [*extra, *out["homework"]["items"]]

    return out


def _grammar_to_expressions(g: dict) -> dict:
    """语法聚焦 → 两栏表达（结构 vs 用法示例）。"""
    structure = g.get("structure", "")
    points = g.get("points", [])
    ask = [structure] if structure else []
    answer = [f"{p.get('use', '')}：{p.get('meaning', '')}" for p in points] or []
    if not answer:
        answer = ["be made from / of / in / by / into 用法辨析"]
    return {"ask": ask, "answer": answer}


def _task3_to_listening(t3: dict, title: str) -> list:
    """听读填表 → listening 条目。"""
    items = t3.get("items", [])
    return [{
        "title": title,
        "stem": t3.get("instruction", "听录音，在信息表中填写关键信息。"),
        "question": "Listen and fill in the chart.",
        "options": items,
        "source": "",
        "script": "",
        "tip": "听前浏览信息表，预测空缺内容类型；听时抓住关键词。",
    }]


def _build_preview(content_json: dict, template: str) -> dict:
    """生成前端可展示的内容预览（兼容 manatee 与标准两种结构）。"""
    objectives = content_json.get("objectives", [])
    culture_question = content_json.get("culture", {}).get("question", "")

    if template == "manatee":
        return {
            "template": "manatee",
            "label": "公开课阅读课（manatee 范式）",
            "objectives": objectives,
            "task1_tf": [it.get("text", "") for it in content_json.get("lets_read", {}).get("items", [])],
            "task2_qa": [ln.get("text", "") for ln in content_json.get("task2", {}).get("lines", [])],
            "grammar": content_json.get("expressions", {}).get("ask", [""])[0],
            "culture_question": culture_question,
        }
    return {
        "template": "topic",
        "objectives": objectives,
        "task1_words": [it.get("word", "") for it in content_json.get("task1", {}).get("items", [])],
        "culture_question": culture_question,
    }


async def generate_english_topic_ppt(
    topic: str,
    grade: str = "",
    author: str = "",
    subject: str = "",
    textbook_content: str = "",
    template: str = "topic",
) -> dict:
    """生成英语话题课件 PPTX，返回结果字典。

    template:
      - "topic"   默认：初中英语话题课件 15 模块 SOP（封面/词汇/对话/中考听力等）
      - "manatee" 公开课阅读课范式：12 步流程（悬念导入/阅读四任务链/语法聚焦/写作输出等），
                  提炼自朱丹老师《Unit 15 manatees》公开课课件。
    """

    job_id = uuid.uuid4().hex[:8]
    job_dir = os.path.join(OUTPUT_DIR, f"eng-ppt-{job_id}")
    os.makedirs(job_dir, exist_ok=True)

    # ── 1. 用 LLM 生成 JSON 内容（按所选模板的 SOP） ──
    if template == "manatee":
        system_prompt = MANATEE_SYSTEM_PROMPT
        user_msg = build_manatee_user_msg(topic, grade, subject, author, textbook_content)
    else:
        system_prompt = SYSTEM_PROMPT
        user_msg = f"""请为以下信息生成课件 JSON：

话题/课题：{topic}
学段年级：{grade or '初中'}
学科：{subject or '英语'}
作者署名：{author or ''}
"""
        if textbook_content:
            user_msg += f"\n教材原文/教学设计参考：\n{textbook_content[:3000]}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_msg},
    ]

    content_json = await deepseek_json(messages, temperature=0.7, timeout=90)

    # 确保 meta.author 有值
    content_json.setdefault("meta", {})["author"] = author or ""
    if grade:
        content_json["meta"]["grade"] = grade

    # 若为 manatee 模板，把其 17 模块 JSON 映射到 build_pptx.py 兼容的 16 模块格式
    if template == "manatee":
        content_json = _manatee_to_standard(content_json)

    # 写 JSON 到临时文件
    json_path = os.path.join(job_dir, "content.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(content_json, f, ensure_ascii=False, indent=2)

    # ── 2. 调 build_pptx.py 生成 PPTX ──
    # 文件名只用 LLM 归纳出的英文课题，且强制 ASCII-safe：
    # 避免中文 / 空格 / 正反斜杠混用导致路径异常（跨平台也更安全），
    # 因此这里不能拿用户原始输入当文件名。
    raw_name = (content_json.get("meta", {}).get("topic_en") or topic).strip()
    ascii_name = "".join(
        c if (c.isalnum() and c.isascii()) else "-" for c in raw_name
    )
    safe_topic = "-".join(p for p in ascii_name.split("-") if p)[:40] or "english-lesson"
    pptx_filename = f"{safe_topic}-{job_id}.pptx"
    pptx_path = os.path.normpath(os.path.join(job_dir, pptx_filename))

    build_cmd = [
        PYTHON_EXE, BUILD_SCRIPT,
        "--json", json_path,
        "--out", pptx_path,
        "--template", TEMPLATE_PATH,
    ]
    proc = await asyncio.to_thread(
        subprocess.run, build_cmd, capture_output=True, text=True, timeout=120
    )
    if proc.returncode != 0:
        raise RuntimeError(f"build_pptx.py failed: {proc.stderr or proc.stdout}")

    if not os.path.exists(pptx_path):
        raise RuntimeError("build_pptx.py completed but PPTX not found")

    # ── 3. 调 add_animations.py 注入 Fade 动画 + 点击出答案（纯 Python，跨平台） ──
    anim_ok = False
    anim_error = ""
    if os.path.exists(ADD_ANIM_SCRIPT):
        # 原地写回：add_animations.py 在不给 out_path 时覆盖 input
        anim_cmd = [PYTHON_EXE, ADD_ANIM_SCRIPT, os.path.normpath(pptx_path)]
        try:
            proc2 = await asyncio.to_thread(
                subprocess.run, anim_cmd, capture_output=True, text=True, timeout=180
            )
            anim_ok = proc2.returncode == 0
            if not anim_ok:
                anim_error = (proc2.stderr or proc2.stdout or "")[-300:]
        except Exception as e:
            anim_ok = False
            anim_error = f"{type(e).__name__}: {e}"
    else:
        anim_error = f"add_animations.py not found at {ADD_ANIM_SCRIPT}"

    # ── 4. 复制到 output_dir 根目录（供 download API 访问） ──
    final_path = os.path.join(OUTPUT_DIR, pptx_filename)
    shutil.copy2(pptx_path, final_path)

    # 复制素材清单（下载文件名也用 ASCII，避免 URL 编码问题）
    readme_name = f"{safe_topic}-{job_id}-assets.txt"
    readme_src = os.path.join(job_dir, os.path.splitext(pptx_filename)[0] + "_素材清单.txt")
    readme_final = os.path.join(OUTPUT_DIR, readme_name)
    if os.path.exists(readme_src):
        shutil.copy2(readme_src, readme_final)

    slide_count = len(content_json.get("objectives", []))  # rough
    # 实际从 pptx 读取
    try:
        from pptx import Presentation as _P
        _prs = _P(final_path)
        slide_count = len(_prs.slides)
    except Exception:
        pass

    return {
        "type": "english-topic-ppt",
        "template": template,
        "topic": topic,
        "grade": grade,
        "download_url": f"/api/download/{pptx_filename}",
        "readme_url": f"/api/download/{readme_name}",
        "slide_count": slide_count,
        "animation": anim_ok,
        "animation_error": anim_error,
        "job_id": job_id,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "content_preview": _build_preview(content_json, template),
    }
