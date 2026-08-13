package com.futuremeal.security;

import com.futuremeal.entity.User;
import com.futuremeal.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final CustomUserDetailsService userDetailsService;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UnauthorizedException("Not authenticated");
        }
        String email = authentication.getName();
        return userDetailsService.loadUserEntityByEmail(email);
    }

    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return null;
        return authentication.getName();
    }

    public boolean isCurrentUserAdmin() {
        try {
            User user = getCurrentUser();
            return user.getRole().name().equals("ADMIN");
        } catch (Exception e) {
            return false;
        }
    }
}
