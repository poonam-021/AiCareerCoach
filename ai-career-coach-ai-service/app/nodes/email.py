import traceback

from app.workflow.state import WorkflowState
from app.agents.email import email_agent
from app.services.checkpoint_service import save_checkpoint


def email_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Email Draft Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        resume_text = state.get("resumeText", "")
        jd_text = state.get("jdText", "")

        result = email_agent(resume_text, jd_text)

        completed.append("email")

        update = {
            "currentStep": "email",
            "emailDraft": result.get("emailDraft", ""),
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print("Email Draft Completed")
        return update

    except Exception as e:
        print(f"Email Draft Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "email",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }