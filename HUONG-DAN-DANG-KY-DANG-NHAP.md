# Lumora — Hướng dẫn & Review: Đăng ký / Đăng nhập

> Tài liệu này mô tả tính năng **đăng ký + đăng nhập** đã nối giữa **Frontend (React)** và **Backend (Spring Boot + PostgreSQL)**, kèm cách chạy từ đầu, cách đăng nhập pgAdmin 4, cách thêm tài khoản test, và giải thích ý nghĩa từng file code. Dùng để review và để tự vận hành.

Cập nhật: 16/10/2026

---

## 1. Tóm tắt đã làm gì

- Backend cung cấp các API: **đăng ký**, **đăng nhập**, **đăng nhập Google**, **đăng nhập Zalo**, **lấy thông tin tài khoản** (`/me`). Mật khẩu băm **BCrypt**, phiên dùng **JWT** (sống 24 giờ).
- Frontend nối thật vào backend: form Gmail + mật khẩu **đăng nhập / đăng ký thật**, có trạng thái chờ, báo lỗi tiếng Việt, chuyển trang sau khi thành công.
- **Đăng nhập Google** đã hoạt động thật (nút chính thức của Google). Tài khoản Google mới sẽ **tự được tạo** trong hệ thống ở lần đăng nhập đầu.
- **Đăng nhập Zalo** (OAuth v4 + PKCE) đã code xong cả FE lẫn BE; chỉ còn chờ bạn điền App ID / Secret Key của Zalo là dùng được.
- Sau khi đăng nhập → vào **trang chính tạm** (hiển thị tên, email, nút đăng xuất). Chưa đăng nhập mà vào khu vực thành viên → tự đẩy về `/login`.
- Phần **SĐT (OTP qua SMS)** vẫn chỉ là giao diện (tốn phí nên chưa làm) — thay vào đó dùng **Zalo** (gắn với số điện thoại) hoặc **Google** để đăng nhập miễn phí.

---

## 2. Yêu cầu môi trường (đã cài sẵn trên máy)

| Thành phần | Phiên bản | Ghi chú |
|-----------|-----------|---------|
| JDK | 17.0.12 | Bắt buộc cho Spring Boot 3 |
| Maven | 3.9.16 | Để chạy backend |
| Node.js + npm | (đã có) | Để chạy frontend |
| PostgreSQL + pgAdmin 4 | 18 | Database tên **`lumora-main`** |

**Thông tin kết nối DB** (đã cấu hình trong `backend/src/main/resources/application.properties`):
- Database: `lumora-main`
- User: `postgres`
- Mật khẩu: `123`

---

## 3. Cách chạy từ đầu (A → Z)

### Bước 1 — Database (chỉ làm 1 lần)
Đã tạo xong rồi. Nếu phải làm lại trên máy khác:
1. Mở **pgAdmin 4** (xem mục 4 nếu chưa biết cách đăng nhập) → tạo database tên `lumora-main`.
2. Mở **Query Tool** trên `lumora-main` → chạy toàn bộ file `backend/db/schema.sql` → tạo bảng `users`.

### Bước 2 — Chạy Backend
```bash
cd D:\lumora\backend
mvn spring-boot:run
```
Đợi tới khi thấy dòng: `Tomcat started on port 8080`.
→ Backend chạy tại **http://localhost:8080**.

### Bước 3 — Chạy Frontend (mở cửa sổ terminal khác)
```bash
cd D:\lumora\frontend
npm run dev
```
→ Mở trình duyệt vào địa chỉ terminal in ra: **http://localhost:5173** (hoặc 5174 nếu 5173 bận).

> ⚠️ Phải chạy **cả hai** (backend + frontend) cùng lúc thì đăng nhập mới hoạt động.

---

## 4. Cách đăng nhập pgAdmin 4 (xem / sửa dữ liệu)

pgAdmin 4 là công cụ giao diện để xem và quản lý database PostgreSQL.

### Lần đầu mở pgAdmin
1. Mở **pgAdmin 4** từ menu Start của Windows (chờ vài giây, nó mở trong trình duyệt).
2. Lần đầu dùng, pgAdmin hỏi đặt **Master Password** — đây là mật khẩu của **riêng pgAdmin** (không phải mật khẩu PostgreSQL). Đặt một chuỗi dễ nhớ và lưu lại; mỗi lần mở pgAdmin sau này sẽ nhập chuỗi này.

