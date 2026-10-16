package com.lumora.backend.common;

/** Ném ra khi email đăng ký đã tồn tại. */
public class EmailAlreadyUsedException extends RuntimeException {
    public EmailAlreadyUsedException(String message) {
        super(message);
    }
}
