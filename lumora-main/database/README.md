# Database Lumora v4

Hai SQL gốc nhóm cung cấp được giữ nguyên byte để đối chiếu:

- `nexus_schema_v4.sql`: 82 bảng pilot, 230 khóa ngoại, view `v_party_kyc_status`.
- `nexus_seed_v4.sql`: tài khoản hệ thống không có mật khẩu đăng nhập, 15 vai trò, 11 bộ policy, 10 retention rules, 2 profile PARCEL/ONSITE.

Ứng dụng chạy bản Flyway tương ứng tại `backend/src/main/resources/db/migration/V1__schema_v4.sql` và `V2__seed_v4.sql`. Chỉ Flyway thực thi khởi tạo; không mount SQL vào `docker-entrypoint-initdb.d` khi chạy stack này.

Không sửa các bản V1/V2 đã chạy; thay đổi sau tạo migration V3 trở lên. Không bật 19 bảng giai đoạn 2 trong pilot. Dữ liệu PostgreSQL nằm trong Docker volume, không nằm trong Git. Mật khẩu cục bộ nằm ở `.env` ngoài Git.

Chạy stack từ thư mục gốc theo README. Kiểm tra schema/seed bằng `scripts/check-database.sql`.
