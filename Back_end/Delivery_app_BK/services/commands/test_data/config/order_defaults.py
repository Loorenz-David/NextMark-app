from __future__ import annotations

from datetime import datetime, timedelta, timezone


DEFAULT_ORDERS_PER_PLAN_TYPE = 5
DEFAULT_LOCAL_DELIVERY_ORDERS_PER_PLAN_MIN = 10
DEFAULT_LOCAL_DELIVERY_ORDERS_PER_PLAN_MAX = 20
DEFAULT_ORDER_PLAN_TYPES = (
    "local_delivery",
    "store_pickup",
    "international_shipping",
)


def build_default_order_templates_by_plan_type() -> dict[str, list[dict]]:
    """Return editable defaults with 5 unique order templates per plan type."""
    return {
        "local_delivery": [
            _build_order_template(
                reference_number="test-LD-001",
                first_name="Erik",
                last_name="Lindqvist",
                email="erik.lindqvist+ld001@testdata.dev",
                prefix="+46",
                number="705550101",
                street_address="Drottninggatan 71",
                city="Stockholm",
                postal_code="111 36",
                country="SE",
                lat=59.3348,
                lng=18.0635,
                operation_type="dropoff",
            ),
            _build_order_template(
                reference_number="test-LD-002",
                first_name="Sara",
                last_name="Johansson",
                email="sara.johansson+ld002@testdata.dev",
                prefix="+46",
                number="705550102",
                street_address="Götgatan 78",
                city="Stockholm",
                postal_code="118 30",
                country="SE",
                lat=59.3168,
                lng=18.0712,
                operation_type="dropoff",
            ),
            _build_order_template(
                reference_number="test-LD-003",
                first_name="Lars",
                last_name="Eriksson",
                email="lars.eriksson+ld003@testdata.dev",
                prefix="+46",
                number="705550103",
                street_address="Birger Jarlsgatan 58",
                city="Stockholm",
                postal_code="114 29",
                country="SE",
                lat=59.3394,
                lng=18.0706,
                operation_type="dropoff",
            ),
            _build_order_template(
                reference_number="test-LD-004",
                first_name="Anna",
                last_name="Berg",
                email="anna.berg+ld004@testdata.dev",
                prefix="+46",
                number="705550104",
                street_address="Odengatan 43",
                city="Stockholm",
                postal_code="113 51",
                country="SE",
                lat=59.3467,
                lng=18.0518,
                operation_type="dropoff",
            ),
            _build_order_template(
                reference_number="test-LD-005",
                first_name="Johan",
                last_name="Svensson",
                email="johan.svensson+ld005@testdata.dev",
                prefix="+46",
                number="705550105",
                street_address="Hornsgatan 124",
                city="Stockholm",
                postal_code="117 28",
                country="SE",
                lat=59.3173,
                lng=18.0478,
                operation_type="dropoff",
            ),
        ],
        "store_pickup": [
            _build_order_template(
                reference_number="test-SP-001",
                first_name="Maja",
                last_name="Carlsson",
                email="maja.carlsson+sp001@testdata.dev",
                prefix="+46",
                number="705550201",
                street_address="Sveavägen 80",
                city="Stockholm",
                postal_code="113 59",
                country="SE",
                lat=59.3421,
                lng=18.0500,
                operation_type="pickup",
            ),
            _build_order_template(
                reference_number="test-SP-002",
                first_name="Oscar",
                last_name="Nilsson",
                email="oscar.nilsson+sp002@testdata.dev",
                prefix="+46",
                number="705550202",
                street_address="Hantverkargatan 54",
                city="Stockholm",
                postal_code="112 31",
                country="SE",
                lat=59.3328,
                lng=18.0380,
                operation_type="pickup",
            ),
            _build_order_template(
                reference_number="test-SP-003",
                first_name="Emma",
                last_name="Andersson",
                email="emma.andersson+sp003@testdata.dev",
                prefix="+46",
                number="705550203",
                street_address="Folkungagatan 112",
                city="Stockholm",
                postal_code="116 30",
                country="SE",
                lat=59.3140,
                lng=18.0774,
                operation_type="pickup",
            ),
            _build_order_template(
                reference_number="test-SP-004",
                first_name="Filip",
                last_name="Gustafsson",
                email="filip.gustafsson+sp004@testdata.dev",
                prefix="+46",
                number="705550204",
                street_address="Vasagatan 11",
                city="Stockholm",
                postal_code="111 20",
                country="SE",
                lat=59.3328,
                lng=18.0556,
                operation_type="pickup",
            ),
            _build_order_template(
                reference_number="test-SP-005",
                first_name="Lina",
                last_name="Pettersson",
                email="lina.pettersson+sp005@testdata.dev",
                prefix="+46",
                number="705550205",
                street_address="Danviksvägen 18",
                city="Nacka",
                postal_code="131 30",
                country="SE",
                lat=59.3183,
                lng=18.1227,
                operation_type="pickup",
            ),
        ],
        "international_shipping": [
            _build_order_template(
                reference_number="test-IS-001",
                first_name="Axel",
                last_name="Magnusson",
                email="axel.magnusson+is001@testdata.dev",
                prefix="+46",
                number="705550301",
                street_address="Frihamnsallén 10",
                city="Stockholm",
                postal_code="115 56",
                country="SE",
                lat=59.3519,
                lng=18.1002,
                operation_type="dropoff",
            ),
            _build_order_template(
                reference_number="test-IS-002",
                first_name="Frida",
                last_name="Olsson",
                email="frida.olsson+is002@testdata.dev",
                prefix="+46",
                number="705550302",
                street_address="Värtahamnen 1",
                city="Stockholm",
                postal_code="115 21",
                country="SE",
                lat=59.3577,
                lng=18.1036,
                operation_type="dropoff",
            ),
            _build_order_template(
                reference_number="test-IS-003",
                first_name="Viktor",
                last_name="Persson",
                email="viktor.persson+is003@testdata.dev",
                prefix="+46",
                number="705550303",
                street_address="Ulvsundavägen 170",
                city="Stockholm",
                postal_code="168 74",
                country="SE",
                lat=59.3533,
                lng=17.9748,
                operation_type="dropoff",
            ),
            _build_order_template(
                reference_number="test-IS-004",
                first_name="Hanna",
                last_name="Larsson",
                email="hanna.larsson+is004@testdata.dev",
                prefix="+46",
                number="705550304",
                street_address="Lövholmsgränd 1",
                city="Stockholm",
                postal_code="117 43",
                country="SE",
                lat=59.3063,
                lng=18.0137,
                operation_type="dropoff",
            ),
            _build_order_template(
                reference_number="test-IS-005",
                first_name="Gustav",
                last_name="Hansson",
                email="gustav.hansson+is005@testdata.dev",
                prefix="+46",
                number="705550305",
                street_address="Arstaängsvägen 9",
                city="Stockholm",
                postal_code="117 43",
                country="SE",
                lat=59.3035,
                lng=18.0438,
                operation_type="dropoff",
            ),
        ],
    }


