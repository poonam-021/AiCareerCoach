package com.aiCareerCoach.AiCareer.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * Response envelope from POST /interview/evaluate.
 * FastAPI returns: { "success": true, "message": "...", "data": { score: ..., feedback_label: ..., ... } }
 */
public record InterviewEvaluateResponse(
        boolean success,
        String message,
        Map<String, Object> data
) {
    public Integer score() {
        if (data == null) return null;
        Object s = data.get("score");
        return s instanceof Number n ? n.intValue() : null;
    }

    public String feedbackLabel() {
        if (data == null) return null;
        Object v = data.get("feedback_label");
        return v != null ? String.valueOf(v) : null;
    }

    public String feedbackTip() {
        if (data == null) return null;
        Object v = data.get("feedback_tip");
        return v != null ? String.valueOf(v) : null;
    }

    public String suggestedNextDifficulty() {
        if (data == null) return "MEDIUM";
        Object v = data.get("suggested_next_difficulty");
        return v != null ? String.valueOf(v) : "MEDIUM";
    }

    public String nextQuestion() {
        if (data == null) return null;
        Object v = data.get("next_question");
        return v != null ? String.valueOf(v) : null;
    }
}
