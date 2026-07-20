package com.aiCareerCoach.AiCareer.controller;

import com.aiCareerCoach.AiCareer.dto.analysis.AnalysisJobResponse;
import com.aiCareerCoach.AiCareer.dto.analysis.AnalysisReportResponse;
import com.aiCareerCoach.AiCareer.queue.AiJobPayload;
import com.aiCareerCoach.AiCareer.entity.*;
import com.aiCareerCoach.AiCareer.enums.AnalysisStatus;
import com.aiCareerCoach.AiCareer.queue.AiJobProducer;
import com.aiCareerCoach.AiCareer.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    private final ResumeRepository resumeRepository;
    private final JobDescriptionRepository jdRepository;
    private final AnalysisReportRepository analysisReportRepository;
    private final AiJobProducer aiJobProducer;

    public AnalysisController(ResumeRepository resumeRepository, JobDescriptionRepository jdRepository,
                              AnalysisReportRepository analysisReportRepository, AiJobProducer aiJobProducer) {
        this.resumeRepository = resumeRepository;
        this.jdRepository = jdRepository;
        this.analysisReportRepository = analysisReportRepository;
        this.aiJobProducer = aiJobProducer;
    }

    @PostMapping("/complete-analysis")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public AnalysisJobResponse startAnalysis(@AuthenticationPrincipal User user,
                                             @RequestParam Long resumeId, @RequestParam Long jdId) {
        Resume resume = resumeRepository.findById(resumeId).orElseThrow();
        JobDescription jd = jdRepository.findById(jdId).orElseThrow();

        AnalysisReport report = AnalysisReport.builder()
                .user(user).resume(resume).jobDescription(jd)
                .status(AnalysisStatus.PENDING)
                .build();
        AnalysisReport saved = analysisReportRepository.save(report);

        aiJobProducer.enqueue(new AiJobPayload(saved.getId(), resumeId, jdId,
                resume.getParsedText(), jd.getDescription()));

        return new AnalysisJobResponse(saved.getId(), AnalysisStatus.PENDING.name());
    }

    @GetMapping("/{id}")
    public AnalysisReportResponse getReport(@PathVariable Long id) {
        AnalysisReport r = analysisReportRepository.findById(id).orElseThrow();
        return toDto(r);
    }

    private AnalysisReportResponse toDto(AnalysisReport r) {
        return new AnalysisReportResponse(
                r.getId(),
                r.getResume() != null ? r.getResume().getId() : null,
                r.getJobDescription() != null ? r.getJobDescription().getId() : null,
                r.getAtsScore(),
                r.getMatchPercentage(),
                r.getRecruiterDecision(),
                r.getFeedback(),
                r.getCoverLetter(),
                r.getEmailDraft(),
                r.getInterviewQuestions(),
                r.getLearningRoadmap(),
                r.getStatus(),
                r.getAnalysisTimestamp()
        );
    }
}