"""
Mock LLM responses for when the Groq API quota is exhausted or unavailable.
Returns realistic structured JSON data so the full pipeline works end-to-end.
"""

MOCK_PARSED_RESUME = {
    "name": "Nisha Sangwan",
    "email": "nisha@example.com",
    "phone": "+91-9876543210",
    "skills": ["Python", "Java", "SQL", "React", "FastAPI", "Spring Boot", "MongoDB"],
    "education": [{"degree": "B.Tech Computer Science", "institution": "Delhi University", "year": "2024"}],
    "experience": [{"title": "AI Intern", "company": "CDAC", "duration": "6 months", "description": "Worked on AI-powered systems and APIs"}],
    "projects": [
        {"name": "AI Career Coach", "description": "Agentic AI backend", "technologies": ["Python", "FastAPI", "LangGraph"]},
        {"name": "Inventory Management System", "description": "Full-stack inventory app", "technologies": ["Spring Boot", "React", "MongoDB"]}
    ],
    "certifications": []
}

MOCK_RESUME_SCORE = {
    "overall_score": 72.0,
    "ats_score": 68.0,
    "formatting_score": 75.0,
    "content_score": 73.0,
    "strengths": ["Strong technical skills", "Relevant internship experience", "Good project portfolio"],
    "weaknesses": ["Missing certifications", "No quantified achievements", "Short experience duration"],
    "suggestions": [
        "Add certifications (AWS, Google Cloud)",
        "Quantify achievements (e.g., 'Reduced API latency by 30%')",
        "Add a professional summary section",
        "Include GitHub links for projects"
    ],
    "missing_sections": ["Summary", "Certifications", "Awards"],
    "summary": "Good foundation with relevant skills. Needs stronger ATS optimization and quantified outcomes."
}

MOCK_ATS_RESULT = {
    "ats_score": 68.0,
    "keyword_match_percent": 72.0,
    "matched_keywords": ["Python", "FastAPI", "SQL", "MongoDB", "REST API"],
    "missing_keywords": ["Docker", "Kubernetes", "AWS", "CI/CD", "Microservices"],
    "formatting_issues": ["Use standard section headings", "Avoid tables in resume"],
    "suggestions": [
        "Add Docker and Kubernetes to skills",
        "Use standard section names: Experience, Education, Skills",
        "Include more JD keywords naturally in bullet points"
    ],
    "ats_compatible": True,
    "verdict": "PASS"
}

MOCK_SKILL_GAP = {
    "existing_skills": ["Python", "Java", "SQL", "React", "FastAPI", "Spring Boot", "MongoDB"],
    "required_skills": ["Python", "FastAPI", "Docker", "AWS", "Kubernetes", "CI/CD", "PostgreSQL"],
    "missing_skills": ["Docker", "AWS", "Kubernetes", "CI/CD", "PostgreSQL"],
    "priority_skills": [
        {"skill": "Docker", "priority": "HIGH", "difficulty": "MEDIUM", "reason": "Required for all modern deployments"},
        {"skill": "AWS", "priority": "HIGH", "difficulty": "MEDIUM", "reason": "Most in-demand cloud platform"},
        {"skill": "Kubernetes", "priority": "MEDIUM", "difficulty": "HARD", "reason": "Container orchestration standard"},
        {"skill": "CI/CD", "priority": "HIGH", "difficulty": "EASY", "reason": "Essential for DevOps practices"}
    ],
    "match_percentage": 60.0,
    "overall_fit": "MODERATE",
    "summary": "Good Python/FastAPI base. Focus on cloud and DevOps skills to become fully job-ready."
}

MOCK_CAREER_ROLES = {
    "top_roles": [
        {"title": "Backend Developer", "domain": "Backend", "confidence_score": 85, "reasoning": "Strong Python/FastAPI/Spring Boot skills", "avg_salary_usd": "$70,000 - $100,000"},
        {"title": "Full Stack Developer", "domain": "Full Stack", "confidence_score": 78, "reasoning": "React + Spring Boot + MongoDB combination", "avg_salary_usd": "$75,000 - $110,000"},
        {"title": "AI/ML Engineer", "domain": "Artificial Intelligence", "confidence_score": 72, "reasoning": "AI internship and LangGraph project experience", "avg_salary_usd": "$90,000 - $130,000"}
    ],
    "career_domains": ["Backend Development", "Full Stack", "AI/ML", "Cloud Engineering"],
    "best_matching_role": "Backend Developer",
    "career_stage": "FRESHER",
    "growth_potential": "HIGH",
    "summary": "Strong candidate for backend and full-stack roles. AI internship gives edge in AI-adjacent positions."
}

MOCK_ROADMAP = {
    "target_role": "Python Backend Developer",
    "total_duration": "90 days",
    "plan": {
        "day_1_30": {
            "theme": "Strengthen Core Python & FastAPI",
            "goals": ["Master FastAPI advanced features", "Learn Docker basics", "Build 2 REST API projects"],
            "daily_topics": ["FastAPI routing", "Pydantic models", "Docker fundamentals", "PostgreSQL basics"],
            "weekly_milestones": ["Complete FastAPI tutorial", "Dockerize a project", "Deploy on local", "Build CRUD API"],
            "resources": ["FastAPI Official Docs", "Docker Getting Started Guide"]
        },
        "day_31_60": {
            "theme": "Cloud & DevOps Fundamentals",
            "goals": ["AWS basics (EC2, S3, RDS)", "CI/CD with GitHub Actions", "Deploy a real project"],
            "daily_topics": ["AWS EC2", "S3 storage", "GitHub Actions", "Docker Compose"],
            "weekly_milestones": ["AWS free tier setup", "Deploy app to EC2", "Set up CI/CD", "Monitor with CloudWatch"],
            "resources": ["AWS Free Tier", "GitHub Actions Docs"]
        },
        "day_61_90": {
            "theme": "Advanced Topics & Interview Prep",
            "goals": ["Kubernetes basics", "System design", "Mock interviews", "Portfolio project"],
            "daily_topics": ["Kubernetes pods", "System design patterns", "LeetCode problems", "Resume polish"],
            "weekly_milestones": ["K8s local cluster", "Design a scalable system", "5 mock interviews", "Final portfolio"],
            "resources": ["Kubernetes.io Docs", "System Design Primer GitHub"]
        }
    },
    "key_skills_to_learn": ["Docker", "AWS", "Kubernetes", "CI/CD", "PostgreSQL"],
    "estimated_job_ready": "After 60 days",
    "tips": ["Code daily for at least 2 hours", "Build real projects not just tutorials", "Network on LinkedIn"]
}

MOCK_PROJECTS = {
    "beginner_projects": [
        {"name": "Todo API", "description": "REST API with CRUD operations", "technologies": ["FastAPI", "SQLite"], "duration": "3 days", "github_idea": "fastapi-todo-api", "skills_demonstrated": ["FastAPI", "REST API design"]},
        {"name": "URL Shortener", "description": "Short URL generator service", "technologies": ["FastAPI", "Redis"], "duration": "1 week", "github_idea": "url-shortener-fastapi", "skills_demonstrated": ["FastAPI", "Redis", "Caching"]}
    ],
    "intermediate_projects": [
        {"name": "Job Board API", "description": "Full job posting and application API", "technologies": ["FastAPI", "PostgreSQL", "Docker"], "duration": "2 weeks", "github_idea": "job-board-api", "skills_demonstrated": ["FastAPI", "PostgreSQL", "Docker", "Auth"]},
        {"name": "Chat Application", "description": "Real-time chat with WebSockets", "technologies": ["FastAPI", "WebSockets", "Redis"], "duration": "3 weeks", "github_idea": "realtime-chat-fastapi", "skills_demonstrated": ["WebSockets", "Real-time", "Redis"]}
    ],
    "advanced_projects": [
        {"name": "Microservices E-commerce", "description": "Full e-commerce with microservices architecture", "technologies": ["FastAPI", "Docker", "Kubernetes", "RabbitMQ"], "duration": "6 weeks", "github_idea": "ecommerce-microservices", "skills_demonstrated": ["Microservices", "K8s", "Message Queue"]}
    ],
    "industry_projects": [
        {"name": "AI Career Coach Backend", "description": "Agentic AI backend with LangGraph", "technologies": ["FastAPI", "LangGraph", "Groq API", "Redis"], "impact": "Full AI microservice for career coaching"}
    ],
    "recommended_start": "Start with Todo API to get comfortable with FastAPI, then move to Job Board API for real-world complexity."
}

MOCK_COURSES = {
    "free_courses": [
        {"name": "FastAPI Full Course", "platform": "YouTube", "url": "Search 'FastAPI full course' on YouTube", "duration": "8 hours", "skill_covered": "FastAPI"},
        {"name": "Docker for Beginners", "platform": "freeCodeCamp YouTube", "url": "youtube.com/freeCodeCamp", "duration": "5 hours", "skill_covered": "Docker"},
        {"name": "AWS Cloud Practitioner", "platform": "AWS Training", "url": "aws.amazon.com/training", "duration": "10 hours", "skill_covered": "AWS"}
    ],
    "paid_courses": [
        {"name": "Complete Python Developer", "platform": "Udemy", "price_range": "$10-$15", "duration": "30 hours", "skill_covered": "Python"},
        {"name": "Docker & Kubernetes: Complete Guide", "platform": "Udemy", "price_range": "$10-$15", "duration": "22 hours", "skill_covered": "Docker, Kubernetes"}
    ],
    "certifications": [
        {"name": "AWS Solutions Architect Associate", "issuer": "Amazon", "level": "INTERMEDIATE", "value": "HIGH", "preparation_time": "2-3 months"},
        {"name": "Google Cloud Associate Engineer", "issuer": "Google", "level": "INTERMEDIATE", "value": "HIGH", "preparation_time": "2-3 months"}
    ],
    "documentation": [
        {"name": "FastAPI Official Docs", "url": "fastapi.tiangolo.com", "type": "OFFICIAL_DOCS"},
        {"name": "Docker Documentation", "url": "docs.docker.com", "type": "OFFICIAL_DOCS"},
        {"name": "AWS Documentation", "url": "docs.aws.amazon.com", "type": "OFFICIAL_DOCS"}
    ],
    "priority_order": ["FastAPI Full Course (YouTube)", "Docker for Beginners", "AWS Cloud Practitioner", "AWS Solutions Architect Certification"]
}

