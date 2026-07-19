"""
Complete AI Career Coach LangGraph Workflow.

Full pipeline:
  parseResume ─┐
  parseJd    ─┘→ resumeScore → atsCheck → skillGap →
  careerRecommend → roadmap → projectRecommend → courseRecommend →
  recruiter → coverLetter → email → feedback → END

Each node calls a Groq/Llama-3.3 agent, saves a Redis checkpoint after
completing, and returns only the fields it owns as a state update.
"""
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.workflow.state import WorkflowState

from app.nodes import (
    # Parsing
    parse_resume_node,
    parse_jd_node,
    # Scoring & analysis
    resume_score_node,
    ats_check_node,
    skill_gap_node,
    # Recommendations
    career_recommend_node,
    roadmap_generate_node,
    project_recommend_node,
    course_recommend_node,
    # Decision & content generation
    recruiter_node,
    cover_letter_node,
    email_node,
    feedback_node,
)


builder = StateGraph(WorkflowState)


# ---------------------------------------------------------------------------
# Add Nodes
# ---------------------------------------------------------------------------

builder.add_node("parseResume",     parse_resume_node)
builder.add_node("parseJd",         parse_jd_node)
builder.add_node("resumeScore",     resume_score_node)
builder.add_node("atsCheck",        ats_check_node)
builder.add_node("skillGap",        skill_gap_node)
builder.add_node("careerRecommend", career_recommend_node)
builder.add_node("roadmap",         roadmap_generate_node)
builder.add_node("projectRecommend",project_recommend_node)
builder.add_node("courseRecommend", course_recommend_node)
builder.add_node("recruiter",       recruiter_node)
builder.add_node("coverLetter",     cover_letter_node)
builder.add_node("email",           email_node)
builder.add_node("feedback",        feedback_node)


# ---------------------------------------------------------------------------
# Workflow Edges
# ---------------------------------------------------------------------------

# Both parsers run first (parseJd runs in parallel conceptually but
# LangGraph serial execution means parseJd happens right after parseResume
# before any node that needs parsedJd data)
builder.add_edge(START,            "parseResume")
builder.add_edge("parseResume",    "parseJd")

# Core analysis chain
builder.add_edge("parseJd",        "resumeScore")
builder.add_edge("resumeScore",    "atsCheck")
builder.add_edge("atsCheck",       "skillGap")

# Recommendation chain
builder.add_edge("skillGap",       "careerRecommend")
builder.add_edge("careerRecommend","roadmap")
builder.add_edge("roadmap",        "projectRecommend")
builder.add_edge("projectRecommend","courseRecommend")

# Decision & content generation (uses atsScore + matchPercent from earlier)
builder.add_edge("courseRecommend","recruiter")
builder.add_edge("recruiter",      "coverLetter")
builder.add_edge("coverLetter",    "email")
builder.add_edge("email",          "feedback")
builder.add_edge("feedback",       END)


# ---------------------------------------------------------------------------
# Compile with MemorySaver (thread-level LangGraph checkpointing).
# Per-node Redis checkpointing is handled inside each node via
# checkpoint_service.save_checkpoint() — this is the durable persistence
# layer that /workflow/run reads back on failure for partial results.
# ---------------------------------------------------------------------------

memory = MemorySaver()
graph = builder.compile(checkpointer=memory)