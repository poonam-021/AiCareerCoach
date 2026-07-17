package com.aiCareerCoach.AiCareer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    private final RestClient supabaseRestClient;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    @Value("${supabase.storage.bucket}")
    private String bucket;

    @Value("${supabase.url}")
    private String supabaseUrl;

    public SupabaseStorageService(RestClient supabaseRestClient) {
        this.supabaseRestClient = supabaseRestClient;
    }

    public String upload(Long userId, MultipartFile file) {
        String storagePath = "resumes/%d/%s_%s".formatted(
                userId, UUID.randomUUID(), file.getOriginalFilename());

        try {
            supabaseRestClient.post()
                    .uri("/storage/v1/object/{bucket}/{path}", bucket, storagePath)
                    .header("apikey", serviceRoleKey)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(file.getBytes())
                    .retrieve()
                    .toBodilessEntity();
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file bytes", e);
        }

        return storagePath;
    }

    public String getSignedUrl(String storagePath) {
        record SignRequest(int expiresIn) {}
        record SignResponse(String signedURL) {}

        SignResponse response = supabaseRestClient.post()
                .uri("/storage/v1/object/sign/{bucket}/{path}", bucket, storagePath)
                .header("apikey", serviceRoleKey)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                .body(new SignRequest(3600))
                .retrieve()
                .body(SignResponse.class);

        return supabaseUrl + response.signedURL();
    }

    public void delete(String storagePath) {
        supabaseRestClient.method(org.springframework.http.HttpMethod.DELETE)
                .uri("/storage/v1/object/{bucket}/{path}", bucket, storagePath)
                .header("apikey", serviceRoleKey)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                .retrieve()
                .toBodilessEntity();
    }
}