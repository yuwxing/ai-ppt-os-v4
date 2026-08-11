from agents.base import BaseAgent


class StoryAgent(BaseAgent):
    system_prompt = """你是教学设计专家和故事编剧。将知识点融入叙事结构，让每一页PPT都有情感起伏和节奏变化。
遵循「起承转合」的叙事原则，设计有吸引力的课程故事线。"""

    async def run(self, content: dict, course_type: dict, blueprint: dict | None = None) -> list:
        # 可选注入课型 Skill 差异化产出，让叙事体现课型专属结构
        extra = ""
        if blueprint:
            lesson_type = blueprint.get("lesson_type", "")
            # 阅读课：采用阅读策略的 pre/while/post 结构
            if lesson_type == "reading":
                rd = blueprint.get("reading-strategy", {})
                if rd.get("pre") or rd.get("while") or rd.get("post"):
                    extra = ("本课为阅读课，请遵循阅读三环节组织叙事：\n"
                             f"- Pre-reading: {rd.get('pre')}\n"
                             f"- While-reading: {rd.get('while')}\n"
                             f"- Post-reading: {rd.get('post')}\n")
                    if blueprint.get("reading-analysis"):
                        extra += f"课文主旨参考：{blueprint['reading-analysis'].get('main_idea', '')}\n"
            # 写作课：采用 审题→谋篇→写作→评价 结构
            elif lesson_type == "writing":
                wa = blueprint.get("genre-analysis", {})
                mj = blueprint.get("model-essay", {})
                if mj.get("model"):
                    extra = "本课为写作课，请遵循“审题→结构→范文→练习→评价”组织叙事：\n"
                    if wa.get("structure"):
                        extra += f"篇章结构(开/正/结)：{wa.get('structure')}\n"
                    if mj.get("model"):
                        extra += f"参考范文：{str(mj.get('model'))[:200]}\n"
            # 新授课：采用 导入→呈现→练习→总结
            elif lesson_type != "listening-speaking" and lesson_type != "grammar":
                ob = blueprint.get("objective-design", {})
                if ob.get("knowledge"):
                    extra = f"本课三维目标参考：知识{ob.get('knowledge')}；重点{blueprint.get('difficulty-analysis', {}).get('key_points', '')}\n"

        return await self.json_output(f"""
为主题「{content['topic']}」设计PPT叙事结构。

课程类型：{course_type.get('course_type', '新知讲授')}
教学方法：{course_type.get('teaching_method', '故事化教学')}
目标受众：{content.get('audience', '学生')}
情感基调：{content.get('emotion_tone', '温暖鼓励')}
{extra}
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
