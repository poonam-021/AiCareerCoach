import traceback

from app.workflow.state import WorkflowState
from app.agents.cover_letter import cover_letter_agent
from app.services.checkpoint_service import save_checkpoint


def cover_letter_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Cover Letter Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        resume_text = state.get("resumeText", "")
        jd_text = state.get("jdText", "")

        # Prefer the parsed company name; fall back to the request-level companyName field
        parsed_jd = state.get("parsedJd") or {}
        company_name = (
            parsed_jd.get("company")
            or state.get("companyName")
            or "the company"
        )

        result = cover_letter_agent(resume_text, jd_text, company_name)

        completed.append("coverLetter")

        update = {
            "currentStep": "coverLetter",
            "coverLetter": result,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print("Cover Letter Completed")
        return update

    except Exception as e:
        print(f"Cover Letter Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "coverLetter",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }