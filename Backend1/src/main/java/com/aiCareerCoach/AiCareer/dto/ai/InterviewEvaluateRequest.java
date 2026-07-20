package com.aiCareerCoach.AiCareer.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request body for POST /interview/evaluate on the FastAPI AI service.
 * Fields use snake_case to match FastAPI's Pydantic model (InterviewEvaluateRequest).
 */
public record InterviewEvaluateRequest(
        String question,
        String answer,
        @JsonProperty("expected_role") String expectedRole
) {}
