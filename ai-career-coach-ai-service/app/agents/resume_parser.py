from langchain_core.prompts import ChatPromptTemplate

from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_json, extract_content
from app.core.mock_data import MOCK_PARSED_RESUME

_PROMPT = ChatPromptTemplate.from_template(
    """You are an expert resume parser.

Analyze the following resume and extract structured information.

Return ONLY valid JSON format with no markdown, no code fences, no explanation.

Extract these fields:
- name (string)
- email (string)
- phone (string)
- skills (list of strings)
- education (list of objects with: degree, institution, year)
- experience (list of objects with: title, company, duration, description)
- projects (list of objects with: name, description, technologies)
- certifications (list of strings)

Resume:
{resume}
"""
)


def resume_parser_agent(resume_text: str) -> str:
    try:
        llm = get_llm()
        chain = _PROMPT | llm
        response = invoke_with_retry(chain, {"resume": resume_text})
        content = response.content
        if isinstance(content, list):
            text = "".join(b.get("text", str(b)) if isinstance(b, dict) else str(b) for b in content)
        else:
            text = str(content)
        text = text.strip()
        if text.startswith("```"):
            lines = [l for l in text.split("\n") if not l.strip().startswith("```")]
            text = "\n".join(lines)
        return text.strip()
    except QuotaExhaustedError:
        import json
        print("[MOCK] resume_parser_agent using mock data")
        return json.dumps(MOCK_PARSED_RESUME)
    except Exception as e:
        import json
        print(f"[WARN] resume_parser_agent failed: {e} — using mock data")
        return json.dumps(MOCK_PARSED_RESUME)