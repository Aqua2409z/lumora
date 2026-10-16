package com.lumora.backend.common;

import java.time.OffsetDateTime;
import java.util.Map;

/** Cấu trúc JSON trả về khi có lỗi. */
public class ApiError {

    private OffsetDateTime timestamp = OffsetDateTime.now();
    private int status;
    private String error;
    private String message;
    private Map<String, String> fieldErrors;

    public ApiError(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
    }

    public ApiError(int status, String error, String message, Map<String, String> fieldErrors) {
        this(status, error, message);
        this.fieldErrors = fieldErrors;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
