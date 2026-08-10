import os
from pathlib import Path

TEMPLATE_DIR = Path(__file__).resolve().parent.parent.parent / "ppt-engine" / "templates"


class TemplateAgent:
    async def run(self, content: str | dict, course_type: dict | None = None, intent: dict | None = None, template_id: str | None = None) -> str | None:
        if isinstance(content, dict):
            topic = content.get("topic", "") or ""
        else:
            topic = content or ""
        topic += " " + ((course_type or {}).get("type") or "") + " " + ((intent or {}).get("purpose") or "")

        kw_mapping = [
            (["英语", "english", "外语"], "english/english.pptx"),
            (["语文", "chinese", "作文", "阅读", "文言文", "古诗"], "chinese/chinese.pptx"),
            (["数学", "math", "代数", "几何"], "general/math.pptx"),
            (["信息", "编程", "ai", "人工智能", "技术", "科技", "it"], "general/tech.pptx"),
            (["教育", "教学", "课程", "课堂", "学科"], "education/education.pptx"),
        ]
        for keywords, rel_path in kw_mapping:
            if any(k in topic.lower() or k in topic for k in keywords):
                fp = TEMPLATE_DIR / rel_path
                if fp.exists():
                    return str(fp)

        lecture = TEMPLATE_DIR / "general" / "lecture.pptx"
        if lecture.exists():
            return str(lecture)

        return None
