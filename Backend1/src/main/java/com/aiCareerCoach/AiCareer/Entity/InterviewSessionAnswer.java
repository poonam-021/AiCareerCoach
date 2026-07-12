package com.aiCareerCoach.AiCareer.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_session_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSessionAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String answerText; // nullable — user can skip

    private String feedbackLabel; // e.g. "Too brief", "Detailed" — from AI backend

    @Column(columnDefinition = "TEXT")
    private String feedbackTip;

    @Column(nullable = false)
    private Integer orderIndex;
}