# Backend Lumora

Spring Boot 3.5.16, Java 21, package `com.nexus` theo bản kiến trúc nhóm chọn. Một ứng dụng modular monolith gồm `platform` và 13 module nghiệp vụ. Xem README gốc và `docs/architecture-reference.md`.

Từng feature có đúng các tầng trong tài liệu (`controller`, `service`, `dto`, `entity`, `repository`, `client`, `listener`, `job` khi cần). `package-info.java` đánh dấu nơi triển khai, không phải lớp nghiệp vụ đã hoàn thành. Các tên class minh họa nằm trong `docs/structure-manifest.json`.

Chỉ `/api/health` và `/actuator/health` được mở trong khung ban đầu; các endpoint khác bị từ chối cho tới khi nhóm triển khai IAM và kiểm quyền. Không có tài khoản đăng nhập mặc định. Cấu hình WebSocket có sẵn nhưng chưa mở quyền kết nối nghiệp vụ.

Flyway sở hữu khởi tạo database: `src/main/resources/db/migration/V1__schema_v4.sql` và `V2__seed_v4.sql`. Không đồng thời nạp SQL bằng Docker initdb. `ddl-auto: validate` được bật để kiểm tra các entity khi nhóm bắt đầu ánh xạ; hiện chưa có entity nghiệp vụ nên chưa thể coi tất cả bảng đã được Hibernate kiểm tra.

Chạy `mvn test` và `mvn spring-boot:run` sau khi đặt `DB_URL`, `DB_USER`, `DB_PASSWORD`. Mặc định kết nối `localhost:5544/Lumora`; Docker sử dụng `db:5432/Lumora`. Khuyến nghị dùng Docker Compose tại gốc để thiết lập lần đầu.
