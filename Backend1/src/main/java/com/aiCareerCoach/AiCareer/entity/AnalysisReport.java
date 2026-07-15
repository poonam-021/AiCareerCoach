package com.aiCareerCoach.AiCareer.entity;


import com.aiCareerCoach.AiCareer.enums.AnalysisStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_description_id", nullable = false)
    private JobDescription jobDescription;

    @Column(precision = 5, scale = 2)
    private BigDecimal atsScore;

    @Column(precision = 5, scale = 2)
    private BigDecimal matchPercentage;

    private String recruiterDecision; // SHORTLIST / REJECT / MAYBE

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    @Column(columnDefinition = "TEXT")
    private String emailDraft;

    @Column(columnDefinition = "TEXT")
    private String interviewQuestions; // JSON string

    @Column(columnDefinition = "TEXT")
    private String learningRoadmap; // JSON string

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AnalysisStatus status = AnalysisStatus.PENDING;

    @Column(updatable = false)
    private LocalDateTime analysisTimestamp;

    @PrePersist
    protected void onCreate() {
        this.analysisTimestamp = LocalDateTime.now();
    }
}
