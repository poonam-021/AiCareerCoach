"""
Full workflow API endpoint.
POST /workflow/run - Runs the complete LangGraph pipeline.
"""
import logging
import uuid
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional

from app.workflow.graph import graph
from app.services.checkpoint_service import load_checkpoint, save_checkpoint
from app.utils import success_response, error_response, Timer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/workflow", tags=["Workflow"])


class WorkflowRunRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    jd_text: str = Field(..., min_length=20)
    analysis_report_id: Optional[int] = None
    difficulty: str = Field(default="MEDIUM", pattern="^(EASY|MEDIUM|HARD)$")
    company_name: Optional[str] = None


def _build_response_data(result: dict, report_id: int) -> dict:
    """
    Extract all node outputs from the final workflow state into a clean
    response dict. This is the contract Spring Boot is built against.
    """
    return {
        "analysis_report_id": report_id,
        "status": result.get("status", "COMPLETED"),
        "completed_steps": result.get("completedSteps", []),

        # Parsing
        "parsed_resume": result.get("parsedResume"),
        "parsed_jd": result.get("parsedJd"),

        # Scoring & analysis
        "resume_score": result.get("resumeScore"),
        "ats_result": result.get("atsResult"),
        "skill_gap": result.get("skillGap"),

        # Recommendations
        "career_roles": result.get("careerRoles"),
        "roadmap": result.get("roadmap"),
        "projects": result.get("projects"),
        "courses": result.get("courses"),

        # Decision & content generation
        "recruiter_decision": result.get("recruiterDecision"),
        "recruiter_reasoning": result.get("recruiterReasoning"),
        "cover_letter": result.get("coverLetter"),
        "email_draft": result.get("emailDraft"),
        "feedback": result.get("feedback"),
    }


@router.post("/run")
async def run_workflow(request: WorkflowRunRequest):
    """
    Run the complete AI Career Coach workflow.

    Executes the full LangGraph pipeline:
      parseResume → parseJd → resumeScore → atsCheck → skillGap →
      careerRecommend → roadmap → projectRecommend → courseRecommend →
      recruiter → coverLetter → email → feedback

    Returns all analysis results in a single response.

    On node-level failure, /workflow/run attempts to read the last good
    Redis checkpoint and returns a partial result rather than a blank 500.
    """
    with Timer() as t:
        report_id = request.analysis_report_id or int(str(uuid.uuid4().int)[:8])
        thread_id = str(report_id)

        initial_state = {
            "analysisReportId": report_id,
            "resumeText": request.resume_text,
            "jdText": request.jd_text,
            "difficulty": request.difficulty,
            "companyName": request.company_name or "",
            "completedSteps": [],
            "status": "IN_PROGRESS",
        }

        config = {"configurable": {"thread_id": thread_id}}

        try:
            result = graph.invoke(initial_state, config=config)

            data = _build_response_data(result, report_id)

            if result.get("error"):
                return error_response(
                    f"Workflow completed with errors: {result['error']}",
                    details=data,
                    execution_time=t.elapsed,
                )

            return success_response(data, "AI workflow completed successfully", t.elapsed)

        except Exception as e:
            logger.error(f"[/workflow/run] Graph execution failed: {e}", exc_info=True)

            # -------------------------------------------------------------------
            # Checkpoint read-on-failure: if any nodes completed before the crash,
            # their state was written to Redis by checkpoint_service.save_checkpoint().
            # Fetch the last good snapshot and return a partial result so the
            # caller gets everything that succeeded rather than an empty error.
            # -------------------------------------------------------------------
            partial_result = None
            try:
                partial_result = load_checkpoint(report_id)
                if partial_result:
                    logger.info(
                        f"[/workflow/run] Returning partial result from Redis checkpoint "
                        f"(completed_steps={partial_result.get('completedSteps', [])})"
                    )
            except Exception as redis_err:
                logger.warning(f"[/workflow/run] Could not load checkpoint from Redis: {redis_err}")

            if partial_result:
                data = _build_response_data(partial_result, report_id)
                data["status"] = "PARTIAL"
                return error_response(
                    f"Workflow failed at step '{partial_result.get('currentStep', 'unknown')}': {str(e)}. "
                    f"Partial results from completed steps are included.",
                    details=data,
                    execution_time=t.elapsed,
                )

            return error_response(
                f"Workflow execution failed: {str(e)}",
                execution_time=t.elapsed,
            )


@router.get("/health")
async def workflow_health():
    """Check if the workflow graph is loaded and healthy."""
    try:
        node_count = len(graph.nodes)
        return success_response(
            {"status": "healthy", "nodes": node_count},
            "Workflow is healthy"
        )
    except Exception as e:
        return error_response(f"Workflow health check failed: {str(e)}")
