package com.aiCareerCoach.AiCareer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AiClientConfig {

    @Bean
    public RestClient aiRestClient(@Value("${ai-backend.base-url}") String baseUrl) {
        return RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Bean
    public RestClient supabaseRestClient(@Value("${supabase.url}") String supabaseUrl) {
        return RestClient.builder()
                .baseUrl(supabaseUrl)
                .build();
    }
}