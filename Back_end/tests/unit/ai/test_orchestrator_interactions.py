from Delivery_app_BK.ai.orchestrator import handle_ai_request_with_thread
from Delivery_app_BK.ai.capabilities.base import CapabilityProfile
from Delivery_app_BK.ai.schemas import (
    AIInteraction,
    AIThreadTurn,
    PlannerClarifyStep,
    PlannerFinalStep,
    PlannerIntentStep,
)
from Delivery_app_BK.ai.stages import CLARIFY_STAGE, EXECUTE_STAGE, INTENT_STAGE


class _DummyProvider:
    name = "dummy"

    def complete(self, system: str, user: str) -> str:
        return ""


def test_handle_ai_request_short_circuits_when_confirm_is_rejected(monkeypatch):
    prior_turns = [
        AIThreadTurn(
            id="turn1",
            thread_id="thr_123",
            role="assistant",
            content="Update 10 orders?",
            created_at="2026-03-21T12:00:00Z",
            awaiting_response=True,
            interaction_kind="confirm",
            interaction_id="int_confirm_update_order_state",
        )
    ]

    # Should not reach planner for rejected confirm.
    monkeypatch.setattr(
        "Delivery_app_BK.ai.orchestrator.get_next_step",
        lambda *args, **kwargs: {"type": "final", "message": "unexpected"},
    )

    result = handle_ai_request_with_thread(
        ctx=None,
        user_input="cancel",
        prior_turns=prior_turns,
        provider=_DummyProvider(),
        system_prompt="",
        interaction_response_payload={
            "__interaction_response__": "int_confirm_update_order_state",
            "confirm_accepted": False,
        },
    )

    assert result.success is True
    assert result.tool_turns == []
    assert result.final_message == "Cancelled by user. No changes were applied."
    assert result.data == {
        "interaction_cancelled": True,
        "interaction_kind": "confirm",
        "interaction_id": "int_confirm_update_order_state",
    }


def test_handle_ai_request_replays_structured_interaction_form_into_history(monkeypatch):
    captured = {}

    prior_turns = [
        AIThreadTurn(
            id="turn_user_form",
            thread_id="thr_123",
            role="user",
            content="Clarification form submitted",
            created_at="2026-03-21T12:30:00Z",
            interaction_response_id="int_clarify_create_order",
            interaction_form={
                "client_address": "Kungsgatan 5, Stockholm",
                "client_phone": "+46 70 123 45 67",
            },
        )
    ]

    def _fake_get_next_step(user_input, history, provider, system_prompt=None):
        captured["history"] = history
        return {"type": "final", "message": "ok"}

    monkeypatch.setattr("Delivery_app_BK.ai.orchestrator.get_next_step", _fake_get_next_step)

    result = handle_ai_request_with_thread(
        ctx=None,
        user_input="Clarification form submitted",
        prior_turns=prior_turns,
        provider=_DummyProvider(),
        system_prompt="",
    )

    assert result.success is True
    assert result.final_message == "ok"
    assert captured["history"][0]["role"] == "user"
    assert '"type": "interaction_response"' in captured["history"][0]["content"]
    assert '"interaction_id": "int_clarify_create_order"' in captured["history"][0]["content"]
    assert '"client_phone": "+46 70 123 45 67"' in captured["history"][0]["content"]
    assert '"normalized_facts": {"client_primary_phone": {"prefix": "+46", "number": "701234567"}, "client_phone_raw": "+46 70 123 45 67"}' in captured["history"][0]["content"]


def test_handle_ai_request_returns_clarify_result_before_execution(monkeypatch):
    prompts = {
        INTENT_STAGE: "intent-prompt",
        CLARIFY_STAGE: "clarify-prompt",
        EXECUTE_STAGE: "execute-prompt",
    }
    capability = CapabilityProfile(
        name="logistics",
        description="logistics",
        prompt_builders={stage: (lambda prompt=prompt: prompt) for stage, prompt in prompts.items()},
        tool_registries={EXECUTE_STAGE: {}},
    )
    captured = {"prompts": []}

    monkeypatch.setattr("Delivery_app_BK.ai.orchestrator.get_capability_profile", lambda name: capability)
    monkeypatch.setattr(
        "Delivery_app_BK.ai.orchestrator.select_provider_for_stage",
        lambda capability_name, stage_name: _DummyProvider(),
    )

    def _fake_get_next_step(user_input, history, provider, system_prompt=None):
        captured["prompts"].append(system_prompt)
        if system_prompt == "intent-prompt":
            return PlannerIntentStep(type="intent", operation="create_order", needs_clarification=True)
        if system_prompt == "clarify-prompt":
            return PlannerClarifyStep(
                type="clarify",
                message="I need a way to contact the customer before I create the order.",
                interaction=AIInteraction(
                    id="int_clarify_create_order_contact",
                    kind="question",
                    label="Add customer contact details",
                    required=True,
                    response_mode="form",
                    payload={
                        "operation": "create_order",
                        "question_id": "q_create_order_contact",
                        "at_least_one_of": ["client_email", "client_phone"],
                    },
                    fields=[
                        {"id": "client_email", "label": "Customer email", "type": "email"},
                        {"id": "client_phone", "label": "Customer phone", "type": "tel"},
                    ],
                    hint="Provide an email address, a phone number, or both.",
                ),
            )
        raise AssertionError(f"Unexpected prompt: {system_prompt}")

    monkeypatch.setattr("Delivery_app_BK.ai.orchestrator.get_next_step", _fake_get_next_step)
    monkeypatch.setattr(
        "Delivery_app_BK.ai.orchestrator.execute_tool",
        lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("execute_tool should not run during clarify")),
    )

    result = handle_ai_request_with_thread(
        ctx=None,
        user_input="create an order for Ana",
        prior_turns=[],
        capability_name="logistics",
        stage_name=EXECUTE_STAGE,
    )

    assert result.success is True
    assert result.tool_turns == []
    assert result.reuse_recent_tool_turns is False
    assert result.interactions[0].id == "int_clarify_create_order_contact"
    assert result.interactions[0].response_mode == "form"
    assert result.data == {"stage": CLARIFY_STAGE, "operation": "create_order"}
    assert captured["prompts"] == ["intent-prompt", "clarify-prompt"]


