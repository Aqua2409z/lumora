package com.lumora.backend.user;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.Optional;

/** Truy cập bảng "users" bằng SQL thuần qua NamedParameterJdbcTemplate. */
@Repository
public class UserRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public UserRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Danh sách cột trả về sau INSERT (giữ đồng bộ với ROW_MAPPER).
    private static final String RETURNING_COLS =
            "id, full_name, email, password_hash, provider, provider_id, avatar_url, created_at, updated_at";

    private static final RowMapper<User> ROW_MAPPER = (ResultSet rs, int rowNum) -> {
        User u = new User();
        u.setId(rs.getLong("id"));
        u.setFullName(rs.getString("full_name"));
        u.setEmail(rs.getString("email"));
        u.setPasswordHash(rs.getString("password_hash"));
        u.setProvider(rs.getString("provider"));
        u.setProviderId(rs.getString("provider_id"));
        u.setAvatarUrl(rs.getString("avatar_url"));
        u.setCreatedAt(rs.getObject("created_at", OffsetDateTime.class));
        u.setUpdatedAt(rs.getObject("updated_at", OffsetDateTime.class));
        return u;
    };

    /** Email đã tồn tại chưa (dùng khi đăng ký). */
    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = :email";
        Integer count = jdbc.queryForObject(
                sql, new MapSqlParameterSource("email", email), Integer.class);
        return count != null && count > 0;
    }

    /** Tìm người dùng theo email. */
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = :email";
        return jdbc.query(sql, new MapSqlParameterSource("email", email), ROW_MAPPER)
                .stream().findFirst();
    }

    /** Tìm người dùng theo id. */
    public Optional<User> findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = :id";
        return jdbc.query(sql, new MapSqlParameterSource("id", id), ROW_MAPPER)
                .stream().findFirst();
    }

    /** Tìm người dùng theo (nhà cung cấp, id bên ngoài) — dùng cho đăng nhập Zalo. */
    public Optional<User> findByProviderId(String provider, String providerId) {
        String sql = "SELECT * FROM users WHERE provider = :provider AND provider_id = :providerId";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("provider", provider)
                .addValue("providerId", providerId);
        return jdbc.query(sql, params, ROW_MAPPER).stream().findFirst();
    }

    /** Thêm người dùng đăng ký bằng mật khẩu (provider mặc định 'local'). */
    public User save(User user) {
        String sql = "INSERT INTO users (full_name, email, password_hash) "
                + "VALUES (:fullName, :email, :passwordHash) "
                + "RETURNING " + RETURNING_COLS;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("fullName", user.getFullName())
                .addValue("email", user.getEmail())
                .addValue("passwordHash", user.getPasswordHash());

        return jdbc.queryForObject(sql, params, ROW_MAPPER);
    }

    /**
     * Thêm người dùng đăng nhập bằng Google (không có mật khẩu).
     *
     * <p>Dùng ON CONFLICT (email) để luồng "chưa có thì tạo" luôn an toàn: nếu hai
     * yêu cầu đăng nhập cùng một email mới chạy song song (hoặc user bấm nút 2 lần),
     * bản ghi sẽ không bị lỗi trùng email mà vẫn trả về đúng user — đảm bảo MỌI tài
     * khoản Google đều đăng nhập được, không phụ thuộc thời điểm. Mỗi lần đăng nhập
     * cũng cập nhật lại avatar mới nhất từ Google.
     */
    public User saveGoogleUser(String fullName, String email, String avatarUrl) {
        String sql = "INSERT INTO users (full_name, email, provider, avatar_url) "
                + "VALUES (:fullName, :email, 'google', :avatarUrl) "
                + "ON CONFLICT (email) DO UPDATE SET "
                + "    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url), "
                + "    updated_at = now() "
                + "RETURNING " + RETURNING_COLS;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("fullName", fullName)
                .addValue("email", email)
                .addValue("avatarUrl", avatarUrl);

        return jdbc.queryForObject(sql, params, ROW_MAPPER);
    }

    /**
     * Thêm / cập nhật người dùng đăng nhập bằng Zalo.
     *
     * <p>Zalo không trả email nên ta dùng email tổng hợp (zalo_&lt;id&gt;@zalo.local) để
     * giữ nguyên ràng buộc email NOT NULL + logic tra cứu theo email sẵn có. Khoá định
     * danh thật là (provider='zalo', provider_id = Zalo user id). ON CONFLICT đảm bảo
     * đăng nhập lại nhiều lần không bị lỗi trùng và luôn cập nhật tên/avatar mới nhất.
     */
    public User saveZaloUser(String fullName, String email, String avatarUrl, String providerId) {
        String sql = "INSERT INTO users (full_name, email, provider, provider_id, avatar_url) "
                + "VALUES (:fullName, :email, 'zalo', :providerId, :avatarUrl) "
                + "ON CONFLICT (provider, provider_id) WHERE provider_id IS NOT NULL DO UPDATE SET "
                + "    full_name  = EXCLUDED.full_name, "
                + "    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url), "
                + "    updated_at = now() "
                + "RETURNING " + RETURNING_COLS;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("fullName", fullName)
                .addValue("email", email)
                .addValue("providerId", providerId)
                .addValue("avatarUrl", avatarUrl);

        return jdbc.queryForObject(sql, params, ROW_MAPPER);
    }
}
