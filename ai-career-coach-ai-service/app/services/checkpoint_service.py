import json

from redis import Redis

from app.core.config import settings

_redis_client = None


def _get_redis() -> Redis:
    """
    Lazy Redis client - created only on first use so import never crashes.
    """
    global _redis_client

    if _redis_client is None:
        _redis_client = Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )

    return _redis_client


def save_checkpoint(state: dict) -> None:
    """
    Save workflow state in Redis after every node.
    State can be a plain dict (TypedDict) or any dict-like object.
    """

    try:
        redis = _get_redis()

        report_id = state.get("analysisReportId", "unknown")
        key = f"checkpoint:{report_id}"

        # Serialize - handle any non-serializable values gracefully
        redis.set(key, json.dumps(state, default=str))

        print(f"[CHECKPOINT SAVED] -> {key}  |  step={state.get('currentStep')}")

    except Exception as e:
        # Never crash the workflow just because Redis failed
        print(f"[CHECKPOINT WARN] Save Failed (Redis): {e}")


def load_checkpoint(report_id) -> dict | None:
    """
    Load the latest checkpoint for a given report ID.
    Returns None if not found or Redis is unavailable.
    """

    try:
        redis = _get_redis()

        key = f"checkpoint:{report_id}"
        data = redis.get(key)

        if data:
            return json.loads(data)

    except Exception as e:
        print(f"[CHECKPOINT WARN] Load Failed (Redis): {e}")

    return None


def delete_checkpoint(report_id) -> None:
    """
    Delete checkpoint for a given report ID.
    """

    try:
        redis = _get_redis()
        redis.delete(f"checkpoint:{report_id}")
        print(f"[CHECKPOINT DELETED] -> checkpoint:{report_id}")

    except Exception as e:
        print(f"[CHECKPOINT WARN] Delete Failed (Redis): {e}")