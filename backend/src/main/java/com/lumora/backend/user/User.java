package com.lumora.backend.user;

import java.time.OffsetDateTime;

/** Bản ghi người dùng tương ứng bảng "users". */
public class User {

    private Long id;
    private String fullName;
    private String email;
    private String passwordHash;
    private String provider;   // 'local' (mật khẩu), 'google', hoặc 'zalo'
    private String providerId; // ID người dùng ở nhà cung cấp ngoài (Zalo user id), có thể null
    private String avatarUrl;  // ảnh đại diện (Google/Zalo cung cấp), có thể null
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public User() {
    }

    /** Dùng khi tạo mới (chưa có id / thời gian — do DB sinh). */
    public User(String fullName, String email, String passwordHash) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
