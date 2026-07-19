import traceback
import json

from app.workflow.graph import graph


initial_state = {
    "analysisReportId": 1,
    "resumeText": """
Nisha Sangwan

B.Tech Computer Science

Skills:
Python
Java
SQL
React
FastAPI
Spring Boot
MongoDB

Experience

AI Intern at CDAC

Projects

AI Career Coach
Inventory Management System
""",
    "jdText": "Looking for Python Developer",
    "completedSteps": [],
    "status": "IN_PROGRESS",
}

config = {
    "configurable": {
        "thread_id": "101"
    }
}

try:
    result = graph.invoke(
        initial_state,
        config=config
    )

    print("\n" + "="*60)
    print("[OK] Workflow Completed Successfully")
    print("="*60)
    print(f"Completed Steps : {result.get('completedSteps')}")
    print(f"Status          : {result.get('status')}")
    print(f"ATS Score       : {result.get('atsScore')}")
    print(f"Match Percent   : {result.get('matchPercent')}")
    print(f"Recruiter       : {result.get('recruiterDecision')}")
    parsed = result.get('parsedResume')
    print(f"Parsed Resume   : {json.dumps(parsed, indent=2, default=str)[:500]}")
    print("="*60)

except Exception:
    print("\nWorkflow Failed\n")
    traceback.print_exc()