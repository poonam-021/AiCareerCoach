from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_PARSED_JD

_PROMPT = ChatPromptTemplate.from_template(
    """You are an expert job description parser.
Analyze the following job description and extract structured information.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"company":"","jobTitle":"","skills":[],"experienceRequired":"","jobType":"","location":"","responsibilities":[],"nice_to_have":[]}}
Job Description: {jd}"""
)


def jd_parser_agent(jd_text: str) -> dict:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"jd": jd_text})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] jd_parser_agent: {e}")
        return MOCK_PARSED_JD
