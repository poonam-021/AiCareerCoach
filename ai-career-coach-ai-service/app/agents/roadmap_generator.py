from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_ROADMAP

_PROMPT = ChatPromptTemplate.from_template(
    """You are a learning coach. Create a 30/60/90-day learning roadmap for the candidate.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"target_role":"","total_duration":"90 days","plan":{{"day_1_30":{{"theme":"","goals":[],"daily_topics":[],"weekly_milestones":[],"resources":[]}},"day_31_60":{{"theme":"","goals":[],"daily_topics":[],"weekly_milestones":[],"resources":[]}},"day_61_90":{{"theme":"","goals":[],"daily_topics":[],"weekly_milestones":[],"resources":[]}}}},"key_skills_to_learn":[],"estimated_job_ready":"","tips":[]}}
Resume: {resume}
Job Description: {jd}"""
)

def roadmap_generator_agent(resume_text: str, jd_text: str) -> dict:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"resume": resume_text, "jd": jd_text})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] roadmap_generator_agent: {e}")
        return MOCK_ROADMAP
