import traceback

from app.workflow.state import WorkflowState
from app.services.checkpoint_service import save_checkpoint


def cover_letter_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Cover Letter Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        # Static placeholder — Groq agent not wired into this legacy node
        name = "Nisha Sangwan"
        job_title = state.get("parsedJd", {}).get("jobTitle", "Software Developer") if state.get("parsedJd") else "Software Developer"
        company = state.get("parsedJd", {}).get("company", "the company") if state.get("parsedJd") else "the company"

        cover_letter = (
            f"Dear Hiring Manager,\n\n"
            f"I am {name}, a B.Tech Computer Science graduate with hands-on experience in Python, "
            f"FastAPI, and AI development. I am excited to apply for the {job_title} position at {company}.\n\n"
            f"During my internship at CDAC, I worked on AI-powered systems and built production-ready APIs. "
            f"My projects, including AI Career Coach and Inventory Management System, showcase my ability to "
            f"deliver full-stack solutions.\n\n"
            f"I am confident my skills align well with your requirements and I would love the opportunity to "
            f"contribute to your team.\n\n"
            f"Sincerely,\n{name}"
        )

        completed.append("coverLetter")

        update = {
            "currentStep": "coverLetter",
            "coverLetter": cover_letter,
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