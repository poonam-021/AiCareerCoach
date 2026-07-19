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
from app.utils import success_response, error_response, Timer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/workflow", tags=["Workflow"])


class WorkflowRunRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    jd_text: str = Field(..., min_length=20)
    analysis_report_id: Optional[int] = None
    difficulty: str = Field(default="MEDIUM", pattern="^(EASY|MEDIUM|HARD)$")
    company_name: Optional[str] = None


@router.post("/run")
async def run_workflow(request: WorkflowRunRequest):
    """
    Run the complete AI Career Coach workflow.

    Executes the full LangGraph pipeline:
    parseResume -> resumeScore -> atsCheck -> skillGap ->
    careerRecommend -> roadmap -> projectRecommend -> courseRecommend

    Returns all analysis results in a single response.
    """
    with Timer() as t:
        try:
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

            result = graph.invoke(initial_state, config=config)

            # Build clean response
            data = {
                "analysis_report_id": report_id,
                "status": result.get("status", "COMPLETED"),
                "completed_steps": result.get("completedSteps", []),
                "parsed_resume": result.get("parsedResume"),
                "resume_score": result.get("resumeScore"),
                "ats_result": result.get("atsResult"),
                "skill_gap": result.get("skillGap"),
                "career_roles": result.get("careerRoles"),
                "roadmap": result.get("roadmap"),
                "projects": result.get("projects"),
                "courses": result.get("courses"),
            }

            if result.get("error"):
                return error_response(
                    f"Workflow completed with errors: {result['error']}",
                    details=data,
                    execution_time=t.elapsed
                )

            return success_response(data, "AI workflow completed successfully", t.elapsed)

        except Exception as e:
            logger.error(f"[/workflow/run] Error: {e}", exc_info=True)
            return error_response(f"Workflow execution failed: {str(e)}", execution_time=t.elapsed)


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
