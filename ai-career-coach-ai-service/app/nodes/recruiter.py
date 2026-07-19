import traceback

from app.workflow.state import WorkflowState
from app.services.checkpoint_service import save_checkpoint


def recruiter_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Recruiter Review Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        # Static placeholder — Groq agent not wired into this legacy node
        decision = "SHORTLIST"
        reasoning = "Candidate has relevant Python and FastAPI skills with internship experience."

        completed.append("recruiter")

        update = {
            "currentStep": "recruiter",
            "recruiterDecision": decision,
            "recruiterReasoning": reasoning,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print("Recruiter Review Completed")
        return update

    except Exception as e:
        print(f"Recruiter Review Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "recruiter",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }