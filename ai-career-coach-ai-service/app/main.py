"""
AI Career Coach — FastAPI Application Entry Point

This is the AI microservice that works alongside the Spring Boot backend.
It exposes 12 REST APIs for AI-powered career coaching features.

Run with: uvicorn app.main:app --reload --port 8001
"""
import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import (
    resume_router,
    career_router,
    interview_router,
    workflow_router,
)
from app.utils import success_response

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown events)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AI Career Coach Service starting up...")
    logger.info(f"Groq LLM: {__import__('app.core.config', fromlist=['settings']).settings.MODEL_NAME}")
    logger.info("All 12 AI agents loaded")
    yield
    logger.info("AI Career Coach Service shutting down...")


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AI Career Coach - AI Microservice",
    description=(
        "Agentic AI backend for the AI Career Coach platform. "
        "Provides resume parsing, ATS analysis, career recommendations, "
        "skill gap analysis, learning roadmaps, interview preparation, "
        "and more via Groq LLM + LangGraph."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ---------------------------------------------------------------------------
# CORS — allow Spring Boot backend to call this service
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Lock down to Spring Boot URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request timing middleware
# ---------------------------------------------------------------------------

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed = time.perf_counter() - start
    response.headers["X-Process-Time"] = f"{elapsed:.3f}s"
    return response


# ---------------------------------------------------------------------------
# Global exception handler
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "data": {"error": str(exc)},
        }
    )


# ---------------------------------------------------------------------------
# Include routers
# ---------------------------------------------------------------------------

app.include_router(resume_router)
app.include_router(career_router)
app.include_router(interview_router)
app.include_router(workflow_router)


# ---------------------------------------------------------------------------
# Health & root endpoints
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
async def root():
    return success_response(
        {
            "service": "AI Career Coach - AI Microservice",
            "version": "1.0.0",
            "status": "running",
            "docs": "/docs",
        },
        "AI Career Coach service is running"
    )


@app.get("/health", tags=["Health"])
async def health():
    return success_response({"status": "healthy"}, "Service is healthy")


# ---------------------------------------------------------------------------
# Dev server entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
