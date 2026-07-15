package com.aiCareerCoach.AiCareer.Repository;

import com.aiCareerCoach.AiCareer.entity.AnalysisReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, Long> {
    List<AnalysisReport> findByUserIdOrderByAnalysisTimestampDesc(Long userId);
    Optional<AnalysisReport> findTopByJobDescriptionIdOrderByAnalysisTimestampDesc(Long jobDescriptionId);
}