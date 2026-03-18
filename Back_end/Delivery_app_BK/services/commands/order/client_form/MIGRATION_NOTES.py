"""
TODO: Alembic migration — add client form token fields to orders table.

Fields to add:
  client_form_token          VARCHAR(64)   UNIQUE  NULLABLE
  client_form_token_expires_at  TIMESTAMP   NULLABLE
  client_form_submitted_at   TIMESTAMP   NULLABLE

Steps:
  1. Run: flask db migrate -m "add client form token fields to orders"
  2. Review the generated migration file.
  3. Run: flask db upgrade
"""
