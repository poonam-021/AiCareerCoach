import traceback

from app.workflow.state import WorkflowState
from app.agents.project_recommender import project_recommender_agent
from app.services.checkpoint_service import save_checkpoint


def project_recommend_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Project Recommendation Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        resume_text = state.get("resumeText", "")
        jd_text = state.get("jdText", "")

        result = project_recommender_agent(resume_text, jd_text)

        completed.append("projectRecommend")

        update = {
            "currentStep": "projectRecommend",
            "projects": result,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print("Project Recommendation Completed")
        return update

    except Exception as e:
        print(f"Project Recommendation Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "projectRecommend",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }
