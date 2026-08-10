import json
from agents.base import BaseAgent


class ScriptWriterAgent(BaseAgent):
    system_prompt = """你是专业的PPT演讲词撰稿人。为每页PPT撰写自然流畅、富有感染力的演讲脚本。
风格配合内容的情感基调，语言要口语化、有节奏感。"""

    async def run(self, slides: list) -> list:
        return await self.json_output(f"""
为每页PPT撰写演讲词。注意页面之间的过渡要自然。
{json.dumps(slides, ensure_ascii=False)}

返回JSON数组（每页一条）：
[
  {{
    "page_number": 1,
    "speech": "这一页说给听众的完整演讲词（200-400字）",
    "timing_seconds": 60,
    "emphasis_words": ["需要重读强调的词1", "词2"],
    "pause_points": ["停顿处1", "停顿处2"]
  }}
]
""")
