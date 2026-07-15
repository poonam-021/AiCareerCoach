package com.aiCareerCoach.AiCareer.repository;

import com.aiCareerCoach.AiCareer.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobDescriptionRepository extends JpaRepository<JobDescription, Long> {
    List<JobDescription> findByUserIdOrderByCreatedAtDesc(Long userId);
}