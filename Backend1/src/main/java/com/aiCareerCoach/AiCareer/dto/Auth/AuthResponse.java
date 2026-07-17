package com.aiCareerCoach.AiCareer.dto.Auth;
public record AuthResponse(String accessToken, String refreshToken, Long userId, String name, String email, String role) {}