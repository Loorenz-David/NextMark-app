from __future__ import annotations
import json
import logging

from .providers.base import LLMProvider
from .prompts.system_prompt import PLANNER_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


def get_next_step(
    user_input: str,
    history: list[dict],
    provider: LLMProvider,
) -> dict:
    """
    Build a proper conversation and get the next planner step from the LLM.
    History entries are dicts with keys: tool, params, result.
    """
    messages: list[dict] = [
        {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
        {"role": "user", "content": user_input},
    ]

    # Build proper conversation turns from history
    for entry in history:
        # What the assistant decided (the tool call)
        messages.append({
            "role": "assistant",
            "content": json.dumps({
                "type": "tool",
                "tool": entry["tool"],
                "parameters": entry.get("params", {}),
            }),
        })
        # What the tool returned (feed back as user message)
        messages.append({
            "role": "user",
            "content": f"Tool result for {entry['tool']}: {json.dumps(entry['result'])}",
        })

    try:
        content = _complete_with_history(provider, messages)
        return json.loads(content)
    except Exception:
        logger.warning("Failed to parse planner step from LLM response")
        return {"type": "final", "message": "Failed to process the request. Please try again."}


def _complete_with_history(provider: LLMProvider, messages: list[dict]) -> str:
    """
    Multi-turn completion using full message history.
    Uses provider's underlying client if it's OpenAIProvider,
    otherwise falls back to single-turn complete() with serialized history.
    """
    # Try to use the OpenAI client directly for proper multi-turn conversation
    try:
        from .providers.openai_provider import OpenAIProvider
        if isinstance(provider, OpenAIProvider):
            response = provider._client.chat.completions.create(
                model=provider._model,
                messages=messages,
                temperature=0,
            )
            return response.choices[0].message.content or ""
    except Exception:
        pass

    # Fallback: serialize history into user message for other providers
    last_user = messages[-1]["content"] if messages else ""
    return provider.complete(
        system=messages[0]["content"],
        user=last_user,
    )
