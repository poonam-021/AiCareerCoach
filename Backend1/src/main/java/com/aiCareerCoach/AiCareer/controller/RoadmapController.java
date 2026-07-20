package com.aiCareerCoach.AiCareer.controller;

import com.aiCareerCoach.AiCareer.dto.roadmap.RoadmapItemResponse;
import com.aiCareerCoach.AiCareer.entity.RoadmapItem;
import com.aiCareerCoach.AiCareer.repository.RoadmapItemRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmap")
public class RoadmapController {

    private final RoadmapItemRepository roadmapItemRepository;

    public RoadmapController(RoadmapItemRepository roadmapItemRepository) {
        this.roadmapItemRepository = roadmapItemRepository;
    }

    @GetMapping("/{analysisReportId}")
    public List<RoadmapItemResponse> getRoadmap(@PathVariable Long analysisReportId) {
        return roadmapItemRepository.findByAnalysisReportId(analysisReportId)
                .stream().map(this::toDto).toList();
    }

    public record ToggleRequest(boolean isCompleted) {}

    @PutMapping("/items/{id}")
    public RoadmapItemResponse toggleItem(@PathVariable Long id, @RequestBody ToggleRequest req) {
        RoadmapItem item = roadmapItemRepository.findById(id).orElseThrow();
        item.setCompleted(req.isCompleted());
        return toDto(roadmapItemRepository.save(item));
    }

    private RoadmapItemResponse toDto(RoadmapItem r) {
        return new RoadmapItemResponse(
                r.getId(),
                r.getAnalysisReport() != null ? r.getAnalysisReport().getId() : null,
                r.getSkill(),
                r.getResources(),
                r.isCompleted(),
                r.getCreatedAt()
        );
    }
}