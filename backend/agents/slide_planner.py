import json
from agents.base import BaseAgent


class SlidePlannerAgent(BaseAgent):
    system_prompt = """你是PPT页面排版规划专家。根据故事结构和课程类型，将每页内容转化为具体的版式、内容模块和视觉布局方案。
支持布局类型: cover, section, content_text, content_image, content_split, comparison, timeline, quote, summary"""

    async def run(self, story: list) -> list:
        return await self.json_output(f"""
根据故事结构规划每页PPT的具体排版布局：
{json.dumps(story, ensure_ascii=False)}

返回JSON数组（每页一条）：
[
  {{
    "page_number": 1,
    "layout": "cover",
    "title": "页面标题",
    "goal": "教学目标",
    "emotion": "情感状态",
    "visual_need": "视觉需求",
    "content": ["要点1", "要点2"],
    "narrative": "过渡语",
    "image_keywords": ["关键词1", "关键词2"],
    "notes": "排版备注"
  }}
]

image_keywords必须精准，用于后续搜图。每页2-4个关键词。
""")
