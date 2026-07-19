import json
import traceback

from app.workflow.state import WorkflowState
from app.agents.resume_parser import resume_parser_agent
from app.services.checkpoint_service import save_checkpoint


def parse_resume_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Resume Parsing Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        result_text = resume_parser_agent(state["resumeText"])

        # Try to parse JSON from the LLM response
        try:
            # Strip markdown code fences if present
            clean = result_text.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
            parsed = json.loads(clean.strip())
        except Exception:
            # If JSON parsing fails, keep as raw text dict
            parsed = {"raw": result_text}

        completed.append("parseResume")

        update = {
            "currentStep": "parseResume",
            "parsedResume": parsed,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print("Resume Parsing Completed")
        return update

    except Exception as e:
        print(f"Resume Parsing Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "parseResume",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }