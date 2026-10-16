package com.lumora.backend.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.lumora.backend.auth.dto.AuthResponse;
import com.lumora.backend.auth.dto.GoogleLoginRequest;
import com.lumora.backend.auth.dto.LoginRequest;
import com.lumora.backend.auth.dto.RegisterRequest;
import com.lumora.backend.auth.dto.UserResponse;
import com.lumora.backend.auth.dto.ZaloLoginRequest;
import com.lumora.backend.common.EmailAlreadyUsedException;
import com.lumora.backend.common.InvalidCredentialsException;
import com.lumora.backend.security.GoogleTokenVerifier;
import com.lumora.backend.security.JwtService;
import com.lumora.backend.security.ZaloClient;
import com.lumora.backend.user.User;
import com.lumora.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/** Xử lý logic đăng ký / đăng nhập. */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final ZaloClient zaloClient;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       GoogleTokenVerifier googleTokenVerifier,
                       ZaloClient zaloClient) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleTokenVerifier = googleTokenVerifier;
        this.zaloClient = zaloClient;
    }

    /** Đăng ký tài khoản mới rồi cấp token luôn. */
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException("Email này đã được sử dụng");
        }

        String hash = passwordEncoder.encode(request.getPassword());
        User saved = userRepository.save(
                new User(request.getFullName().trim(), email, hash));

        String token = jwtService.generateToken(saved.getEmail(), saved.getId());
        return new AuthResponse(token, UserResponse.from(saved));
    }

    /** Đăng nhập: kiểm tra email + mật khẩu, trả token nếu đúng. */
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Email hoặc mật khẩu không đúng");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId());
        return new AuthResponse(token, UserResponse.from(user));
    }

    /**
     * Đăng nhập bằng Google: xác minh ID token, lấy email/tên/ảnh.
     * Chưa có tài khoản thì tạo mới (provider = 'google'); đã có thì đăng nhập luôn.
     */
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(request.getCredential());

        Boolean emailVerified = payload.getEmailVerified();
        if (emailVerified == null || !emailVerified) {
            throw new InvalidCredentialsException("Email Google của bạn chưa được xác minh.");
        }

        String email = payload.getEmail().trim().toLowerCase();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        User user = userRepository.findByEmail(email).orElseGet(() ->
                userRepository.saveGoogleUser(
                        (name != null && !name.isBlank()) ? name.trim() : email,
                        email,
                        picture));

        String token = jwtService.generateToken(user.getEmail(), user.getId());
        return new AuthResponse(token, UserResponse.from(user));
    }

    /**
     * Đăng nhập bằng Zalo (OAuth v4 + PKCE).
     * Backend đổi code lấy hồ sơ Zalo (id/tên/ảnh), rồi tạo mới hoặc đăng nhập user tương ứng.
     * Zalo không cung cấp email nên ta dùng email tổng hợp theo Zalo id.
     */
    public AuthResponse loginWithZalo(ZaloLoginRequest request) {
        ZaloClient.ZaloProfile profile = zaloClient.fetchProfile(request.getCode(), request.getCodeVerifier());

        String zaloId = profile.id();
        String name = (profile.name() != null && !profile.name().isBlank())
                ? profile.name().trim()
                : "Thành viên Zalo";
        // Email tổng hợp — ổn định theo Zalo id, không trùng với email thật của ai.
        String syntheticEmail = "zalo_" + zaloId + "@zalo.local";

        User user = userRepository.saveZaloUser(name, syntheticEmail, profile.pictureUrl(), zaloId);

        String token = jwtService.generateToken(user.getEmail(), user.getId());
        return new AuthResponse(token, UserResponse.from(user));
    }

    /** Lấy thông tin người dùng hiện tại theo email (từ token). */
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Phiên đăng nhập không hợp lệ"));
        return UserResponse.from(user);
    }
}
