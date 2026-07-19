import json
import traceback

from app.workflow.state import WorkflowState
from app.services.checkpoint_service import save_checkpoint


def parse_jd_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"JD Parsing Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        # Static placeholder — Groq agent not wired into this legacy node
        parsed_jd = {
            "company": "Google",
            "jobTitle": "Python Developer",
            "skills": ["Python", "FastAPI"],
            "experienceRequired": "2 Years"
        }

        completed.append("parseJd")

        update = {
            "currentStep": "parseJd",
            "parsedJd": parsed_jd,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print("JD Parsing Completed")
        return update

    except Exception as e:
        print(f"JD Parsing Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "parseJd",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }