package com.aiCareerCoach.AiCareer.dto.dashboard;

import java.time.LocalDateTime;

public record ActivityLogResponse(
        Long id,
        String type,
        String title,
        String meta,
        LocalDateTime createdAt
) {}
