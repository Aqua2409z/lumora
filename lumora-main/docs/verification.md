# Kết quả kiểm tra bộ khung

- Backend: Maven test thành công, 14 kiểm tra ranh giới module.
- Frontend: TypeScript và production build thành công cho cả hai portal.
- Docker: build hai portal thành công; backend build thành công với cache Maven lấy từ thư viện đã tải cục bộ, do kết nối Maven Central từ Docker bị timeout.
- Toàn bộ stack Docker khởi động thành công. Trên máy kiểm tra dùng DB 5545, BE 8081, customer 5175, operations 5176 để tránh dịch vụ đang có; `.env.example` giữ các cổng mặc định.
- Flyway V1/V2 đã chạy trên database trống. Kiểm tra SQL xác nhận 82 bảng pilot, 230 FK, view KYC, seed và hai migration thành công.
- Backend health trả 200; API chưa cấp quyền trả 403.
- SQL gốc, các bản Flyway và tài liệu kiến trúc trùng nguyên văn với file được cung cấp. Mọi thư mục trong cây mục C/D đều tồn tại.

Phạm vi kiểm tra là bộ khung và khởi tạo database; chưa có kiểm thử nghiệp vụ, mapping đầy đủ entity, IAM/MFA, carrier hoặc tài chính. Build lần đầu cần kết nối các kho thư viện và Docker registry.
