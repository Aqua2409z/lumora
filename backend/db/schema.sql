-- ============================================================
--  Lumora — Schema PostgreSQL
--  Chạy file này trong pgAdmin 4 (Query Tool) SAU KHI đã tạo
--  database tên "lumora-main" và kết nối vào nó.
-- ============================================================

-- Bảng người dùng (phục vụ Đăng ký / Đăng nhập / Đăng nhập Google)
CREATE TABLE IF NOT EXISTS users (
    id            BIGSERIAL PRIMARY KEY,
    full_name     VARCHAR(120)  NOT NULL,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    -- Null với tài khoản đăng nhập bằng Google/Zalo (họ không có mật khẩu).
    password_hash VARCHAR(255),
    -- 'local' = đăng ký bằng mật khẩu, 'google' = đăng nhập Google, 'zalo' = đăng nhập Zalo.
    provider      VARCHAR(20)   NOT NULL DEFAULT 'local',
    -- ID người dùng ở nhà cung cấp ngoài (Zalo trả về user id, Google không cần vì có email).
    provider_id   VARCHAR(255),
    -- Ảnh đại diện (Google/Zalo cung cấp), có thể null.
    avatar_url    VARCHAR(512),
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Tìm theo email là thao tác thường xuyên nhất -> đánh index
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
-- Tra cứu nhanh user theo (nhà cung cấp, id bên ngoài) — dùng cho đăng nhập Zalo.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_id
    ON users (provider, provider_id) WHERE provider_id IS NOT NULL;

-- ------------------------------------------------------------
--  MIGRATION cho database đã tạo bảng users từ trước
--  (chạy an toàn nhiều lần, không gây lỗi nếu đã áp dụng rồi)
-- ------------------------------------------------------------
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider    VARCHAR(20)  NOT NULL DEFAULT 'local';
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url  VARCHAR(512);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_id
    ON users (provider, provider_id) WHERE provider_id IS NOT NULL;
