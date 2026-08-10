import json
from agents.base import BaseAgent


class AnimationAgent(BaseAgent):
    system_prompt = """你是PPT动画设计师。为每页PPT设计动画方案，包括页面切换动画和元素入场动画。
根据内容和情感状态匹配动画风格。"""

    async def run(self, slides: list) -> list:
        return await self.json_output(f"""
为每页PPT设计动画方案：
{json.dumps(slides, ensure_ascii=False)}

动画类型选项：
- 入场: fade, fly_from_bottom, zoom, float, split
- 页面过渡: morph, fade_smooth, push, reveal

返回JSON数组：
[
  {{
    "page_number": 1,
    "transition": "页面过渡动画",
    "transition_duration": 1.0,
    "elements": [
      {{"element": "title", "animation": "入场动画", "delay": 0.3, "duration": 0.8}},
      {{"element": "content", "animation": "入场动画", "delay": 0.8, "duration": 0.8}},
      {{"element": "image", "animation": "入场动画", "delay": 1.5, "duration": 1.0}}
    ],
    "notes": "设计说明"
  }}
]

transition推荐：封面用fade_smooth，情感高潮用morph，知识点用reveal
""")
