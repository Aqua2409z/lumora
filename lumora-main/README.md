# Lumora

Một repository cho Backend, hai portal Frontend và database PostgreSQL của Group 03.

## Kiến trúc

Theo bản `nexus_kien_truc_fe_be (1).md` do nhóm cung cấp ngày 14/10/2026, lưu nguyên văn tại [docs/architecture-reference.md](docs/architecture-reference.md).

- Backend: Spring Boot 3.5, Java 21, Maven, modular monolith; package gốc `com.nexus` theo tài liệu. Gồm `platform` và 13 module nghiệp vụ.
- Frontend: React + TypeScript, Vite, Node.js 24 LTS, pnpm workspace; hai app `customer-portal` và `operations-portal`, năm package dùng chung.
- Database: PostgreSQL 17, DB v4 gồm 82 bảng pilot, 230 khóa ngoại, view KYC và seed. Flyway chạy V1/V2 khi backend khởi động; Hibernate dùng `ddl-auto: validate`.
- WebSocket: khung cấu hình STOMP `/ws`; IAM, phân quyền và đăng ký topic nghiệp vụ sẽ được triển khai sau.
- RabbitMQ và Redis: profile Docker `messaging`, tùy chọn cho pilot theo tài liệu.

```text
lumora/
├── backend/                 # Spring Boot và các module/feature/layer
├── frontend/
│   ├── apps/customer-portal/
│   ├── apps/operations-portal/
│   └── packages/            # ui, api-client, auth, realtime, utils
├── database/                # SQL gốc v4 để đối chiếu
├── docs/                    # Kiến trúc và danh mục cấu trúc
├── scripts/                 # Tạo môi trường và kiểm tra database
├── compose.yaml
├── .env.example
└── Lumora.code-workspace
```

Đây là bộ khung chạy được để nhóm bắt đầu code. Các feature trong cây thư mục chưa có nghiệp vụ hoàn chỉnh. Tên class/component minh họa trong tài liệu được giữ trong `docs/structure-manifest.json`; hiện chỉ tạo các tầng cần thiết và phần kết nối chạy dự án. Không có entity cho 19 bảng hoãn sang giai đoạn 2. Chưa có dữ liệu bán hàng demo, tài khoản đăng nhập, MFA hoặc chức năng đấu giá/thanh toán.

## Chạy bằng Docker

Cần Docker Desktop đang chạy, Git và OpenSSL. Từ Terminal:

```sh
git clone https://git.fsoft-academy.edu.vn/hcm26_cpl_js_java_04/group-03/lumora.git
cd lumora
sh scripts/setup-env.sh
docker compose up -d --build --wait
```

Script tạo `.env` với mật khẩu ngẫu nhiên, chỉ lưu cục bộ và không ghi đè file hiện có. Nếu các cổng đã được dùng, sửa trong `.env` trước khi chạy.

Các địa chỉ mặc định:

| Thành phần | Địa chỉ |
| --- | --- |
| Customer portal | http://localhost:5173 |
| Operations portal | http://localhost:5174 |
| Backend health | http://localhost:8080/api/health |
| PostgreSQL | localhost:5544, database `Lumora`, user `nexus` |

Các địa chỉ thực tế phụ thuộc các biến `CUSTOMER_PORT`, `OPERATIONS_PORT`, `BACKEND_PORT`, `POSTGRES_PORT` trong `.env`. Mật khẩu PostgreSQL ở `POSTGRES_PASSWORD` trong `.env`.

```sh
docker compose ps
docker compose logs backend
docker compose stop
```

Volume `lumora-v4_postgres_data` giữ dữ liệu khi dừng/tạo lại container. Khi chỉ bật service `db`, database còn rỗng; bật backend để Flyway nạp schema và seed. Mỗi máy có database riêng, Git không đồng bộ dữ liệu phát sinh.

## Code và tự tải lại khi phát triển

Mở `Lumora.code-workspace` bằng VS Code hoặc mở thư mục `lumora`; IntelliJ mở `backend/pom.xml`.

1. Chạy PostgreSQL: `docker compose up -d db`.
2. Chạy backend bằng Java 21/Maven, cấu hình `DB_URL`, `DB_USER`, `DB_PASSWORD` theo `.env`, rồi `cd backend` và `mvn spring-boot:run`. Nếu backend Docker đang chạy, dừng service đó trước để dùng cổng.
3. Frontend cần Node.js 24 và pnpm 11.9.0. Từ `frontend`: `pnpm install --frozen-lockfile`. Chạy hai terminal: `pnpm dev:customer` và `pnpm dev:operations`.
4. Dev server proxy `/api`, `/ws` tới `http://localhost:8080`. Đổi `BE_PROXY_TARGET` trong `.env.local` của mỗi app nếu backend dùng cổng khác. `VITE_API_BASE_URL=/api`.

Docker phục vụ bản build tĩnh qua Nginx. Sau khi sửa code ở chế độ Docker, chạy lại `docker compose up -d --build`; dùng Vite/IDE ở trên để tự tải lại khi code.

## Kiểm tra

```sh
cd backend
mvn test
cd ../frontend
pnpm typecheck
pnpm build
cd ..
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < scripts/check-database.sql
```

`ModuleDependencyTest` ngăn import entity/repository chéo module. Các thư mục kiểm thử nghiệp vụ được giữ theo kiến trúc; nhóm bổ sung khi hiện thực nghiệp vụ. Kiểm tra SQL dành cho database vừa khởi tạo, gồm 82 bảng, 230 FK, seed và lịch sử Flyway.

## Làm việc trên GitLab

Tạo nhánh theo tính năng như `feat/iam-auth`, `feat/customer-catalog`; commit phần mình sửa rồi mở Merge Request vào `main`. Maintainer kiểm tra và merge. Tất cả feature BE chỉ giao tiếp qua `api`, `event` hoặc port; FE không import trực tiếp feature khác, dùng package chung. Khi sửa database, thêm migration mới; không sửa V1/V2 đã chạy.
