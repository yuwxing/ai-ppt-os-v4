from agents.base import BaseAgent


SKILL_STYLE = {
    "听": lambda b: _printable(b.get("listening-task-analysis", {}).get("listening_key_points")),
    "v": lambda b: _printable(b.get("pronunciation-focus", {}).get("sound_focus")),
    "g": lambda b: b.get("grammar-discovery", {}).get("target_structure"),
}


def _printable(x):
    if isinstance(x, list):
        return "、".join(str(i) for i in x)
    return x or ""


class StoryAgent(BaseAgent):
    system_prompt = """你是教学设计专家和故事编剧。将知识点融入叙事结构，让每一页PPT都有情感起伏和节奏变化。
遵循「起承转合」的叙事原则，设计有吸引力的课程故事线。"""

    async def run(self, content: dict, course_type: dict, blueprint: dict | None = None,
                  textbook_content: str = "") -> list:
        # 把课型 Skill 专项产出注入叙事约束，让页面内容与结构体现课型差异
        extra = _build_lesson_extra(blueprint, content)
        # 教材原文：让页面内容紧扣教材，而不是只靠课题泛泛而谈
        tb = ""
        if textbook_content and textbook_content.strip():
            tb = f"\n\n教材原文（请充分依据此文本组织页面知识点，勿脱离教材）：\n{textbook_content[:3000]}"
        elif blueprint and blueprint.get("textbook-analysis"):
            ta = blueprint["textbook-analysis"]
            summary = []
            for k in ("knowledge_points", "language_points", "teaching_focus", "teaching_difficulties", "key_points", "main_points"):
                v = ta.get(k)
                if isinstance(v, list):
                    summary.append("、".join(str(i) for i in v))
                elif v:
                    summary.append(str(v))
            if summary:
                tb = "\n\n教材要点参考（来自教材分析）：\n" + "；".join(summary)
        else:
            tb = "\n\n（未提供教材文本，请依据课标与课题常识组织内容）"

        return await self.json_output(f"""
为主题「{content['topic']}」设计PPT叙事结构。

课程类型：{course_type.get('course_type', '新知讲授')}
教学方法：{course_type.get('teaching_method', '故事化教学')}
目标受众：{content.get('audience', '学生')}
情感基调：{content.get('emotion_tone', '温暖鼓励')}
{tb}
{extra}
要求：{content.get('estimated_pages', 15)}页左右，每页有明确的教学目标和情感设计。

务必让「content_outline」紧扣上面的教材内容，并充分体现本课的课型专用要点（如听力任务/口语输出、语法规则/操练、课文的读前读中读后等），不要写成脱离教材的通用知识点。

返回JSON数组：
[
  {{
    "title": "页面标题",
    "goal": "这一页要达到的教学目标",
    "emotion": "学生应有的情感状态（好奇/惊喜/理解/感悟）",
    "visual_need": "视觉设计需求描述",
    "content_outline": "本页内容大纲，3-5个要点（体现课型专项内容）",
    "narrative": "这一页要讲的故事情节或过渡语"
  }}
]
""")


def _build_lesson_extra(blueprint: dict | None, content: dict) -> str:
    """根据课型 Skill 专项产出，构建用于约束 PPT 差异化内容的提示片段。"""
    if not blueprint:
        return ""
    lesson_type = blueprint.get("lesson_type", "")
    out = []

    # ============ 听说课专项 ============
    if lesson_type == "listening-speaking":
        lta = blueprint.get("listening-task-analysis", {})
        pf = blueprint.get("pronunciation-focus", {})
        so = blueprint.get("speaking-output", {})
        if lta or pf or so:
            out.append("本课为【听说课】，课件必须围绕「听前预测→听力→信息提取→口语输出」展开：")
            kp = _printable(lta.get("listening_key_points"))
            if kp:
                out.append("- 听力任务/要点：" + kp)
            sf = _printable(pf.get("sound_focus"))
            if sf:
                out.append("- 语音难点：" + sf)
            if lta.get("task_type"):
                out.append("- 听力题型：" + str(lta.get("task_type")))
            if pf.get("intonation"):
                out.append("- 语调要点：" + str(pf.get("intonation")))
            if so.get("imitation") or so.get("dialogue"):
                out.append("- 听后输出：模仿(跟读) → 对话(角色扮演) → 转述(信息复述)")
            out.append("页面须包含「听力任务」「语音难点」「口语输出」专页。")

    # ============ 语法课专项 ============
    elif lesson_type == "grammar":
        gd = blueprint.get("grammar-discovery", {})
        gp = blueprint.get("grammar-practice", {})
        ge = blueprint.get("grammar-error-focus", {})
        if gd or gp or ge:
            out.append("本课为【语法课】，课件必须体现「规则发现→分层操练→易错辨析」：")
            if gd.get("target_structure"):
                out.append("- 目标语法结构：" + str(gd.get("target_structure")))
            if gd.get("examples"):
                out.append("- 展示例句：" + _printable(gd.get("examples")))
            if gd.get("rules_summary"):
                out.append("- 规则总结：" + str(gd.get("rules_summary")))
            if gp:
                out.append("- 分层操练：机械" + _printable(gp.get("mechanical")) + " / 意义" + _printable(gp.get("meaningful")) + " / 交际" + _printable(gp.get("communicative")))
            if ge.get("common_errors"):
                out.append("- 易错点：" + _printable(ge.get("common_errors")))
            out.append("页面须包含「规则发现/总结」「分层操练」「易错辨析」专页。")

    # ============ 阅读课专项 ============
    elif lesson_type == "reading":
        rd = blueprint.get("reading-strategy", {})
        ra = blueprint.get("reading-analysis", {})
        if rd.get("pre") or rd.get("while") or rd.get("post"):
            out.append("本课为【阅读课】，课件遵循读前/读中/读后三环节：")
            out.append("- 读前：" + _printable(rd.get("pre")))
            out.append("- 读中：" + _printable(rd.get("while")))
            out.append("- 读后：" + _printable(rd.get("post")))
            out.append("页面须包含「整体理解」与「阅读策略」专页。")
        if ra.get("main_idea"):
            out.append("- 课文主旨：" + str(ra.get("main_idea")))

    # ============ 写作课专项 ============
    elif lesson_type == "writing":
        mj = blueprint.get("model-essay", {})
        wa = blueprint.get("genre-analysis", {})
        if mj.get("model") or wa.get("structure"):
            out.append("本课为【写作课】，课件遵循「审题→结构→范文→写作→评价」：")
            if wa.get("structure"):
                out.append("- 篇章结构：" + str(wa.get("structure")))
            if mj.get("model"):
                out.append("- 参考范文：" + _printable(mj.get("model")))
            out.append("页面须包含「范文拆解」与「写作指导」专页。")

    # ============ 新授课/其他课型 ============
    else:
        ob = blueprint.get("objective-design", {})
        dif = blueprint.get("difficulty-analysis", {})
        if ob.get("knowledge"):
            out.append("本课为【新授课】，课件遵循「导入→新知呈现→练习→总结」：")
            out.append("- 教学目标(知识)：" + str(ob.get("knowledge")))
        if dif.get("key_points"):
            out.append("- 重点：" + _printable(dif.get("key_points")))
        cp = blueprint.get("content-presentation", {})
        if cp.get("teaching_ladder"):
            out.append("- 新知呈现(认知阶梯)：" + str(cp.get("teaching_ladder")))

    if out:
        return "\n".join(out) + "\n"
    return ""
