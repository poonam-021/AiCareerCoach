"""
Interview-related API endpoints.
POST /interview/questions
POST /interview/evaluate
POST /cover-letter
"""
import logging
from fastapi import APIRouter

from app.schemas.requests import (
    InterviewQuestionsRequest,
    InterviewEvaluateRequest,
    CoverLetterRequest,
)
from app.agents import (
    interview_question_generator_agent,
    interview_evaluator_agent,
    cover_letter_agent,
)
from app.utils import success_response, error_response, Timer

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Interview & Cover Letter"])


@router.post("/interview/questions")
async def generate_interview_questions(request: InterviewQuestionsRequest):
    """Generate HR, technical, behavioral, coding and scenario interview questions."""
    with Timer() as t:
        try:
            data = interview_question_generator_agent(
                request.resume_text,
                request.jd_text,
                request.difficulty
            )
            return success_response(data, "Interview questions generated", t.elapsed)
        except Exception as e:
            logger.error(f"[/interview/questions] Error: {e}", exc_info=True)
            return error_response(f"Question generation failed: {str(e)}", execution_time=t.elapsed)


@router.post("/interview/evaluate")
async def evaluate_interview_answer(request: InterviewEvaluateRequest):
    """Evaluate a candidate's interview answer and provide detailed feedback."""
    with Timer() as t:
        try:
            data = interview_evaluator_agent(
                request.question,
                request.answer,
                request.expected_role or "Software Developer"
            )
            return success_response(data, "Interview answer evaluated", t.elapsed)
        except Exception as e:
            logger.error(f"[/interview/evaluate] Error: {e}", exc_info=True)
            return error_response(f"Evaluation failed: {str(e)}", execution_time=t.elapsed)


@router.post("/cover-letter")
async def generate_cover_letter(request: CoverLetterRequest):
    """Generate a professional, tailored cover letter."""
    with Timer() as t:
        try:
            data = cover_letter_agent(
                request.resume_text,
                request.jd_text,
                request.company_name or ""
            )
            return success_response(data, "Cover letter generated", t.elapsed)
        except Exception as e:
            logger.error(f"[/cover-letter] Error: {e}", exc_info=True)
            return error_response(f"Cover letter generation failed: {str(e)}", execution_time=t.elapsed)
