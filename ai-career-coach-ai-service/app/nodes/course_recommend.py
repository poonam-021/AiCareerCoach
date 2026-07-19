import traceback

from app.workflow.state import WorkflowState
from app.agents.course_recommender import course_recommender_agent
from app.services.checkpoint_service import save_checkpoint


def course_recommend_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Course Recommendation Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        resume_text = state.get("resumeText", "")
        jd_text = state.get("jdText", "")

        result = course_recommender_agent(resume_text, jd_text)

        completed.append("courseRecommend")

        update = {
            "currentStep": "courseRecommend",
            "courses": result,
            "completedSteps": completed,
            "status": "COMPLETED",
        }

        save_checkpoint({**state, **update})

        print("Course Recommendation Completed")
        return update

    except Exception as e:
        print(f"Course Recommendation Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "courseRecommend",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }
