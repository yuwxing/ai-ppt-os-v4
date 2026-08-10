from agents.base import BaseAgent


class ContentAgent(BaseAgent):
    system_prompt = """你是一名教研专家。深入理解用户输入的课题信息，分析教材内容、课型特点和教学目标。"""

    async def run(self, topic: str, subject: str = "", grade: str = "", book: str = "", lesson_type: str = "新授课", lesson_period: str = "", textbook_content: str = "") -> dict:
        meta = f"学科：{subject}，年级：{grade}，教材：{book}"
        if lesson_period:
            meta += f"，课时：{lesson_period}"
        meta += f"，课型：{lesson_type}"
        if textbook_content:
            meta += f"\n\n教材原文：\n{textbook_content[:3000]}"
        else:
            meta += "\n（无教材原文，请根据课标要求和常见教材结构生成）"
        return await self.json_output(f"""
分析教学课题「{topic}」的内容需求。
{meta}

返回JSON：
{{
  "topic": "{topic}",
  "subject": "{subject}",
  "grade": "{grade}",
  "book": "{book}",
  "lesson_type": "{lesson_type}",
  "lesson_period": "{lesson_period}",
  "type": "course_ppt",
  "level": "primary | middle | high",
  "audience": "目标学生描述",
  "key_points": ["知识点1", "知识点2", "知识点3"],
  "estimated_pages": 15,
  "emotion_tone": "温暖鼓励 | 专业严谨 | 激情澎湃 | 幽默风趣",
  "scenario": "课堂教学"
}}
""")
