package com.aiCareerCoach.AiCareer.dto.analysis;

import com.aiCareerCoach.AiCareer.enums.AnalysisStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AnalysisReportResponse(
        Long id,
        Long resumeId,
        Long jobDescriptionId,
        BigDecimal atsScore,
        BigDecimal matchPercentage,
        String recruiterDecision,
        String feedback,
        String coverLetter,
        String emailDraft,
        String interviewQuestions,
        String learningRoadmap,
        AnalysisStatus status,
        LocalDateTime analysisTimestamp
) {}