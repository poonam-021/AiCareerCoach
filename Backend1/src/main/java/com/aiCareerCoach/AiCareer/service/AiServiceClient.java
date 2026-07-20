package com.aiCareerCoach.AiCareer.service;

import com.aiCareerCoach.AiCareer.dto.ai.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class AiServiceClient {

    private final RestClient aiRestClient;

    public AiServiceClient(RestClient aiRestClient) {
        this.aiRestClient = aiRestClient;
    }

    public WorkflowEnvelope runWorkflow(Long analysisReportId, String resumeText, String jdText, String companyName) {
        try {
            return aiRestClient.post()
                    .uri("/workflow/run")
                    .body(new WorkflowRunRequest(resumeText, jdText, analysisReportId, "MEDIUM", companyName))
                    .retrieve()
                    .body(WorkflowEnvelope.class);
        } catch (RestClientException e) {
            throw new AiServiceException("AI service failed during workflow run", e);
        }
    }


    public InterviewQuestionsResponse generateQuestion(String resumeText, String jdText, String difficulty) {
        try {
            return aiRestClient.post()
                    .uri("/interview/questions")
                    .body(new InterviewQuestionsRequest(resumeText, jdText, difficulty))
                    .retrieve()
                    .body(InterviewQuestionsResponse.class);
        } catch (RestClientException e) {
            throw new AiServiceException("AI service failed during question generation", e);
        }
    }

    /**
     * Calls POST /interview/evaluate on the FastAPI service.
     * Used to evaluate a candidate answer and return score + feedback.
     */
    public InterviewEvaluateResponse evaluateAnswer(String question, String answer, String expectedRole) {
        try {
            return aiRestClient.post()
                    .uri("/interview/evaluate")
                    .body(new InterviewEvaluateRequest(question, answer, expectedRole))
                    .retrieve()
                    .body(InterviewEvaluateResponse.class);
        } catch (RestClientException e) {
            throw new AiServiceException("AI service failed during answer evaluation", e);
        }
    }
}