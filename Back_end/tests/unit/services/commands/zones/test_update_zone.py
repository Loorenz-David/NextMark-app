from types import SimpleNamespace

import pytest

from Delivery_app_BK import create_app
from Delivery_app_BK.errors import NotFound, ValidationFailed
from Delivery_app_BK.services.commands.zones.update_zone import update_zone
from Delivery_app_BK.services.context import ServiceContext


@pytest.fixture
def app_ctx():
    app = create_app("testing")
    with app.app_context():
        yield


def _ctx(incoming_data: dict) -> ServiceContext:
    return ServiceContext(incoming_data=incoming_data, identity={"active_team_id": 1})


def test_update_zone_success_partial_update(monkeypatch):
    zone = SimpleNamespace(
        id=7,
        team_id=1,
        zone_version_id=12,
        city_key="stockholm",
        name="Old Name",
        zone_type="user",
        centroid_lat=59.3,
        centroid_lng=18.0,
        geometry={"type": "Polygon", "coordinates": []},
        min_lat=59.0,
        max_lat=59.5,
        min_lng=17.8,
        max_lng=18.2,
        is_active=True,
        created_at=None,
    )
    version = SimpleNamespace(id=12, team_id=1, is_active=False)

    monkeypatch.setattr("Delivery_app_BK.services.commands.zones.update_zone.db.session.get", lambda model, pk: zone if model.__name__ == "Zone" else version)
    committed = {"value": False}
    monkeypatch.setattr("Delivery_app_BK.services.commands.zones.update_zone.db.session.commit", lambda: committed.update(value=True))

    result = update_zone(_ctx({"zone_id": 7, "version_id": 12, "name": "  Zone North  "}))

    assert result["id"] == 7
    assert result["name"] == "Zone North"
    assert committed["value"] is True


def test_update_zone_rejects_active_version(monkeypatch):
    zone = SimpleNamespace(id=7, team_id=1, zone_version_id=12)
    version = SimpleNamespace(id=12, team_id=1, is_active=True)

    monkeypatch.setattr("Delivery_app_BK.services.commands.zones.update_zone.db.session.get", lambda model, pk: zone if model.__name__ == "Zone" else version)

    with pytest.raises(ValidationFailed, match="Cannot edit zones in an active version"):
        update_zone(_ctx({"zone_id": 7, "version_id": 12, "name": "Zone"}))


def test_update_zone_raises_not_found_for_team_mismatch(monkeypatch):
    zone = SimpleNamespace(id=7, team_id=999, zone_version_id=12)

    monkeypatch.setattr("Delivery_app_BK.services.commands.zones.update_zone.db.session.get", lambda model, pk: zone)

    with pytest.raises(NotFound):
        update_zone(_ctx({"zone_id": 7}))