def build_default_delivery_window_for_slot(
    *,
    start_date_utc: datetime | None,
    order_index: int,
    now_utc: datetime | None = None,
) -> list[dict]:
    """Build one UTC delivery window in the future for a given slot index."""
    now_reference = now_utc or datetime.now(timezone.utc)
    base_date = (start_date_utc or now_reference).date()
    if base_date <= now_reference.date():
        base_date = (now_reference + timedelta(days=1)).date()

    base_start = datetime.combine(base_date, datetime.min.time(), tzinfo=timezone.utc)
    slot_start = base_start + timedelta(hours=9 + order_index)
    slot_end = slot_start + timedelta(hours=1)

    return [
        {
            "start_at": slot_start.isoformat(),
            "end_at": slot_end.isoformat(),
            "window_type": "TIME_RANGE",
        }
    ]


def _build_order_template(
    *,
    reference_number: str,
    first_name: str,
    last_name: str,
    email: str,
    prefix: str,
    number: str,
    street_address: str,
    city: str,
    postal_code: str,
    country: str = "SE",
    lat: float,
    lng: float,
    operation_type: str,
) -> dict:
    return {
        "reference_number": reference_number,
        "client_first_name": first_name,
        "client_last_name": last_name,
        "client_email": email,
        "client_primary_phone": {
            "prefix": prefix,
            "number": number,
        },
        "client_address": {
            "street_address": street_address,
            "postal_code": postal_code,
            "country": country,
            "city": city,
            "coordinates": {
                "lat": lat,
                "lng": lng,
            },
        },
        "operation_type": operation_type,
        "marketing_messages": False,
    }


__all__ = [
    "DEFAULT_ORDERS_PER_PLAN_TYPE",
    "DEFAULT_LOCAL_DELIVERY_ORDERS_PER_PLAN_MIN",
    "DEFAULT_LOCAL_DELIVERY_ORDERS_PER_PLAN_MAX",
    "DEFAULT_ORDER_PLAN_TYPES",
    "build_default_order_templates_by_plan_type",
    "build_default_delivery_window_for_slot",
]