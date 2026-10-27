"""Provider port and a configurable chat-completions-compatible HTTP adapter."""
import json
from typing import Protocol
from urllib.parse import urlparse
import httpx
from fastapi import HTTPException


class AIProvider(Protocol):
    async def generate(self, messages: list[dict[str, str]]) -> dict: ...


class ChatCompletionProvider:
    def __init__(self, settings):
        self.settings = settings

    async def generate(self, messages):
        settings = self.settings
        if not all((settings.ai_base_url, settings.ai_api_key, settings.ai_model)):
            raise HTTPException(503, "JSR AI provider is not configured. Set AI_BASE_URL, AI_MODEL and AI_API_KEY on the backend.")
        url = settings.ai_base_url.rstrip("/") + "/chat/completions"
        if urlparse(url).scheme != "https":
            raise HTTPException(503, "JSR provider must use HTTPS")
        try:
            async with httpx.AsyncClient(timeout=settings.ai_timeout_seconds, follow_redirects=False) as client:
                response = await client.post(url, headers={"Authorization": f"Bearer {settings.ai_api_key}"}, json={
                    "model": settings.ai_model, "messages": messages, "temperature": 0,
                    "max_tokens": 1200, "response_format": {"type": "json_object"},
                })
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            if len(content) > 16000:
                raise ValueError("Oversized response")
            return json.loads(content)
        except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError):
            raise HTTPException(503, "JSR provider is unavailable or returned an invalid response. Try again later.")