MOCK_COVER_LETTER = {
    "subject_line": "Application for Python Backend Developer Position",
    "cover_letter": """Dear Hiring Manager,

I am Nisha Sangwan, a B.Tech Computer Science graduate with strong expertise in Python, FastAPI, Spring Boot, and AI development. I am excited to apply for the Python Developer position at your organization.

During my AI internship at CDAC, I developed production-ready AI-powered APIs and gained hands-on experience with real-world software development challenges. My projects, including an AI Career Coach platform and an Inventory Management System, demonstrate my ability to architect and deliver complete full-stack solutions.

I am proficient in Python, FastAPI, MongoDB, React, and Spring Boot, and have practical experience with LangGraph and Groq API for building agentic AI systems. I believe my technical background and passion for building scalable backend systems make me an excellent fit for your team.

I would love the opportunity to contribute to your organization and am available for an interview at your earliest convenience.

Sincerely,
Nisha Sangwan""",
    "key_highlights": ["AI internship at CDAC", "AI Career Coach project with LangGraph", "Full-stack skills across frontend and backend"],
    "word_count": 165
}

MOCK_INTERVIEW_QUESTIONS = {
    "role": "Python Backend Developer",
    "difficulty": "MEDIUM",
    "hr_questions": [
        {"question": "Tell me about yourself.", "tip": "Focus on your technical journey, internship, and key projects"},
        {"question": "Why do you want to work here?", "tip": "Research the company and align with their tech stack"},
        {"question": "Where do you see yourself in 5 years?", "tip": "Show ambition aligned with a senior backend/ML role"}
    ],
    "technical_questions": [
        {"question": "Explain FastAPI vs Flask. When would you choose one over the other?", "expected_topics": ["async support", "auto docs", "Pydantic", "performance"], "difficulty": "MEDIUM"},
        {"question": "What is the difference between SQL and NoSQL databases?", "expected_topics": ["ACID", "scalability", "schema", "use cases"], "difficulty": "EASY"},
        {"question": "Explain REST API design principles.", "expected_topics": ["stateless", "HTTP methods", "status codes", "resources"], "difficulty": "EASY"}
    ],
    "behavioral_questions": [
        {"question": "Tell me about a challenging bug you solved during your internship.", "competency": "problem-solving"},
        {"question": "Describe a time you had to learn a new technology quickly.", "competency": "adaptability"}
    ],
    "coding_questions": [
        {"question": "Write a FastAPI endpoint that accepts a resume file and returns extracted text.", "hint": "Use UploadFile and python-docx or PyPDF2", "time_limit": "20 mins"},
        {"question": "Implement a simple LRU Cache in Python.", "hint": "Use OrderedDict from collections", "time_limit": "15 mins"}
    ],
    "scenario_questions": [
        {"scenario": "Your API response time suddenly increased from 100ms to 2s. How would you debug?", "what_to_evaluate": "debugging skills, performance analysis"},
        {"scenario": "A client wants to add 10 new features in 1 week. How do you handle this?", "what_to_evaluate": "communication, prioritization, project management"}
    ],
    "total_questions": 12
}

MOCK_INTERVIEW_EVALUATION = {
    "overall_rating": 7,
    "scores": {
        "technical_accuracy": 75,
        "communication": 80,
        "confidence": 70,
        "grammar_clarity": 85,
        "relevance": 78
    },
    "strengths": ["Clear explanation", "Good structure", "Relevant examples"],
    "improvements": ["Add more technical depth", "Use specific metrics/numbers", "Mention edge cases"],
    "ideal_answer_hints": ["Mention time/space complexity", "Talk about trade-offs", "Reference real-world use cases"],
    "missing_points": ["Performance considerations", "Error handling approach", "Testing strategy"],
    "grammar_issues": [],
    "verdict": "GOOD",
    "detailed_feedback": "The answer demonstrates a solid understanding of the core concept. The candidate communicated clearly and used relevant examples. To improve, focus on adding technical depth by discussing trade-offs, edge cases, and performance implications. Using specific metrics from real experience would significantly strengthen the answer."
}
