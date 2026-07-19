"""
Complete AI Career Coach LangGraph Workflow.

Full pipeline:
parseResume -> resumeScore -> atsCheck -> skillGap ->
careerRecommend -> roadmap -> projectRecommend -> courseRecommend -> END

Each node calls a Groq LLM agent, saves a Redis checkpoint, and returns state updates.
"""
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.workflow.state import WorkflowState

from app.nodes import (
    # Core parsing
    parse_resume_node,

    # Scoring & analysis
    resume_score_node,
    ats_check_node,
    skill_gap_node,

    # Recommendations
    career_recommend_node,
    roadmap_generate_node,
    project_recommend_node,
    course_recommend_node,
)


builder = StateGraph(WorkflowState)


# ---------------------------------------------------------------------------
# Add Nodes
# ---------------------------------------------------------------------------

builder.add_node("parseResume", parse_resume_node)
builder.add_node("resumeScore", resume_score_node)
builder.add_node("atsCheck", ats_check_node)
builder.add_node("skillGap", skill_gap_node)
builder.add_node("careerRecommend", career_recommend_node)
builder.add_node("roadmap", roadmap_generate_node)
builder.add_node("projectRecommend", project_recommend_node)
builder.add_node("courseRecommend", course_recommend_node)


# ---------------------------------------------------------------------------
# Workflow Edges
# ---------------------------------------------------------------------------

builder.add_edge(START, "parseResume")
builder.add_edge("parseResume", "resumeScore")
builder.add_edge("resumeScore", "atsCheck")
builder.add_edge("atsCheck", "skillGap")
builder.add_edge("skillGap", "careerRecommend")
builder.add_edge("careerRecommend", "roadmap")
builder.add_edge("roadmap", "projectRecommend")
builder.add_edge("projectRecommend", "courseRecommend")
builder.add_edge("courseRecommend", END)


# ---------------------------------------------------------------------------
# Compile with MemorySaver (thread-level LangGraph checkpointing)
# Our custom Redis checkpointing is done inside each node via checkpoint_service.
# ---------------------------------------------------------------------------

memory = MemorySaver()
graph = builder.compile(checkpointer=memory)