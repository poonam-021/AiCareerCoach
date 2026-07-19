import traceback

from app.workflow.state import WorkflowState
from app.agents.career_recommender import career_recommender_agent
from app.services.checkpoint_service import save_checkpoint


def career_recommend_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Career Recommendation Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        resume_text = state.get("resumeText", "")

        result = career_recommender_agent(resume_text)

        completed.append("careerRecommend")

        update = {
            "currentStep": "careerRecommend",
            "careerRoles": result,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print(f"Career Recommendation Completed | best={result.get('best_matching_role', 'N/A')}")
        return update

    except Exception as e:
        print(f"Career Recommendation Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "careerRecommend",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }
