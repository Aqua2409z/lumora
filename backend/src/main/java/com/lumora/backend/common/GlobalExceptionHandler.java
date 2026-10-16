package com.lumora.backend.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/** Bắt lỗi toàn cục và trả về JSON thống nhất. */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Lỗi validate dữ liệu đầu vào -> 400 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        ApiError body = new ApiError(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "Dữ liệu không hợp lệ",
                fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    /** Email đã tồn tại -> 409 */
    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ResponseEntity<ApiError> handleEmailUsed(EmailAlreadyUsedException ex) {
        ApiError body = new ApiError(
                HttpStatus.CONFLICT.value(), "Conflict", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    /** Sai email/mật khẩu -> 401 */
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiError> handleInvalidCredentials(InvalidCredentialsException ex) {
        ApiError body = new ApiError(
                HttpStatus.UNAUTHORIZED.value(), "Unauthorized", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    /** Các lỗi còn lại -> 500 */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleOther(Exception ex) {
        ApiError body = new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                "Đã xảy ra lỗi, vui lòng thử lại sau");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
