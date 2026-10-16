package com.lumora.backend.auth;

import com.lumora.backend.auth.dto.AuthResponse;
import com.lumora.backend.auth.dto.GoogleLoginRequest;
import com.lumora.backend.auth.dto.LoginRequest;
import com.lumora.backend.auth.dto.RegisterRequest;
import com.lumora.backend.auth.dto.UserResponse;
import com.lumora.backend.auth.dto.ZaloLoginRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Các endpoint xác thực: đăng ký, đăng nhập, lấy thông tin tài khoản hiện tại. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** POST /api/auth/google — đăng nhập bằng Google (body: { credential }). */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request));
    }

    /** POST /api/auth/zalo — đăng nhập bằng Zalo (body: { code, codeVerifier }). */
    @PostMapping("/zalo")
    public ResponseEntity<AuthResponse> zalo(@Valid @RequestBody ZaloLoginRequest request) {
        return ResponseEntity.ok(authService.loginWithZalo(request));
    }

    /** GET /api/auth/me — cần gửi header: Authorization: Bearer &lt;token&gt; */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        // authentication.getName() = email (subject của token)
        return ResponseEntity.ok(authService.getCurrentUser(authentication.getName()));
    }
}
