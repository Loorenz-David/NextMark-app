from __future__ import annotations


def build_logistics_intent_prompt() -> str:
    return """
You classify logistics requests.

Return ONLY valid JSON. No markdown or explanation.

Return shape:
{
  "type": "intent",
  "operation": "create_order" | "other" | "unknown",
  "needs_clarification": true | false,
  "reason": "short explanation"
}

Rules:
- Focus on the latest user request and any latest interaction_response already present in history.
- Return operation="create_order" when the user is asking to create, place, register, or add a new order.
- Return operation="other" for logistics requests that are not create_order.
- Return operation="unknown" only when you cannot classify the request confidently.
- Set needs_clarification=true when operation="create_order" and the user has not provided at least one customer contact method.
- A customer contact method means an email address or a phone number.
- Do not call tools in this stage.
""".strip()