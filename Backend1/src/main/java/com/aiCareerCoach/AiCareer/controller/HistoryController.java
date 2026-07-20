package com.aiCareerCoach.AiCareer.controller;

import com.aiCareerCoach.AiCareer.dto.analysis.AnalysisReportResponse;
import com.aiCareerCoach.AiCareer.entity.AnalysisReport;
import com.aiCareerCoach.AiCareer.entity.User;
import com.aiCareerCoach.AiCareer.repository.AnalysisReportRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final AnalysisReportRepository analysisReportRepository;

    public HistoryController(AnalysisReportRepository analysisReportRepository) {
        this.analysisReportRepository = analysisReportRepository;
    }

    @GetMapping
    public List<AnalysisReportResponse> list(@AuthenticationPrincipal User user) {
        return analysisReportRepository.findByUserIdOrderByAnalysisTimestampDesc(user.getId())
                .stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public AnalysisReportResponse get(@PathVariable Long id) {
        return toDto(analysisReportRepository.findById(id).orElseThrow());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        analysisReportRepository.deleteById(id);
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