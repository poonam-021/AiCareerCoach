import traceback

from app.workflow.state import WorkflowState
from app.agents.resume_scorer import resume_scorer_agent
from app.services.checkpoint_service import save_checkpoint


def resume_score_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Resume Scoring Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        resume_text = state.get("resumeText", "")
        jd_text = state.get("jdText", "")

        result = resume_scorer_agent(resume_text, jd_text)

        completed.append("resumeScore")

        update = {
            "currentStep": "resumeScore",
            "resumeScore": result,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print(f"Resume Scoring Completed | score={result.get('overall_score', 'N/A')}")
        return update

    except Exception as e:
        print(f"Resume Scoring Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "resumeScore",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }
