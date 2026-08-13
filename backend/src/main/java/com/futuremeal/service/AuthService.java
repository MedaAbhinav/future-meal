package com.futuremeal.service;

import com.futuremeal.dto.request.LoginRequest;
import com.futuremeal.dto.request.RegisterRequest;
import com.futuremeal.dto.response.AuthResponse;
import com.futuremeal.entity.User;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    AuthResponse.UserResponse getCurrentUser(String email);
    User updateProfile(String email, Object profileData);
}
