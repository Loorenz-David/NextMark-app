from __future__ import annotations

from flask import Flask
from flask_jwt_extended import create_access_token

from Delivery_app_BK.ai import orchestrator as ai_orchestrator
from Delivery_app_BK.ai import tool_registry
from Delivery_app_BK.ai.schemas import AIInteraction, AIInteractionField, AIThreadTurn
from Delivery_app_BK.ai.tools import geocode_tools
from Delivery_app_BK.geocoding.domain.models import GeocodeResult
from Delivery_app_BK.routers.api_v2 import ai as ai_route
from Delivery_app_BK.routers.utils.jwt_handler import jwt


def _build_app() -> Flask:
	app = Flask(__name__)
	app.config.update(
		TESTING=True,
		JWT_SECRET_KEY="test-secret",
	)
	jwt.init_app(app)
	app.register_blueprint(ai_route.ai_bp, url_prefix="/api_v2/ai")
	return app


def _auth_headers(app: Flask, *, default_country_code: str | None = None) -> dict[str, str]:
	claims = {
		"user_id": 1,
		"team_id": 10,
		"active_team_id": 10,
		"base_role_id": 2,
		"app_scope": "admin",
		"session_scope_id": "sess_123",
		"time_zone": "Europe/Stockholm",
		"default_country_code": default_country_code,
	}
	with app.app_context():
		token = create_access_token(identity="1", additional_claims=claims)
	return {"Authorization": f"Bearer {token}"}


def _make_result(**kwargs) -> GeocodeResult:
	defaults = dict(
		street_address="Kungsgatan 5",
		postal_code="111 56",
		city="Stockholm",
		country="SE",
		lat=59.334,
		lng=18.063,
		formatted_address="Kungsgatan 5, 111 56 Stockholm, Sweden",
	)
	return GeocodeResult(**{**defaults, **kwargs})


def _install_thread_store_stubs(monkeypatch):
	stored_turns: list = []

	monkeypatch.setattr(ai_route, "assert_thread_access", lambda *args, **kwargs: None)
	monkeypatch.setattr(ai_route, "append_turn", lambda thread_id, turn: stored_turns.append(turn))
	monkeypatch.setattr(ai_route, "list_turns", lambda thread_id: [])
	monkeypatch.setattr(ai_route.thread_store, "get_turn_awaiting_response", lambda thread_id: None)
	monkeypatch.setattr(ai_route.thread_store, "clear_turn_awaiting_response", lambda thread_id, turn_id: None)

	return stored_turns


def test_ai_thread_message_route_uses_identity_country_hint_for_geocoding(monkeypatch):
	app = _build_app()
	client = app.test_client()
	stored_turns = _install_thread_store_stubs(monkeypatch)
	monkeypatch.setattr(ai_orchestrator, "select_provider_for_stage", lambda *args, **kwargs: type("_Provider", (), {"name": "dummy"})())

	monkeypatch.setattr(geocode_tools, "geocode_address", lambda q, country_hint=None: _make_result())

	captured = {}

	def _fake_create_order(ctx, **params):
		captured["ctx_default_country_code"] = ctx.default_country_code
		captured["params"] = params
		return {
			"status": "created",
			"order_id": 42,
			"items_created": 0,
		}

	monkeypatch.setitem(tool_registry.TOOLS, "create_order", _fake_create_order)

	def _fake_get_next_step(user_input, history, provider, system_prompt=None):
		tool_history = [entry for entry in history if "tool" in entry]
		if not tool_history:
			return {
				"type": "tool",
				"tool": "geocode_address",
				"parameters": {"q": "Kungsgatan 5, Stockholm"},
			}

		last = tool_history[-1]
		if last["tool"] == "geocode_address":
			assert last["result"]["used_country_hint"] == "SE"
			assert last["result"]["country_hint_source"] == "team_default"
			return {
				"type": "tool",
				"tool": "create_order",
				"parameters": {
					"client_first_name": "Anna",
					"client_address": last["result"]["address_object"],
				},
			}

		return {"type": "final", "message": "Created order #42 for Anna."}

	monkeypatch.setattr(ai_orchestrator, "get_next_step", _fake_get_next_step)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={"message": "create an order for Anna at Kungsgatan 5, Stockholm"},
		headers=_auth_headers(app, default_country_code="SE"),
	)

	assert response.status_code == 200
	payload = response.get_json()
	assert payload["success"] is True
	message = payload["data"]["message"]
	assert message["content"] == "Created order #42 for Anna."
	assert message["blocks"]
	assert [block["kind"] for block in message["blocks"]] == ["entity_detail", "entity_detail"]
	assert message["blocks"][0]["data"]["formatted_address"] == "Kungsgatan 5, 111 56 Stockholm, Sweden"
	assert message["blocks"][1]["data"]["id"] == 42
	assert [entry["tool"] for entry in message["tool_trace"]] == ["geocode_address", "create_order"]
	assert captured["ctx_default_country_code"] == "SE"
	assert "client_address" in captured["params"]
	assert captured["params"]["client_address"]["coordinates"]["lat"] == 59.334
	assert stored_turns[-1].blocks is not None
	assert stored_turns[-1].blocks[0].kind == "entity_detail"
	assert len(stored_turns) == 4


