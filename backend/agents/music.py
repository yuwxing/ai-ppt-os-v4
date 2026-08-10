import json
from agents.base import BaseAgent


class MusicAgent(BaseAgent):
    system_prompt = """你是PPT配乐师。根据主题和内容情感曲线，选择合适的背景音乐方案。
使用免费的SoundHelix或生成合适的音乐推荐。"""

    async def run(self, content: dict) -> dict:
        return await self.json_output(f"""
为PPT设计背景音乐方案：
{json.dumps(content, ensure_ascii=False)}

可用资源：SoundHelix免费MP3（https://www.soundhelix.com/audio/mp3/SoundHelix-Song-1.mp3 到 Song-16.mp3）

返回JSON：
{{
  "has_music": true,
  "source": "soundhelix",
  "track_number": 5,
  "track_url": "https://www.soundhelix.com/audio/mp3/SoundHelix-Song-5.mp3",
  "volume": 0.15,
  "play_across_slides": true,
  "start_slide": 1,
  "mood_match": "音乐情绪描述",
  "notes": "配乐说明"
}}
""")
