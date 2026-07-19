from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_COURSES

_PROMPT = ChatPromptTemplate.from_template(
    """You are an e-learning advisor. Recommend courses, certifications and resources for the candidate.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"free_courses":[{{"name":"","platform":"","url":"","duration":"","skill_covered":""}}],"paid_courses":[{{"name":"","platform":"","price_range":"","duration":"","skill_covered":""}}],"certifications":[{{"name":"","issuer":"","level":"BEGINNER|INTERMEDIATE|ADVANCED","value":"HIGH|MEDIUM|LOW","preparation_time":""}}],"documentation":[{{"name":"","url":"","type":"OFFICIAL_DOCS|TUTORIAL|BOOK|BLOG"}}],"priority_order":[]}}
Resume: {resume}
Job Description: {jd}"""
)

def course_recommender_agent(resume_text: str, jd_text: str) -> dict:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"resume": resume_text, "jd": jd_text})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] course_recommender_agent: {e}")
        return MOCK_COURSES
