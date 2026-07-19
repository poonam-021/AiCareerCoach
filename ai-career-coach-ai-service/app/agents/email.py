from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_EMAIL_DRAFT

_PROMPT = ChatPromptTemplate.from_template(
    """You are an expert career coach writing a professional job application email.
Write a concise, tailored cold-email to accompany the candidate's resume application.
The email should be professional, personalized to the JD, and not exceed 150 words.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"emailDraft":"<full email text including subject line, salutation, body, and sign-off>"}}
Resume: {resume}
Job Description: {jd}"""
)


def email_agent(resume_text: str, jd_text: str) -> dict:
    """
    Generate a professional job application email draft.

    Returns:
        {"emailDraft": "<full email text>"}
    """
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"resume": resume_text, "jd": jd_text})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] email_agent: {e}")
        return MOCK_EMAIL_DRAFT
