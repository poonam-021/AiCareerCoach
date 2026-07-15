package com.aiCareerCoach.AiCareer.Repository;

import com.aiCareerCoach.AiCareer.entity.RoadmapItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoadMapItemRepository extends JpaRepository<RoadmapItem, Long> {
    List<RoadmapItem> findByAnalysisReportId(Long analysisReportId);
}