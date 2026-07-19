from langgraph.checkpoint.redis import RedisSaver

from app.core.config import settings

_checkpointer = None


def get_checkpointer():
    global _checkpointer

    if _checkpointer is None:
        _checkpointer = RedisSaver(
            redis_url=settings.REDIS_URL,
            checkpoint_prefix="checkpoint",
            checkpoint_write_prefix="checkpoint_write",
        )

        # IMPORTANT
        _checkpointer.setup()

    return _checkpointer