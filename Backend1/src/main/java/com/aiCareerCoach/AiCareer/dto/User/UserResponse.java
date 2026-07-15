package com.aiCareerCoach.AiCareer.dto.User;

public record UserResponse(
        Long id, String name, String email, String role,
        String plan, java.time.LocalDateTime planRenewsAt
) {}
