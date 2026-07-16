package com.aiCareerCoach.AiCareer.security;

import com.aiCareerCoach.AiCareer.entity.User;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final FirebaseUserSyncService firebaseUserSyncService;

    public JwtAuthFilter(FirebaseUserSyncService firebaseUserSyncService) {
        this.firebaseUserSyncService = firebaseUserSyncService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);
            User user = firebaseUserSyncService.syncUser(decodedToken);

            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
            var authToken = new UsernamePasswordAuthenticationToken(user, null, authorities);
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        } catch (Exception e) {
            // invalid/expired Firebase token — leave unauthenticated, request continues as anonymous
        }

        filterChain.doFilter(request, response);
    }
}