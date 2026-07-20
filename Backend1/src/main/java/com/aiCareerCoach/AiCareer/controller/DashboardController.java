package com.aiCareerCoach.AiCareer.controller;

import com.aiCareerCoach.AiCareer.dto.dashboard.ActivityLogResponse;
import com.aiCareerCoach.AiCareer.entity.*;
import com.aiCareerCoach.AiCareer.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final AnalysisReportRepository analysisReportRepository;
    private final ActivityLogRepository activityLogRepository;

    public DashboardController(AnalysisReportRepository analysisReportRepository,
                               ActivityLogRepository activityLogRepository) {
        this.analysisReportRepository = analysisReportRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats(@AuthenticationPrincipal User user) {
        List<AnalysisReport> reports = analysisReportRepository.findByUserIdOrderByAnalysisTimestampDesc(user.getId());
        Double latestAts = reports.isEmpty() || reports.get(0).getAtsScore() == null
                ? null : reports.get(0).getAtsScore().doubleValue();
        return Map.of("atsScore", latestAts == null ? "" : latestAts, "totalAnalyses", reports.size());
    }

    @GetMapping("/trend")
    public List<Map<String, Object>> trend(@AuthenticationPrincipal User user) {
        return analysisReportRepository.findByUserIdOrderByAnalysisTimestampDesc(user.getId())
                .stream()
                .map(r -> Map.<String, Object>of(
                        "date", r.getAnalysisTimestamp().toString(),
                        "atsScore", r.getAtsScore() != null ? r.getAtsScore() : 0))
                .toList();
    }

    @GetMapping("/activity")
    public List<ActivityLogResponse> activity(@AuthenticationPrincipal User user) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 10))
                .stream()
                .map(a -> new ActivityLogResponse(
                        a.getId(),
                        a.getType() != null ? a.getType().name() : null,
                        a.getTitle(),
                        a.getMeta(),
                        a.getCreatedAt()
                ))
                .toList();
    }
}