package com.lumora.backend.common;

/** Ném ra khi email hoặc mật khẩu đăng nhập không đúng. */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
