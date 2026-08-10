from agents.base import BaseAgent


class PPTAssemblerAgent(BaseAgent):
    system_prompt = "你是PPT总装工程师，将内容转为PPT渲染结构"

    LAYOUT_MAP = {
        "title": 0,
        "title_content": 1,
        "content_text": 1,
        "image_left": 3,
        "image_right": 4,
        "full_image": 5,
    }

    async def run(
        self,
        slides: list,
        scripts: list,
        images: list,
        animations: list,
        style: dict,
        music: dict,
        template: dict
    ) -> dict:

        result_slides = []

        for s in slides:

            page = s["page_number"]

            matched_images = [
                img for img in images
                if img["page_number"] == page
            ]

            matched_animation = next(
                (a for a in animations if a["page_number"] == page),
                None
            )

            matched_script = next(
                (sc for sc in scripts if sc["page_number"] == page),
                None
            )

            layout_index = self.LAYOUT_MAP.get(
                s.get("layout", "content_text"),
                1
            )

            result_slides.append({
                "page_number": page,
                "layout": layout_index,

                "title": s.get("title", ""),
                "content": s.get("content", []),

                "narrative": s.get("narrative", ""),
                "goal": s.get("goal", ""),
                "emotion": s.get("emotion", ""),

                "image": {
                    "main": matched_images[0] if len(matched_images) > 0 else None,
                    "background": matched_images[1] if len(matched_images) > 1 else None
                },

                "animation": {
                    "type": matched_animation.get("type") if matched_animation else None,
                    "duration": matched_animation.get("duration", 0.5) if matched_animation else None,
                    "target": matched_animation.get("target", "content") if matched_animation else None
                } if matched_animation else None,

                "script": matched_script
            })

        return {
            "style": style,
            "music": music,
            "slides": result_slides,

            "pptx_schema": {
                "template": template.get("file") if template else None,
                "theme": style,
                "slides": result_slides
            }
        }
