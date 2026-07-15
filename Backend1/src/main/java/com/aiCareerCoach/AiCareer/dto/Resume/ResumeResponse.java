package com.aiCareerCoach.AiCareer.dto.Resume;

public record ResumeResponse(
        Long id, String fileName, String publicUrl, String fileType,
        Long fileSize, boolean isActive, java.time.LocalDateTime uploadDate
) {}