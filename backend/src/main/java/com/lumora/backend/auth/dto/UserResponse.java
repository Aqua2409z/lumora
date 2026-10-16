package com.lumora.backend.auth.dto;

import com.lumora.backend.user.User;

import java.time.OffsetDateTime;

/** Thông tin người dùng trả về client (KHÔNG chứa mật khẩu). */
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String avatarUrl;
    private OffsetDateTime createdAt;

    public UserResponse(Long id, String fullName, String email, String avatarUrl, OffsetDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
    }

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(), user.getFullName(), user.getEmail(),
                user.getAvatarUrl(), user.getCreatedAt());
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
