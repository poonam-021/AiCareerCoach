from langchain_core.prompts import ChatPromptTemplate
from app.core.llm import get_llm, invoke_with_retry, QuotaExhaustedError
from app.utils.json_parser import extract_content

_PROMPT = ChatPromptTemplate.from_template(
    """You are a professional resume writer. Rewrite the resume to be ATS-optimized, professional, and tailored for the job.
Use action verbs, quantify achievements, include JD keywords naturally.
Return the rewritten resume as plain text only (no JSON, no markdown).
Start directly with the candidate's name.

Original Resume: {resume}
Target Job Description: {jd}"""
)

_MOCK_REWRITTEN = """Nisha Sangwan
Email: nisha@example.com | Phone: +91-9876543210 | GitHub: github.com/nisha

PROFESSIONAL SUMMARY
Results-driven Computer Science graduate with hands-on experience in Python, FastAPI, and AI development.
Built production-ready agentic AI systems during internship at CDAC. Passionate about scalable backend solutions.

TECHNICAL SKILLS
Languages: Python, Java, SQL, JavaScript
Frameworks: FastAPI, Spring Boot, React
Databases: MongoDB, MySQL
Tools: Git, Docker (learning), REST APIs, LangGraph

EXPERIENCE
AI Intern | CDAC | 6 Months
- Developed AI-powered REST APIs using Python and FastAPI serving 100+ requests/day
- Built agentic workflow systems using LangGraph and Groq API
- Collaborated with cross-functional teams to deliver production-ready features on schedule

PROJECTS
AI Career Coach | Python, FastAPI, LangGraph, Groq API
- Architected full Agentic AI microservice with 12 AI agents and LangGraph workflow
- Integrated Redis checkpointing for fault-tolerant workflow execution

Inventory Management System | Spring Boot, React, MongoDB
- Developed full-stack inventory system with real-time stock tracking and reporting

EDUCATION
B.Tech Computer Science | Delhi University | 2024"""

def resume_rewriter_agent(resume_text: str, jd_text: str) -> str:
    try:
        chain = _PROMPT | get_llm()
        response = invoke_with_retry(chain, {"resume": resume_text, "jd": jd_text})
        return extract_content(response).strip()
    except (QuotaExhaustedError, Exception) as e:
        print(f"[MOCK] resume_rewriter_agent: {e}")
        return _MOCK_REWRITTEN
