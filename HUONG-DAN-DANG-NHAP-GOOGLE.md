# Lumora — Hướng dẫn bật Đăng nhập Google

> Code backend + frontend cho nút **"Tiếp tục với Google"** đã xong 100%.
> Chỉ còn **1 việc duy nhất phải tự làm**: lấy **Client ID** từ Google (gắn với tài khoản Google của bạn, người khác không tạo hộ được). Lấy xong dán vào 2 chỗ là chạy.

Cập nhật: 15/10/2026

---

## 0. Hiểu nhanh cách hoạt động

```
Bấm nút Google (frontend)
        │
        ▼
 Google hiện popup chọn tài khoản → trả về "ID token" (một chuỗi JWT)
        │
        ▼
 Frontend gửi token lên:  POST /api/auth/google  { credential }
        │
        ▼
 Backend nhờ khoá công khai của Google kiểm tra token thật/giả,
 đọc được email + tên + ảnh → tạo/tìm user → cấp JWT của Lumora
        │
        ▼
 Frontend lưu phiên như đăng nhập thường → vào trang chính
```

- **Không cần Client Secret**, chỉ cần **Client ID**.
- Cùng **một Client ID** dán cho cả backend và frontend.

---

## 1. Lấy Client ID từ Google Cloud Console (làm 1 lần)

### Bước 1 — Tạo project
1. Vào https://console.cloud.google.com/ (đăng nhập bằng Gmail của bạn).
2. Góc trên bên trái, bấm chọn project → **New Project** → đặt tên `Lumora` → **Create**.
3. Đợi tạo xong thì chọn đúng project `Lumora`.

### Bước 2 — Cấu hình màn hình đồng ý (OAuth consent screen)
1. Menu trái → **APIs & Services** → **OAuth consent screen**
   (giao diện mới có thể nằm ở **Google Auth Platform** → **Branding**).
2. Chọn **User Type = External** → **Create**.
3. Điền tối thiểu:
   - **App name**: `Lumora`
   - **User support email**: chọn Gmail của bạn
   - **Developer contact information**: nhập lại Gmail của bạn
4. Bấm **Save and Continue** qua các bước Scopes (để mặc định).
5. Tới mục **Test users** → **Add users** → thêm **chính Gmail của bạn**
   (đang ở chế độ Testing thì chỉ các Gmail này mới đăng nhập được).
6. **Save and Continue** → **Back to Dashboard**.

### Bước 3 — Tạo OAuth Client ID
1. Menu trái → **APIs & Services** → **Credentials**.
2. **+ Create Credentials** → **OAuth client ID**.
3. **Application type** = **Web application**.
4. **Name**: `Lumora Web`.
5. Mục **Authorized JavaScript origins** → **Add URI**, thêm **cả hai** (không có dấu `/` ở cuối):
   ```
   http://localhost:5173
   http://localhost:5174
   ```
6. Mục **Authorized redirect URIs**: **để trống** (cách đăng nhập này không cần).
7. **Create** → hiện popup, **copy "Client ID"** (dạng `xxxxx.apps.googleusercontent.com`).

---

## 2. Dán Client ID vào 2 chỗ

### a) Backend — `backend/src/main/resources/application.properties`
Tìm dòng:
```properties
app.google.client-id=
```
Dán Client ID vào ngay sau dấu `=`:
```properties
app.google.client-id=123456789-abcdefg.apps.googleusercontent.com
```

### b) Frontend — `frontend/.env`
Tìm dòng:
```
VITE_GOOGLE_CLIENT_ID=
```
Dán **cùng Client ID đó**:
```
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

> ⚠️ Dùng **đúng một Client ID** cho cả hai file.

---

## 3. Khởi động lại & chạy

Phải restart cả hai (đổi config xong không tự nhận nếu không chạy lại):

```bash
# Terminal 1 — backend
cd D:\lumora\backend
mvn spring-boot:run

# Terminal 2 — frontend
cd D:\lumora\frontend
npm run dev
```

Mở trang đăng nhập → giờ sẽ thấy **nút Google thật của Google**. Bấm vào → chọn Gmail (phải là Gmail đã thêm ở Test users) → tự đăng nhập vào Lumora, trang chính hiện **ảnh đại diện Google** của bạn.

---

## 4. Kiểm tra nhanh đã bật chưa (không cần mở trình duyệt)

```bash
curl -X POST http://localhost:8080/api/auth/google ^
  -H "Content-Type: application/json" -d "{\"credential\":\"abc\"}"
```
- **Chưa cấu hình Client ID** → trả: *"Đăng nhập Google chưa được cấu hình trên máy chủ..."*
- **Đã cấu hình** → trả: *"Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn."*
  (vì `abc` là token giả — đúng như mong đợi).

---

## 5. Lỗi thường gặp

| Hiện tượng | Nguyên nhân & cách sửa |
|-----------|------------------------|
| Nút Google vẫn là nút xám bị khoá | Frontend chưa có `VITE_GOOGLE_CLIENT_ID`, hoặc chưa **restart** `npm run dev` sau khi sửa `.env` |
| Popup Google báo **origin not allowed / 400** | Chưa thêm đúng `http://localhost:5173` và `:5174` vào **Authorized JavaScript origins** (đừng để dấu `/` cuối) |
| Đăng nhập xong backend trả **401** | Client ID ở backend khác với frontend, hoặc dán thiếu/thừa ký tự |
| Google báo **access_denied / app chưa verify** | Gmail đang dùng chưa được thêm vào **Test users** (ở OAuth consent screen) |
| Chạy ở cổng khác (vd 5175) | Thêm origin cổng đó vào Google Console **và** vào `app.cors.allowed-origins` của backend |

---

## 6. Những gì đã code sẵn (để review)

**Backend**
- `pom.xml`: thêm thư viện `google-api-client` (xác minh ID token).
- `application.properties`: thêm `app.google.client-id`.
- `security/GoogleTokenVerifier.java` *(mới)*: xác minh token Google; chưa cấu hình thì tắt an toàn.
- `auth/dto/GoogleLoginRequest.java` *(mới)*: nhận `{ credential }`.
- `auth/AuthService.java`: thêm `loginWithGoogle()` — xác minh → tạo/tìm user → cấp JWT.
- `auth/AuthController.java`: thêm `POST /api/auth/google`.
- `config/SecurityConfig.java`: cho phép gọi `/api/auth/google` không cần đăng nhập trước.
- `user/User.java`, `user/UserRepository.java`: thêm cột `provider`, `avatar_url`; thêm `saveGoogleUser()`.
- `db/schema.sql`: `password_hash` cho phép null + cột `provider`, `avatar_url` (đã chạy migration vào DB `lumora-main`).

**Frontend**
- `lib/api.ts`: thêm `googleLoginApi()` + trường `avatarUrl`.
- `lib/AuthContext.tsx`: thêm `loginWithGoogle()`.
- `features/auth/GoogleSignInButton.tsx` *(mới)*: nạp thư viện Google, render nút thật, bắt lỗi; chưa có Client ID thì hiện nút khoá.
- `features/auth/GmailLoginForm.tsx`, `PhoneLoginForm.tsx`: dùng nút Google thật.
- `pages/HomePage.tsx`: hiện ảnh đại diện Google sau khi đăng nhập.
- `.env` / `.env.example`: thêm `VITE_GOOGLE_CLIENT_ID`.

> Trạng thái hiện tại: backend đang chạy (port 8080), đã test endpoint OK. Khi bạn dán Client ID và restart là đăng nhập Google chạy thật.
