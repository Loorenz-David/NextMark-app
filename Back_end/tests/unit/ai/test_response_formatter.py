from Delivery_app_BK.ai.response_formatter import format_response, generate_blocks, generate_interactions
from Delivery_app_BK.ai.schemas import AIInteraction


def test_generate_blocks_maps_geocode_and_create_order_flow():
    tool_turns = [
        {
            "tool": "geocode_address",
            "params": {"q": "Kungsgatan 5, Stockholm"},
            "result": {
                "found": True,
                "q": "Kungsgatan 5, Stockholm",
                "formatted_address": "Kungsgatan 5, 111 56 Stockholm, Sweden",
                "address_object": {
                    "street_address": "Kungsgatan 5",
                    "postal_code": "111 56",
                    "city": "Stockholm",
                    "country": "SE",
                    "coordinates": {"lat": 59.334, "lng": 18.063},
                },
                "used_country_hint": "SE",
                "country_hint_source": "team_default",
            },
        },
        {
            "tool": "create_order",
            "params": {"client_first_name": "Anna"},
            "result": {
                "status": "created",
                "order_id": 42,
                "items_created": 0,
                "result": {
                    "created": [
                        {
                            "order": {
                                "id": 42,
                                "client_first_name": "Anna",
                                "client_address": {
                                    "street_address": "Kungsgatan 5",
                                },
                            }
                        }
                    ]
                },
            },
        },
    ]

    blocks = generate_blocks(tool_turns)

    assert [block.kind for block in blocks] == ["entity_detail", "entity_detail"]
    assert blocks[0].layout == "key_value"
    assert blocks[0].data["formatted_address"] == "Kungsgatan 5, 111 56 Stockholm, Sweden"
    assert blocks[1].entity_type == "order"
    assert blocks[1].data["id"] == 42


def test_generate_blocks_maps_list_orders_collection():
    blocks = generate_blocks([
        {
            "tool": "list_orders",
            "params": {"scheduled": False},
            "result": {
                "order": [
                    {
                        "id": 100,
                        "order_scalar_id": "100245",
                        "client_first_name": "Anna",
                        "client_last_name": "Smith",
                        "order_state_id": 3,
                    }
                ],
                "order_stats": {"total": 1},
                "order_pagination": {"has_more": False},
            },
        }
    ])

    assert len(blocks) == 1
    assert blocks[0].kind == "entity_collection"
    assert blocks[0].entity_type == "order"
    assert blocks[0].layout == "table"
    assert blocks[0].data["total"] == 1
    assert blocks[0].data["items"][0]["client_name"] == "Anna Smith"
    assert blocks[0].meta["table"]["columns"] == [
        "status",
        "order_scalar_id",
        "client_name",
    ]


def test_generate_blocks_maps_single_order_object_from_list_orders():
    blocks = generate_blocks([
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
    ])

    assert len(blocks) == 1
    assert blocks[0].kind == "entity_collection"
    assert blocks[0].data["total"] == 1
    assert blocks[0].data["items"][0]["id"] == 1056
    assert blocks[0].data["items"][0]["client_name"] == "Some Name"
    assert blocks[0].meta["table"]["columns"][0] == "order_scalar_id"


def test_generate_blocks_prioritizes_client_name_for_client_search():
    blocks = generate_blocks([
        {
            "tool": "list_orders",
            "params": {"q": "ana", "s": ["client_first_name", "client_last_name"]},
            "result": {
                "order": [
                    {
                        "id": 101,
                        "order_scalar_id": "101",
                        "client_first_name": "Ana",
                        "client_last_name": "Lopez",
                        "order_state_id": 2,
                        "client_address": {"street_address": "Main St 5"},
                        "total_items": 3,
                    }
                ],
                "order_stats": {"total": 1},
                "order_pagination": {"has_more": False},
            },
        }
    ])

    assert blocks[0].meta["table"]["columns"] == [
        "client_name",
        "order_scalar_id",
        "status",
        "street_address",
    ]


