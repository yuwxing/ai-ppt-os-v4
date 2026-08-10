import os
import asyncio
from pathlib import Path


async def bing_search(keywords: list[str], page_num: int, output_dir: Path) -> str | None:
    try:
        from bing_image_downloader import downloader
        query = " ".join(keywords[:3])[:50]
        dest = output_dir / f"slide_{page_num:02d}"
        downloader.download(query, limit=1, output_dir=str(dest),
                           adult_filter_off=True, force_replace=True)
        imgs = list(dest.glob("Image_*/*"))
        return str(imgs[0]) if imgs else None
    except Exception:
        return None


async def generate_images(slides: list, output_dir: Path) -> list:
    output_dir.mkdir(parents=True, exist_ok=True)
    tasks = []
    for slide in slides:
        keywords = slide.get("image_keywords", [slide.get("title", "")])
        tasks.append(bing_search(keywords, slide["page_number"], output_dir))
    return await asyncio.gather(*tasks)
