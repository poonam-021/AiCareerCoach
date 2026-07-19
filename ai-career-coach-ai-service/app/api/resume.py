"""
Resume-related API endpoints.
POST /resume/parse
POST /resume/score
POST /resume/ats
POST /resume/rewrite
"""
import logging
from fastapi import APIRouter

from app.schemas.requests import (
    ResumeParseRequest,
    ResumeScoreRequest,
    ResumeAtsRequest,
    ResumeRewriteRequest,
)
from app.agents import (
    resume_parser_agent,
    resume_scorer_agent,
    ats_checker_agent,
    resume_rewriter_agent,
)
from app.utils import success_response, error_response, Timer
from app.utils.json_parser import extract_json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/parse")
async def parse_resume(request: ResumeParseRequest):
    """Parse resume text and extract structured information."""
    with Timer() as t:
        try:
            raw = resume_parser_agent(request.resume_text)
            data = extract_json(raw) if isinstance(raw, str) else raw
            return success_response(data, "Resume parsed successfully", t.elapsed)
        except Exception as e:
            logger.error(f"[/resume/parse] Error: {e}", exc_info=True)
            return error_response(f"Resume parsing failed: {str(e)}", execution_time=t.elapsed)


@router.post("/score")
async def score_resume(request: ResumeScoreRequest):
    """Score resume quality, ATS compatibility and provide improvement suggestions."""
    with Timer() as t:
        try:
            data = resume_scorer_agent(request.resume_text, request.jd_text or "")
            return success_response(data, "Resume scored successfully", t.elapsed)
        except Exception as e:
            logger.error(f"[/resume/score] Error: {e}", exc_info=True)
            return error_response(f"Resume scoring failed: {str(e)}", execution_time=t.elapsed)


@router.post("/ats")
async def check_ats(request: ResumeAtsRequest):
    """Check ATS compatibility of resume against a job description."""
    with Timer() as t:
        try:
            data = ats_checker_agent(request.resume_text, request.jd_text)
            return success_response(data, "ATS check completed", t.elapsed)
        except Exception as e:
            logger.error(f"[/resume/ats] Error: {e}", exc_info=True)
            return error_response(f"ATS check failed: {str(e)}", execution_time=t.elapsed)


@router.post("/rewrite")
async def rewrite_resume(request: ResumeRewriteRequest):
    """Rewrite resume in ATS-optimized, professional format."""
    with Timer() as t:
        try:
            rewritten = resume_rewriter_agent(request.resume_text, request.jd_text)
            data = {"rewritten_resume": rewritten, "word_count": len(rewritten.split())}
            return success_response(data, "Resume rewritten successfully", t.elapsed)
        except Exception as e:
            logger.error(f"[/resume/rewrite] Error: {e}", exc_info=True)
            return error_response(f"Resume rewrite failed: {str(e)}", execution_time=t.elapsed)
