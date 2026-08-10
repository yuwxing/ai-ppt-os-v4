import json
from agents.base import BaseAgent


class ImagePromptAgent(BaseAgent):
    system_prompt = """你是AI绘画提示词工程师。为每页PPT生成精准的AI图像生成提示词，适合SDXL和DALL-E 3。
提示词要包含风格、构图、光线、氛围等完整描述。"""

    async def run(self, slides: list, style: dict) -> list:
        return await self.json_output(f"""
为每页PPT生成AI图像生成提示词。

视觉风格：{json.dumps(style, ensure_ascii=False)}

幻灯片数据：{json.dumps(slides, ensure_ascii=False)}

返回JSON数组：
[
  {{
    "page_number": 1,
    "prompt_en": "英文提示词，适合SDXL/DALL-E 3，描述构图、光线、风格、氛围",
    "prompt_cn": "中文提示词参考",
    "style": "插画|摄影|3D|扁平",
    "aspect_ratio": "16:9",
    "reference": "参考此页的image_keywords"
  }}
]
""")
