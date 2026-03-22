from Delivery_app_BK.ai.schemas import AIAction, AIThreadMessagePayload, AIThreadMessageResponse
from Delivery_app_BK.routers.api_v2 import ai as ai_route


def test_operation_allowlist_tools_are_known_and_within_same_capability():
    for operation, allowlist in ai_route._OPERATION_TO_TOOL_ALLOWLIST.items():
        for tool_name in allowlist:
            assert tool_name in ai_route._TOOL_TO_CAPABILITY, (
                f"Operation '{operation}' references unknown tool '{tool_name}'"
            )

        capability_set = {ai_route._TOOL_TO_CAPABILITY[tool_name] for tool_name in allowlist}
        assert len(capability_set) == 1, (
            f"Operation '{operation}' mixes capabilities: {sorted(capability_set)}"
        )


def test_operation_allowlist_covers_response_formatter_operations():
    required_operations = {
        "list_orders",
        "list_plans",
        "create_plan",
        "list_routes",
        "update_order_state",
        "item_taxonomy_config",
        "create_order",
        "analyze_metrics",
    }
    missing = required_operations - set(ai_route._OPERATION_TO_TOOL_ALLOWLIST)
    assert not missing, f"Missing operation allowlists: {sorted(missing)}"


def test_message_capability_hint_routes_statistics_keywords():
    assert ai_route._message_capability_hint("show performance this week") == "statistics"
    assert ai_route._message_capability_hint("why are deliveries late") == "statistics"


def test_message_capability_hint_does_not_route_bare_why_to_statistics():
    assert ai_route._message_capability_hint("why did this fail?") is None


def test_parse_requested_capability_policy_defaults_to_auto_for_backward_compat():
    parsed, error = ai_route._parse_requested_capability_policy({"context": {}})

    assert error is None
    assert parsed["requested_capability_mode"] == "auto"
    assert parsed["requested_capability_id"] is None


def test_parse_requested_capability_policy_accepts_manual_context_capability():
    parsed, error = ai_route._parse_requested_capability_policy(
        {"context": {"capability_mode": "manual", "capability_id": "statistics"}}
    )

    assert error is None
    assert parsed["requested_capability_mode"] == "manual"
    assert parsed["requested_capability_id"] == "statistics"


def test_parse_requested_capability_policy_rejects_manual_without_capability_id():
    _parsed, error = ai_route._parse_requested_capability_policy(
        {"context": {"capability_mode": "manual"}}
    )

    assert error is not None
    assert error["code"] == "capability_policy_missing_id"


def test_parse_requested_capability_policy_fallbacks_to_auto_when_manual_missing_id_and_fallback_enabled():
    parsed, error = ai_route._parse_requested_capability_policy(
        {"context": {"capability_mode": "manual"}},
        invalid_input_behavior="fallback_auto",
    )

    assert error is None
    assert parsed["requested_capability_mode"] == "auto"
    assert parsed["requested_capability_id"] is None
    assert "capability_id_missing_fallback_auto" in parsed["policy_warnings"]


def test_parse_requested_capability_policy_rejects_unknown_capability_id():
    _parsed, error = ai_route._parse_requested_capability_policy(
        {"context": {"capability_mode": "manual", "capability_id": "unknown_capability"}}
    )

    assert error is not None
    assert error["code"] == "capability_policy_unknown_id"


def test_parse_requested_capability_policy_fallbacks_to_auto_when_unknown_id_and_fallback_enabled():
    parsed, error = ai_route._parse_requested_capability_policy(
        {"context": {"capability_mode": "manual", "capability_id": "unknown_capability"}},
        invalid_input_behavior="fallback_auto",
    )

    assert error is None
    assert parsed["requested_capability_mode"] == "auto"
    assert parsed["requested_capability_id"] is None
    assert "capability_id_unknown_fallback_auto" in parsed["policy_warnings"]


def test_parse_requested_capability_policy_fallbacks_to_auto_for_invalid_mode_when_enabled():
    parsed, error = ai_route._parse_requested_capability_policy(
        {"context": {"capability_mode": "invalid_mode", "capability_id": "statistics"}},
        invalid_input_behavior="fallback_auto",
    )

    assert error is None
    assert parsed["requested_capability_mode"] == "auto"
    assert parsed["requested_capability_id"] is None
    assert "capability_mode_invalid_fallback_auto" in parsed["policy_warnings"]


def test_parse_requested_capability_policy_ignores_capability_id_in_auto_mode_with_warning():
    parsed, error = ai_route._parse_requested_capability_policy(
        {"context": {"capability_mode": "auto", "capability_id": "statistics"}}
    )

    assert error is None
    assert parsed["requested_capability_mode"] == "auto"
    assert parsed["requested_capability_id"] is None
    assert parsed["policy_warnings"] == ["capability_id_ignored_in_auto_mode"]


def test_tool_policy_resolution_maps_statistics_to_readonly():
    assert ai_route._resolve_tool_policy("statistics") == "readonly"
    assert ai_route._resolve_tool_policy("logistics") == "action"


def test_policy_metadata_merge_exposes_minimum_contract_fields():
    merged = ai_route._merge_policy_metadata(
        data={"existing": True},
        requested_mode="manual",
        requested_capability_id="statistics",
        resolved_mode="manual",
        resolved_capability_id="statistics",
        tool_policy="readonly",
        policy_warnings=["x"],
    )

    assert merged["resolved_capability_mode"] == "manual"
    assert merged["resolved_capability_id"] == "statistics"
    assert merged["tool_policy"] == "readonly"
    assert merged["policy_warnings"] == ["x"]


def test_apply_tool_policy_to_response_clears_actions_for_readonly_and_none():
    response = AIThreadMessageResponse(
        thread_id="thr_123",
        message=AIThreadMessagePayload(
            role="assistant",
            content="done",
            actions=[AIAction(type="apply_order_filters", label="Apply")],
        ),
    )

    ai_route._apply_tool_policy_to_response(response, "readonly")
    assert response.message.actions == []

    response.message.actions = [AIAction(type="apply_order_filters", label="Apply")]
    ai_route._apply_tool_policy_to_response(response, "none")
    assert response.message.actions == []
