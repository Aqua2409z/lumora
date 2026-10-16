# Áp dụng kiến trúc

Nguồn duy nhất: `nexus_kien_truc_fe_be (1).md` do người dùng chọn, được lưu nguyên văn ở `architecture-reference.md`. Bản cũ trong Downloads không được dùng.

- Giữ package `com.nexus`, 14 module BE, các feature/layer, 12 feature customer, 15 feature operations và năm package FE đúng cây ở mục C/D.
- `structure-manifest.json` liệt kê cả thư mục và tên file minh họa từ tài liệu. Các class nghiệp vụ, mapping ORM, màn hình và tích hợp được thực hiện ở các sprint sau; không tạo lớp/endpoint rỗng giả thành chức năng hoàn chỉnh.
- Bản khung có entrypoint Spring Boot, health, cấu hình Security/WebSocket/Scheduling, Flyway, hai app Vite và proxy Nginx, Docker Compose.
- DB v4: 82 bảng pilot. SQL gốc và migration V1/V2 giữ nguyên nội dung. Hibernate validate đã cấu hình nhưng chưa có entity nghiệp vụ để validate toàn bộ mapping.
- Chỉ giữ ranh giới phần ngoài pilot; không map entity cho bảng giai đoạn 2, không tạo bảng shipment.
- Redis/RabbitMQ tùy chọn; outbox relay, policy service và các job nghiệp vụ trong tài liệu chưa được hiện thực.
- NFR về IAM, MFA, idempotency, audit, field crypto, tài chính và carrier còn là phần phải triển khai. Bộ khung chưa dùng cho vận hành nghiệp vụ thật.