def test_generate_blocks_maps_plan_and_route_tables_with_columns():
    blocks = generate_blocks([
        {
            "tool": "list_plans",
            "params": {"label": "Morning"},
            "result": {
                "delivery_plans": [
                    {
                        "id": 91,
                        "label": "Morning route",
                        "plan_type": "local_delivery",
                        "start_date": "2026-03-21T08:00:00Z",
                        "end_date": "2026-03-21T12:00:00Z",
                        "state_id": 2,
                        "total_orders": 4,
                    }
                ],
            },
        },
        {
            "tool": "list_routes",
            "params": {"plan_id": 91},
            "result": {
                "routes": [
                    {
                        "id": 501,
                        "local_delivery_plan_id": 91,
                        "driver_id": 7,
                        "is_selected": True,
                        "stops": [{"id": 1}, {"id": 2}],
                        "delivery_plan": {"label": "Morning route"},
                    }
                ],
            },
        },
    ])

    assert blocks[0].layout == "table"
    assert blocks[0].meta["table"]["columns"][0] == "plan_name"
    assert blocks[1].layout == "table"
    assert blocks[1].meta["table"]["columns"][0] == "plan_name"


def test_generate_blocks_falls_back_for_unknown_tool():
    blocks = generate_blocks([
        {
            "tool": "custom_tool",
            "params": {"foo": "bar"},
            "result": {"value": 1},
        }
    ])

    assert len(blocks) == 1
    assert blocks[0].kind == "summary"
    assert blocks[0].entity_type == "generic"
    assert blocks[0].data["tool"] == "custom_tool"


def test_format_response_uses_interactions_override():
    response = format_response(
        "thr_123",
        "I need contact details.",
        [],
        interactions_override=[
            AIInteraction(
                id="int_clarify_create_order_contact",
                kind="question",
                label="Add customer contact details",
                required=True,
                response_mode="form",
                payload={"at_least_one_of": ["client_email", "client_phone"]},
                fields=[
                    {"id": "client_email", "label": "Customer email", "type": "email"},
                    {"id": "client_phone", "label": "Customer phone", "type": "tel"},
                ],
            )
        ],
    )

    assert response.message.interactions[0].id == "int_clarify_create_order_contact"
    assert response.message.interactions[0].response_mode == "form"


def test_generate_blocks_maps_plan_creation_and_assignment():
    blocks = generate_blocks([
        {
            "tool": "create_plan",
            "params": {
                "label": "Morning route",
                "start_date": "2026-03-21T08:00:00Z",
                "end_date": "2026-03-21T12:00:00Z",
            },
            "result": {
                "plan_id": 91,
                "label": "Morning route",
                "plan_type": "local_delivery",
                "start_date": "2026-03-21T08:00:00Z",
                "end_date": "2026-03-21T12:00:00Z",
            },
        },
        {
            "tool": "assign_orders_to_plan",
            "params": {"plan_id": 91, "order_ids": [10, 11]},
            "result": {
                "status": "assigned",
                "plan_id": 91,
                "requested": 2,
                "assigned": 2,
            },
        },
    ])

    assert [block.kind for block in blocks] == ["entity_detail", "summary"]
    assert blocks[0].entity_type == "plan"
    assert blocks[0].data["id"] == 91
    assert blocks[1].data["assigned"] == 2
    assert blocks[1].data["plan_id"] == 91


def test_generate_blocks_maps_order_mutations_and_items():
    blocks = generate_blocks([
        {
            "tool": "update_order_state",
            "params": {"order_ids": [42, 43], "state_name": "Completed"},
            "result": {
                "status": "updated",
                "state": "Completed",
                "order_ids": [42, 43],
                "count": 2,
            },
        },
        {
            "tool": "update_order",
            "params": {"order_id": 42, "fields": {"client_first_name": "Anna"}},
            "result": {
                "status": "updated",
                "order_id": 42,
                "updated_fields": ["client_first_name"],
            },
        },
        {
            "tool": "add_items_to_order",
            "params": {"order_id": 42},
            "result": {
                "status": "added",
                "order_id": 42,
                "items_added": 1,
                "result": [{"id": 1, "item_type": "table"}],
            },
        },
    ])

    assert [block.kind for block in blocks] == ["summary", "entity_detail", "entity_detail"]
    assert blocks[0].data["state"] == "Completed"
    assert blocks[1].data["updated_fields"] == ["client_first_name"]
    assert blocks[2].data["items_added"] == 1


def test_generate_blocks_maps_item_search_and_plan_optimization():
    blocks = generate_blocks([
        {
            "tool": "search_item_types",
            "params": {"q": "table"},
            "result": {
                "item_types": [
                    {
                        "item_type": "table",
                        "sample_article_number": "table-ab12cd",
                        "properties_template": {"extensions": 0},
                    }
                ],
                "count": 1,
                "matched": True,
            },
        },
        {
            "tool": "optimize_plan",
            "params": {"local_delivery_plan_id": 77},
            "result": {
                "status": "optimized",
                "route_id": 501,
                "total_distance_meters": 12345,
                "total_travel_time_seconds": 3600,
            },
        },
    ])

    assert [block.kind for block in blocks] == ["entity_collection", "summary"]
    assert blocks[0].layout == "chips"
    assert blocks[0].data["items"][0]["item_type"] == "table"
    assert blocks[1].data["plan_id"] == 77
    assert blocks[1].data["route_id"] == 501


