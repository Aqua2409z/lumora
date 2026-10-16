package com.lumora.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Dữ liệu client gửi lên khi đăng nhập bằng Google.
 * "credential" là ID token (JWT) do Google Identity Services trả về ở frontend.
 */
public class GoogleLoginRequest {

    @NotBlank(message = "Thiếu thông tin đăng nhập Google")
    private String credential;

    public String getCredential() {
        return credential;
    }

    public void setCredential(String credential) {
        this.credential = credential;
    }
}
