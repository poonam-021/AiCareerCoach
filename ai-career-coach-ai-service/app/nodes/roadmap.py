import traceback

from app.workflow.state import WorkflowState
from app.agents.roadmap_generator import roadmap_generator_agent
from app.services.checkpoint_service import save_checkpoint


def roadmap_generate_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Roadmap Generation Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        resume_text = state.get("resumeText", "")
        jd_text = state.get("jdText", "")

        result = roadmap_generator_agent(resume_text, jd_text)

        # Also set legacy roadmapItems
        roadmap_items = []
        plan = result.get("plan", {})
        for phase_key, phase in plan.items():
            for topic in phase.get("daily_topics", [])[:3]:
                roadmap_items.append({
                    "skill": topic,
                    "priority": "HIGH",
                    "resources": phase.get("resources", [])[:2]
                })

        completed.append("roadmap")

        update = {
            "currentStep": "roadmap",
            "roadmap": result,
            "roadmapItems": roadmap_items,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print("Roadmap Generation Completed")
        return update

    except Exception as e:
        print(f"Roadmap Generation Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "roadmap",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }