import json
import re
from core.deepseek import deepseek_chat


class BaseAgent:
    system_prompt: str = "你是一个专业PPT内容助手。"
    model: str = "deepseek-chat"
    temperature: float = 0.7

    def __init__(self, api_key: str | None = None):
        self._api_key = api_key

    async def chat(self, user_prompt: str) -> str:
        return await deepseek_chat(
            [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            model=self.model,
            temperature=self.temperature,
            api_key=self._api_key,
        )

    def _clean_json(self, text: str) -> str:
        text = text.strip()
        text = re.sub(r'^```json\s*', '', text)
        text = re.sub(r'^```\s*', '', text)
        text = re.sub(r'\s*```$', '', text)
        text = text.strip()
        return text

    async def json_output(self, user_prompt: str) -> dict | list:
        for attempt in range(3):
            try:
                reply = await self.chat(
                    user_prompt + "\n只输出JSON，不要其他文字。"
                    + (" 确保JSON格式正确，不要有多余逗号。" if attempt > 0 else "")
                )
                reply = self._clean_json(reply)
                return json.loads(reply)
            except json.JSONDecodeError as e:
                if attempt >= 2:
                    return {}
                continue
        return {}
