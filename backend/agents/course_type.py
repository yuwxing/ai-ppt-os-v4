import json
from agents.base import BaseAgent


class CourseTypeAgent(BaseAgent):
    system_prompt = "你是课程类型识别专家。根据主题和内容分析，识别最适合的课程/演示类型和结构。"

    async def run(self, content: dict) -> dict:
        return await self.json_output(f"""
根据内容分析，确定课程/演示类型：
{json.dumps(content, ensure_ascii=False)}

返回格式：
{{
  "course_type": "新知讲授 | 复习巩固 | 技能训练 | 项目展示 | 产品发布",
  "teaching_method": "5E教学法 | 支架式教学 | PBL项目式 | 故事化教学",
  "structure": "导入-讲解-练习-总结 | 问题-分析-方案-评估",
  "page_distribution": [
    {{"section": "导入", "pages": 2}},
    {{"section": "核心讲解", "pages": 6}},
    {{"section": "互动练习", "pages": 3}},
    {{"section": "总结提升", "pages": 2}}
  ],
  "interaction_design": ["提问", "小组讨论", "课堂小测"]
}}
""")
