from __future__ import annotations
import logging

from Delivery_app_BK.services.context import ServiceContext

from .planner import get_next_step
from .tool_executor import execute_tool
from .providers.base import LLMProvider
from .providers.openai_provider import OpenAIProvider
from .schemas import AIResponse

logger = logging.getLogger(__name__)

MAX_STEPS = 5


def handle_ai_request(
    ctx: ServiceContext,
    user_input: str,
    provider: LLMProvider | None = None,
) -> AIResponse:
    provider = provider or OpenAIProvider()
    history: list[dict] = []

    logger.info(
        "AI request start | provider=%s | input=%r",
        provider.name,
        user_input,
    )

    try:
        for step_num in range(MAX_STEPS):
            step = get_next_step(user_input, history, provider)

            if step.get("type") == "final":
                message = step.get("message", "Done.")
                logger.info(
                    "AI request complete | steps=%d | message=%r | history=%s",
                    step_num,
                    message,
                    history,
                )
                return AIResponse(
                    success=True,
                    message=message,
                    steps=history,
                )

            if step.get("type") == "tool":
                tool_name = step.get("tool", "")
                params = step.get("parameters") or {}

                try:
                    result = execute_tool(ctx, tool_name, params)
                except Exception as e:
                    logger.warning("Tool execution failed | tool=%s | error=%s", tool_name, e)
                    result = {"error": str(e)}

                history.append({
                    "tool": tool_name,
                    "params": params,
                    "result": result,
                })
                continue

            # Unknown step type — treat as final
            logger.warning("Unknown step type from planner: %s", step)
            break

        # MAX_STEPS reached without final
        logger.warning("AI request hit MAX_STEPS=%d | history=%s", MAX_STEPS, history)
        return AIResponse(
            success=False,
            message="Max steps reached without completing the request.",
            steps=history,
        )

    except Exception as e:
        logger.exception("Unexpected error in AI request | input=%r", user_input)
        return AIResponse(
            success=False,
            message=str(e),
            steps=history,
        )
