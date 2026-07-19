import traceback

from app.workflow.state import WorkflowState
from app.agents.jd_parser import jd_parser_agent
from app.services.checkpoint_service import save_checkpoint


def parse_jd_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"JD Parsing Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        jd_text = state.get("jdText", "")

        parsed_jd = jd_parser_agent(jd_text)

        completed.append("parseJd")

        update = {
            "currentStep": "parseJd",
            "parsedJd": parsed_jd,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print(f"JD Parsing Completed | company={parsed_jd.get('company', 'N/A')} | role={parsed_jd.get('jobTitle', 'N/A')}")
        return update

    except Exception as e:
        print(f"JD Parsing Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "parseJd",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }