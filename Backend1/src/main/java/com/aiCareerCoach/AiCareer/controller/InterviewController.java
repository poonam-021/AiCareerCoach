package com.aiCareerCoach.AiCareer.controller;

import com.aiCareerCoach.AiCareer.dto.ai.*;
import com.aiCareerCoach.AiCareer.dto.interview.InterviewSessionResponse;
import com.aiCareerCoach.AiCareer.entity.*;
import com.aiCareerCoach.AiCareer.repository.*;
import com.aiCareerCoach.AiCareer.service.AiServiceClient;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewSessionAnswerRepository answerRepository;
    private final AiServiceClient aiServiceClient;

    public InterviewController(InterviewSessionRepository sessionRepository,
                               InterviewSessionAnswerRepository answerRepository,
                               AiServiceClient aiServiceClient) {
        this.sessionRepository = sessionRepository;
        this.answerRepository = answerRepository;
        this.aiServiceClient = aiServiceClient;
    }

    public record StartSessionRequest(String category, String difficulty, Integer questionCount) {}
    public record SessionStartResponse(Long sessionId, String question) {}
    public record SubmitAnswerRequest(String answer) {}
    public record AnswerFeedbackResponse(Integer score, String feedbackLabel, String feedbackTip,
                                         String nextQuestion, boolean sessionComplete, Integer finalScore) {}

    @PostMapping("/sessions")
    public SessionStartResponse startSession(@AuthenticationPrincipal User user,
                                             @RequestBody StartSessionRequest req) {
        InterviewSession session = InterviewSession.builder()
                .user(user).category(req.category()).difficulty(req.difficulty())
                .questionCount(req.questionCount()).build();
        InterviewSession saved = sessionRepository.save(session);

        // Generate first question via the correct AI endpoint: POST /interview/questions
        InterviewQuestionsResponse aiResponse = aiServiceClient.generateQuestion(
                "", "", req.difficulty() != null ? req.difficulty().toUpperCase() : "MEDIUM");

        String firstQuestion = aiResponse.firstQuestion();
        if (firstQuestion == null) firstQuestion = "Tell me about yourself and your experience.";

        InterviewSessionAnswer firstQ = InterviewSessionAnswer.builder()
                .session(saved).questionText(firstQuestion).orderIndex(0).build();
        answerRepository.save(firstQ);

        return new SessionStartResponse(saved.getId(), firstQuestion);
    }

    @PostMapping("/sessions/{id}/answers")
    public AnswerFeedbackResponse submitAnswer(@PathVariable Long id,
                                               @RequestBody SubmitAnswerRequest req) {
        InterviewSession session = sessionRepository.findById(id).orElseThrow();
        List<InterviewSessionAnswer> answers = answerRepository.findBySessionIdOrderByOrderIndexAsc(id);
        InterviewSessionAnswer current = answers.get(answers.size() - 1);
        current.setAnswerText(req.answer());

        // Evaluate the answer via the correct AI endpoint: POST /interview/evaluate
        InterviewEvaluateResponse evalResult = aiServiceClient.evaluateAnswer(
                current.getQuestionText(), req.answer(), session.getCategory());

        current.setFeedbackLabel(evalResult.feedbackLabel());
        current.setFeedbackTip(evalResult.feedbackTip());
        answerRepository.save(current);

        boolean isComplete = answers.size() >= session.getQuestionCount();

        if (isComplete) {
            int avgScore = (int) answers.stream()
                    .mapToInt(a -> evalResult.score() != null ? evalResult.score() : 0)
                    .average().orElse(0);
            session.setScore(avgScore);
            sessionRepository.save(session);
            return new AnswerFeedbackResponse(evalResult.score(), evalResult.feedbackLabel(),
                    evalResult.feedbackTip(), null, true, avgScore);
        }

        // Generate next question
        InterviewQuestionsResponse nextQ = aiServiceClient.generateQuestion(
                "", "", evalResult.suggestedNextDifficulty() != null
                        ? evalResult.suggestedNextDifficulty().toUpperCase() : "MEDIUM");

        String nextQuestion = nextQ.firstQuestion();
        if (nextQuestion == null) nextQuestion = evalResult.nextQuestion();

        InterviewSessionAnswer nextAnswer = InterviewSessionAnswer.builder()
                .session(session).questionText(nextQuestion != null ? nextQuestion : "Next question")
                .orderIndex(answers.size()).build();
        answerRepository.save(nextAnswer);

        return new AnswerFeedbackResponse(evalResult.score(), evalResult.feedbackLabel(),
                evalResult.feedbackTip(), nextQuestion, false, null);
    }

    @GetMapping("/sessions")
    public List<InterviewSessionResponse> listSessions(@AuthenticationPrincipal User user) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDto).toList();
    }

    @GetMapping("/sessions/{id}")
    public InterviewSessionResponse getSession(@PathVariable Long id) {
        return toDto(sessionRepository.findById(id).orElseThrow());
    }

    private InterviewSessionResponse toDto(InterviewSession s) {
        List<InterviewSessionResponse.AnswerResponse> answers = answerRepository
                .findBySessionIdOrderByOrderIndexAsc(s.getId())
                .stream()
                .map(a -> new InterviewSessionResponse.AnswerResponse(
                        a.getId(), a.getQuestionText(), a.getAnswerText(),
                        a.getFeedbackLabel(), a.getFeedbackTip(), a.getOrderIndex()))
                .toList();
        return new InterviewSessionResponse(
                s.getId(), s.getCategory(), s.getDifficulty(),
                s.getQuestionCount(), s.getScore(), s.getCreatedAt(), answers);
    }
}