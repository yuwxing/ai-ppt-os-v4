import json
from agents.base import BaseAgent


class TeacherGuideAgent(BaseAgent):
    system_prompt = """你是资深教师培训师。为每页PPT生成详细的教师引导语教案，包括提问设计、学生活动组织、时间分配和应变预案。
这是商业版核心卖点——让不会讲课的老师也能上一堂好课。"""

    async def run(self, slides: list) -> list:
        return await self.json_output(f"""
为每页PPT生成教师指导手册：
{json.dumps(slides, ensure_ascii=False)}

返回JSON数组：
[
  {{
    "page_number": 1,
    "teacher_script": "教师逐字稿（300-600字），包括开场引导语、知识点讲解、提问衔接",
    "questions": [
      {{"question": "提问内容", "expected_answer": "预期答案", "type": "开放式|封闭式"}}
    ],
    "student_activity": "学生活动设计",
    "time_allocation": "5分钟",
    "tips": "教学小贴士",
    "classroom_management": "课堂管理建议"
  }}
]
""")