### Kết nối tới PostgreSQL
3. Cột trái, mở rộng **Servers** → **PostgreSQL 18**.
4. pgAdmin hỏi **mật khẩu của server PostgreSQL** → nhập `123` (mật khẩu của user `postgres`).
5. Tick **Save Password** để lần sau khỏi nhập lại → bấm **OK**.

### Mở xem bảng `users`
6. Đi theo cây: **PostgreSQL 18 → Databases → `lumora-main` → Schemas → public → Tables → `users`**.
7. Chuột phải vào `users` → **View/Edit Data → All Rows** để xem toàn bộ tài khoản đã đăng ký.
8. Muốn chạy lệnh SQL: chuột phải `lumora-main` → **Query Tool**, gõ lệnh rồi bấm ▶ (hoặc F5). Ví dụ:
   ```sql
   SELECT id, full_name, email, provider, provider_id, created_at FROM users ORDER BY id;
   ```

> 💡 Phân biệt 2 mật khẩu: **Master Password** là của pgAdmin (do bạn tự đặt), còn `123` là mật khẩu kết nối **PostgreSQL** (của user `postgres`, đã khai trong `application.properties`).

---

## 5. Cách thêm tài khoản Gmail làm "test user" (để đăng nhập Google)

App Google đang ở chế độ **Testing** (thử nghiệm), nên **chỉ những Gmail được thêm vào danh sách test user mới đăng nhập được**. Giới hạn tối đa 100 tài khoản. (Muốn mở cho tất cả mọi người thì phải đưa app lên **Production** — xem ghi chú cuối mục.)

### Các bước thêm test user
1. Vào **https://console.cloud.google.com/** → đăng nhập bằng tài khoản Google **sở hữu dự án** (tài khoản đã tạo Client ID).
2. Góc trên chọn đúng **dự án** chứa Client ID của Lumora.
3. Menu trái: **APIs & Services** → **OAuth consent screen** (Màn hình chấp thuận OAuth).
4. Kéo xuống mục **Test users** → bấm **+ ADD USERS**.
5. Nhập địa chỉ Gmail cần cho phép (mỗi dòng một email), ví dụ `khoalee655@gmail.com` → bấm **SAVE**.
6. Xong. Gmail đó giờ đăng nhập được. Người dùng có thể phải **xoá cache / thử lại sau vài phút** nếu trước đó bị Google chặn.

### Nếu muốn mọi Gmail đều đăng nhập được (không cần thêm từng cái)
- Vào **OAuth consent screen** → bấm **PUBLISH APP** → chuyển **Publishing status** sang **In production**.
- Vì app Lumora chỉ xin quyền cơ bản (email, profile, openid — là *non-sensitive scopes*), nên **không cần Google xét duyệt**; chuyển Production là dùng ngay cho mọi tài khoản.
- Lúc đăng nhập người dùng có thể thấy màn cảnh báo "Google hasn't verified this app" → bấm **Advanced → Go to… (unsafe)** là vào được; muốn bỏ cảnh báo này mới cần nộp hồ sơ xác minh (logo, trang chủ, chính sách bảo mật).

> ⚠️ Lỗi 429 / 403 khi bấm nút Google thường **không phải do code** mà do Google tạm chặn vì đăng nhập thử quá nhiều lần liên tục — đợi ít phút rồi thử lại, hoặc thử ở cửa sổ ẩn danh.

---

## 6. Cách bật đăng nhập Zalo (OAuth v4 + PKCE)

Code đã xong cả FE lẫn BE. Khi chưa cấu hình, nút "Tiếp tục với Zalo" **tự khoá** (xám) nên app vẫn chạy bình thường. Để bật:

1. Vào **https://developers.zalo.me/** → tạo **Ứng dụng** mới.
2. **Liên kết một Official Account (OA)** vào app (Zalo bắt buộc bước này).
3. Lấy **App ID** và **Secret Key** trong phần cài đặt app.
4. Mục **Đăng nhập (Login)** của app → đăng ký **Redirect URI** y hệt: `http://localhost:5173/auth/zalo/callback`
5. Thêm Zalo của bạn vào **danh sách test user** (app mới chỉ cho test user tới khi được Zalo duyệt — giống Google Testing mode).
6. Điền giá trị vào 2 nơi, rồi chạy lại frontend (`npm run dev`):
   - `backend/src/main/resources/application.properties`: `app.zalo.app-id=...` và `app.zalo.secret-key=...`
   - `frontend/.env`: `VITE_ZALO_APP_ID=...`

> 🔒 **Secret Key chỉ đặt ở backend**, tuyệt đối không dán vào `.env` frontend hay commit lên git.

**Lưu ý kỹ thuật:** Zalo không trả email/SĐT, nên backend tạo **email tổng hợp** `zalo_<zaloId>@zalo.local` để giữ nguyên kiến trúc (cột email bắt buộc, JWT định danh theo email). Mỗi tài khoản Zalo được phân biệt qua cặp `(provider, provider_id)`.

---

## 7. Cách đăng ký & đăng nhập (thao tác trên web)

### Đăng ký tài khoản mới
1. Mở web → đang ở màn **Đăng nhập**.
2. Góc phải trên bấm **"Tạo tài khoản"** → chuyển sang màn Đăng ký.
3. Nhập **Họ và tên**, **Gmail**, **Mật khẩu** (tối thiểu 6 ký tự).
4. Bấm **"Tạo tài khoản"** → tự đăng nhập luôn → vào **trang chính**.

### Đăng nhập
- **Bằng Gmail + mật khẩu:** nhập Gmail + mật khẩu đã đăng ký → bấm **"Đăng nhập"**.
- **Bằng Google:** bấm nút **"Tiếp tục với Google"** → chọn tài khoản (phải là test user, xem mục 5).
- **Bằng Zalo:** bấm nút **"Tiếp tục với Zalo"** → đồng ý cấp quyền trên Zalo (cần đã cấu hình, xem mục 6).

### Đăng xuất
- Ở trang chính bấm **"Đăng xuất"** → quay lại màn đăng nhập.

### Các thông báo lỗi thường gặp
| Tình huống | Thông báo |
|-----------|-----------|
| Mật khẩu < 6 ký tự khi đăng ký | "Mật khẩu cần ít nhất 6 ký tự." |
| Gmail đã có người dùng | "Email này đã được sử dụng" |
| Sai mật khẩu khi đăng nhập | "Email hoặc mật khẩu không đúng" |
| Backend chưa chạy | "Không kết nối được máy chủ…" |

---

## 8. Luồng hoạt động (để review kỹ thuật)

```
Người dùng nhập form / bấm nút mạng xã hội (FE)
        │
        ▼
  POST /api/auth/register | /login | /google | /zalo   (JSON, kèm Origin)
        │
        ▼
  Backend kiểm tra dữ liệu → băm/so khớp mật khẩu (BCrypt)
  hoặc xác minh token Google / đổi code Zalo lấy hồ sơ → tạo JWT
        │
        ▼
  Trả về { token, user }  ──►  FE lưu vào localStorage (lumora.token, lumora.user)
        │
        ▼
  FE chuyển sang trang chính. Mỗi lần mở lại web, FE gọi
  GET /api/auth/me (kèm "Authorization: Bearer <token>") để xác thực token còn hạn.
```

- **Token hết hạn / hỏng** → `/me` trả 401 → FE tự xoá phiên, đẩy về đăng nhập.
- **Đăng nhập Google:** FE lấy *ID token* từ Google → gửi BE → BE xác minh chữ ký → tạo/đăng nhập user.
- **Đăng nhập Zalo:** FE sinh **PKCE** (code_verifier + code_challenge) → chuyển sang Zalo → Zalo gọi về `/auth/zalo/callback` kèm `code` → FE gửi `code` + `code_verifier` cho BE → BE đổi lấy access_token rồi lấy hồ sơ.

---

## 9. Ý nghĩa từng file code

### 9.1. Backend (`backend/src/main/java/com/lumora/backend/...`)

