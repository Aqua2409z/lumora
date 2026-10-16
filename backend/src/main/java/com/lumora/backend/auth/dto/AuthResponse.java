package com.lumora.backend.auth.dto;

/** Kết quả trả về sau khi đăng ký / đăng nhập thành công. */
public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private UserResponse user;

    public AuthResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public UserResponse getUser() {
        return user;
    }
}
