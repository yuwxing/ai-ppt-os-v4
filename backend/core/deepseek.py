import json
import httpx
from core.config import settings


DEEPSEEK_API = "https://api.deepseek.com/v1/chat/completions"


async def deepseek_chat(
    messages: list,
    model: str = "deepseek-chat",
    temperature: float = 0.7,
    timeout: int = 60,
    api_key: str | None = None,
) -> str:
    key = api_key or settings.deepseek_api_key
    if not key:
        raise ValueError("DEEPSEEK_API_KEY not configured")

    async with httpx.AsyncClient(
        timeout=httpx.Timeout(timeout, connect=15.0),
        # 忽略系统 ALL_PROXY(socks)，避免依赖 socksio；如需代理请显式传 settings.proxy_url
        trust_env=False,
    ) as client:
        resp = await client.post(
            DEEPSEEK_API,
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": messages,
                "temperature": temperature,
            },
            timeout=timeout,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def deepseek_json(messages: list, api_key: str | None = None, **kwargs) -> dict | list:
    if api_key:
        kwargs["api_key"] = api_key
    reply = await deepseek_chat(messages, **kwargs)
    for c in ('```json', '```'):
        if reply.startswith(c): reply = reply[len(c):]
        if reply.endswith(c): reply = reply[:-len(c)]
    reply = reply.strip()
    return json.loads(reply)
