class SlideAgent:
    ANIMATION_TYPES = ["fade", "fly_from_bottom", "zoom", "float", "split"]

    async def run(self, story: list) -> list:
        slides = []
        for i, s in enumerate(story):
            slides.append({
                "index": s["index"],
                "title": s["title"],
                "content": s["content"],
                "layout": s.get("layout", 1),
                "img_keywords": s.get("img_keywords", ""),
                "animation_in": self.ANIMATION_TYPES[i % len(self.ANIMATION_TYPES)],
                "transition": "fade" if i > 0 else "none",
            })
        return slides
