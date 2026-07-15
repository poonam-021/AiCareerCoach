package com.aiCareerCoach.AiCareer.Repository;

import com.aiCareerCoach.AiCareer.entity.InterviewSessionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewSessionAnswerRepository extends JpaRepository<InterviewSessionAnswer, Long> {
    List<InterviewSessionAnswer> findBySessionIdOrderByOrderIndexAsc(Long sessionId);
}
