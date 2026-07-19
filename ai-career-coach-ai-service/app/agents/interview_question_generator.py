from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_INTERVIEW_QUESTIONS

_PROMPT = ChatPromptTemplate.from_template(
    """You are an expert technical interviewer. Generate interview questions for the candidate. Difficulty: {difficulty}
Return ONLY valid JSON with NO markdown fences.
JSON: {{"role":"","difficulty":"{difficulty}","hr_questions":[{{"question":"","tip":""}}],"technical_questions":[{{"question":"","expected_topics":[],"difficulty":"EASY|MEDIUM|HARD"}}],"behavioral_questions":[{{"question":"","competency":""}}],"coding_questions":[{{"question":"","hint":"","time_limit":""}}],"scenario_questions":[{{"scenario":"","what_to_evaluate":""}}],"total_questions":<number>}}
Resume: {resume}
Job Description: {jd}"""
)

def interview_question_generator_agent(resume_text: str, jd_text: str, difficulty: str = "MEDIUM") -> dict:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"resume": resume_text, "jd": jd_text, "difficulty": difficulty})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] interview_question_generator_agent: {e}")
        result = dict(MOCK_INTERVIEW_QUESTIONS)
        result["difficulty"] = difficulty
        return result