def test_ai_thread_message_route_resolves_user_config_capability_from_payload(monkeypatch):
	app = _build_app()
	client = app.test_client()
	_install_thread_store_stubs(monkeypatch)

	captured = {}

	monkeypatch.setattr(
		ai_route,
		"handle_ai_request_with_thread",
		lambda ctx, message, prior_turns, **kwargs: (
			captured.update({"kwargs": kwargs})
			or ai_orchestrator.OrchestratorResult(
				final_message="User config capability selected.",
				tool_turns=[],
				success=True,
			)
		),
	)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={"message": "update my settings", "capability": "user_config"},
		headers=_auth_headers(app),
	)

	assert response.status_code == 200
	assert captured["kwargs"]["capability_name"] == "user_config"
	assert captured["kwargs"]["stage_name"] == "execute"


def test_ai_thread_message_route_rejects_unknown_capability(monkeypatch):
	app = _build_app()
	client = app.test_client()
	_install_thread_store_stubs(monkeypatch)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={"message": "hello", "capability": "unknown_capability"},
		headers=_auth_headers(app),
	)

	assert response.status_code == 400
	payload = response.get_json()
	assert payload["success"] is False
	assert "Unknown AI capability" in payload["error"]


def test_ai_thread_message_route_falls_back_to_create_order_without_address(monkeypatch):
	app = _build_app()
	client = app.test_client()
	_install_thread_store_stubs(monkeypatch)
	monkeypatch.setattr(ai_orchestrator, "select_provider_for_stage", lambda *args, **kwargs: type("_Provider", (), {"name": "dummy"})())

	monkeypatch.setattr(geocode_tools, "geocode_address", lambda q, country_hint=None: None)

	captured = {}

	def _fake_create_order(ctx, **params):
		captured["ctx_default_country_code"] = ctx.default_country_code
		captured["params"] = params
		return {
			"status": "created",
			"order_id": 77,
			"items_created": 0,
		}

	monkeypatch.setitem(tool_registry.TOOLS, "create_order", _fake_create_order)

	def _fake_get_next_step(user_input, history, provider, system_prompt=None):
		tool_history = [entry for entry in history if "tool" in entry]
		if not tool_history:
			return {
				"type": "tool",
				"tool": "geocode_address",
				"parameters": {"q": "unknown place 999"},
			}

		last = tool_history[-1]
		if last["tool"] == "geocode_address":
			assert last["result"]["found"] is False
			assert last["result"]["can_create_without_client_address"] is True
			return {
				"type": "tool",
				"tool": "create_order",
				"parameters": {
					"client_first_name": "Anna",
				},
			}

		return {
			"type": "final",
			"message": "Created order #77 for Anna, but the address still needs to be completed.",
		}

	monkeypatch.setattr(ai_orchestrator, "get_next_step", _fake_get_next_step)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={"message": "create an order for Anna at unknown place 999"},
		headers=_auth_headers(app, default_country_code="SE"),
	)

	assert response.status_code == 200
	payload = response.get_json()
	assert payload["success"] is True
	message = payload["data"]["message"]
	assert message["content"] == "Created order #77 for Anna, but the address still needs to be completed."
	assert message["blocks"]
	assert message["blocks"][0]["kind"] == "summary"
	assert message["blocks"][0]["data"]["found"] is False
	assert message["blocks"][1]["kind"] == "entity_detail"
	assert message["blocks"][1]["data"]["id"] == 77
	assert [entry["tool"] for entry in message["tool_trace"]] == ["geocode_address", "create_order"]
	assert captured["ctx_default_country_code"] == "SE"
	assert "client_address" not in captured["params"]
	assert any("Address not found" in entry["summary"] for entry in message["tool_trace"])


def test_ai_thread_message_reuses_recent_tool_turns_for_blocks_when_model_skips_tool_call(monkeypatch):
	app = _build_app()
	client = app.test_client()
	stored_turns: list = []

	monkeypatch.setattr(ai_route, "assert_thread_access", lambda *args, **kwargs: None)
	monkeypatch.setattr(ai_route, "append_turn", lambda thread_id, turn: stored_turns.append(turn))
	monkeypatch.setattr(ai_orchestrator, "select_provider_for_stage", lambda *args, **kwargs: type("_Provider", (), {"name": "dummy"})())
	monkeypatch.setattr(ai_route.thread_store, "get_turn_awaiting_response", lambda thread_id: None)
	monkeypatch.setattr(ai_route.thread_store, "clear_turn_awaiting_response", lambda thread_id, turn_id: None)

	prior_turns = [
		AIThreadTurn(
			id="turn_prev_user",
			thread_id="thr_123",
			role="user",
			content="show me scheduled orders",
			created_at="2026-03-21T10:00:00Z",
		),
		AIThreadTurn(
			id="turn_prev_tool",
			thread_id="thr_123",
			role="tool",
			content="Tool list_orders executed",
			created_at="2026-03-21T10:00:01Z",
			tool_name="list_orders",
			tool_params={"scheduled": True},
			tool_result={
				"order": [
					{
						"id": 1056,
						"order_scalar_id": "1056",
						"client_first_name": "Some",
						"client_last_name": "Name",
						"order_state_id": 2,
					},
					{
						"id": 1055,
						"order_scalar_id": "1055",
						"client_first_name": "Some",
						"client_last_name": "New",
						"order_state_id": 2,
					},
				],
				"order_stats": {"total": 2},
				"order_pagination": {"has_more": False},
			},
		),
		AIThreadTurn(
			id="turn_prev_assistant",
			thread_id="thr_123",
			role="assistant",
			content="I found 2 scheduled orders.",
			created_at="2026-03-21T10:00:02Z",
		),
		AIThreadTurn(
			id="turn_current_user",
			thread_id="thr_123",
			role="user",
			content="show me those orders",
			created_at="2026-03-21T10:00:03Z",
		),
	]

	monkeypatch.setattr(ai_route, "list_turns", lambda thread_id: prior_turns)
	monkeypatch.setattr(
		ai_route,
		"handle_ai_request_with_thread",
		lambda *args, **kwargs: ai_orchestrator.OrchestratorResult(
			final_message="Here are the details of the 2 scheduled orders.",
			tool_turns=[],
			success=True,
		),
	)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={"message": "show me those orders"},
		headers=_auth_headers(app, default_country_code="SE"),
	)

	assert response.status_code == 200
	payload = response.get_json()
	assert payload["success"] is True
	message = payload["data"]["message"]
	assert message["content"] == "Here are the details of the 2 scheduled orders."
	assert [entry["tool"] for entry in message["tool_trace"]] == ["list_orders"]
	assert len(message["blocks"]) == 1
	assert message["blocks"][0]["kind"] == "entity_collection"
	assert message["blocks"][0]["entity_type"] == "order"
	assert message["blocks"][0]["data"]["total"] == 2
	assert message["blocks"][0]["data"]["items"][0]["order_number"] == "1056"
	assert stored_turns[-1].blocks is not None
	assert stored_turns[-1].tool_trace[0].tool == "list_orders"


def test_ai_thread_message_handles_single_order_object_from_list_orders(monkeypatch):
	app = _build_app()
	client = app.test_client()
	stored_turns = _install_thread_store_stubs(monkeypatch)
	monkeypatch.setattr(ai_orchestrator, "select_provider_for_stage", lambda *args, **kwargs: type("_Provider", (), {"name": "dummy"})())
	monkeypatch.setattr(
		ai_route,
		"handle_ai_request_with_thread",
		lambda *args, **kwargs: ai_orchestrator.OrchestratorResult(
			final_message="Order #1056 details:\n- Client: some name",
			tool_turns=[
				{
					"tool": "list_orders",
					"params": {"q": "1056", "s": ["order_scalar_id"], "limit": 1},
					"result": {
						"order": {
							"id": 1056,
							"order_scalar_id": "1056",
							"client_first_name": "Some",
							"client_last_name": "Name",
							"order_state_id": 1,
							"delivery_plan_id": 129,
						},
						"order_stats": {"total": 1},
						"order_pagination": {"has_more": False},
					},
				}
			],
			success=True,
		),
	)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={"message": "could you show me the order 1056"},
		headers=_auth_headers(app, default_country_code="SE"),
	)

	assert response.status_code == 200
	payload = response.get_json()
	assert payload["success"] is True
	message = payload["data"]["message"]
	assert message["content"] == "Order #1056 details:\n- Client: some name"
	assert [entry["tool"] for entry in message["tool_trace"]] == ["list_orders"]
	assert len(message["blocks"]) == 1
	assert message["blocks"][0]["entity_type"] == "order"
	assert message["blocks"][0]["data"]["total"] == 1
	assert message["blocks"][0]["data"]["items"][0]["id"] == 1056
	assert stored_turns[-1].blocks is not None
	assert stored_turns[-1].blocks[0].data["items"][0]["order_number"] == "1056"


def test_ai_thread_message_rejects_non_response_while_blocking_interaction_is_awaiting(monkeypatch):
	app = _build_app()
	client = app.test_client()

	awaiting_turn = AIThreadTurn(
		id="turn_blocking",
		thread_id="thr_123",
		role="assistant",
		content="Which plan type should I use?",
		created_at="2026-03-21T11:00:00Z",
		awaiting_response=True,
		interaction_kind="question",
		interaction_id="q_plan_type",
	)

	monkeypatch.setattr(ai_route, "assert_thread_access", lambda *args, **kwargs: None)
	monkeypatch.setattr(ai_route.thread_store, "get_turn_awaiting_response", lambda thread_id: awaiting_turn)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={"message": "create the plan now"},
		headers=_auth_headers(app),
	)

	assert response.status_code == 409
	payload = response.get_json()
	assert payload["success"] is False
	assert payload["data"]["awaiting_interaction_id"] == "q_plan_type"


def test_ai_thread_message_marks_assistant_turn_awaiting_response_for_blocking_interaction(monkeypatch):
	app = _build_app()
	client = app.test_client()
	stored_turns = _install_thread_store_stubs(monkeypatch)

	monkeypatch.setattr(ai_route.thread_store, "get_turn_awaiting_response", lambda thread_id: None)
	monkeypatch.setattr(ai_route.thread_store, "clear_turn_awaiting_response", lambda thread_id, turn_id: None)

	monkeypatch.setattr(
		ai_route,
		"handle_ai_request_with_thread",
		lambda *args, **kwargs: ai_orchestrator.OrchestratorResult(
			final_message="I found multiple plan types. Please choose one.",
			tool_turns=[
				{
					"tool": "list_plans",
					"params": {},
					"result": {
						"count": 2,
						"delivery_plans": [
							{"id": 1, "label": "A", "plan_type": "local_delivery"},
							{"id": 2, "label": "B", "plan_type": "international_shipping"},
						],
					},
				}
			],
			success=True,
		),
	)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={"message": "create a plan for tomorrow"},
		headers=_auth_headers(app),
	)

	assert response.status_code == 200
	payload = response.get_json()
	assert payload["success"] is True
	assert any(i["kind"] == "question" for i in payload["data"]["message"]["interactions"])

	assistant_turn = stored_turns[-1]
	assert assistant_turn.role == "assistant"
	assert assistant_turn.awaiting_response is True
	assert assistant_turn.interaction_kind == "question"
	assert assistant_turn.interaction_id == "int_question_plan_type"


def test_ai_thread_message_requires_confirm_flag_for_confirm_interactions(monkeypatch):
	app = _build_app()
	client = app.test_client()

	awaiting_turn = AIThreadTurn(
		id="turn_confirm",
		thread_id="thr_123",
		role="assistant",
		content="Update 12 orders to completed?",
		created_at="2026-03-21T11:10:00Z",
		awaiting_response=True,
		interaction_kind="confirm",
		interaction_id="int_confirm_update_order_state",
	)

	monkeypatch.setattr(ai_route, "assert_thread_access", lambda *args, **kwargs: None)
	monkeypatch.setattr(ai_route.thread_store, "get_turn_awaiting_response", lambda thread_id: awaiting_turn)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={
			"message": "yes",
			"__interaction_response__": "int_confirm_update_order_state",
		},
		headers=_auth_headers(app),
	)

	assert response.status_code == 400
	payload = response.get_json()
	assert payload["success"] is False
	assert "confirm_accepted" in payload["error"]


def test_ai_thread_message_requires_email_or_phone_for_contact_clarify_form(monkeypatch):
	app = _build_app()
	client = app.test_client()

	awaiting_turn = AIThreadTurn(
		id="turn_contact_clarify",
		thread_id="thr_123",
		role="assistant",
		content="I need a way to contact the customer before I create the order.",
		created_at="2026-03-21T11:15:00Z",
		awaiting_response=True,
		interaction_kind="question",
		interaction_id="int_clarify_create_order_contact",
		interactions=[
			AIInteraction(
				id="int_clarify_create_order_contact",
				kind="question",
				label="Add customer contact details",
				required=True,
				response_mode="form",
				payload={"at_least_one_of": ["client_email", "client_phone"]},
				fields=[
					AIInteractionField(id="client_email", label="Customer email", type="email", required=False),
					AIInteractionField(id="client_phone", label="Customer phone", type="tel", required=False),
				],
			),
		],
	)

	monkeypatch.setattr(ai_route, "assert_thread_access", lambda *args, **kwargs: None)
	monkeypatch.setattr(ai_route.thread_store, "get_turn_awaiting_response", lambda thread_id: awaiting_turn)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={
			"message": "here are the details",
			"__interaction_response__": "int_clarify_create_order_contact",
			"interaction_form": {},
		},
		headers=_auth_headers(app),
	)

	assert response.status_code == 400
	payload = response.get_json()
	assert payload["success"] is False
	assert payload["data"]["at_least_one_of"] == ["client_email", "client_phone"]


def test_ai_thread_message_returns_contact_clarify_interaction_from_staged_orchestrator(monkeypatch):
	app = _build_app()
	client = app.test_client()
	stored_turns = _install_thread_store_stubs(monkeypatch)

	monkeypatch.setattr(ai_orchestrator, "select_provider_for_stage", lambda *args, **kwargs: type("_Provider", (), {"name": "dummy"})())

	def _fake_get_next_step(user_input, history, provider, system_prompt=None):
		if "You classify logistics requests." in system_prompt:
			return {
				"type": "intent",
				"operation": "create_order",
				"needs_clarification": True,
			}
		if "You prepare clarification steps for logistics workflows." in system_prompt:
			return {
				"type": "clarify",
				"message": "I need a way to contact the customer before I create the order.",
				"interaction": {
					"id": "int_clarify_create_order_contact",
					"kind": "question",
					"label": "Add customer contact details",
					"required": True,
					"response_mode": "form",
					"payload": {
						"operation": "create_order",
						"question_id": "q_create_order_contact",
						"at_least_one_of": ["client_email", "client_phone"],
					},
					"fields": [
						{"id": "client_email", "label": "Customer email", "type": "email"},
						{"id": "client_phone", "label": "Customer phone", "type": "tel"},
					],
					"hint": "Provide an email address, a phone number, or both.",
				},
			}
		raise AssertionError(f"Unexpected system prompt: {system_prompt}")

	monkeypatch.setattr(ai_orchestrator, "get_next_step", _fake_get_next_step)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={"message": "create an order for Ana"},
		headers=_auth_headers(app),
	)

	assert response.status_code == 200
	payload = response.get_json()
	assert payload["success"] is True
	message = payload["data"]["message"]
	assert message["content"] == "I need a way to contact the customer before I create the order."
	assert message["tool_trace"] == []
	assert message["interactions"][0]["id"] == "int_clarify_create_order_contact"
	assert message["interactions"][0]["response_mode"] == "form"
	assert message["interactions"][0]["payload"]["at_least_one_of"] == ["client_email", "client_phone"]
	assistant_turn = stored_turns[-1]
	assert assistant_turn.awaiting_response is True
	assert assistant_turn.interaction_id == "int_clarify_create_order_contact"


