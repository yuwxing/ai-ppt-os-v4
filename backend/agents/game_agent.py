from agents.base import BaseAgent

GAME_PROMPT = """你是一名教学游戏设计师。根据以下课程信息，设计2个适合课堂的互动游戏活动。

课程信息：
{lesson_info}

要求：
每个游戏包含：类型（选择/抢答/小组竞赛/实验模拟/AI问答等）、名称、适用环节（导入/探究/练习/总结）、时长、详细规则、所需材料。

只输出JSON数组，格式：
[{{
  "type": "游戏类型",
  "name": "游戏名称",
  "phase": "适用环节",
  "duration": "时长",
  "description": "详细规则描述",
  "materials": ["所需材料"],
  "learning_goal": "学习目标"
}}]
"""

class GameAgent(BaseAgent):
    system_prompt = "你是一名教学设计专家，擅长设计课堂互动游戏。"

    async def run(self, slides, teacher_guide=None):
        lesson_info = f"共{len(slides)}页PPT\n"
        for s in slides[:5]:
            lesson_info += f"- {s.get('title','')}: {', '.join(s.get('content',[])[:2])}\n"
        if teacher_guide:
            lesson_info += f"\n教师活动设计参考：{str(teacher_guide[:2])}"
        return await self.json_output(GAME_PROMPT.format(lesson_info=lesson_info))