| File | Vai trò |
|------|---------|
| `auth/AuthController.java` | Khai báo các endpoint: `/register`, `/login`, `/google`, `/zalo`, `/me`. Nhận request, gọi `AuthService`, trả kết quả. |
| `auth/AuthService.java` | **Trung tâm logic** đăng ký/đăng nhập: băm & so khớp mật khẩu, gọi xác minh Google/Zalo, tạo JWT, tạo/tìm user. |
| `auth/dto/RegisterRequest.java` | Dữ liệu đăng ký gửi lên (họ tên, email, mật khẩu) + ràng buộc hợp lệ. |
| `auth/dto/LoginRequest.java` | Dữ liệu đăng nhập Gmail + mật khẩu. |
| `auth/dto/GoogleLoginRequest.java` | Chứa `credential` (ID token của Google). |
| `auth/dto/ZaloLoginRequest.java` | Chứa `code` + `codeVerifier` của luồng Zalo OAuth. |
| `auth/dto/AuthResponse.java` | Kết quả trả về khi đăng nhập thành công: `token` + `user`. |
| `auth/dto/UserResponse.java` | Thông tin user gửi về FE (ẩn mật khẩu băm). |
| `user/User.java` | Mô hình bảng `users` (id, họ tên, email, password_hash, provider, provider_id, avatar_url…). |
| `user/UserRepository.java` | Truy vấn DB bằng SQL thuần (JdbcTemplate): tìm theo email, theo provider_id, lưu user thường/Google/Zalo. |
| `security/JwtService.java` | Tạo & đọc JWT (ký bằng khoá bí mật, hạn 24h, subject = email, claim `uid`). |
| `security/JwtAuthFilter.java` | Chặn mỗi request, đọc header `Authorization: Bearer`, xác thực token. |
| `security/JwtAuthEntryPoint.java` | Trả lỗi 401 JSON tiếng Việt khi token thiếu/sai. |
| `security/GoogleTokenVerifier.java` | Xác minh ID token của Google (đúng chữ ký, đúng Client ID). |
| `security/ZaloClient.java` | Gọi API Zalo: đổi `code` lấy access_token, rồi lấy hồ sơ (id/tên/ảnh). |
| `config/SecurityConfig.java` | Cấu hình Spring Security: bật CORS, tắt CSRF, mở công khai các route `/api/auth/*`, bắt buộc token cho route còn lại, dùng BCrypt. |
| `common/EmailAlreadyUsedException.java` | Lỗi "email đã dùng" → map ra HTTP 409. |
| `common/InvalidCredentialsException.java` | Lỗi "sai thông tin đăng nhập" → map ra HTTP 401. |
| `db/schema.sql` | Lệnh SQL tạo bảng `users` + index. Có cột `provider`/`provider_id` cho đăng nhập mạng xã hội. |
| `resources/application.properties` | Cấu hình: kết nối DB, khoá JWT, Client ID Google, App ID/Secret Key Zalo, CORS. |

### 9.2. Frontend (`frontend/src/...`)

