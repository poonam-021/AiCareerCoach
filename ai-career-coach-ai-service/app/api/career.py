"""
Career-related API endpoints.
POST /career/recommend
POST /skill-gap
POST /roadmap
POST /projects
POST /courses
"""
import logging
from fastapi import APIRouter

from app.schemas.requests import (
    CareerRecommendRequest,
    SkillGapRequest,
    RoadmapRequest,
    ProjectRecommendRequest,
    CourseRecommendRequest,
)
from app.agents import (
    career_recommender_agent,
    skill_gap_agent,
    roadmap_generator_agent,
    project_recommender_agent,
    course_recommender_agent,
)
from app.utils import success_response, error_response, Timer

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Career"])


@router.post("/career/recommend")
async def recommend_career(request: CareerRecommendRequest):
    """Recommend best-fit career roles and domains based on resume."""
    with Timer() as t:
        try:
            data = career_recommender_agent(request.resume_text)
            return success_response(data, "Career recommendations generated", t.elapsed)
        except Exception as e:
            logger.error(f"[/career/recommend] Error: {e}", exc_info=True)
            return error_response(f"Career recommendation failed: {str(e)}", execution_time=t.elapsed)


@router.post("/skill-gap")
async def analyze_skill_gap(request: SkillGapRequest):
    """Identify skill gaps between resume and job description."""
    with Timer() as t:
        try:
            data = skill_gap_agent(request.resume_text, request.jd_text)
            return success_response(data, "Skill gap analysis completed", t.elapsed)
        except Exception as e:
            logger.error(f"[/skill-gap] Error: {e}", exc_info=True)
            return error_response(f"Skill gap analysis failed: {str(e)}", execution_time=t.elapsed)


@router.post("/roadmap")
async def generate_roadmap(request: RoadmapRequest):
    """Generate a personalized 30/60/90-day learning roadmap."""
    with Timer() as t:
        try:
            data = roadmap_generator_agent(request.resume_text, request.jd_text)
            return success_response(data, "Learning roadmap generated", t.elapsed)
        except Exception as e:
            logger.error(f"[/roadmap] Error: {e}", exc_info=True)
            return error_response(f"Roadmap generation failed: {str(e)}", execution_time=t.elapsed)


@router.post("/projects")
async def recommend_projects(request: ProjectRecommendRequest):
    """Recommend hands-on projects to build for skill development."""
    with Timer() as t:
        try:
            data = project_recommender_agent(request.resume_text, request.jd_text or "")
            return success_response(data, "Project recommendations generated", t.elapsed)
        except Exception as e:
            logger.error(f"[/projects] Error: {e}", exc_info=True)
            return error_response(f"Project recommendation failed: {str(e)}", execution_time=t.elapsed)


@router.post("/courses")
async def recommend_courses(request: CourseRecommendRequest):
    """Recommend courses, certifications and learning resources."""
    with Timer() as t:
        try:
            data = course_recommender_agent(request.resume_text, request.jd_text)
            return success_response(data, "Course recommendations generated", t.elapsed)
        except Exception as e:
            logger.error(f"[/courses] Error: {e}", exc_info=True)
            return error_response(f"Course recommendation failed: {str(e)}", execution_time=t.elapsed)
