from __future__ import annotations
from openai import OpenAI


class OpenAIProvider:
    name = "openai"

    def __init__(self, model: str = "gpt-4.1-mini"):
        self._client = OpenAI()
        self._model = model

    def complete(self, system: str, user: str) -> str:
        response = self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0,
        )
        return response.choices[0].message.content or ""
