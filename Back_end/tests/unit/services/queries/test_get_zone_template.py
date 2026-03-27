from datetime import datetime, timezone
from types import SimpleNamespace

import pytest

from Delivery_app_BK import create_app
from Delivery_app_BK.services.context import ServiceContext
from Delivery_app_BK.services.queries.zones import get_zone_template as module


class _QueryResult:
    def __init__(self, value):
        self._value = value

    def first(self):
        return self._value


@pytest.fixture
def app_ctx():
    app = create_app("testing")
    with app.app_context():
        yield


def test_get_zone_template_returns_none_without_zone_id():
    ctx = ServiceContext(query_params={}, identity={"active_team_id": 1})

    result = module.get_zone_template(ctx)

    assert result is None


def test_get_zone_template_returns_none_when_version_zone_mismatch(monkeypatch, app_ctx):
    ctx = ServiceContext(
        query_params={"zone_id": 7, "version_id": 12},
        identity={"active_team_id": 1},
    )

    monkeypatch.setattr(module.Zone, "query", SimpleNamespace(filter_by=lambda **kwargs: _QueryResult(None)), raising=False)

    result = module.get_zone_template(ctx)

    assert result is None


def test_get_zone_template_returns_serialized_active_template(monkeypatch, app_ctx):
    now = datetime.now(timezone.utc)
    ctx = ServiceContext(
        query_params={"zone_id": 7, "version_id": 12},
        identity={"active_team_id": 1},
    )

    template = SimpleNamespace(
        id=99,
        team_id=1,
        zone_id=7,
        name="North Default",
        config_json={"max_stops": 20},
        version=3,
        is_active=True,
        created_at=now,
        updated_at=now,
    )

    monkeypatch.setattr(
        module.Zone,
        "query",
        SimpleNamespace(filter_by=lambda **kwargs: _QueryResult(SimpleNamespace(id=7))),
        raising=False,
    )
    monkeypatch.setattr(
        module.ZoneTemplate,
        "query",
        SimpleNamespace(filter_by=lambda **kwargs: _QueryResult(template)),
        raising=False,
    )

    result = module.get_zone_template(ctx)

    assert result is not None
    assert result["id"] == 99
    assert result["zone_id"] == 7
    assert result["config_json"] == {"max_stops": 20}
    assert result["is_active"] is True
