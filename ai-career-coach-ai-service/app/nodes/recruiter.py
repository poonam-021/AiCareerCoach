import traceback

from app.workflow.state import WorkflowState
from app.agents.recruiter import recruiter_agent
from app.services.checkpoint_service import save_checkpoint


def recruiter_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Recruiter Review Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        resume_text = state.get("resumeText", "")
        jd_text = state.get("jdText", "")

        # Pull ATS score and match% from earlier nodes if available
        ats_score = state.get("atsScore") or 0.0
        match_percent = state.get("matchPercent") or 0.0

        result = recruiter_agent(resume_text, jd_text, ats_score, match_percent)

        completed.append("recruiter")

        update = {
            "currentStep": "recruiter",
            "recruiterDecision": result.get("decision", "MAYBE"),
            "recruiterReasoning": result.get("reasoning", ""),
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print(f"Recruiter Review Completed | decision={result.get('decision', 'N/A')}")
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