def test_ai_thread_message_resumes_question_interaction_and_executes_next_tool(monkeypatch):
	app = _build_app()
	client = app.test_client()
	stored_turns = _install_thread_store_stubs(monkeypatch)

	awaiting_turn = AIThreadTurn(
		id="turn_question_pending",
		thread_id="thr_123",
		role="assistant",
		content="Which plan type should I use?",
		created_at="2026-03-21T12:00:00Z",
		awaiting_response=True,
		interaction_kind="question",
		interaction_id="int_question_plan_type",
	)

	clear_calls: list[tuple[str, str]] = []
	monkeypatch.setattr(ai_route, "assert_thread_access", lambda *args, **kwargs: None)
	monkeypatch.setattr(ai_route.thread_store, "get_turn_awaiting_response", lambda thread_id: awaiting_turn)
	monkeypatch.setattr(
		ai_route.thread_store,
		"clear_turn_awaiting_response",
		lambda thread_id, turn_id: clear_calls.append((thread_id, turn_id)),
	)

	monkeypatch.setattr(
		ai_route,
		"handle_ai_request_with_thread",
		lambda *args, **kwargs: ai_orchestrator.OrchestratorResult(
			final_message="Created local delivery plan #44.",
			tool_turns=[
				{
					"tool": "create_plan",
					"params": {
						"label": "Tomorrow Local",
						"plan_type": "local_delivery",
						"start_date": "2026-03-22T08:00:00Z",
						"end_date": "2026-03-22T18:00:00Z",
					},
					"result": {
						"plan_id": 44,
						"label": "Tomorrow Local",
						"plan_type": "local_delivery",
						"start_date": "2026-03-22T08:00:00Z",
						"end_date": "2026-03-22T18:00:00Z",
					},
				}
			],
			success=True,
		),
	)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={
			"message": "local_delivery",
			"__interaction_response__": "int_question_plan_type",
		},
		headers=_auth_headers(app),
	)

	assert response.status_code == 200
	payload = response.get_json()
	assert payload["success"] is True
	assert payload["data"]["message"]["content"] == "Created local delivery plan #44."
	assert [entry["tool"] for entry in payload["data"]["message"]["tool_trace"]] == ["create_plan"]
	assert payload["data"]["message"]["blocks"][0]["entity_type"] == "plan"

	assert clear_calls == [("thr_123", "turn_question_pending")]

	assistant_turn = stored_turns[-1]
	assert assistant_turn.role == "assistant"
	assert assistant_turn.awaiting_response is False


def test_ai_thread_message_requires_interaction_form_for_form_question(monkeypatch):
	app = _build_app()
	client = app.test_client()

	awaiting_turn = AIThreadTurn(
		id="turn_form_pending",
		thread_id="thr_123",
		role="assistant",
		content="I need address and phone.",
		created_at="2026-03-21T12:10:00Z",
		awaiting_response=True,
		interaction_kind="question",
		interaction_id="int_clarify_create_order",
		interactions=[
			AIInteraction(
				id="int_clarify_create_order",
				kind="question",
				label="I need a few more details",
				required=True,
				response_mode="form",
				fields=[
					AIInteractionField(id="client_phone", label="Phone", type="phone", required=True),
				],
			)
		],
	)

	monkeypatch.setattr(ai_route, "assert_thread_access", lambda *args, **kwargs: None)
	monkeypatch.setattr(ai_route.thread_store, "get_turn_awaiting_response", lambda thread_id: awaiting_turn)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={
			"message": "Clarification form submitted",
			"__interaction_response__": "int_clarify_create_order",
		},
		headers=_auth_headers(app),
	)

	assert response.status_code == 400
	payload = response.get_json()
	assert payload["success"] is False
	assert "interaction_form" in payload["error"]


