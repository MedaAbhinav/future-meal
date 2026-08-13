package com.futuremeal.dto.response;

import com.futuremeal.entity.enums.DietaryPreference;
import com.futuremeal.entity.enums.SpiceLevel;
import com.futuremeal.entity.enums.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String refreshToken;
    private UserResponse user;

    @Data
    @Builder
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private UserRole role;
        private String profilePicture;
        private DietaryPreference dietaryPreference;
        private SpiceLevel spicePreference;
        private String budgetPreference;
        private String createdAt;
    }
}
