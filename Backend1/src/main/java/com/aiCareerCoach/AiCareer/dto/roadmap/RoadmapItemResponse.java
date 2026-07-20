package com.aiCareerCoach.AiCareer.dto.roadmap;

import java.time.LocalDateTime;

public record RoadmapItemResponse(
        Long id,
        Long analysisReportId,
        String skill,
        String resources,
        boolean isCompleted,
        LocalDateTime createdAt
) {}
