import traceback

from app.workflow.state import WorkflowState
from app.services.checkpoint_service import save_checkpoint


def match_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Resume Matching Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        # Static placeholder — Groq agent not wired into this legacy node
        match_percent = 80.0
        matched_keywords = ["Python", "FastAPI", "SQL"]
        missing_keywords = ["Docker", "Kubernetes", "AWS"]

        completed.append("match")

        update = {
            "currentStep": "match",
            "matchPercent": match_percent,
            "matchedKeywords": matched_keywords,
            "missingKeywords": missing_keywords,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print("Resume Matching Completed")
        return update

    except Exception as e:
        print(f"Resume Matching Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "match",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }