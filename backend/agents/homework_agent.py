from agents.base import BaseAgent

HOMEWORK_PROMPT = """你是一名作业设计专家。根据以下课程信息，设计分层次课后作业。

课程信息：
{lesson_info}

要求设计三类作业，每类2题：
1. 基础作业：巩固本节课基础知识
2. 拓展作业：应用知识解决新问题
3. 实践作业：动手操作或社会实践类

只输出JSON数组：
[{{
  "tier": "基础/拓展/实践",
  "title": "题目",
  "description": "详细要求",
  "estimated_time": "预估完成时间",
  "difficulty": "容易/中等/困难"
}}]
"""

class HomeworkAgent(BaseAgent):
    system_prompt = "你是一名作业设计专家，擅长设计分层作业。"

    async def run(self, slides, content=None):
        lesson_info = f"主题：{content.get('topic','') if content else ''}\n"
        lesson_info += f"共{len(slides)}页PPT\n核心内容：\n"
        for s in slides[:6]:
            lesson_info += f"- {s.get('title','')}\n"
        if content:
            lesson_info += f"\n知识点：{', '.join(content.get('key_points',[]))}"
        return await self.json_output(HOMEWORK_PROMPT.format(lesson_info=lesson_info))
