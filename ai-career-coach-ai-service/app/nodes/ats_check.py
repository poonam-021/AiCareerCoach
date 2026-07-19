import traceback

from app.workflow.state import WorkflowState
from app.agents.ats_checker import ats_checker_agent
from app.services.checkpoint_service import save_checkpoint


def ats_check_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"ATS Check Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        resume_text = state.get("resumeText", "")
        jd_text = state.get("jdText", "")

        result = ats_checker_agent(resume_text, jd_text)

        completed.append("atsCheck")

        update = {
            "currentStep": "atsCheck",
            "atsResult": result,
            "atsScore": result.get("ats_score"),
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print(f"ATS Check Completed | score={result.get('ats_score', 'N/A')}")
        return update

    except Exception as e:
        print(f"ATS Check Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "atsCheck",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }
