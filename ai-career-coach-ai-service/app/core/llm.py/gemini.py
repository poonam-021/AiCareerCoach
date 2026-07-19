from langchain_groq import ChatGroq

from app.core.config import settings


_PRIMARY_MODEL = settings.MODEL_NAME           # e.g. "llama-3.3-70b-versatile"
_FALLBACK_MODEL = "llama-3.1-8b-instant"


def _make_llm(model: str) -> ChatGroq:
    """
    Create Groq LLM instance (lazy — uses key at call time)
    """

    return ChatGroq(
        model=model,
        api_key=settings.GROQ_API_KEY,
        temperature=0.2,
    )


def get_llm(use_fallback: bool = False) -> ChatGroq:
    """
    Return Groq model. Always creates a fresh instance so the
    API key is resolved at call time (not at import time).
    """

    if not settings.GROQ_API_KEY:
        raise ValueError(
            "GROQ_API_KEY is missing in .env"
        )

    if use_fallback:
        return _make_llm(_FALLBACK_MODEL)

    return _make_llm(_PRIMARY_MODEL)


# Module-level aliases kept for backwards compatibility
llm = None          # use get_llm() instead
llm_fallback = None # use get_llm(use_fallback=True) instead