def test_format_response_keeps_legacy_data_while_adding_blocks():
    response = format_response(
        "thr_123",
        "Created order #42 for Anna.",
        [
            {
                "tool": "create_order",
                "params": {"client_first_name": "Anna"},
                "result": {"status": "created", "order_id": 42, "items_created": 0},
            }
        ],
        data={"legacy": True},
    )

    assert response.thread_id == "thr_123"
    assert response.message.content == "Created order #42 for Anna."
    assert response.message.data == {"legacy": True}
    assert len(response.message.blocks) == 1
    assert response.message.blocks[0].kind == "entity_detail"


# ---------------------------------------------------------------------------
# Interaction generation tests (Phase 1: continue_prompt)
# ---------------------------------------------------------------------------

def test_generate_interactions_returns_continue_prompt_for_list_orders_with_results():
    """Phase 1: list_orders with results should generate continue_prompt interactions."""
    tool_turns = [
        {
            "tool": "list_orders",
            "params": {},
            "result": {
                "count": 5,
                "orders": [
                    {"id": 1, "client_first_name": "Ana", "order_scalar_id": "ORD-001"},
                    {"id": 2, "client_first_name": "Ana", "order_scalar_id": "ORD-002"},
                    {"id": 3, "client_first_name": "Bob", "order_scalar_id": "ORD-003"},
                    {"id": 4, "client_first_name": "Bob", "order_scalar_id": "ORD-004"},
                    {"id": 5, "client_first_name": "Bob", "order_scalar_id": "ORD-005"},
                ],
            },
        }
    ]

    interactions = generate_interactions(tool_turns)

    # Should have at least one continue_prompt for refining search
    assert len(interactions) > 0
    assert all(i.kind == "continue_prompt" for i in interactions)
    assert any(i.label == "Refine search" for i in interactions)


def test_generate_interactions_returns_continue_prompt_for_unscheduled_orders():
    """Phase 1: unscheduled orders should generate continue_prompt for scheduling."""
    tool_turns = [
        {
            "tool": "list_orders",
            "params": {"scheduled": False},  # unscheduled filter
            "result": {
                "count": 12,
                "orders": [{"id": i, "client_first_name": f"Customer{i}", "order_scalar_id": f"ORD-{i:03d}"} for i in range(1, 13)],
            },
        }
    ]

    interactions = generate_interactions(tool_turns)

    # Should have continue_prompt for scheduling
    assert len(interactions) > 0
    assert any(i.kind == "continue_prompt" and i.label == "Schedule these" for i in interactions)
    schedule_prompt = next(i for i in interactions if i.label == "Schedule these")
    assert schedule_prompt.payload.get("unscheduled_count") == 12


def test_generate_interactions_returns_continue_prompt_for_list_plans():
    """Phase 1: list_plans with results should generate continue_prompt."""
    tool_turns = [
        {
            "tool": "list_plans",
            "params": {},
            "result": {
                "count": 3,
                "delivery_plans": [
                    {"id": 1, "label": "Monday Delivery", "plan_type": "local_delivery"},
                    {"id": 2, "label": "Tuesday Delivery", "plan_type": "local_delivery"},
                    {"id": 3, "label": "Express", "plan_type": "international_shipping"},
                ],
            },
        }
    ]

    interactions = generate_interactions(tool_turns)

    # Should have continue_prompt for searching plans
    assert len(interactions) > 0
    assert any(i.kind == "continue_prompt" and i.label == "Search plans" for i in interactions)


def test_generate_interactions_returns_continue_prompt_for_list_routes():
    """Phase 1: list_routes with results should generate continue_prompt."""
    tool_turns = [
        {
            "tool": "list_routes",
            "params": {"plan_id": 123},
            "result": {
                "count": 2,
                "routes": [
                    {"id": 1, "plan_id": 123, "driver_id": 10, "is_selected": True},
                    {"id": 2, "plan_id": 123, "driver_id": 11, "is_selected": False},
                ],
            },
        }
    ]

    interactions = generate_interactions(tool_turns)

    # Should have continue_prompt for viewing route details
    assert len(interactions) > 0
    assert any(i.kind == "continue_prompt" and i.label == "View route details" for i in interactions)


