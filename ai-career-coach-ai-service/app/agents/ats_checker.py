from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_ATS_RESULT

_PROMPT = ChatPromptTemplate.from_template(
    """You are an ATS specialist. Check resume ATS compatibility against the job description.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"ats_score":<0-100>,"keyword_match_percent":<0-100>,"matched_keywords":[],"missing_keywords":[],"formatting_issues":[],"suggestions":[],"ats_compatible":true,"verdict":"PASS or FAIL"}}
Resume: {resume}
Job Description: {jd}"""
)

def ats_checker_agent(resume_text: str, jd_text: str) -> dict:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"resume": resume_text, "jd": jd_text})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] ats_checker_agent: {e}")
        return MOCK_ATS_RESULT
