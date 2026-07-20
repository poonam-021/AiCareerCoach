package com.aiCareerCoach.AiCareer.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request body for POST /interview/questions on the FastAPI AI service.
 * Fields use snake_case to match FastAPI's Pydantic model (InterviewQuestionsRequest).
 */
public record InterviewQuestionsRequest(
        @JsonProperty("resume_text") String resumeText,
        @JsonProperty("jd_text") String jdText,
        String difficulty
) {}
