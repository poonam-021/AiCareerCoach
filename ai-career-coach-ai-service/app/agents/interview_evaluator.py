from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_INTERVIEW_EVALUATION

_PROMPT = ChatPromptTemplate.from_template(
    """You are an expert interview coach. Evaluate the candidate's interview answer.
Return ONLY valid JSON with NO markdown fences.
JSON: {{"overall_rating":<1-10>,"scores":{{"technical_accuracy":<0-100>,"communication":<0-100>,"confidence":<0-100>,"grammar_clarity":<0-100>,"relevance":<0-100>}},"strengths":[],"improvements":[],"ideal_answer_hints":[],"missing_points":[],"grammar_issues":[],"verdict":"EXCELLENT|GOOD|AVERAGE|NEEDS_IMPROVEMENT","detailed_feedback":"<2-3 paragraphs>"}}
Question: {question}
Candidate Answer: {answer}
Role Context: {role}"""
)

def interview_evaluator_agent(question: str, answer: str, expected_role: str = "Software Developer") -> dict:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"question": question, "answer": answer, "role": expected_role})
        return extract_json(extract_content(response))
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] interview_evaluator_agent: {e}")
        return MOCK_INTERVIEW_EVALUATION
