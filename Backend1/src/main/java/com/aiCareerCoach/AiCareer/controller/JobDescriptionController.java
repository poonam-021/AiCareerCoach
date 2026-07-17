package com.aiCareerCoach.AiCareer.controller;

import com.aiCareerCoach.AiCareer.dto.jobdescription.JobDescriptionRequest;
import com.aiCareerCoach.AiCareer.dto.jobdescription.JobDescriptionResponse;
import com.aiCareerCoach.AiCareer.entity.JobDescription;
import com.aiCareerCoach.AiCareer.entity.User;
import com.aiCareerCoach.AiCareer.repository.AnalysisReportRepository;
import com.aiCareerCoach.AiCareer.repository.JobDescriptionRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-descriptions")
public class JobDescriptionController {

    private final JobDescriptionRepository jdRepository;
    private final AnalysisReportRepository analysisReportRepository;

    public JobDescriptionController(JobDescriptionRepository jdRepository,
                                    AnalysisReportRepository analysisReportRepository) {
        this.jdRepository = jdRepository;
        this.analysisReportRepository = analysisReportRepository;
    }

    @PostMapping
    public JobDescriptionResponse create(@AuthenticationPrincipal User user, @RequestBody JobDescriptionRequest req) {
        JobDescription jd = JobDescription.builder()
                .user(user)
                .company(req.company())
                .jobTitle(req.jobTitle())
                .description(req.description())
                .skills(req.skills())
                .experienceRequired(req.experienceRequired())
                .source("MANUAL")
                .build();
        return toResponse(jdRepository.save(jd));
    }

    @GetMapping
    public List<JobDescriptionResponse> list(@AuthenticationPrincipal User user) {
        return jdRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        jdRepository.deleteById(id);
    }

    private JobDescriptionResponse toResponse(JobDescription jd) {
        var latest = analysisReportRepository.findTopByJobDescriptionIdOrderByAnalysisTimestampDesc(jd.getId());
        Double match = latest.map(r -> r.getMatchPercentage() != null ? r.getMatchPercentage().doubleValue() : null).orElse(null);
        String decision = latest.map(r -> r.getRecruiterDecision()).orElse(null);

        return new JobDescriptionResponse(jd.getId(), jd.getCompany(), jd.getJobTitle(),
                jd.getDescription(), jd.getSkills(), jd.getExperienceRequired(),
                jd.getSource(), match, decision);
    }
}