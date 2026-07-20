package com.aiCareerCoach.AiCareer.queue;

import com.aiCareerCoach.AiCareer.entity.AnalysisReport;
import com.aiCareerCoach.AiCareer.enums.AnalysisStatus;
import com.aiCareerCoach.AiCareer.repository.AnalysisReportRepository;
import com.aiCareerCoach.AiCareer.service.AiServiceClient;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;
import com.aiCareerCoach.AiCareer.dto.ai.WorkflowEnvelope;
import com.aiCareerCoach.AiCareer.dto.ai.WorkflowData;
import java.math.BigDecimal;
import java.time.Duration;

@Component
public class AiJobListener {

    private final StringRedisTemplate redisTemplate;
    private final JsonMapper jsonMapper;
    private final AiServiceClient aiServiceClient;
    private final AnalysisReportRepository analysisReportRepository;

    @Value("${ai.queue.name}")
    private String queueName;

    public AiJobListener(StringRedisTemplate redisTemplate, JsonMapper jsonMapper,
                         AiServiceClient aiServiceClient, AnalysisReportRepository analysisReportRepository) {
        this.redisTemplate = redisTemplate;
        this.jsonMapper = jsonMapper;
        this.aiServiceClient = aiServiceClient;
        this.analysisReportRepository = analysisReportRepository;
    }

    @PostConstruct
    public void startListening() {
        Thread listenerThread = new Thread(this::listen);
        listenerThread.setDaemon(true);
        listenerThread.start();
    }

    private void listen() {
        while (true) {
            try {
                String json = redisTemplate.opsForList().rightPop(queueName, Duration.ofSeconds(5));
                if (json == null) continue;

                AiJobPayload payload = jsonMapper.readValue(json, AiJobPayload.class);
                processJob(payload);
            } catch (Exception e) {
                System.out.println("AI job processing failed: " + e.getMessage());
                Throwable t = e.getCause();
                int depth = 1;
                while (t != null) {
                    System.out.println("  ".repeat(depth) + "caused by [" + t.getClass().getName() + "]: " + t.getMessage());
                    t = t.getCause();
                    depth++;
                }
                try { Thread.sleep(2000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            }
        }
    }

    private void processJob(AiJobPayload payload) {
        AnalysisReport report = analysisReportRepository.findById(payload.analysisReportId()).orElseThrow();
        report.setStatus(AnalysisStatus.IN_PROGRESS);
        analysisReportRepository.save(report);

        try {
            WorkflowEnvelope envelope = aiServiceClient.runWorkflow(
                    payload.analysisReportId(), payload.resumeText(), payload.jdText(), null);
            WorkflowData result = envelope.data();

            if (result.atsResult() != null && result.atsResult().get("ats_score") != null) {
                report.setAtsScore(BigDecimal.valueOf(((Number) result.atsResult().get("ats_score")).doubleValue()));
            }
            if (result.skillGap() != null && result.skillGap().get("match_percentage") != null) {
                report.setMatchPercentage(BigDecimal.valueOf(((Number) result.skillGap().get("match_percentage")).doubleValue()));
            }
            report.setRecruiterDecision(result.recruiterDecision());
            if (result.coverLetter() != null) {
                report.setCoverLetter((String) result.coverLetter().get("cover_letter"));
            }
            report.setEmailDraft(result.emailDraft());
            if (result.feedback() != null) {
                report.setFeedback(String.join("\n", result.feedback()));
            }

            String status = result.status();
            report.setStatus("PARTIAL".equals(status) ? AnalysisStatus.PARTIAL : AnalysisStatus.valueOf(status));

        }catch (Exception e) {
        System.out.println("Analysis failed for report " + payload.analysisReportId() + ": " + e.getMessage());
        Throwable cause = e.getCause();
        int depth = 1;
        while (cause != null) {
            System.out.println("  ".repeat(depth) + "caused by [" + cause.getClass().getName() + "]: " + cause.getMessage());
            cause = cause.getCause();
            depth++;
        }
        report.setStatus(AnalysisStatus.FAILED);
    }

        analysisReportRepository.save(report);
    }
}