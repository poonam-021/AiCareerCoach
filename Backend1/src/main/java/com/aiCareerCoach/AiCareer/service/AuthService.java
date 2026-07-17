package com.aiCareerCoach.AiCareer.service;

import com.aiCareerCoach.AiCareer.dto.Auth.*;
import com.aiCareerCoach.AiCareer.entity.RefreshToken;
import com.aiCareerCoach.AiCareer.entity.User;
import com.aiCareerCoach.AiCareer.enums.Role;
import com.aiCareerCoach.AiCareer.repository.RefreshTokenRepository;
import com.aiCareerCoach.AiCareer.repository.UserRepository;
import com.aiCareerCoach.AiCareer.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        System.out.println(req.email());
        User user = User.builder()
                .email(req.email())
                .name(req.name())
                .password(passwordEncoder.encode(req.password()))
                .role(Role.USER)
                .build();
        return issueTokens(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (user.getPassword() == null || !passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return issueTokens(user);
    }

    public AuthResponse refresh(RefreshRequest req) {
        RefreshToken stored = refreshTokenRepository.findByToken(req.refreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (stored.isRevoked() || stored.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Refresh token expired or revoked");
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        stored.setRevoked(true); // rotate
        refreshTokenRepository.save(stored);

        return issueTokens(user);
    }

    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(rt -> { rt.setRevoked(true); refreshTokenRepository.save(rt); });
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshTokenValue = jwtService.generateRefreshTokenValue();

        refreshTokenRepository.save(RefreshToken.builder()
                .token(refreshTokenValue)
                .userId(user.getId())
                .expiryDate(LocalDateTime.now().plusSeconds(jwtService.getRefreshTokenExpirationMs() / 1000))
                .revoked(false)
                .build());

        return new AuthResponse(accessToken, refreshTokenValue, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}