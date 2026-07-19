from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_COVER_LETTER

_PROMPT = ChatPromptTemplate.from_template(
    """You are an expert cover letter writer. Write a professional, tailored cover letter.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"subject_line":"","cover_letter":"<full letter text>","key_highlights":[],"word_count":<number>}}
Resume: {resume}
Job Description: {jd}
Company: {company}"""
)

def cover_letter_agent(resume_text: str, jd_text: str, company_name: str = "") -> dict:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"resume": resume_text, "jd": jd_text, "company": company_name or "the company"})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] cover_letter_agent: {e}")
        return MOCK_COVER_LETTER
