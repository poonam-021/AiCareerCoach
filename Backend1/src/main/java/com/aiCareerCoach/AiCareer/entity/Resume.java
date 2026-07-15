package com.aiCareerCoach.AiCareer.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String fileName;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String storagePath; // e.g. "resumes/{userId}/{uuid}_filename.pdf" — the Supabase bucket key

    @Column(length = 500)
    private String publicUrl; // Supabase returns this after upload; nullable if bucket is private

    private String fileType; // PDF, DOCX

    private Long fileSize; // bytes

    @Column(columnDefinition = "TEXT")
    private String parsedText; // cached result from AI /parse-resume call

    @Builder.Default
    private boolean isActive = false;

    @Column(updatable = false)
    private LocalDateTime uploadDate;

    @PrePersist
    protected void onCreate() {
        this.uploadDate = LocalDateTime.now();
    }
}
