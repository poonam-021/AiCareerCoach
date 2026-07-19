"""
Nodes package — exports all active LangGraph workflow nodes.

Deleted (dead weight, replaced by real nodes):
  - ats_node   → replaced by ats_check_node  (calls ats_checker_agent)
  - match_node → replaced by skill_gap_node  (calls skill_gap_agent)
"""
# Parsing
from .parse_resume import parse_resume_node
from .parse_jd import parse_jd_node

# Scoring & analysis
from .resume_score import resume_score_node
from .ats_check import ats_check_node
from .skill_gap import skill_gap_node

# Decision & content generation
from .recruiter import recruiter_node
from .cover_letter import cover_letter_node
from .email import email_node
from .feedback import feedback_node

# Recommendations
from .career_recommend import career_recommend_node
from .roadmap import roadmap_generate_node
from .project_recommend import project_recommend_node
from .course_recommend import course_recommend_node

__all__ = [
    # Parsing
    "parse_resume_node",
    "parse_jd_node",
    # Scoring & analysis
    "resume_score_node",
    "ats_check_node",
    "skill_gap_node",
    # Decision & content
    "recruiter_node",
    "cover_letter_node",
    "email_node",
    "feedback_node",
    # Recommendations
    "career_recommend_node",
    "roadmap_generate_node",
    "project_recommend_node",
    "course_recommend_node",
]
