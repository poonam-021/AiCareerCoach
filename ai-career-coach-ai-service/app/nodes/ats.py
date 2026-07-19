import traceback

from app.workflow.state import WorkflowState
from app.services.checkpoint_service import save_checkpoint


def ats_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"ATS Analysis Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        # Static placeholder — Groq agent not wired into this legacy node
        ats_score = 85.0
        score_breakdown = [
            {"category": "Skills Match", "score": 90},
            {"category": "Experience", "score": 80},
            {"category": "Keywords", "score": 85},
        ]
        skill_gaps = ["Docker", "Kubernetes"]

        completed.append("ats")

        update = {
            "currentStep": "ats",
            "atsScore": ats_score,
            "scoreBreakdown": score_breakdown,
            "skillGaps": skill_gaps,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print("ATS Analysis Completed")
        return update

    except Exception as e:
        print(f"ATS Analysis Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "ats",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }