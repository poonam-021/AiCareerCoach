from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_PROJECTS

_PROMPT = ChatPromptTemplate.from_template(
    """You are a software engineering mentor. Recommend hands-on projects for the candidate to build.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"beginner_projects":[{{"name":"","description":"","technologies":[],"duration":"","github_idea":"","skills_demonstrated":[]}}],"intermediate_projects":[{{"name":"","description":"","technologies":[],"duration":"","github_idea":"","skills_demonstrated":[]}}],"advanced_projects":[{{"name":"","description":"","technologies":[],"duration":"","github_idea":"","skills_demonstrated":[]}}],"industry_projects":[{{"name":"","description":"","technologies":[],"impact":""}}],"recommended_start":""}}
Resume: {resume}
Target Role: {jd}"""
)

def project_recommender_agent(resume_text: str, jd_text: str = "") -> dict:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"resume": resume_text, "jd": jd_text or "General software development"})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] project_recommender_agent: {e}")
        return MOCK_PROJECTS
