package com.aiCareerCoach.AiCareer.repository;

import com.aiCareerCoach.AiCareer.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserIdOrderByUploadDateDesc(Long userId);
    Optional<Resume> findByUserIdAndIsActiveTrue(Long userId);
}