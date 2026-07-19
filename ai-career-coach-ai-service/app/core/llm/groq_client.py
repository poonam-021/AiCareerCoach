import time
import logging

from langchain_groq import ChatGroq

from app.core.config import settings

logger = logging.getLogger(__name__)

# Groq/Llama-3.3 model configuration (reads from .env MODEL_NAME)
# Default: llama-3.3-70b-versatile
_PRIMARY_MODEL  = settings.MODEL_NAME          # e.g. "llama-3.3-70b-versatile"
_FALLBACK_MODEL = "llama-3.1-8b-instant"       # lightweight fallback

_INTER_CALL_DELAY = 0   # Groq is generous on rate limits; no artificial delay needed
_MAX_RETRIES      = 3
_RETRY_BASE_DELAY = 5   # seconds base (multiplied per attempt)

# Set to True when quota is confirmed exhausted — uses mock data instantly
_QUOTA_EXHAUSTED = False


def _make_llm(model: str) -> ChatGroq:
    return ChatGroq(
        model=model,
        api_key=settings.GROQ_API_KEY,
        temperature=0.2,
        max_retries=1,
    )


def get_llm(use_fallback: bool = False) -> ChatGroq:
    """
    Return a configured Groq LLM instance.
    Primary  : llama-3.3-70b-versatile  (default, configurable via MODEL_NAME env var)
    Fallback : llama-3.1-8b-instant     (lightweight fallback on model-not-found)
    """
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing in .env")
    return _make_llm(_FALLBACK_MODEL if use_fallback else _PRIMARY_MODEL)


def is_quota_exhausted() -> bool:
    return _QUOTA_EXHAUSTED


def invoke_with_retry(chain, inputs: dict, max_retries: int = _MAX_RETRIES):
    """
    Invoke a LangChain chain with:
    - Auto-retry on 429 rate limit with exponential back-off
    - Instant fallback to mock data on quota exhaustion
    - Auto model-swap to fallback on model-not-found errors
    """
    global _QUOTA_EXHAUSTED
    import re

    # If quota already known to be exhausted, skip immediately
    if _QUOTA_EXHAUSTED:
        raise QuotaExhaustedError("Daily quota exhausted — using mock data")

    if _INTER_CALL_DELAY:
        time.sleep(_INTER_CALL_DELAY)

    last_error = None

    for attempt in range(max_retries):
        try:
            return chain.invoke(inputs)

        except Exception as e:
            error_msg = str(e)
            last_error = e

            if "429" in error_msg or "rate_limit" in error_msg.lower() or "RESOURCE_EXHAUSTED" in error_msg:
                # Check if it's a hard daily limit
                if "tokens per day" in error_msg.lower() or "limit: 0" in error_msg:
                    print("[LLM] Daily quota exhausted. Switching to mock data mode.")
                    _QUOTA_EXHAUSTED = True
                    raise QuotaExhaustedError("Daily quota exhausted")

                # Per-minute limit — wait and retry
                delay = _RETRY_BASE_DELAY * (attempt + 1)
                m = re.search(r'"retryDelay"\s*:\s*"(\d+)s"', error_msg)
                if m:
                    delay = int(m.group(1)) + 3

                print(f"[LLM] Rate limit (attempt {attempt+1}/{max_retries}). Waiting {delay}s...")
                time.sleep(delay)

            elif "404" in error_msg or "NOT_FOUND" in error_msg or "model_not_found" in error_msg.lower():
                # Model unavailable — rebuild with fallback
                print(f"[LLM] Model not found. Switching to fallback: {_FALLBACK_MODEL}")
                try:
                    steps = list(chain.steps) if hasattr(chain, "steps") else []
                    if steps:
                        return (steps[0] | _make_llm(_FALLBACK_MODEL)).invoke(inputs)
                except Exception:
                    pass
                raise e

            else:
                raise e

    # All retries exhausted — try fallback model
    print(f"[LLM] Retries exhausted. Trying fallback: {_FALLBACK_MODEL}")
    try:
        steps = list(chain.steps) if hasattr(chain, "steps") else []
        if steps:
            return (steps[0] | _make_llm(_FALLBACK_MODEL)).invoke(inputs)
    except Exception as fe:
        print(f"[LLM] Fallback failed: {fe}")

    raise last_error


class QuotaExhaustedError(Exception):
    """Raised when the Groq API quota is exhausted."""
    pass


def list_available_models() -> list[str]:
    """List Groq models available for your API key."""
    try:
        from groq import Groq
        client = Groq(api_key=settings.GROQ_API_KEY)
        return [m.id for m in client.models.list().data]
    except Exception as e:
        logger.error(f"[LLM] Could not list models: {e}")
        return []


# Backward-compat aliases (not used internally)
llm = None
llm_fallback = None
