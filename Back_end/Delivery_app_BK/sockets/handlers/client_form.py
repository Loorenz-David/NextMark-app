"""
Socket.IO handler for client_form:submitted.

The `client_form:submitted` event is emitted server-side from the HTTP endpoint
(submit_client_form service) directly to the team admin room — no client-side
socket event is needed from the public form app.

This file registers the room-name helper and documents the event contract,
but the actual emit lives in the HTTP handler (submit_client_form.py).

Event: SERVER_EVENT_CLIENT_FORM_SUBMITTED → "client_form:submitted"
Room:  build_team_admin_room(team_id)     → "team:{team_id}:admin"

Payload sent to admin room:
  {
    "order_id": int,
    "order_reference": str,
  }

Admin-app listens via the clientForm channel in shared-realtime.
"""

# No socket handler registration needed here — the emit is triggered from
# the HTTP POST /public/client-form/<token> endpoint after a successful write.
# This file exists for documentation and future extension (e.g. join/leave rooms
# for per-order notifications).
