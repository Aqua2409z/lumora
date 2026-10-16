package com.lumora.backend.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.lumora.backend.common.InvalidCredentialsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

/**
 * Xác thực ID token do Google cấp (đăng nhập "Tiếp tục với Google").
 *
 * <p>Thư viện của Google tự tải khoá công khai của Google, kiểm tra chữ ký,
 * thời hạn, "issuer" và "audience" (phải trùng Client ID của ta).
 * Nếu chưa cấu hình Client ID thì tính năng bị tắt (ném lỗi rõ ràng).
 */
@Component
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;
    private final boolean enabled;

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        if (clientId == null || clientId.isBlank()) {
            this.enabled = false;
            this.verifier = null;
        } else {
            this.enabled = true;
            this.verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();
        }
    }

    /** Trả về payload (email, name, picture...) nếu token hợp lệ; ném lỗi nếu không. */
    public GoogleIdToken.Payload verify(String idTokenString) {
        if (!enabled) {
            throw new InvalidCredentialsException(
                    "Đăng nhập Google chưa được cấu hình trên máy chủ (thiếu Client ID).");
        }
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new InvalidCredentialsException(
                        "Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn.");
            }
            return idToken.getPayload();
        } catch (IllegalArgumentException e) {
            // Token sai định dạng (không phải JWT hợp lệ) -> coi như phiên không hợp lệ.
            throw new InvalidCredentialsException(
                    "Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn.");
        } catch (GeneralSecurityException | IOException e) {
            throw new InvalidCredentialsException(
                    "Không xác thực được tài khoản Google. Vui lòng thử lại.");
        }
    }
}