def test_handle_ai_request_returns_clarify_result_for_user_config(monkeypatch):
    prompts = {
        INTENT_STAGE: "intent-prompt",
        CLARIFY_STAGE: "clarify-prompt",
        EXECUTE_STAGE: "execute-prompt",
    }
    capability = CapabilityProfile(
        name="user_config",
        description="user-config",
        prompt_builders={stage: (lambda prompt=prompt: prompt) for stage, prompt in prompts.items()},
        tool_registries={EXECUTE_STAGE: {}},
    )

    monkeypatch.setattr("Delivery_app_BK.ai.orchestrator.get_capability_profile", lambda name: capability)
    monkeypatch.setattr(
        "Delivery_app_BK.ai.orchestrator.select_provider_for_stage",
        lambda capability_name, stage_name: _DummyProvider(),
    )

    def _fake_get_next_step(user_input, history, provider, system_prompt=None):
        if system_prompt == "intent-prompt":
            return PlannerIntentStep(type="intent", operation="item_taxonomy_config", needs_clarification=True)
        if system_prompt == "clarify-prompt":
            return PlannerClarifyStep(
                type="clarify",
                message="I need details before I can propose your item taxonomy.",
                interaction=AIInteraction(
                    id="int_clarify_user_config_scope",
                    kind="question",
                    label="Confirm taxonomy scope",
                    required=True,
                    response_mode="form",
                    payload={
                        "operation": "item_taxonomy_config",
                        "question_id": "q_user_config_scope",
                    },
                    fields=[
                        {"id": "catalog_scope", "label": "Catalog scope", "type": "text", "required": True},
                    ],
                ),
            )
        raise AssertionError(f"Unexpected prompt: {system_prompt}")

    monkeypatch.setattr("Delivery_app_BK.ai.orchestrator.get_next_step", _fake_get_next_step)

    result = handle_ai_request_with_thread(
        ctx=None,
        user_input="configure furniture item types",
        prior_turns=[],
        capability_name="user_config",
        stage_name=EXECUTE_STAGE,
    )

    assert result.success is True
    assert result.tool_turns == []
    assert result.reuse_recent_tool_turns is False
    assert result.interactions[0].id == "int_clarify_user_config_scope"
    assert result.data == {"stage": CLARIFY_STAGE, "operation": "item_taxonomy_config"}


def test_handle_ai_request_execute_stage_returns_clarify_interaction(monkeypatch):
    prompts = {
        INTENT_STAGE: "intent-prompt",
        CLARIFY_STAGE: "clarify-prompt",
        EXECUTE_STAGE: "execute-prompt",
    }
    capability = CapabilityProfile(
        name="user_config",
        description="user-config",
        prompt_builders={stage: (lambda prompt=prompt: prompt) for stage, prompt in prompts.items()},
        tool_registries={EXECUTE_STAGE: {}},
    )

    monkeypatch.setattr("Delivery_app_BK.ai.orchestrator.get_capability_profile", lambda name: capability)
    monkeypatch.setattr(
        "Delivery_app_BK.ai.orchestrator.select_provider_for_stage",
        lambda capability_name, stage_name: _DummyProvider(),
    )

    steps = iter(
        [
            PlannerIntentStep(type="intent", operation="item_taxonomy_config", needs_clarification=False),
            PlannerClarifyStep(
                type="clarify",
                message="Here is a draft proposal. Approve to apply changes.",
                interaction=AIInteraction(
                    id="int_confirm_user_config_apply",
                    kind="confirm",
                    label="Apply item taxonomy proposal",
                    required=True,
                    response_mode="confirm",
                    payload={"operation": "item_taxonomy_config", "proposal_id": "p_1"},
                ),
            ),
        ]
    )
    monkeypatch.setattr("Delivery_app_BK.ai.orchestrator.get_next_step", lambda *args, **kwargs: next(steps))

    result = handle_ai_request_with_thread(
        ctx=None,
        user_input="apply this taxonomy",
        prior_turns=[],
        capability_name="user_config",
        stage_name=EXECUTE_STAGE,
    )

    assert result.success is True
    assert result.final_message == "Here is a draft proposal. Approve to apply changes."
    assert result.reuse_recent_tool_turns is False
    assert result.interactions[0].id == "int_confirm_user_config_apply"
    assert result.data == {"stage": CLARIFY_STAGE}
