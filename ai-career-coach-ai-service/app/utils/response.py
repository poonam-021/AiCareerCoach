"""
Standard API response formatter for all FastAPI endpoints.
Every response follows the same envelope structure.
"""
import time
from datetime import datetime, timezone
from typing import Any


_request_start_times: dict[str, float] = {}


def success_response(data: Any, message: str = "Operation completed", execution_time: str = None) -> dict:
    """
    Build a successful API response envelope.
    """
    return {
        "success": True,
        "message": message,
        "data": data,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "execution_time": execution_time or "N/A",
    }


def error_response(message: str, details: Any = None, execution_time: str = None) -> dict:
    """
    Build an error API response envelope.
    """
    return {
        "success": False,
        "message": message,
        "data": details or {},
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "execution_time": execution_time or "N/A",
    }


class Timer:
    """
    Context manager / stopwatch for measuring execution time.

    Usage:
        with Timer() as t:
            do_work()
        print(t.elapsed)   # "1.23s"
    """

    def __init__(self):
        self.start = None
        self.elapsed = None

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, *args):
        elapsed_sec = time.perf_counter() - self.start
        self.elapsed = f"{elapsed_sec:.2f}s"
