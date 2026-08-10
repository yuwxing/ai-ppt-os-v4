import json
from agents.base import BaseAgent


class IntentAgent(BaseAgent):
    system_prompt = "你是用户意图分析专家。分析PPT主题的深层需求，识别用户真正想要达成的目标。"

    async def run(self, content: dict) -> dict:
        return await self.json_output(f"""
根据内容分析结果，识别用户生成PPT的真实意图：
{json.dumps(content, ensure_ascii=False)}

返回格式：
{{
  "primary_intent": "教学 | 汇报 | 推广 | 演讲",
  "secondary_intent": "激发兴趣 | 传授知识 | 说服决策 | 展示成果",
  "pain_points": ["学生注意力分散", "内容枯燥"],
  "success_criteria": ["学生能复述核心概念", "课堂互动率高"]
}}
""")
