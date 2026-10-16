package com.lumora.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Dữ liệu client gửi lên khi đăng nhập bằng Zalo (OAuth v4 + PKCE).
 * - "code": mã uỷ quyền Zalo trả về ở redirect URI sau khi người dùng đồng ý.
 * - "codeVerifier": chuỗi PKCE do frontend sinh ra trước khi chuyển hướng (xác minh code).
 */
public class ZaloLoginRequest {

    @NotBlank(message = "Thiếu mã uỷ quyền Zalo")
    private String code;

    @NotBlank(message = "Thiếu mã xác minh (code_verifier)")
    private String codeVerifier;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCodeVerifier() {
        return codeVerifier;
    }

    public void setCodeVerifier(String codeVerifier) {
        this.codeVerifier = codeVerifier;
    }
}
