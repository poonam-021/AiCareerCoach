package com.aiCareerCoach.AiCareer.dto.ai;

import java.util.List;
import java.util.Map;

/**
 * Response envelope from POST /interview/questions.
 * FastAPI returns: { "success": true, "message": "...", "data": { questions: [...] } }
 */
public record InterviewQuestionsResponse(
        boolean success,
        String message,
        Map<String, Object> data
) {
    /** Convenience: pull the first question string out of data, if available */
    public String firstQuestion() {
        if (data == null) return null;
        Object q = data.get("questions");
        if (q instanceof List<?> list && !list.isEmpty()) {
            return String.valueOf(list.get(0));
        }
        // Fallback: some agents return a single "question" key
        Object single = data.get("question");
        return single != null ? String.valueOf(single) : null;
    }
}