def test_generate_interactions_no_results_for_empty_lists():
    """Phase 1: empty list results should not generate continue_prompt."""
    tool_turns = [
        {
            "tool": "list_orders",
            "params": {"q": "nonexistent"},
            "result": {
                "count": 0,
                "orders": [],
            },
        }
    ]

    interactions = generate_interactions(tool_turns)

    # Should have no interactions for empty results
    assert len(interactions) == 0


def test_generate_interactions_no_results_on_error():
    """Phase 1: errors should not generate interactions."""
    tool_turns = [
        {
            "tool": "list_orders",
            "params": {},
            "result": {
                "error": "Database connection failed",
            },
        }
    ]

    interactions = generate_interactions(tool_turns)

    # Should have no interactions on error
    assert len(interactions) == 0


def test_format_response_includes_interactions():
    """Phase 1: format_response should include interactions in the payload."""
    response = format_response(
        "thr_123",
        "Found 5 orders.",
        [
            {
                "tool": "list_orders",
                "params": {},
                "result": {
                    "count": 5,
                    "orders": [
                        {"id": 1, "client_first_name": "Ana", "order_scalar_id": "ORD-001"},
                        {"id": 2, "client_first_name": "Ana", "order_scalar_id": "ORD-002"},
                        {"id": 3, "client_first_name": "Bob", "order_scalar_id": "ORD-003"},
                        {"id": 4, "client_first_name": "Bob", "order_scalar_id": "ORD-004"},
                        {"id": 5, "client_first_name": "Bob", "order_scalar_id": "ORD-005"},
                    ],
                },
            }
        ],
    )

    # Response should include interactions
    assert hasattr(response.message, "interactions")
    assert isinstance(response.message.interactions, list)
    assert len(response.message.interactions) > 0
    # Verify interactions have the right structure
    for interaction in response.message.interactions:
        assert interaction.kind == "continue_prompt"
        assert interaction.label  # should have a label
        assert interaction.payload is not None


def test_generate_interactions_adds_plan_type_question_when_plan_types_are_ambiguous():
    tool_turns = [
        {
            "tool": "list_plans",
            "params": {},
            "result": {
                "delivery_plans": [
                    {"id": 1, "label": "A", "plan_type": "local_delivery"},
                    {"id": 2, "label": "B", "plan_type": "international_shipping"},
                ],
                "count": 2,
            },
        }
    ]

    interactions = generate_interactions(tool_turns)

    question = next((i for i in interactions if i.kind == "question"), None)
    assert question is not None
    assert question.required is True
    assert question.response_mode == "select"
    assert sorted(opt["id"] for opt in (question.options or [])) == [
        "international_shipping",
        "local_delivery",
    ]


def test_generate_interactions_adds_driver_question_when_routes_have_multiple_drivers():
    tool_turns = [
        {
            "tool": "list_routes",
            "params": {},
            "result": {
                "routes": [
                    {"id": 1, "driver_id": 10},
                    {"id": 2, "driver_id": 11},
                ],
                "count": 2,
            },
        }
    ]

    interactions = generate_interactions(tool_turns)

    question = next((i for i in interactions if i.id == "int_question_driver"), None)
    assert question is not None
    assert question.kind == "question"
    assert question.required is True
    assert question.response_mode == "select"


def test_generate_interactions_adds_confirm_for_large_order_state_update():
    tool_turns = [
        {
            "tool": "update_order_state",
            "params": {"order_ids": [1, 2, 3, 4, 5, 6], "state_name": "Completed"},
            "result": {"count": 6, "state": "Completed", "order_ids": [1, 2, 3, 4, 5, 6]},
        }
    ]

    interactions = generate_interactions(tool_turns)

    confirm = next((i for i in interactions if i.kind == "confirm"), None)
    assert confirm is not None
    assert confirm.required is True
    assert confirm.response_mode == "confirm"
    assert confirm.payload.get("target_count") == 6
    assert confirm.payload.get("operation") == "update_order_state"


def test_generate_interactions_adds_confirm_for_large_assign_batch():
    tool_turns = [
        {
            "tool": "assign_orders_to_plan",
            "params": {"plan_id": 99, "order_ids": list(range(1, 55))},
            "result": {"assigned": 54, "plan_id": 99},
        }
    ]

    interactions = generate_interactions(tool_turns)

    confirm = next((i for i in interactions if i.id == "int_confirm_assign_orders"), None)
    assert confirm is not None
    assert confirm.kind == "confirm"
    assert confirm.required is True
    assert confirm.payload.get("plan_id") == 99

