package com.aiCareerCoach.AiCareer.security;

import com.aiCareerCoach.AiCareer.enums.Role;
import com.aiCareerCoach.AiCareer.entity.User;
import com.aiCareerCoach.AiCareer.repository.UserRepository;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;

@Service
public class FirebaseUserSyncService {

    private final UserRepository userRepository;

    public FirebaseUserSyncService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User syncUser(FirebaseToken decodedToken) {
        return userRepository.findByFirebaseUid(decodedToken.getUid())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .firebaseUid(decodedToken.getUid())
                            .email(decodedToken.getEmail())
                            .name(decodedToken.getName() != null ? decodedToken.getName() : "User")
                            .role(Role.USER)
                            .build();
                    return userRepository.save(newUser);
                });
    }
}