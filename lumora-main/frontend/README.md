# Frontend Lumora

React + TypeScript, Vite, Node.js 24 LTS, pnpm 11.9.0. Hai app tách bundle: `apps/customer-portal` và `apps/operations-portal`. Các feature và tầng con được tạo theo bản kiến trúc trong `docs/architecture-reference.md`.

```sh
pnpm install --frozen-lockfile
pnpm dev:customer
# Terminal khác:
pnpm dev:operations
```

Mỗi app có `.env.example`; đặt `BE_PROXY_TARGET` trong `.env.local` để thay backend dev (mặc định `http://localhost:8080`). Khi build Docker, Nginx proxy API và WebSocket vào backend cùng mạng; Node.js chỉ dùng lúc build/dev.

Năm package dùng chung: `ui`, `api-client`, `auth`, `realtime`, `utils`. Chưa có xác thực hoặc nghiệp vụ hoàn chỉnh. `RouteGuard` cần được nối với phiên đã được server xác nhận; không dùng nó thay kiểm quyền BE. Feature ngoài pilot chỉ giữ ranh giới thư mục và nhãn trong bản khung.

Kiểm tra: `pnpm typecheck`, `pnpm build`.
