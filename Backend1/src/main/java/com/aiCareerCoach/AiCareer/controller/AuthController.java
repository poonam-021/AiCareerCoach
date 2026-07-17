package com.aiCareerCoach.AiCareer.controller;

import com.aiCareerCoach.AiCareer.dto.Auth.AuthResponse;
import com.aiCareerCoach.AiCareer.dto.Auth.LoginRequest;
import com.aiCareerCoach.AiCareer.dto.Auth.RefreshRequest;
import com.aiCareerCoach.AiCareer.dto.Auth.RegisterRequest;
import com.aiCareerCoach.AiCareer.dto.Auth.*;
import com.aiCareerCoach.AiCareer.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest req) {
//        System.out.println("Register hit hiiii");
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) { return authService.login(req); }

    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestBody RefreshRequest req) { return authService.refresh(req); }

    @PostMapping("/logout")
    public void logout(@RequestBody RefreshRequest req) { authService.logout(req.refreshToken()); }
}