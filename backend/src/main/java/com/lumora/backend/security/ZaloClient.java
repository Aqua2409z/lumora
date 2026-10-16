package com.lumora.backend.security;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.lumora.backend.common.InvalidCredentialsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

/**
 * Gọi API Zalo để hoàn tất đăng nhập "Đăng nhập với Zalo" (OAuth v4 + PKCE).
 *
 * <p>Luồng:
 * <ol>
 *   <li>Frontend chuyển hướng người dùng tới trang cấp quyền của Zalo, nhận về "code".</li>
 *   <li>Backend đổi "code" + "code_verifier" lấy access_token (gửi kèm secret_key).</li>
 *   <li>Backend dùng access_token gọi Graph API lấy hồ sơ (id, name, picture).</li>
 * </ol>
 *
 * <p>Nếu chưa cấu hình App ID / Secret Key thì tính năng bị tắt (ném lỗi rõ ràng).
 */
@Component
public class ZaloClient {

    private static final String TOKEN_URL = "https://oauth.zaloapp.com/v4/access_token";
    private static final String GRAPH_ME_URL = "https://graph.zalo.me/v2.0/me?fields=id,name,picture";

    private final String appId;
    private final String secretKey;
    private final boolean enabled;
    private final RestClient restClient;

    public ZaloClient(
            @Value("${app.zalo.app-id:}") String appId,
            @Value("${app.zalo.secret-key:}") String secretKey) {
        this.appId = appId;
        this.secretKey = secretKey;
        this.enabled = appId != null && !appId.isBlank() && secretKey != null && !secretKey.isBlank();
        this.restClient = RestClient.create();
    }

    public boolean isEnabled() {
        return enabled;
    }

    /** Hồ sơ người dùng Zalo tối thiểu mà ta cần. */
    public record ZaloProfile(String id, String name, String pictureUrl) {
    }

    /** Đổi code -> access_token -> hồ sơ người dùng. Ném lỗi nếu thất bại ở bất kỳ bước nào. */
    public ZaloProfile fetchProfile(String code, String codeVerifier) {
        if (!enabled) {
            throw new InvalidCredentialsException(
                    "Đăng nhập Zalo chưa được cấu hình trên máy chủ (thiếu App ID / Secret Key).");
        }

        String accessToken = exchangeCodeForToken(code, codeVerifier);
        return fetchUserProfile(accessToken);
    }

    private String exchangeCodeForToken(String code, String codeVerifier) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("app_id", appId);
        form.add("grant_type", "authorization_code");
        form.add("code_verifier", codeVerifier);

        TokenResponse token;
        try {
            token = restClient.post()
                    .uri(TOKEN_URL)
                    .header("secret_key", secretKey)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(TokenResponse.class);
        } catch (Exception e) {
            throw new InvalidCredentialsException("Không kết nối được máy chủ Zalo. Vui lòng thử lại.");
        }

        if (token == null || token.access_token == null || token.access_token.isBlank()) {
            String reason = token != null && token.error_description != null
                    ? token.error_description
                    : "Phiên đăng nhập Zalo không hợp lệ hoặc đã hết hạn.";
            throw new InvalidCredentialsException(reason);
        }
        return token.access_token;
    }

    private ZaloProfile fetchUserProfile(String accessToken) {
        ProfileResponse profile;
        try {
            profile = restClient.get()
                    .uri(GRAPH_ME_URL)
                    .header("access_token", accessToken)
                    .retrieve()
                    .body(ProfileResponse.class);
        } catch (Exception e) {
            throw new InvalidCredentialsException("Không lấy được thông tin tài khoản Zalo. Vui lòng thử lại.");
        }

        if (profile == null || profile.id == null || profile.id.isBlank()) {
            throw new InvalidCredentialsException("Không lấy được thông tin tài khoản Zalo. Vui lòng thử lại.");
        }

        String pictureUrl = profile.picture != null && profile.picture.data != null
                ? profile.picture.data.url
                : null;
        return new ZaloProfile(profile.id, profile.name, pictureUrl);
    }

    // ----- Các kiểu ánh xạ JSON trả về từ Zalo (chỉ lấy trường cần dùng) -----

    /** Phản hồi của /v4/access_token. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class TokenResponse {
        public String access_token;
        public String error;
        public String error_description;
    }

    /** Phản hồi của graph.zalo.me/v2.0/me. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class ProfileResponse {
        public String id;
        public String name;
        public Picture picture;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Picture {
        public PictureData data;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PictureData {
        public String url;
    }
}
