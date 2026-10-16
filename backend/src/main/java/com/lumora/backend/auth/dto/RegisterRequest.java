package com.lumora.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Dữ liệu gửi lên khi đăng ký. */
public class RegisterRequest {

    @NotBlank(message = "Vui lòng nhập họ tên")
    @Size(min = 2, max = 120, message = "Họ tên từ 2 đến 120 ký tự")
    private String fullName;

    @NotBlank(message = "Vui lòng nhập email")
    @Email(message = "Email không hợp lệ")
    @Size(max = 255, message = "Email quá dài")
    private String email;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    @Size(min = 6, max = 72, message = "Mật khẩu từ 6 đến 72 ký tự")
    private String password;

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
