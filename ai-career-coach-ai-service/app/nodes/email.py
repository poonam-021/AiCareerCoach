import traceback

from app.workflow.state import WorkflowState
from app.services.checkpoint_service import save_checkpoint


def email_node(state: WorkflowState) -> dict:

    report_id = state.get("analysisReportId", "?")
    print(f"Email Draft Started | {report_id}")

    completed = list(state.get("completedSteps", []))

    try:
        # Static placeholder — Groq agent not wired into this legacy node
        job_title = state.get("parsedJd", {}).get("jobTitle", "Software Developer") if state.get("parsedJd") else "Software Developer"
        company = state.get("parsedJd", {}).get("company", "your company") if state.get("parsedJd") else "your company"

        email_draft = (
            f"Subject: Application for {job_title} Position\n\n"
            f"Dear Hiring Team,\n\n"
            f"I hope this message finds you well. I am writing to express my strong interest in the "
            f"{job_title} role at {company}. Please find my resume attached for your consideration.\n\n"
            f"I have hands-on experience with Python, FastAPI, and AI/ML development, and I believe my "
            f"background makes me an excellent candidate for this position.\n\n"
            f"I would love the opportunity to discuss how my skills can contribute to your team. "
            f"Please feel free to reach out at your earliest convenience.\n\n"
            f"Thank you for your time and consideration.\n\n"
            f"Best regards,\n"
            f"Nisha Sangwan"
        )

        completed.append("email")

        update = {
            "currentStep": "email",
            "emailDraft": email_draft,
            "completedSteps": completed,
        }

        save_checkpoint({**state, **update})

        print("Email Draft Completed")
        return update

    except Exception as e:
        print(f"Email Draft Failed: {e}")
        traceback.print_exc()
        return {
            "currentStep": "email",
            "error": str(e),
            "status": "FAILED",
            "completedSteps": completed,
        }