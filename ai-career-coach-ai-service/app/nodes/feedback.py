import traceback

from app.workflow.state import WorkflowState
from app.services.checkpoint_service import save_checkpoint


def feedback_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Resume Feedback Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        # Static placeholder — Groq agent not wired into this legacy node
        feedback_list = [
            "Add more detailed project descriptions with measurable outcomes.",
            "Include links to GitHub repositories or live demos.",
            "Quantify achievements where possible (e.g., 'Reduced API latency by 30%').",
            "Add certifications relevant to the target role.",
        ]

        completed.append("feedback")

        update = {
            "currentStep": "feedback",
            "feedback": feedback_list,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print("Resume Feedback Completed")
        return update

    except Exception as e:
        print(f"Resume Feedback Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "feedback",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }