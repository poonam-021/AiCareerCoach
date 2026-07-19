from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_CAREER_ROLES

_PROMPT = ChatPromptTemplate.from_template(
    """You are an expert career counselor. Based on the candidate's resume, recommend best-fit career roles.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"top_roles":[{{"title":"","domain":"","confidence_score":<0-100>,"reasoning":"","avg_salary_usd":""}}],"career_domains":[],"best_matching_role":"","career_stage":"FRESHER|JUNIOR|MID|SENIOR","growth_potential":"HIGH|MEDIUM|LOW","summary":""}}
Resume: {resume}"""
)

def career_recommender_agent(resume_text: str) -> dict:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"resume": resume_text})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] career_recommender_agent: {e}")
        return MOCK_CAREER_ROLES
