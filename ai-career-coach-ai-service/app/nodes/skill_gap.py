import traceback

from app.workflow.state import WorkflowState
from app.agents.skill_gap import skill_gap_agent
from app.services.checkpoint_service import save_checkpoint


def skill_gap_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Skill Gap Analysis Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        resume_text = state.get("resumeText", "")
        jd_text = state.get("jdText", "")

        result = skill_gap_agent(resume_text, jd_text)

        completed.append("skillGap")

        update = {
            "currentStep": "skillGap",
            "skillGap": result,
            "skillGaps": result.get("missing_skills", []),
            "matchPercent": result.get("match_percentage"),
            "missingKeywords": result.get("missing_skills", []),
            "matchedKeywords": result.get("existing_skills", []),
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print(f"Skill Gap Analysis Completed | match={result.get('match_percentage', 'N/A')}%")
        return update

    except Exception as e:
        print(f"Skill Gap Analysis Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "skillGap",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }
