import json
from agents.base import BaseAgent


class VisualStyleAgent(BaseAgent):
    system_prompt = """你是PPT视觉设计总监。根据主题、受众和情感基调，定义整套PPT的视觉风格体系。
包括配色、字体、装饰元素、图片风格等完整的设计规范。"""

    async def run(self, content: dict) -> dict:
        return await self.json_output(f"""
为以下主题设计PPT视觉风格方案：
{json.dumps(content, ensure_ascii=False)}

返回JSON：
{{
  "theme_name": "主题名称",
  "color_scheme": {{
    "primary": "#主色",
    "secondary": "#辅色",
    "accent": "#强调色",
    "background": "#背景色",
    "text": "#文字色"
  }},
  "fonts": {{
    "title": "标题字体",
    "body": "正文字体"
  }},
  "image_style": "插画风格 | 真实摄影 | 扁平设计 | 3D渲染",
  "decoration_style": "几何简约 | 手绘感 | 渐变流动 | 科技感",
  "mood_board": "视觉情绪关键词，如：温暖、自然、专业、动感",
  "cover_style": "封面设计风格描述"
}}
""")
