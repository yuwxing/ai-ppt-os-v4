from agents.base import BaseAgent


class QAAgent(BaseAgent):
    system_prompt = """你是PPT质量审核专家。检查PPT结构完整性、内容准确性、页面连贯性和视觉一致性。
发现并报告问题，如页面缺失、内容重复、图片丢失、动画冲突等。"""

    async def run(self, ppt_data: dict, template: str | None = None) -> dict:
        issues = []
        slides = ppt_data.get("slides", [])

        if not slides:
            issues.append({"severity": "critical", "message": "幻灯片为空"})

        for i, slide in enumerate(slides):
            if not slide.get("title"):
                issues.append({"severity": "warning", "message": f"第{i+1}页缺少标题"})

            if not slide.get("content") and slide.get("layout") not in ["cover", "section", "summary"]:
                issues.append({"severity": "warning", "message": f"第{i+1}页内容为空"})

        return {
            "passed": len(issues) == 0,
            "issues": issues,
            "total_slides": len(slides),
            "ppt_data": ppt_data,
        }
