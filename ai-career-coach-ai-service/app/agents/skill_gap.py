from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_SKILL_GAP

_PROMPT = ChatPromptTemplate.from_template(
    """You are a career advisor. Compare resume against job description and identify skill gaps.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"existing_skills":[],"required_skills":[],"missing_skills":[],"priority_skills":[{{"skill":"","priority":"HIGH|MEDIUM|LOW","difficulty":"EASY|MEDIUM|HARD","reason":""}}],"match_percentage":<0-100>,"overall_fit":"STRONG|MODERATE|WEAK","summary":""}}
Resume: {resume}
Job Description: {jd}"""
)

def skill_gap_agent(resume_text: str, jd_text: str) -> dict:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"resume": resume_text, "jd": jd_text})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] skill_gap_agent: {e}")
        return MOCK_SKILL_GAP
