from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_RECRUITER_RESULT

_PROMPT = ChatPromptTemplate.from_template(
    """You are an experienced technical recruiter. Evaluate the candidate's resume against the job description.
Consider the ATS score ({ats_score}/100) and skill-match percentage ({match_percent}%) in your decision.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"decision":"SHORTLIST|REJECT|MAYBE","reasoning":"<concise 2-3 sentence explanation>"}}
Resume: {resume}
Job Description: {jd}"""
)


def recruiter_agent(
    resume_text: str,
    jd_text: str,
    ats_score: float = 0.0,
    match_percent: float = 0.0,
) -> dict:
    """
    Evaluate a candidate and return a hiring decision.

    Returns:
        {"decision": "SHORTLIST|REJECT|MAYBE", "reasoning": ""}
    """
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(
            chain,
            {
                "resume": resume_text,
                "jd": jd_text,
                "ats_score": ats_score,
                "match_percent": match_percent,
            },
        )
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] recruiter_agent: {e}")
        return MOCK_RECRUITER_RESULT
