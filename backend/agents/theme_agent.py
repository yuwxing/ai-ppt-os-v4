from agents.base import BaseAgent

THEME_PROMPT = """你是一名课程思政设计师。根据以下课程信息，设计一个能够升华主题、连接价值的环节。

课程信息：
{topic_info}

要求设计一个包含以下要素的主题升华方案：
1. 核心价值：本节课要传递的核心价值/情感
2. 升华形式：选择一种（视频/音乐/图片/故事/名言/实践活动）
3. 具体内容：详细描述升华环节的内容
4. 教师引导语：教师如何引入升华环节

只输出JSON：
{{
  "core_value": "核心价值",
  "format": "升华形式",
  "content": "具体内容描述",
  "teacher_script": "教师引导语",
  "duration": "建议时长（分钟）"
}}
"""

class ThemeAgent(BaseAgent):
    system_prompt = "你是一名课程思政与情感教育专家，擅长设计课堂主题升华环节。"

    async def run(self, content, story=None):
        topic_info = f"主题：{content.get('topic','')}\n"
        topic_info += f"核心要点：{', '.join(content.get('key_points',[]))}\n"
        topic_info += f"情感基调：{content.get('emotion_tone','')}\n"
        if story:
            topic_info += f"叙事线索：{str(story[:2]) if isinstance(story,list) else story}"
        return await self.json_output(THEME_PROMPT.format(topic_info=topic_info))
