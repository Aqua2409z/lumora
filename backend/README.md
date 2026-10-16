# Lumora — Backend (Spring Boot)

API xác thực cho **Lumora**: **Đăng ký** và **Đăng nhập** bằng email + mật khẩu. Mật khẩu được băm bằng **BCrypt**, phiên đăng nhập dùng **JWT**. Tầng dữ liệu viết **SQL thuần** (JdbcTemplate) trên **PostgreSQL** (quản lý bằng **pgAdmin 4**).

> Phần Gmail / Số điện thoại (OTP) chưa làm theo yêu cầu — hiện chỉ có register + login cơ bản.

---

## 🧱 Công nghệ

| Hạng mục | Lựa chọn |
|----------|----------|
| Ngôn ngữ | Java 17 |
| Framework | Spring Boot 3.3 (Web, Security, Validation, JDBC) |
| CSDL | PostgreSQL (pgAdmin 4) |
| Truy cập DB | SQL thuần — `NamedParameterJdbcTemplate` |
| Bảo mật | Spring Security 6 · BCrypt · JWT (jjwt 0.12) |
| Build | Maven |

---

## ✅ Yêu cầu cài đặt

1. **JDK 17 trở lên** (máy đang có JDK 8 — **không chạy được Spring Boot 3**).
   - Tải: [Eclipse Temurin 17](https://adoptium.net/temurin/releases/?version=17) hoặc [Microsoft OpenJDK 17](https://learn.microsoft.com/java/openjdk/download).
   - Cài xong kiểm tra: `java -version` phải ra `17.x`.
2. **Maven** — hoặc dùng IDE có sẵn Maven (IntelliJ IDEA / Spring Tool Suite / VS Code + Extension Pack for Java). Nếu cài riêng: [maven.apache.org](https://maven.apache.org/download.cgi).
3. **PostgreSQL + pgAdmin 4** (bạn đã có).

---

## 🗄️ Bước 1 — Tạo database & bảng trong pgAdmin 4

1. Mở **pgAdmin 4** → chuột phải **Databases** → **Create → Database…** → đặt tên `lumora` → **Save**.
2. Chọn database `lumora` → mở **Query Tool** (biểu tượng ⚡).
3. Mở file [db/schema.sql](db/schema.sql), **copy toàn bộ** dán vào Query Tool → bấm **Run** (F5).
4. Kiểm tra: mục **Schemas → public → Tables** sẽ thấy bảng `users`.

---

## ⚙️ Bước 2 — Cấu hình kết nối

Mở [src/main/resources/application.properties](src/main/resources/application.properties) và sửa cho khớp PostgreSQL của bạn:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/lumora
spring.datasource.username=postgres      # đổi nếu khác
spring.datasource.password=postgres      # đổi đúng mật khẩu Postgres của bạn
app.jwt.secret=change-this-...            # NÊN đổi chuỗi bí mật (>= 32 ký tự)
```

---

## ▶️ Bước 3 — Chạy ứng dụng

**Cách A — Maven (dòng lệnh):**
```bash
mvn spring-boot:run
```

**Cách B — IDE:** mở thư mục `backend` bằng IntelliJ / STS → chạy class `LumoraBackendApplication`.

Chạy thành công, API sẵn sàng tại: **http://localhost:8080**

---

## 🔌 API

Base URL: `http://localhost:8080/api/auth`

### 1) Đăng ký — `POST /api/auth/register`
```json
{ "fullName": "Nguyễn Văn A", "email": "a@gmail.com", "password": "matkhau123" }
```
Trả về `201`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "user": { "id": 1, "fullName": "Nguyễn Văn A", "email": "a@gmail.com", "createdAt": "2026-10-15T..." }
}
```

### 2) Đăng nhập — `POST /api/auth/login`
```json
{ "email": "a@gmail.com", "password": "matkhau123" }
```
Trả về `200` với cấu trúc giống đăng ký (kèm `token`).

### 3) Thông tin tài khoản — `GET /api/auth/me`
Cần header: `Authorization: Bearer <token>`. Trả về `200`:
```json
{ "id": 1, "fullName": "Nguyễn Văn A", "email": "a@gmail.com", "createdAt": "2026-10-15T..." }
```

### Mã lỗi
| Mã | Khi nào |
|----|---------|
| `400` | Dữ liệu sai (email không hợp lệ, mật khẩu < 6 ký tự…) — kèm `fieldErrors` |
| `401` | Sai email/mật khẩu, hoặc token thiếu/hết hạn khi gọi `/me` |
| `409` | Email đã được dùng khi đăng ký |

---

## 🧪 Thử nhanh bằng curl

```bash
# Đăng ký
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Nguyễn Văn A","email":"a@gmail.com","password":"matkhau123"}'

# Đăng nhập
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@gmail.com","password":"matkhau123"}'

# Lấy thông tin (thay <token> bằng token nhận được ở trên)
curl http://localhost:8080/api/auth/me -H "Authorization: Bearer <token>"
```

---

## 📁 Cấu trúc thư mục

```
backend/
├─ pom.xml
├─ db/
│  └─ schema.sql                      # Chạy trong pgAdmin 4
└─ src/main/
   ├─ java/com/lumora/backend/
   │  ├─ LumoraBackendApplication.java
   │  ├─ config/
   │  │  └─ SecurityConfig.java        # Stateless + JWT + CORS + BCrypt
   │  ├─ security/
   │  │  ├─ JwtService.java            # Tạo/đọc token
   │  │  ├─ JwtAuthFilter.java         # Đọc Bearer token mỗi request
   │  │  ├─ JwtAuthEntryPoint.java     # Trả 401 JSON khi chưa đăng nhập
   │  │  └─ CustomUserDetailsService.java
   │  ├─ user/
   │  │  ├─ User.java                  # Model
   │  │  └─ UserRepository.java        # SQL thuần (JdbcTemplate)
   │  ├─ auth/
   │  │  ├─ AuthController.java        # /register /login /me
   │  │  ├─ AuthService.java           # Logic nghiệp vụ
   │  │  └─ dto/                       # RegisterRequest, LoginRequest, AuthResponse, UserResponse
   │  └─ common/
   │     ├─ GlobalExceptionHandler.java
   │     ├─ ApiError.java
   │     ├─ EmailAlreadyUsedException.java
   │     └─ InvalidCredentialsException.java
   └─ resources/
      └─ application.properties
```

---

## 🔗 Kết nối với Frontend

CORS đã mở sẵn cho `http://localhost:5173` và `http://localhost:5174` (Vite). Frontend chỉ cần gọi `http://localhost:8080/api/auth/...`, lưu `token` nhận được rồi gắn header `Authorization: Bearer <token>` cho các request cần đăng nhập.

## 🔒 Lưu ý bảo mật
- **Đổi** `app.jwt.secret` ở môi trường thật, không commit mật khẩu DB thật lên git.
- Mật khẩu không bao giờ được lưu dạng gốc — chỉ lưu bản băm BCrypt (`password_hash`).
