from agents.base import BaseAgent


class StoryAgent(BaseAgent):
    system_prompt = """你是教学设计专家和故事编剧。将知识点融入叙事结构，让每一页PPT都有情感起伏和节奏变化。
遵循「起承转合」的叙事原则，设计有吸引力的课程故事线。"""

    async def run(self, content: dict, course_type: dict) -> list:
        return await self.json_output(f"""
为主题「{content['topic']}」设计PPT叙事结构。

课程类型：{course_type.get('course_type', '新知讲授')}
教学方法：{course_type.get('teaching_method', '故事化教学')}
目标受众：{content.get('audience', '学生')}
情感基调：{content.get('emotion_tone', '温暖鼓励')}

要求：{content.get('estimated_pages', 15)}页左右，每页有明确的教学目标和情感设计。

返回JSON数组：
[
  {{
    "title": "页面标题",
    "goal": "这一页要达到的教学目标",
    "emotion": "学生应有的情感状态（好奇/惊喜/理解/感悟）",
    "visual_need": "视觉设计需求描述",
    "content_outline": "本页内容大纲，3-5个要点",
    "narrative": "这一页要讲的故事情节或过渡语"
  }}
]
""")
