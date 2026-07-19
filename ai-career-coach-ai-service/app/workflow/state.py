"""
Complete WorkflowState for the AI Career Coach LangGraph workflow.
Uses TypedDict for LangGraph compatibility.
"""
from typing import Optional, Any
from typing_extensions import TypedDict


class WorkflowState(TypedDict, total=False):

    # -------------------------------------------------------------------
    # Inputs (required)
    # -------------------------------------------------------------------
    analysisReportId: int
    resumeText: str
    jdText: str
    difficulty: str          # EASY | MEDIUM | HARD  (for interview questions)
    companyName: str         # Optional - for cover letter fallback

    # -------------------------------------------------------------------
    # Workflow tracking
    # -------------------------------------------------------------------
    currentStep: Optional[str]
    completedSteps: list
    status: str              # IN_PROGRESS | COMPLETED | FAILED
    error: Optional[str]

    # -------------------------------------------------------------------
    # Primary agent outputs (used by Spring Boot / frontend)
    # -------------------------------------------------------------------
    parsedResume: Optional[Any]         # dict from resume_parser_agent
    parsedJd: Optional[Any]             # dict from jd_parser_agent
    resumeScore: Optional[Any]          # dict from resume_scorer_agent
    atsResult: Optional[Any]            # dict from ats_checker_agent
    skillGap: Optional[Any]             # dict from skill_gap_agent
    careerRoles: Optional[Any]          # dict from career_recommender_agent
    roadmap: Optional[Any]              # dict from roadmap_generator_agent
    courses: Optional[Any]              # dict from course_recommender_agent
    projects: Optional[Any]             # dict from project_recommender_agent
    coverLetter: Optional[Any]          # dict from cover_letter_agent
    recruiterDecision: Optional[str]    # "SHORTLIST" | "REJECT" | "MAYBE"
    recruiterReasoning: Optional[str]   # explanation from recruiter_agent
    emailDraft: Optional[str]           # generated email text from email_agent
    feedback: Optional[list]            # list of improvement strings

    # Interview (used by /interview/* endpoints, not the main workflow)
    rewrittenResume: Optional[str]      # str from resume_rewriter_agent
    interviewQuestions: Optional[Any]   # dict from interview_question_generator_agent
    interviewEvaluation: Optional[Any]  # dict from interview_evaluator_agent

    # -------------------------------------------------------------------
    # Convenience / cross-node fields populated by multiple nodes
    # -------------------------------------------------------------------
    atsScore: Optional[float]           # ats_check_node → recruiter_node
    matchPercent: Optional[float]       # skill_gap_node → recruiter_node
    matchedKeywords: Optional[list]
    missingKeywords: Optional[list]
    skillGaps: Optional[list]
    scoreBreakdown: Optional[list]
    roadmapItems: Optional[list]