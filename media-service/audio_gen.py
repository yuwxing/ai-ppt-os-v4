import httpx
import random
from pathlib import Path


SOUNDHELIX_URLS = [
    f"https://www.soundhelix.com/audio/mp3/SoundHelix-Song-{i}.mp3"
    for i in range(1, 17)
]


async def download_background_music(track_number: int = None, output_dir: Path = None) -> str | None:
    if output_dir is None:
        output_dir = Path("output/audio")
    output_dir.mkdir(parents=True, exist_ok=True)

    if track_number is None:
        track_number = random.randint(1, 16)

    url = SOUNDHELIX_URLS[track_number - 1]
    output_path = output_dir / f"background_{track_number}.mp3"

    if output_path.exists():
        return str(output_path)

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=30)
            resp.raise_for_status()
            output_path.write_bytes(resp.content)
        return str(output_path)
    except Exception:
        return None