def test_ai_thread_message_rejects_missing_required_form_fields(monkeypatch):
	app = _build_app()
	client = app.test_client()

	awaiting_turn = AIThreadTurn(
		id="turn_form_pending",
		thread_id="thr_123",
		role="assistant",
		content="I need address and phone.",
		created_at="2026-03-21T12:15:00Z",
		awaiting_response=True,
		interaction_kind="question",
		interaction_id="int_clarify_create_order",
		interactions=[
			AIInteraction(
				id="int_clarify_create_order",
				kind="question",
				label="I need a few more details",
				required=True,
				response_mode="form",
				fields=[
					AIInteractionField(id="client_address", label="Address", type="text", required=False),
					AIInteractionField(id="client_phone", label="Phone", type="phone", required=True),
				],
			)
		],
	)

	monkeypatch.setattr(ai_route, "assert_thread_access", lambda *args, **kwargs: None)
	monkeypatch.setattr(ai_route.thread_store, "get_turn_awaiting_response", lambda thread_id: awaiting_turn)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={
			"message": "Clarification form submitted",
			"__interaction_response__": "int_clarify_create_order",
			"interaction_form": {"client_address": "Kungsgatan 5"},
		},
		headers=_auth_headers(app),
	)

	assert response.status_code == 400
	payload = response.get_json()
	assert payload["success"] is False
	assert payload["data"]["missing_fields"] == ["client_phone"]


def test_ai_thread_message_forwards_and_persists_interaction_form(monkeypatch):
	app = _build_app()
	client = app.test_client()
	stored_turns = _install_thread_store_stubs(monkeypatch)

	awaiting_turn = AIThreadTurn(
		id="turn_form_pending",
		thread_id="thr_123",
		role="assistant",
		content="I need address and phone.",
		created_at="2026-03-21T12:20:00Z",
		awaiting_response=True,
		interaction_kind="question",
		interaction_id="int_clarify_create_order",
		interactions=[
			AIInteraction(
				id="int_clarify_create_order",
				kind="question",
				label="I need a few more details",
				required=True,
				response_mode="form",
				fields=[
					AIInteractionField(id="client_phone", label="Phone", type="phone", required=True),
				],
			)
		],
	)

	clear_calls: list[tuple[str, str]] = []
	monkeypatch.setattr(ai_route.thread_store, "get_turn_awaiting_response", lambda thread_id: awaiting_turn)
	monkeypatch.setattr(ai_route.thread_store, "clear_turn_awaiting_response", lambda thread_id, turn_id: clear_calls.append((thread_id, turn_id)))

	def _fake_handle(*args, **kwargs):
		assert kwargs["interaction_response_payload"]["interaction_form"] == {
			"client_address": "Kungsgatan 5, Stockholm",
			"client_phone": "+46 70 123 45 67",
		}
		return ai_orchestrator.OrchestratorResult(
			final_message="Created order #88 for Ana.",
			tool_turns=[
				{
					"tool": "create_order",
					"params": {"client_first_name": "Ana"},
					"result": {"status": "created", "order_id": 88, "items_created": 0},
				}
			],
			success=True,
		)

	monkeypatch.setattr(ai_route, "handle_ai_request_with_thread", _fake_handle)

	response = client.post(
		"/api_v2/ai/threads/thr_123/messages",
		json={
			"message": "Clarification form submitted",
			"__interaction_response__": "int_clarify_create_order",
			"interaction_form": {
				"client_address": "Kungsgatan 5, Stockholm",
				"client_phone": "+46 70 123 45 67",
			},
		},
		headers=_auth_headers(app),
	)

	assert response.status_code == 200
	payload = response.get_json()
	assert payload["success"] is True
	assert payload["data"]["message"]["content"] == "Created order #88 for Ana."
	assert clear_calls == [("thr_123", "turn_form_pending")]
	assert stored_turns[0].interaction_response_id == "int_clarify_create_order"
	assert stored_turns[0].interaction_form == {
		"client_address": "Kungsgatan 5, Stockholm",
		"client_phone": "+46 70 123 45 67",
	}
