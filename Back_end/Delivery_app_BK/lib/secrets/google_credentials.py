import os
import json
import boto3
from functools import lru_cache


SECRET_NAME = "prod/google/service-account"
REGION = "eu-north-1"


@lru_cache()
def get_google_credentials_dict():
    """
    Load Google service account credentials.

    Priority:
    1. Local environment variable (for dev)
    2. AWS Secrets Manager (for production)
    """

    # ✅ 1. Local fallback (development)
    local_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if local_json:
        try:
            return json.loads(local_json)
        except Exception as exc:
            raise RuntimeError(f"Invalid GOOGLE_SERVICE_ACCOUNT_JSON: {exc}") from exc

    # ✅ 2. AWS Secrets Manager (production)
    try:
        client = boto3.client("secretsmanager", region_name=REGION)
        response = client.get_secret_value(SecretId=SECRET_NAME)
    except Exception as exc:
        raise RuntimeError(f"Failed to fetch secret from AWS: {exc}") from exc

    secret_string = response.get("SecretString")
    if not secret_string:
        raise RuntimeError("SecretString not found in AWS response")

    try:
        return json.loads(secret_string)
    except Exception as exc:
        raise RuntimeError(f"Invalid JSON in AWS secret: {exc}") from exc