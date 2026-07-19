"""
All Pydantic request/response schemas for the AI Career Coach API.

Naming:
  *Request  -> API input body
  *Response -> data field inside the API envelope
"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime, timezone


# ===========================================================================
# STANDARD ENVELOPE
# ===========================================================================

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Any
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    execution_time: str = "N/A"


# ===========================================================================
# REQUEST SCHEMAS
# ===========================================================================

class ResumeParseRequest(BaseModel):
    resume_text: str = Field(..., min_length=20, description="Full resume text")


class ResumeScoreRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    jd_text: Optional[str] = Field(None, description="Optional job description")


class ResumeAtsRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    jd_text: str = Field(..., min_length=20)


class ResumeRewriteRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    jd_text: str = Field(..., min_length=20)


class SkillGapRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    jd_text: str = Field(..., min_length=20)


class CareerRecommendRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)


class RoadmapRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    jd_text: str = Field(..., min_length=20)


class ProjectRecommendRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    jd_text: Optional[str] = None


class CourseRecommendRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    jd_text: str = Field(..., min_length=20)


class CoverLetterRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    jd_text: str = Field(..., min_length=20)
    company_name: Optional[str] = None


class InterviewQuestionsRequest(BaseModel):
    resume_text: str = Field(..., min_length=20)
    jd_text: str = Field(..., min_length=20)
    difficulty: str = Field(default="MEDIUM", pattern="^(EASY|MEDIUM|HARD)$")


class InterviewEvaluateRequest(BaseModel):
    question: str = Field(..., min_length=5)
    answer: str = Field(..., min_length=5)
    expected_role: Optional[str] = None
