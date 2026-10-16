# Lumora — Frontend

Giao diện web cho **Lumora** — nền tảng đấu giá & ký gửi tài sản. Dự án được dựng lại từ đầu dựa trên thiết kế Figma *"Nexus — Website UI"* (frame **Đăng nhập · Gmail / Số điện thoại — Desktop 1440**).

Màn hình hiện có: **Trang đăng nhập** (Login/Auth) với 2 chế độ chuyển đổi tương tác:

- **Gmail** — đăng nhập bằng email + mật khẩu (kèm nút "Tiếp tục với Google").
- **Số điện thoại** — đăng nhập bằng OTP gửi qua SMS.

Khi bấm chuyển tab, **cả biểu mẫu bên phải lẫn collage nghệ thuật bên trái đều đổi** theo từng chế độ (ảnh sản phẩm, thẻ LÔ, polaroid, ghi chú viết tay…), bám sát thiết kế gốc.

---

## 🧱 Công nghệ

| Hạng mục | Lựa chọn |
|----------|----------|
| Build tool | [Vite](https://vitejs.dev/) 5 |
| Framework | React 18 + TypeScript |
| Styling | Tailwind CSS 3.4 (cấu hình token theo Figma) |
| Routing | React Router 6 |
| Fonts | Google Fonts — Be Vietnam Pro, Playfair Display, Alex Brush, Patrick Hand, Charm |
| Icons | SVG tự vẽ (stroke `currentColor`), gradient vàng dùng `<linearGradient>` |

> Chọn **Vite** thay cho Create React App (đã ngừng phát triển) để khởi động nhanh và build gọn. Chọn **Tailwind** để kiểm soát khoảng cách / màu / bo góc theo đúng pixel của Figma.

---

## 🚀 Chạy dự án

```bash
# 1. Cài phụ thuộc
npm install

# 2. Chạy môi trường phát triển (http://localhost:5173)
npm run dev

# 3. Build production
npm run build

# 4. Xem thử bản build
npm run preview

# 5. Kiểm tra lint
npm run lint
```

Trang thiết kế theo khung cố định **1440×1024** (desktop). Mở trình duyệt ở bề rộng ≥ 1440px để thấy đúng bố cục; màn nhỏ hơn sẽ có thanh cuộn ngang (đúng theo thiết kế desktop-fixed của Figma).

---

## 📁 Cấu trúc thư mục

```
frontend/
├─ index.html              # Gốc HTML, nạp Google Fonts, lang="vi"
├─ package.json
├─ vite.config.ts          # Plugin React + alias "@" → ./src
├─ tsconfig.json
├─ tsconfig.node.json
├─ tailwind.config.js      # Token màu / font / shadow lấy từ Figma
├─ postcss.config.js
├─ public/
│  ├─ favicon.svg
│  └─ images/              # ⚠️ Ảnh sản phẩm PLACEHOLDER (xem mục dưới)
│     ├─ watch.svg
│     ├─ ring.svg
│     ├─ camera.svg
│     └─ bag.svg
└─ src/
   ├─ main.tsx             # Điểm vào: StrictMode + BrowserRouter
   ├─ App.tsx              # Khai báo route ("/", "/login")
   ├─ index.css            # @tailwind + utility gradient vàng
   ├─ vite-env.d.ts
   ├─ assets/              # Ảnh/đồ hoạ import vào bundle
   ├─ components/
   │  ├─ LumoraLogo.tsx    # Biểu tượng + chữ "Lumora"
   │  ├─ icons/
   │  │  ├─ index.tsx      # Bộ icon SVG dùng chung + Sparkle (gradient)
   │  │  └─ Doodles.tsx    # Nét vẽ tay: vòng xoắn, gạch chân, mũi tên cong
   │  ├─ layout/           # (dành cho layout dùng lại)
   │  └─ ui/               # (dành cho component UI nguyên tử)
   ├─ features/
   │  └─ auth/             # Toàn bộ tính năng Đăng nhập
   │     ├─ scenes.ts          # Dữ liệu collage theo từng tab (gmail/phone)
   │     ├─ AuthShowcase.tsx   # Panel trái đỏ crimson (collage)
   │     ├─ AuthForm.tsx       # Khung form + tab switcher + tiêu đề
   │     ├─ GmailLoginForm.tsx # Nội dung form Gmail
   │     ├─ PhoneLoginForm.tsx # Nội dung form OTP
   │     └─ parts.tsx          # Các mảnh UI của form (input, nút, checkbox…)
   ├─ pages/
   │  └─ LoginPage.tsx     # Lắp ráp trang, giữ state tab gmail/phone
   ├─ sections/            # (dành cho section lớn của trang)
   ├─ hooks/               # (custom hooks)
   ├─ lib/                 # (hàm tiện ích, client API…)
   └─ types/              # (khai báo type dùng chung)
```

> Các thư mục `layout/`, `ui/`, `sections/`, `hooks/`, `lib/`, `types/` hiện để trống (có `.gitkeep`) — dựng sẵn theo cấu trúc frontend chuẩn để mở rộng về sau.

---

## 🎨 Token thiết kế (lấy từ Figma)

Khai báo trong [tailwind.config.js](tailwind.config.js):

- **Màu thương hiệu:** `brand` `#9F1239` (đỏ crimson), `brand-dark` `#6B0B27`, `brand-deep` `#5E0A22`.
- **Nền kem/giấy:** `cream` `#F6F1E9`, `cream-card` `#FFFDF8`, `cream-light` `#F5F0E8`, `cream-tab` `#EDE4D6`.
- **Vàng gold:** `gold` `#E9CF84`, `gold-deep` `#D4AF37`, `gold-soft` `#F4DC92`, `gold-muted` `#C9A24A`.
- **Chữ:** `ink` `#171717` và các cấp 700/600/500.
- **Gradient vàng** (logo, chữ nghệ thuật, ngôi sao): utility `.text-gold-grad` / `.bg-gold-grad` trong [src/index.css](src/index.css) và `<linearGradient>` trong SVG.
- **Bóng đổ:** `shadow-photo`, `shadow-polaroid`, `shadow-lot`, `shadow-tab`, `shadow-btn-brand`, `shadow-ring-brand`…

---

## ⚠️ Về ảnh sản phẩm (cần thay)

Do bản Figma truy cập qua MCP bị **giới hạn tốc độ (Starter plan)** nên **không tải được ảnh gốc**. Các file trong [public/images/](public/images/) (`watch.svg`, `ring.svg`, `camera.svg`, `bag.svg`) hiện là **ảnh minh hoạ tạm (placeholder)** được vẽ theo đúng bảng màu thiết kế.

**Cách thay bằng ảnh thật:** export ảnh từ Figma (PNG/JPG/WebP), đặt vào `public/images/` rồi cập nhật đường dẫn `src` tương ứng trong [src/features/auth/scenes.ts](src/features/auth/scenes.ts). Không cần sửa chỗ nào khác.

---

## 📝 Tóm tắt những gì đã làm

1. **Xoá sạch** mã frontend cũ và dựng lại từ đầu trong thư mục `frontend/`.
2. Thiết lập **Vite + React + TypeScript + Tailwind + React Router** với cấu trúc thư mục chuẩn.
3. Cấu hình **token Figma** (màu, font, bóng đổ, gradient vàng) vào Tailwind.
4. Dựng **trang Đăng nhập** bám sát Figma: panel collage trái + biểu mẫu phải, 2 tab Gmail/OTP tương tác (đổi cả form lẫn collage).
5. Tự vẽ **bộ icon SVG** và các **nét vẽ tay** (doodle) khớp thiết kế.
6. Thay ảnh gốc chưa tải được bằng **placeholder SVG** đúng tông màu (ghi chú cách thay ở trên).
7. Viết **README** này.
```

Nội dung và vị trí (toạ độ px, màu, font) được dựng theo ảnh chụp thiết kế + bản "Copy as CSS" từ Figma để bám sát bản gốc nhất có thể.
