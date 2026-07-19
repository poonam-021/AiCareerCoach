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
    companyName: str         # Optional - for cover letter

    # -------------------------------------------------------------------
    # Workflow tracking
    # -------------------------------------------------------------------
    currentStep: Optional[str]
    completedSteps: list
    status: str              # IN_PROGRESS | COMPLETED | FAILED
    error: Optional[str]

    # -------------------------------------------------------------------
    # Agent outputs
    # -------------------------------------------------------------------
    parsedResume: Optional[Any]         # dict from resume_parser
    resumeScore: Optional[Any]          # dict from resume_scorer
    atsResult: Optional[Any]            # dict from ats_checker
    skillGap: Optional[Any]             # dict from skill_gap
    careerRoles: Optional[Any]          # dict from career_recommender
    roadmap: Optional[Any]              # dict from roadmap_generator
    courses: Optional[Any]              # dict from course_recommender
    projects: Optional[Any]             # dict from project_recommender
    rewrittenResume: Optional[str]      # str from resume_rewriter
    coverLetter: Optional[Any]          # dict from cover_letter
    interviewQuestions: Optional[Any]   # dict from interview_question_generator
    interviewEvaluation: Optional[Any]  # dict from interview_evaluator

    # -------------------------------------------------------------------
    # Legacy fields (kept for backward compatibility)
    # -------------------------------------------------------------------
    parsedJd: Optional[Any]
    atsScore: Optional[float]
    scoreBreakdown: Optional[list]
    skillGaps: Optional[list]
    matchPercent: Optional[float]
    matchedKeywords: Optional[list]
    missingKeywords: Optional[list]
    recruiterDecision: Optional[str]
    recruiterReasoning: Optional[str]
    feedback: Optional[list]
    emailDraft: Optional[str]
    roadmapItems: Optional[list]