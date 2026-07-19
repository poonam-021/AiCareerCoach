"""
API package init — registers all routers.
"""
from .resume import router as resume_router
from .career import router as career_router
from .interview import router as interview_router
from .workflow import router as workflow_router

__all__ = ["resume_router", "career_router", "interview_router", "workflow_router"]
