package com.aiCareerCoach.AiCareer.dto.interview;

import java.time.LocalDateTime;
import java.util.List;

public record InterviewSessionResponse(
        Long id,
        String category,
        String difficulty,
        Integer questionCount,
        Integer score,
        LocalDateTime createdAt,
        List<AnswerResponse> answers
) {
    public record AnswerResponse(
            Long id,
            String questionText,
            String answerText,
            String feedbackLabel,
            String feedbackTip,
            Integer orderIndex
    ) {}
}
