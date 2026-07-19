from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_RESUME_SCORE

_PROMPT = ChatPromptTemplate.from_template(
    """You are an expert resume reviewer. Analyze the resume and score it.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"overall_score":<0-100>,"ats_score":<0-100>,"formatting_score":<0-100>,"content_score":<0-100>,"strengths":[],"weaknesses":[],"suggestions":[],"missing_sections":[],"summary":"<text>"}}
Resume: {resume}
Job Description: {jd}"""
)

def resume_scorer_agent(resume_text: str, jd_text: str = "") -> dict:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"resume": resume_text, "jd": jd_text or "Not provided"})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] resume_scorer_agent: {e}")
        return MOCK_RESUME_SCORE
