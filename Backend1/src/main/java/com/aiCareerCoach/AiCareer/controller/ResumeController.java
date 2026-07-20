package com.aiCareerCoach.AiCareer.controller;

import com.aiCareerCoach.AiCareer.dto.Resume.ResumeResponse;
import com.aiCareerCoach.AiCareer.entity.Resume;
import com.aiCareerCoach.AiCareer.entity.User;
import com.aiCareerCoach.AiCareer.repository.ResumeRepository;
import com.aiCareerCoach.AiCareer.service.ResumeTextExtractor;
import com.aiCareerCoach.AiCareer.service.S3StorageService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final S3StorageService storageService;
    private final ResumeTextExtractor textExtractor;

    public ResumeController(ResumeRepository resumeRepository, S3StorageService storageService,
                            ResumeTextExtractor textExtractor) {
        this.resumeRepository = resumeRepository;
        this.storageService = storageService;
        this.textExtractor = textExtractor;
    }

    @PostMapping("/upload")
    public ResumeResponse upload(@AuthenticationPrincipal User user, @RequestParam MultipartFile file) {
        String storagePath = storageService.upload(user.getId(), file);
        String extractedText = textExtractor.extractText(file);

        Resume resume = Resume.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .storagePath(storagePath)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .parsedText(extractedText)
                .isActive(true)
                .build();

        resumeRepository.findByUserIdAndIsActiveTrue(user.getId())
                .ifPresent(r -> { r.setActive(false); resumeRepository.save(r); });

        Resume saved = resumeRepository.save(resume);
        return toResponse(saved);
    }

    @GetMapping
    public List<ResumeResponse> list(@AuthenticationPrincipal User user) {
        return resumeRepository.findByUserIdOrderByUploadDateDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}/download")
    public String getDownloadUrl(@PathVariable Long id) {
        Resume resume = resumeRepository.findById(id).orElseThrow();
        return storageService.getSignedUrl(resume.getStoragePath());
    }

    @PutMapping("/{id}/activate")
    public ResumeResponse activate(@AuthenticationPrincipal User user, @PathVariable Long id) {
        resumeRepository.findByUserIdAndIsActiveTrue(user.getId())
                .ifPresent(r -> { r.setActive(false); resumeRepository.save(r); });

        Resume resume = resumeRepository.findById(id).orElseThrow();
        resume.setActive(true);
        return toResponse(resumeRepository.save(resume));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Resume resume = resumeRepository.findById(id).orElseThrow();
        storageService.delete(resume.getStoragePath());
        resumeRepository.delete(resume);
    }

    private ResumeResponse toResponse(Resume r) {
        return new ResumeResponse(r.getId(), r.getFileName(), r.getPublicUrl(),
                r.getFileType(), r.getFileSize(), r.isActive(), r.getUploadDate());
    }
}