| File | Vai trò |
|------|---------|
| `lib/api.ts` | Gọi tất cả API backend (register/login/google/zalo/me) + bắt lỗi thành thông báo tiếng Việt. |
| `lib/auth.ts` | Lưu/đọc/xoá token + user trong `localStorage`. |
| `lib/AuthContext.tsx` | Trạng thái đăng nhập dùng chung toàn app: `user`, `token`, `login`, `register`, `loginWithGoogle`, `loginWithZalo`, `logout`. |
| `lib/pkce.ts` | Sinh `code_verifier` / `code_challenge` (PKCE) + `state` cho luồng Zalo, dùng Web Crypto. |
| `features/auth/AuthForm.tsx` | Khung form: chuyển tab Gmail ⇄ SĐT và chế độ Đăng nhập ⇄ Đăng ký. |
| `features/auth/GmailLoginForm.tsx` | Form Gmail + mật khẩu (đăng nhập thật), kèm nút Google + Zalo. |
| `features/auth/RegisterForm.tsx` | Form đăng ký (họ tên + gmail + mật khẩu). |
| `features/auth/PhoneLoginForm.tsx` | Tab SĐT: ô OTP là giao diện; đăng nhập thật bằng nút Zalo + Google. |
| `features/auth/GoogleSignInButton.tsx` | Nút Google chính thức (tải thư viện GIS, xác thực, gọi `loginWithGoogle`). |
| `features/auth/ZaloSignInButton.tsx` | Nút Zalo: sinh PKCE, lưu tạm, chuyển hướng sang trang cấp quyền Zalo. |
| `features/auth/parts.tsx` | Các mảnh UI dùng lại: ô nhập, nút chính, báo lỗi, divider… |
| `features/auth/AuthShowcase.tsx` / `scenes.ts` | Phần ảnh minh hoạ bên trái màn đăng nhập. |
| `pages/LoginPage.tsx` | Trang đăng nhập/đăng ký (ghép khung trái + form phải). |
| `pages/ZaloCallback.tsx` | Trang Zalo chuyển hướng về: kiểm tra `state`, gọi BE đổi token, vào trang chính. |
| `pages/HomePage.tsx` | Trang chính tạm sau khi đăng nhập (tên + email + đăng xuất). |
| `pages/LandingPage.tsx` | Trang chủ công khai. |
| `App.tsx` | Khai báo route + chặn khu vực thành viên nếu chưa đăng nhập. |
| `main.tsx` | Điểm khởi động, bọc toàn app trong `AuthProvider`. |
| `.env` | Cấu hình FE: địa chỉ backend, Client ID Google, App ID + Redirect URI Zalo. |

---

## 10. Kiểm thử đã chạy

| # | Kịch bản | Kết quả |
|---|----------|---------|
| 1 | Đăng ký tài khoản mới | ✅ 201, trả token + user |
| 2 | Đăng nhập đúng mật khẩu | ✅ 200, trả token |
| 3 | Gọi `/me` bằng token | ✅ 200, trả thông tin user |
| 4 | Đăng nhập sai mật khẩu | ✅ 401 "Email hoặc mật khẩu không đúng" |
| 5 | Đăng ký trùng email | ✅ 409 "Email này đã được sử dụng" |
| 6 | CORS từ origin cổng frontend | ✅ Header hợp lệ, không bị chặn |
| 7 | Đăng nhập Google (test user) | ✅ Tự tạo user, vào trang chính |
| 8 | Build frontend (`npm run build`) | ✅ Không lỗi |
| 9 | Compile backend (`mvn compile`) | ✅ Không lỗi |

---

## 11. Chưa làm (gợi ý tiếp theo)

- **SĐT (OTP qua SMS)** — tốn phí nên chưa làm; đã thay bằng Zalo/Google.
- **Đăng nhập Zalo** — code xong, chờ bạn điền App ID / Secret Key để chạy thật.
- "Quên mật khẩu" — nút đã có, chưa nối chức năng.
- Chưa có refresh token (token sống 24h rồi phải đăng nhập lại).
- Trang chính (`HomePage`) mới là bản tạm, chờ ghép trang chủ Lumora thật.

---

## 12. Mẹo xử lý nhanh khi lỗi

- **Trang trắng / không gọi được API:** kiểm tra backend còn chạy không (mở `http://localhost:8080` — nếu tắt thì chạy lại `mvn spring-boot:run`).
- **Lỗi 500 khi đăng ký/đăng nhập:** thường do sai mật khẩu DB trong `application.properties` (phải là user `postgres`, mật khẩu `123`).
- **Muốn xem dữ liệu user:** pgAdmin 4 → `lumora-main` → Schemas → public → Tables → `users` → chuột phải **View/Edit Data** (xem mục 4).
- **Bấm nút Google báo lỗi 429/403:** Google tạm chặn do thử quá nhiều — đợi vài phút hoặc dùng cửa sổ ẩn danh (xem mục 5).
- **Gmail cụ thể không đăng nhập Google được:** chưa được thêm vào test user (mục 5).
- **Đổi cổng backend/frontend:** sửa `VITE_API_BASE_URL` trong `frontend/.env` cho khớp backend.
- **Sửa file `.env` xong không ăn:** phải **tắt rồi chạy lại** `npm run dev` (Vite chỉ đọc `.env` lúc khởi động).
</content>
</invoke>
