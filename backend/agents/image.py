import os
import asyncio
from pathlib import Path
from agents.base import BaseAgent


class ImageAgent(BaseAgent):
    system_prompt = "你是PPT配图专家。根据提示词为每页PPT获取最佳配图，生成可用于PPT的图片文件。"

    async def run(self, prompts: list) -> list:
        output_dir = Path("C:/Users/user/.openclaw/workspace/ai-ppt-os-v3/output/images")
        output_dir.mkdir(parents=True, exist_ok=True)

        async def fetch_one(p: dict) -> dict:
            try:
                from bing_image_downloader import downloader
                keywords = p.get("prompt_cn", "") or " ".join(p.get("reference", []))
                keywords = keywords[:50]

                dest = output_dir / f"slide_{p['page_number']:02d}"
                downloader.download(
                    keywords,
                    limit=1,
                    output_dir=str(dest),
                    adult_filter_off=True,
                    force_replace=True,
                )

                img_files = list(dest.glob("Image_*/*"))
                return {
                    "page_number": p["page_number"],
                    "file_path": str(img_files[0]) if img_files else None,
                    "status": "ok" if img_files else "no_image",
                }
            except Exception as e:
                return {"page_number": p["page_number"], "file_path": None, "error": str(e)}

        tasks = [fetch_one(p) for p in prompts]
        results = await asyncio.gather(*tasks)
        return results
