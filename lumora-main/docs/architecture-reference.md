# Nexus – Kiến trúc source code FE/BE theo feature (bước phân tích, chưa viết code nghiệp vụ)

> **Nguồn:** `NexusBaoCaoDuAn.pdf` (NXA-BA-DATA-01 v2.0, 03/10/2026). Tài liệu này là báo cáo thiết kế dựa trên **SRS 2.0**; bản SRS 2.0 gốc **không nằm trong file được cung cấp**. Phụ lục A của báo cáo có **tên đủ 60 FR** (FR001–FR060) nên mục F ghi tên FR; nội dung chi tiết từng FR vẫn là **TBD**. Mã FR dưới đây là mã ghi ở cột "Đối chiếu" của từng action.
>
> **Căn cứ công nghệ (Mục 2.1 và 10.1 của tài liệu):** Spring Boot, React TypeScript, PostgreSQL, Redis, RabbitMQ, Docker; backend **modular monolith** (đề xuất P02, _chưa được phê duyệt_); hai cổng FE: customer portal và operations portal; nhóm 7 người, Sprint 1 bắt đầu 05/10/2026, kết thúc 09/12/2026.
>
> **Công nghệ team dùng:** FE **React** (TypeScript) chạy công cụ trên **Node.js**; BE **Spring Boot**; DB **PostgreSQL**; thêm Docker và WebSocket. Node.js chỉ dùng để cài gói, chạy dev server và build (Vite); mọi API nằm ở Spring Boot (mục H).
>
> **Bản sửa 14/10/2026.** Căn lại theo ba nguồn team đã chốt: bộ luật **"Nexus — Đặc tả Business Rules (bản chuẩn)"** (113 luật = 76 BR-C + 37 BR-N), **DB v4** (`nexus_schema_v4.sql` + `nexus_seed_v4.sql`: 82 bảng của pilot; 19 bảng hoãn ở `nexus_giai_doan_2.sql`) và canvas **"Nexus – UI"**. Giao hàng dùng **API của hãng vận chuyển**, không có bảng giao hàng nội bộ. Danh sách chỗ đã sửa ở **mục K**.

**Quy ước đánh dấu:** `[TL]` = có căn cứ trực tiếp từ tài liệu; `[ĐX]` = đề xuất kiến trúc ngoài phạm vi yêu cầu gốc; `TBD` = chưa đủ thông tin; **Ngoài pilot** = không làm trong giai đoạn thí điểm theo BR-N36 (pilot chỉ có vật phẩm giao kiện PARCEL và giao tại chỗ ONSITE).

## A. SRS ANALYSIS

Quy mô: **98 actions** (A001–A098) trong 9 nhóm, **18 actors** (ACT01–ACT18), **113 business rules** theo bộ BR chuẩn (76 BR-C giữ mã tài liệu gốc + 37 BR-N mới; pilot áp dụng 101 luật), **DB v4: 82 bảng trong pilot** và 19 bảng hoãn sang giai đoạn 2 (tài liệu gốc 98 bảng; v3 bỏ 3 bảng giao hàng nội bộ, thêm 6 bảng; v4 tách 19 bảng không dùng trong pilot). Pilot không làm **23 action** (cột Pilot ở F.2). Mỗi action được gán đúng một module BE chủ quản (bảng F ở dưới).

| Module / Feature      | Mô tả nghiệp vụ                                                                                                                                                                                            | Chức năng con (feature)                                                                                          | Actor liên quan                                               | Tham chiếu (actions · FR)                                                                                                                    | Độ chắc chắn             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **platform**          | Shared kernel và hạ tầng: kiểu tiền VND, đồng hồ DB, idempotency, outbox/inbox, bảo mật (kể cả mã hóa cột nhạy cảm), lưu trữ tài liệu riêng tư, kết nối API hãng vận chuyển, xử lý lỗi chung.              | common, security, messaging, document, carrier                                                                   | —                                                             | Hạ tầng dùng chung                                                                                                                           | [ĐX] shared kernel       |
| **iam**               | Tài khoản, xác thực, MFA, khóa đăng nhập tạm thời, phiên, vai trò nhân viên, KYC (gồm xác thực CCCD) và tài khoản nhận tiền.                                                                               | `auth`, `account`, `identity`, `staffaccess`                                                                     | ACT01, ACT02, ACT03, ACT13                                    | 5 actions: A002, A003, A004, A005, A006 · 7 mã FR                                                                                            | [TL] Ch.10.1             |
| **governance**        | Tham số và điều khoản có phiên bản, audit, chấp thuận điều khoản, yêu cầu dữ liệu cá nhân và thời hạn lưu, thông báo và cài đặt kênh, giám sát vận hành.                                                   | `policy`, `datarequest`, `audit`, `acknowledgment`, `notification`, `operations`                                 | ACT12, ACT13, ACT15                                           | 4 actions: A007, A065, A066, A067 · 6 mã FR                                                                                                  | [TL] Ch.10.1             |
| **taxonomy**          | Nhóm hàng, mẫu hàng, category policy, Fulfillment Profile (pilot chỉ PARCEL, ONSITE) và bật nhóm hàng sau nghiệm thu (tách khỏi Catalog của tài liệu).                                                     | `master`, `policy`, `profile`, `enablement`                                                                      | ACT06, ACT07, ACT12, ACT13, ACT16                             | 5 actions: A029, A069, A070, A071, A098 · 7 mã FR                                                                                            | [ĐX] tách từ Catalog     |
| **asset**             | Item và hồ sơ chi tiết theo loại tài sản, lịch sử quyền sở hữu, hàng rào chống bán trùng (commitment), hold 4 loại; bộ hàng nhiều thành phần và capacity ngoài pilot (tách khỏi Consignment của tài liệu). | `item`, `commitment`, `hold`, `detail`, `lot`, `capacity`                                                        | ACT03, ACT04, ACT07, ACT15, ACT16                             | 4 actions: A072, A073, A091, A092 · 7 mã FR · 3 ngoài pilot                                                                                  | [ĐX] tách từ Consignment |
| **consignment**       | Hồ sơ ký gửi (xét từ xa hoặc mang/gửi hàng đến kho), xét quyền bán, hợp đồng/phiên bản/bảng phí, phí thu của chủ hàng, yêu cầu rút hoặc gia hạn.                                                           | `request`, `authority`, `agreement`, `withdrawal`, `charge`                                                      | ACT03, ACT04, ACT07, ACT12                                    | 10 actions: A008, A009, A010, A011, A012, A013, A014, A015, A017, A018 · 14 mã FR                                                            | [TL] Ch.10.1             |
| **inspectioncustody** | Nhận hàng, vị trí, custody, kiểm định, xác minh theo chiều (verification). Không còn shipment: giao nhận đi qua API hãng.                                                                                  | `custody`, `inspection`, `verification`                                                                          | ACT04, ACT05, ACT07, ACT12, ACT16, ACT17                      | 12 actions: A019, A020, A021, A022, A023, A024, A025, A074, A075, A080, A082, A086 · 14 mã FR · 5 ngoài pilot                                | [TL] Ch.10.1             |
| **catalog**           | Bài đăng, revision, duyệt độc lập và công bố, tìm kiếm/xem hàng công khai, watchlist.                                                                                                                      | `listing`, `search`, `watchlist`                                                                                 | ACT01, ACT06                                                  | 4 actions: A001, A026, A027, A028 · 8 mã FR                                                                                                  | [TL] Ch.10.1             |
| **commerce**          | Giỏ, checkout giữ hàng 15 phút, đơn mua ngay, đơn từ kết quả đấu giá, hạn thanh toán và gia hạn khi đang đối soát.                                                                                         | `cart`, `checkout`, `order`, `overdue`                                                                           | ACT02, ACT09, ACT11, ACT15                                    | 7 actions: A030, A031, A032, A033, A034, A035, A044 · 12 mã FR                                                                               | [TL] Ch.10.1             |
| **auction**           | Quy chế, lịch phiên, tham gia (tự duyệt, hạn chế đặt giá), bid và loại giá, đóng phiên 3 phút + đếm 3 lần, kết quả và điều chỉnh, realtime.                                                                | `rule`, `schedule`, `participation`, `bidding`, `result`, `incident`                                             | ACT02, ACT08, ACT12, ACT15                                    | 10 actions: A036, A037, A038, A039, A040, A041, A042, A043, A045, A046 · 13 mã FR                                                            | [TL] Ch.10.1             |
| **finance**           | Thanh toán, sổ cái ghi kép, hoàn tiền và chi trả (Finance Maker lập, Finance Checker duyệt), quyết toán, đối soát, thu hồi, chứng từ; nghĩa vụ thu theo mốc ngoài pilot.                                   | `payment`, `ledger`, `obligation`, `refund`, `settlement`, `payout`, `reconciliation`, `recovery`, `taxdocument` | ACT02, ACT09, ACT10, ACT12, ACT14, ACT15                      | 12 actions: A047, A048, A049, A050, A051, A052, A053, A054, A055, A056, A093, A094 · 10 mã FR · 2 ngoài pilot                                | [TL] Ch.10.1             |
| **fulfillment**       | Kế hoạch bàn giao theo profile, giao hàng qua API hãng, nhận tại kho, xét hoàn tất sau 7 ngày khiếu nại; chuyển quyền, vé/quyền số và dịch vụ ngoài pilot.                                                 | `plan`, `delivery`, `handover`, `transfer`, `entitlement`, `servicebooking`, `completion`                        | ACT02, ACT05, ACT07, ACT12, ACT14, ACT15, ACT16, ACT17, ACT18 | 17 actions: A057, A058, A059, A060, A076, A077, A078, A079, A081, A083, A084, A087, A088, A089, A090, A095, A096 · 19 mã FR · 11 ngoài pilot | [TL] Ch.10.1             |
| **dispute**           | Vụ việc 7 loại, bằng chứng, quyết định (Trưởng ca duyệt) và kháng nghị, hàng trả về, khắc phục giao dịch không chuyển quyền được (ngoài pilot).                                                            | `casemgmt`, `decision`, `returns`, `remediation`                                                                 | ACT05, ACT07, ACT11, ACT12, ACT16, ACT17                      | 6 actions: A061, A062, A063, A064, A085, A097 · 8 mã FR · 2 ngoài pilot                                                                      | [TL] Ch.10.1             |
| **reporting**         | Read model và báo cáo: bảng theo dõi của chủ hàng, báo cáo vận hành (không sở hữu bảng nghiệp vụ).                                                                                                         | `consignorview`, `ops`                                                                                           | ACT03, ACT08, ACT09                                           | 2 actions: A016, A068 · 4 mã FR                                                                                                              | [ĐX] read model          |

Tên đầy đủ actor: ACT01=Guest; ACT02=Buyer; ACT03=Consignor; ACT04=Intake; ACT05=Authenticator; ACT06=Catalog/Publisher; ACT07=Custody/Fulfillment; ACT08=Auction Ops; ACT09=Finance Maker; ACT10=Finance Checker; ACT11=Support/Case; ACT12=Legal/Data; ACT13=Admin/Security; ACT14=External Provider; ACT15=Scheduler/Worker; ACT16=Asset/Transfer Officer; ACT17=Issuer/Performer; ACT18=Handover Parties.

Mười module của Mục 10.1 là: IAM; Consignment; Inspection/Custody; Catalog; Auction; Commerce; Finance; Fulfillment; Dispute; Governance/Notification. Mình **giữ nguyên 10 module này** và đề xuất thêm 3 (`taxonomy`, `asset`, `reporting`) cùng `platform` để tránh vòng phụ thuộc (xem mục H).

## B. FEATURE BREAKDOWN

### platform [ĐX]

- `common`, `security`, `messaging` (idempotency/outbox/inbox), `document` (lưu tài liệu riêng tư), **`carrier`** (client API hãng vận chuyển và webhook, không có bảng riêng). _Lý do:_ các cơ chế an toàn mà Chương 10 yêu cầu cho mọi command (idempotency, giờ DB, outbox) và kết nối hãng vận chuyển dùng chung cho nhiều module, không thuộc nghiệp vụ nào.

### iam [TL]

_Tài khoản, xác thực, MFA, khóa đăng nhập tạm thời, phiên, vai trò nhân viên, KYC (gồm xác thực CCCD) và tài khoản nhận tiền._

- `auth` – A003 Đăng nhập, MFA và thu hồi phiên · khóa 15 phút sau 5 lần sai mật khẩu (BR-N03); MFA bắt buộc khi đăng ký phiên và khai tài khoản nhận tiền (BR-N02)
- `account` – A002 Đăng ký và xác minh liên hệ; A004 Cập nhật hồ sơ và địa chỉ
- `identity` – A005 Gửi danh tính và tài khoản nhận tiền · KYC và xác thực CCCD qua nhà cung cấp eKYC, bảng `citizen_id_verifications` (BR-N01); trạng thái tổng của khách đọc từ view `v_party_kyc_status`; tài khoản nhận tiền phải xác minh (BR-C42)
- `staffaccess` – A006 Cấp và thu hồi quyền nhân viên · 15 vai trò trong seed v4, gồm Trưởng ca (SHIFT_LEAD), Finance Maker, Finance Checker

### governance [TL]

_Tham số và điều khoản có phiên bản, audit, chấp thuận điều khoản, yêu cầu dữ liệu cá nhân và thời hạn lưu, thông báo và cài đặt kênh, giám sát vận hành._

- `policy` – A066 Quản lý policy và feature gate · tham số đã chốt nằm ở `policy_versions` (11 bộ trong seed v4), code đọc qua `governance.api`, không viết cứng
- `datarequest` – A007 Xử lý yêu cầu quyền dữ liệu · phản hồi 2 ngày làm việc, xong trong 10 hoặc 20 ngày, gia hạn 1 lần (BR-N34); job xóa theo thời hạn lưu, bỏ qua legal hold (BR-C53)
- `audit` – [ĐX] không có action riêng, phục vụ các feature khác
- `acknowledgment` – [ĐX] không có action riêng, phục vụ các feature khác
- `notification` – A067 Thông báo và tác vụ chạy lại · email + trong app, SMS cho 3 loại; loại bắt buộc không tắt được (BR-N32); bảng `notification_preferences`
- `operations` – A065 Giám sát, backup và phục hồi

### taxonomy [ĐX]

_Nhóm hàng, mẫu hàng, category policy, Fulfillment Profile (pilot chỉ PARCEL, ONSITE) và bật nhóm hàng sau nghiệm thu (tách khỏi Catalog của tài liệu)._

- `master` – A029 Quản lý mẫu và nhóm hàng; A069 Tạo hoặc mở rộng danh mục
- `policy` – A070 Duyệt điều kiện ngành hàng
- `profile` – A071 Soạn và duyệt Fulfillment Profile · pilot chỉ dùng profile PARCEL và ONSITE (BR-N36)
- `enablement` – A098 Bật nhóm hàng sau nghiệm thu

### asset [ĐX]

_Item và hồ sơ chi tiết theo loại tài sản, lịch sử quyền sở hữu, hàng rào chống bán trùng (commitment), hold 4 loại; bộ hàng nhiều thành phần và capacity ngoài pilot (tách khỏi Consignment của tài liệu)._

- `item` – [ĐX] không có action riêng, phục vụ các feature khác · kèm `ownership_events` (lịch sử quyền sở hữu, chuyển từ `consignment/authority` sang)
- `commitment` – [ĐX] không có action riêng, phục vụ các feature khác
- `hold` – [ĐX] không có action riêng, phục vụ các feature khác · 4 loại hold: Bán, Giao, Chi tiền, Pháp lý (BR-N29)
- `detail` – A072 Phân loại lot và đề xuất bàn giao; A073 Lập hồ sơ bất động sản _(ngoài pilot)_
- `lot` – A091 Lập lot nhiều thành phần hoặc nhiều đơn vị _(ngoài pilot)_ · ngoài pilot từ 14/10 (BR-C71): pilot coi một bộ hàng là một món, không bán lẻ
- `capacity` – A092 Giữ và chuyển capacity/component _(ngoài pilot)_ · ngoài pilot; bảng ở `nexus_giai_doan_2.sql`

### consignment [TL]

_Hồ sơ ký gửi (xét từ xa hoặc mang/gửi hàng đến kho), xét quyền bán, hợp đồng/phiên bản/bảng phí, phí thu của chủ hàng, yêu cầu rút hoặc gia hạn._

- `request` – A008 Tạo hồ sơ ký gửi; A009 Tải giấy tờ và cam kết trách nhiệm; A010 Bổ sung và gửi chính thức; A015 Hẹn giao hoặc gửi tài sản vào kho · hạn bổ sung 10 ngày, hồ sơ bị từ chối đóng sau 3 ngày (BR-N05, N06); A015 chuyển từ `inspectioncustody/shipment` sang, vận đơn chiều gửi qua `platform/carrier`
- `authority` – A011 Xét hồ sơ từ xa theo route A; A012 Xét quyền ký gửi và quyền bán
- `agreement` – A013 Đề xuất hợp đồng và bảng phí; A014 Chấp thuận hoặc thương lượng điều khoản · chấp thuận bằng OTP (BR-N04), thời hạn 60 ngày (BR-N08), biểu phí mẫu (BR-N31)
- `withdrawal` – A017 Yêu cầu rút hoặc gia hạn ký gửi; A018 Quyết định trả hàng hoặc đóng ký gửi · vận đơn trả hàng qua `platform/carrier`, phí rút trước hạn (BR-N08)
- `charge` – [ĐX] không có action riêng: phí thu của chủ hàng khi không bán được, bảng `consignor_charges` (BR-C06, N07, N08)

### inspectioncustody [TL]

_Nhận hàng, vị trí, custody, kiểm định, xác minh theo chiều (verification). Không còn shipment: giao nhận đi qua API hãng._

- `custody` – A019 Nhận và đối chiếu hàng ký gửi; A020 Đặt vị trí và niêm phong; A024 Cách ly hàng có bất thường; A025 Kiểm kê và xử lý chênh lệch
- `inspection` – A021 Phân công kiểm định; A022 Kiểm định và lập báo cáo; A023 Hoàn tất, sửa hoặc thu hồi báo cáo
- `verification` – A074 Xác minh khả năng chuyển quyền đất _(ngoài pilot)_; A075 Khảo sát thực địa và xem tài sản _(ngoài pilot)_; A080 Kiểm tra xe và hồ sơ đăng ký _(ngoài pilot)_; A082 Xác minh quyền sự kiện và nguồn vé _(ngoài pilot)_; A086 Đặc tả gói dịch vụ và năng lực _(ngoài pilot)_ · bảng `verification_reviews` vẫn dùng trong pilot cho kết quả xác minh giấy tờ, hiện trạng vật phẩm (`listing_verifications` trỏ tới)

### catalog [TL]

_Bài đăng, revision, duyệt độc lập và công bố, tìm kiếm/xem hàng công khai, watchlist._

- `listing` – A026 Soạn bài đăng Nexus; A027 Duyệt độc lập và công bố; A028 Sửa nội dung và đình chỉ bài · người duyệt khác người soạn, từ chối thì về Nháp (BR-N09); đình chỉ bài thì hủy checkout đang mở (BR-N13)
- `search` – A001 Tìm và xem sản phẩm
- `watchlist` – [ĐX] không có action riêng: theo dõi bài đăng, bảng `watchlist_items` (BR-N33)

### commerce [TL]

_Giỏ, checkout giữ hàng 15 phút, đơn mua ngay, đơn từ kết quả đấu giá, hạn thanh toán và gia hạn khi đang đối soát._

- `cart` – A030 Thêm giỏ và xem tổng dự kiến · mua nguyên lot, mỗi lần checkout một món (BR-N11)
- `checkout` – A031 Checkout và giữ hàng có hạn; A033 Hết hạn checkout · giữ hàng 15 phút, cảnh báo khi còn 2 phút (BR-N12); `checkouts.expires_at` là nguồn duy nhất của hạn giữ
- `order` – A032 Xác nhận đơn mua ngay; A034 Xem đơn và yêu cầu hủy; A035 Can thiệp đơn theo căn cứ · hạn thanh toán (BR-N21), phí vận chuyển theo báo giá hãng (BR-N23, N24), hủy đơn (BR-N27)
- `overdue` – A044 Xử lý người thắng quá hạn · gia hạn tối đa 24 giờ khi đang đối soát (BR-N22); báo auction để hạn chế đặt giá (BR-N20)

### auction [TL]

_Quy chế, lịch phiên, tham gia (tự duyệt, hạn chế đặt giá), bid và loại giá, đóng phiên 3 phút + đếm 3 lần, kết quả và điều chỉnh, realtime._

- `rule` – A036 Chốt quy chế và chủ thể tổ chức
- `schedule` – A037 Lập lịch phiên và dành hàng; A039 Mở phiên theo giờ máy chủ
- `participation` – A038 Đăng ký tham gia và chấp thuận quy chế · tự duyệt (BR-N17); hạn chế đặt giá 30 ngày, bảng `bidding_restrictions` (BR-N20)
- `bidding` – A040 Gửi lượt trả giá; A041 Theo dõi lịch sử và giá dẫn đầu · hệ số bước x1/x2/x5 (BR-N15); loại giá không xóa, bảng `bid_invalidations` (BR-N18); realtime STOMP
- `result` – A042 Đóng nhận giá và chốt kết quả; A043 Tạo đơn từ kết quả hợp lệ; A046 Điều chỉnh kết quả phiên · job đóng phiên 3 phút + đếm 3 × 5 giây (BR-N16); giữ kết quả nghi vấn (BR-N19)
- `incident` – A045 Xử lý sự cố hoặc hủy phiên

### finance [TL]

_Thanh toán, sổ cái ghi kép, hoàn tiền và chi trả (Finance Maker lập, Finance Checker duyệt), quyết toán, đối soát, thu hồi, chứng từ; nghĩa vụ thu theo mốc ngoài pilot._

- `payment` – A047 Khởi tạo thanh toán; A048 Xử lý xác nhận tiền
- `ledger` – [ĐX] không có action riêng, phục vụ các feature khác
- `obligation` – A093 Lập nghĩa vụ thu theo mốc _(ngoài pilot)_; A094 Phân bổ thu và giải mốc _(ngoài pilot)_
- `refund` – A050 Lập hoàn tiền; A051 Duyệt hoàn và thực hiện · Finance Maker lập, Finance Checker duyệt (BR-N28)
- `settlement` – A052 Lập quyết toán ký gửi; A053 Duyệt quyết toán và thụ hưởng · chỉ quyết toán khi hết 7 ngày khiếu nại và không có hold Chi tiền (BR-C41)
- `payout` – A054 Lập, duyệt và theo dõi chi trả · Finance Maker lập, Finance Checker duyệt (BR-N28); màn A5a, tab Chi tiền chủ hàng
- `reconciliation` – A049 Đối soát và xử lý chênh lệch
- `recovery` – A056 Thu hồi sau chi trả sai
- `taxdocument` – A055 Cấp chứng từ và báo cáo thuế

### fulfillment [TL]

_Kế hoạch bàn giao theo profile, giao hàng qua API hãng, nhận tại kho, xét hoàn tất sau 7 ngày khiếu nại; chuyển quyền, vé/quyền số và dịch vụ ngoài pilot._

- `plan` – A089 Lập phương án hàng cồng kềnh _(ngoài pilot)_; A095 Lập và thực hiện kế hoạch bàn giao · pilot chỉ 2 kiểu bàn giao cố định PARCEL, ONSITE (seed v4); mốc giao lấy từ cột `carrier_*` của `fulfillment_cases`, `fulfillment_milestones` và `fulfillment_evidence` để giai đoạn 2
- `delivery` – A057 Chọn vận chuyển và đóng gói; A058 Bàn giao cho hãng hoặc người nhận; A059 Cập nhật hành trình và ngoại lệ · **[ĐX] mới**, thay `inspectioncustody/shipment`. Trong pilot, A057 là chọn hãng và tạo vận đơn (Nexus không tự đóng gói, không tự giao), A058 là giao hàng cho hãng, A059 là nhận trạng thái từ API hãng; quá 3 ngày chưa giao thì cảnh báo (BR-N25)
- `handover` – A060 Xác nhận nhận hoặc phản ánh vấn đề; A079 Bàn giao bất động sản tại chỗ _(ngoài pilot)_
- `transfer` – A076 Chốt thủ tục chuyển quyền và chi phí _(ngoài pilot)_; A077 Ghi căn cứ ký kết và nộp hồ sơ _(ngoài pilot)_; A078 Xác nhận kết quả đăng ký chuyển quyền _(ngoài pilot)_; A081 Điều phối giao xe và sang tên _(ngoài pilot)_
- `entitlement` – A083 Cấp hoặc chuyển vé/quyền _(ngoài pilot)_; A084 Xác nhận redeem quyền _(ngoài pilot)_; A090 Xác minh và cấp quyền số _(ngoài pilot)_
- `servicebooking` – A087 Đặt hoặc đổi lịch dịch vụ _(ngoài pilot)_; A088 Thực hiện và nghiệm thu dịch vụ _(ngoài pilot)_ · đổi tên từ `service` để không thành package `fulfillment.service.service`
- `completion` – A096 Xét hoàn tất theo profile · tự hoàn tất khi hết 7 ngày khiếu nại mà không có vụ việc (BR-N26); biết vụ việc đang mở qua port `OpenCasePort` do dispute hiện thực

### dispute [TL]

_Vụ việc 7 loại, bằng chứng, quyết định (Trưởng ca duyệt) và kháng nghị, hàng trả về, khắc phục giao dịch không chuyển quyền được (ngoài pilot)._

- `casemgmt` – A061 Phân loại và điều tra tranh chấp; A064 Tiếp nhận tranh chấp từ người thứ ba/cơ quan; A085 Xử lý sự kiện hoãn/hủy hoặc vé bị từ chối _(ngoài pilot)_ · 7 loại vụ việc (BR-N29), hạn xử lý (BR-N10), hỏng/mất trong kho (BR-N30)
- `decision` – A062 Ra quyết định và kháng nghị · Trưởng ca duyệt, khác người đề xuất (BR-N28)
- `returns` – A063 Nhận trả và kiểm định lại · đổi tên từ `return` vì `return` là từ khóa Java, không đặt được tên package
- `remediation` – A097 Khắc phục giao dịch không chuyển quyền được _(ngoài pilot)_

### reporting [ĐX]

_Read model và báo cáo: bảng theo dõi của chủ hàng, báo cáo vận hành (không sở hữu bảng nghiệp vụ)._

- `consignorview` – A016 Theo dõi ký gửi và quyết toán
- `ops` – A068 Xem báo cáo vận hành

**Lý do nhóm:** mỗi module sở hữu một tập bảng và một ranh giới giao dịch rõ (xem Phụ lục 2); các action cùng một aggregate (ví dụ `bid` và `auction_results`) ở cùng module để giữ một transaction, đúng yêu cầu Mục 10.1.

## C. BACKEND DIRECTORY TREE

Spring Boot, Java, package gốc `com.nexus` (giả định, TBD). Tên file minh họa, không có code. Mỗi feature chỉ có các thư mục thật sự cần: feature chỉ xử lý worker thì không có `controller`; feature không sở hữu bảng thì không có `entity`.

```
backend/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/
    │   │       └── nexus/
    │   │           ├── NexusApplication.java
    │   │           ├── platform/
    │   │           │   ├── common/
    │   │           │   │   ├── Money.java
    │   │           │   │   ├── DbClock.java
    │   │           │   │   ├── ApiError.java
    │   │           │   │   ├── GlobalExceptionHandler.java
    │   │           │   │   └── JobLock.java  # khóa để job chỉ chạy 1 lần khi có nhiều instance
    │   │           │   ├── security/
    │   │           │   │   ├── SecurityConfig.java
    │   │           │   │   ├── ObjectAccessGuard.java
    │   │           │   │   └── FieldCrypto.java  # băm HMAC + mã hóa cột nhạy cảm: số CCCD, địa chỉ, serial (BR-C50)
    │   │           │   ├── messaging/
    │   │           │   │   ├── IdempotencyFilter.java  # bảng idempotency_records
    │   │           │   │   ├── OutboxPublisher.java  # bảng outbox_events
    │   │           │   │   ├── InboxDeduplicator.java  # bảng processed_events
    │   │           │   │   ├── RabbitConfig.java  # tùy chọn: pilot 1 instance chưa cần (mục H)
    │   │           │   │   └── OutboxRelayJob.java  # đọc outbox_events sau commit, gọi listener; chống trùng bằng processed_events
    │   │           │   ├── document/
    │   │           │   │   ├── DocumentStorageService.java
    │   │           │   │   └── Document.java  # entity bảng documents
    │   │           │   ├── carrier/
    │   │           │   │   ├── CarrierClient.java  # interface: báo giá, tạo vận đơn, tra hành trình
    │   │           │   │   ├── HttpCarrierClient.java  # adapter cho hãng được chọn (GHN/GHTK/Viettel Post – TBD)
    │   │           │   │   ├── CarrierWebhookController.java  # POST /carrier/webhooks/{carrier}: kiểm chữ ký, chống trùng
    │   │           │   │   └── CarrierStatusChanged.java  # event: mã hãng, mã vận đơn, trạng thái, thời điểm
    │   │           │   └── port/
    │   │           │       ├── AuditTrail.java
    │   │           │       ├── AcknowledgmentPort.java
    │   │           │       └── OpenCasePort.java  # dispute hiện thực; fulfillment/completion hỏi vụ việc đang mở
    │   │           ├── iam/
    │   │           │   ├── auth/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── AuthController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   ├── AuthService.java
    │   │           │   │   │   └── LoginLockService.java  # BR-N03: sai 5 lần khóa 15 phút
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── AuthRequest.java
    │   │           │   │   │   └── AuthResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── SecurityCredential.java
    │   │           │   │   │   └── UserSession.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── SecurityCredentialRepository.java
    │   │           │   │       └── UserSessionRepository.java
    │   │           │   ├── account/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── AccountController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── AccountService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── AccountRequest.java
    │   │           │   │   │   └── AccountResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── User.java
    │   │           │   │   │   ├── Party.java
    │   │           │   │   │   └── Address.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── UserRepository.java
    │   │           │   │       ├── PartyRepository.java
    │   │           │   │       └── AddressRepository.java
    │   │           │   ├── identity/
    │   │           │   │   ├── controller/
    │   │           │   │   │   ├── IdentityController.java
    │   │           │   │   │   └── KycReviewController.java  # A2c: hàng chờ NEEDS_REVIEW và quyết định Đạt / Yêu cầu làm lại / Không đạt; vai trò INTAKE_OFFICER
    │   │           │   │   ├── service/
    │   │           │   │   │   ├── IdentityService.java
    │   │           │   │   │   └── KycReviewService.java  # chỉ cho Đạt khi liveness đạt, thẻ còn hạn, CCCD chưa gắn tài khoản khác; ghi reviewed_by, reviewed_at và audit
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── IdentityRequest.java
    │   │           │   │   │   └── IdentityResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── IdentityCheck.java
    │   │           │   │   │   ├── BankAccount.java
    │   │           │   │   │   └── CitizenIdVerification.java  # bảng citizen_id_verifications (BR-N01)
    │   │           │   │   ├── repository/
    │   │           │   │   │   ├── IdentityCheckRepository.java
    │   │           │   │   │   ├── BankAccountRepository.java
    │   │           │   │   │   └── CitizenIdVerificationRepository.java
    │   │           │   │   └── client/
    │   │           │   │       └── EkycProviderClient.java  # nhà cung cấp eKYC: chụp thẻ + khuôn mặt, đọc chip, VNeID (TBD)
    │   │           │   ├── staffaccess/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── StaffAccessController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── StaffAccessService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── StaffAccessRequest.java
    │   │           │   │   │   └── StaffAccessResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── Role.java  # 15 vai trò theo seed v4
    │   │           │   │   │   └── UserRole.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── RoleRepository.java
    │   │           │   │       └── UserRoleRepository.java
    │   │           │   └── api/
    │   │           │       └── IamApi.java
    │   │           ├── governance/
    │   │           │   ├── policy/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── PolicyController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── PolicyService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── PolicyRequest.java
    │   │           │   │   │   └── PolicyResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── PolicyVersion.java
    │   │           │   │   └── repository/
    │   │           │   │       └── PolicyVersionRepository.java
    │   │           │   ├── datarequest/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── DataRequestController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── DataRequestService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── DataRequestRequest.java
    │   │           │   │   │   └── DataRequestResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── DataRequest.java
    │   │           │   │   │   └── RetentionRule.java
    │   │           │   │   ├── repository/
    │   │           │   │   │   ├── DataRequestRepository.java
    │   │           │   │   │   └── RetentionRuleRepository.java
    │   │           │   │   └── job/
    │   │           │   │       ├── DataRequestDeadlineJob.java  # BR-N34: hạn phản hồi 2 ngày làm việc, hoàn tất 10/20 ngày
    │   │           │   │       └── RetentionJob.java  # BR-C53: xóa/ẩn danh theo retention_rules, bỏ qua legal hold
    │   │           │   ├── audit/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── AuditController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── AuditService.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── AuditEvent.java
    │   │           │   │   └── repository/
    │   │           │   │       └── AuditEventRepository.java
    │   │           │   ├── acknowledgment/
    │   │           │   │   ├── service/
    │   │           │   │   │   └── AcknowledgmentService.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── Acknowledgment.java
    │   │           │   │   └── repository/
    │   │           │   │       └── AcknowledgmentRepository.java
    │   │           │   ├── notification/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── NotificationController.java  # hộp thư và cài đặt kênh (C4i)
    │   │           │   │   ├── service/
    │   │           │   │   │   └── NotificationService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   └── NotificationPreferenceRequest.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── NotificationDelivery.java
    │   │           │   │   │   └── NotificationPreference.java  # bảng notification_preferences (BR-N32)
    │   │           │   │   ├── repository/
    │   │           │   │   │   ├── NotificationDeliveryRepository.java
    │   │           │   │   │   └── NotificationPreferenceRepository.java
    │   │           │   │   └── job/
    │   │           │   │       └── NotificationJob.java
    │   │           │   ├── operations/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── OperationsController.java
    │   │           │   │   └── service/
    │   │           │   │       └── OperationsService.java
    │   │           │   ├── api/
    │   │           │   │   ├── GovernanceApi.java
    │   │           │   │   └── PolicyParams.java  # đọc tham số đã chốt trong policy_versions
    │   │           │   └── event/
    │   │           │       └── GovernanceEvents.java
    │   │           ├── taxonomy/
    │   │           │   ├── master/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── CategoryController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── CategoryService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── CategoryRequest.java
    │   │           │   │   │   └── CategoryResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── Category.java
    │   │           │   │   │   └── ProductModel.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── CategoryRepository.java
    │   │           │   │       └── ProductModelRepository.java
    │   │           │   ├── policy/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── CategoryPolicyController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── CategoryPolicyService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── CategoryPolicyRequest.java
    │   │           │   │   │   └── CategoryPolicyResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── CategoryPolicy.java
    │   │           │   │   └── repository/
    │   │           │   │       └── CategoryPolicyRepository.java
    │   │           │   ├── profile/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── FulfillmentProfileController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── FulfillmentProfileService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── FulfillmentProfileRequest.java
    │   │           │   │   │   └── FulfillmentProfileResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── FulfillmentProfile.java  # pilot: PARCEL, ONSITE (BR-N36)
    │   │           │   │   └── repository/
    │   │           │   │       └── FulfillmentProfileRepository.java
    │   │           │   ├── enablement/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── CategoryEnablementController.java
    │   │           │   │   └── service/
    │   │           │   │       └── CategoryEnablementService.java
    │   │           │   └── api/
    │   │           │       └── TaxonomyApi.java
    │   │           ├── asset/
    │   │           │   ├── item/
    │   │           │   │   ├── service/
    │   │           │   │   │   └── ItemService.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── Item.java
    │   │           │   │   │   ├── ItemIdentifier.java
    │   │           │   │   │   └── OwnershipEvent.java  # chuyển từ consignment/authority
    │   │           │   │   └── repository/
    │   │           │   │       ├── ItemRepository.java
    │   │           │   │       ├── ItemIdentifierRepository.java
    │   │           │   │       └── OwnershipEventRepository.java
    │   │           │   ├── commitment/
    │   │           │   │   ├── service/
    │   │           │   │   │   └── ItemCommitmentService.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── ItemCommitment.java
    │   │           │   │   └── repository/
    │   │           │   │       └── ItemCommitmentRepository.java
    │   │           │   ├── hold/
    │   │           │   │   ├── service/
    │   │           │   │   │   └── ItemHoldService.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── ItemHold.java  # scope: SALE, HANDOVER, PAYOUT, LEGAL
    │   │           │   │   └── repository/
    │   │           │   │       └── ItemHoldRepository.java
    │   │           │   ├── detail/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── AssetDetailController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── AssetDetailService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── AssetDetailRequest.java
    │   │           │   │   │   └── AssetDetailResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── AssetDetailRevision.java
    │   │           │   │   │   ├── MovableDetail.java
    │   │           │   │   │   ├── RealEstateDetail.java  # ngoài pilot
    │   │           │   │   │   ├── VehicleDetail.java  # ngoài pilot
    │   │           │   │   │   ├── EventOffering.java  # ngoài pilot
    │   │           │   │   │   ├── ServiceOffering.java  # ngoài pilot
    │   │           │   │   │   ├── DigitalRightDetail.java  # ngoài pilot
    │   │           │   │   │   └── AssetRightHolder.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── AssetDetailRevisionRepository.java
    │   │           │   │       ├── MovableDetailRepository.java
    │   │           │   │       └── RealEstateDetailRepository.java
    │   │           │   ├── lot/  # ngoài pilot (BR-C71): pilot coi một bộ hàng là một món
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── SaleLotController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── SaleLotService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── SaleLotRequest.java
    │   │           │   │   │   └── SaleLotResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── SaleLotComponent.java  # ngoài pilot
    │   │           │   │   └── repository/
    │   │           │   │       └── SaleLotComponentRepository.java
    │   │           │   ├── capacity/  # ngoài pilot; bảng ở nexus_giai_doan_2.sql
    │   │           │   │   ├── service/
    │   │           │   │   │   └── CapacityService.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── CapacityPool.java  # ngoài pilot
    │   │           │   │   │   ├── CapacityReservation.java  # ngoài pilot
    │   │           │   │   │   ├── ComponentAllocation.java  # ngoài pilot (BR-C71)
    │   │           │   │   │   └── LotCapacityRequirement.java  # ngoài pilot, chuyển từ asset/lot
    │   │           │   │   ├── repository/
    │   │           │   │   │   ├── CapacityPoolRepository.java
    │   │           │   │   │   ├── CapacityReservationRepository.java
    │   │           │   │   │   ├── ComponentAllocationRepository.java
    │   │           │   │   │   └── LotCapacityRequirementRepository.java
    │   │           │   │   └── job/
    │   │           │   │       └── CapacityJob.java  # ngoài pilot
    │   │           │   ├── api/
    │   │           │   │   └── AssetApi.java
    │   │           │   └── event/
    │   │           │       └── AssetEvents.java
    │   │           ├── consignment/
    │   │           │   ├── request/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── ConsignmentRequestController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── ConsignmentRequestService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── ConsignmentRequestRequest.java
    │   │           │   │   │   └── ConsignmentRequestResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── ConsignmentRequest.java
    │   │           │   │   │   ├── RequestItem.java
    │   │           │   │   │   └── RequestDocument.java
    │   │           │   │   ├── repository/
    │   │           │   │   │   ├── ConsignmentRequestRepository.java
    │   │           │   │   │   ├── RequestItemRepository.java
    │   │           │   │   │   └── RequestDocumentRepository.java
    │   │           │   │   └── job/
    │   │           │   │       └── ConsignmentDeadlineJob.java  # BR-N05 hạn bổ sung 10 ngày; BR-N06 đóng hồ sơ bị từ chối sau 3 ngày
    │   │           │   ├── authority/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── AuthorityReviewController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── AuthorityReviewService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── AuthorityReviewRequest.java
    │   │           │   │   │   └── AuthorityReviewResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── AuthorityReview.java
    │   │           │   │   └── repository/
    │   │           │   │       └── AuthorityReviewRepository.java
    │   │           │   ├── agreement/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── AgreementController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── AgreementService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── AgreementRequest.java
    │   │           │   │   │   └── AgreementResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── Agreement.java
    │   │           │   │   │   ├── AgreementVersion.java
    │   │           │   │   │   └── AgreementItem.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── AgreementRepository.java
    │   │           │   │       ├── AgreementVersionRepository.java
    │   │           │   │       └── AgreementItemRepository.java
    │   │           │   ├── withdrawal/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── WithdrawalController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── WithdrawalService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── CreateWithdrawalRequest.java  # đổi tên: trùng tên entity WithdrawalRequest
    │   │           │   │   │   └── WithdrawalResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── WithdrawalRequest.java
    │   │           │   │   └── repository/
    │   │           │   │       └── WithdrawalRequestRepository.java
    │   │           │   ├── charge/  # phí thu của chủ hàng khi không bán được (BR-C06, N07, N08)
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── ConsignorChargeController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── ConsignorChargeService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   └── ConsignorChargeResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── ConsignorCharge.java
    │   │           │   │   └── repository/
    │   │           │   │       └── ConsignorChargeRepository.java
    │   │           │   ├── api/
    │   │           │   │   └── ConsignmentApi.java
    │   │           │   ├── listener/
    │   │           │   │   └── CarrierStatusListener.java  # cập nhật intake_carrier_* và return_carrier_*
    │   │           │   └── event/
    │   │           │       └── ConsignmentEvents.java
    │   │           ├── inspectioncustody/
    │   │           │   ├── custody/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── CustodyController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── CustodyService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── CustodyRequest.java
    │   │           │   │   │   └── CustodyResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── Location.java
    │   │           │   │   │   └── CustodyEvent.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── LocationRepository.java
    │   │           │   │       └── CustodyEventRepository.java
    │   │           │   ├── inspection/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── InspectionController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── InspectionService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── InspectionRequest.java
    │   │           │   │   │   └── InspectionResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── InspectionCase.java
    │   │           │   │   │   └── InspectionReport.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── InspectionCaseRepository.java
    │   │           │   │       └── InspectionReportRepository.java
    │   │           │   ├── verification/  # A074, A075, A080, A082, A086 ngoài pilot; bảng verification_reviews vẫn dùng
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── VerificationController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── VerificationService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── VerificationRequest.java
    │   │           │   │   │   └── VerificationResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── VerificationReview.java
    │   │           │   │   └── repository/
    │   │           │   │       └── VerificationReviewRepository.java
    │   │           │   ├── api/
    │   │           │   │   └── InspectioncustodyApi.java
    │   │           │   └── event/
    │   │           │       └── InspectioncustodyEvents.java
    │   │           ├── catalog/
    │   │           │   ├── listing/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── ListingController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── ListingService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── ListingRequest.java
    │   │           │   │   │   └── ListingResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── Listing.java
    │   │           │   │   │   ├── ListingRevision.java
    │   │           │   │   │   └── ListingVerification.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── ListingRepository.java
    │   │           │   │       ├── ListingRevisionRepository.java
    │   │           │   │       └── ListingVerificationRepository.java
    │   │           │   ├── search/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── ListingSearchController.java
    │   │           │   │   └── service/
    │   │           │   │       └── ListingSearchService.java
    │   │           │   ├── watchlist/  # BR-N33
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── WatchlistController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── WatchlistService.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── WatchlistItem.java
    │   │           │   │   └── repository/
    │   │           │   │       └── WatchlistItemRepository.java
    │   │           │   ├── api/
    │   │           │   │   └── CatalogApi.java
    │   │           │   └── event/
    │   │           │       └── CatalogEvents.java
    │   │           ├── commerce/
    │   │           │   ├── cart/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── CartController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── CartService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── CartRequest.java
    │   │           │   │   │   └── CartResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── Cart.java
    │   │           │   │   │   └── CartItem.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── CartRepository.java
    │   │           │   │       └── CartItemRepository.java
    │   │           │   ├── checkout/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── CheckoutController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── CheckoutService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── CheckoutRequest.java
    │   │           │   │   │   └── CheckoutResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── Checkout.java
    │   │           │   │   ├── repository/
    │   │           │   │   │   └── CheckoutRepository.java
    │   │           │   │   └── job/
    │   │           │   │       └── CheckoutJob.java  # BR-N12: nhả hàng sau 15 phút
    │   │           │   ├── order/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── OrderController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── OrderService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── OrderRequest.java
    │   │           │   │   │   └── OrderResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── Order.java
    │   │           │   │   │   ├── OrderLine.java
    │   │           │   │   │   └── OrderCharge.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── OrderRepository.java
    │   │           │   │       ├── OrderLineRepository.java
    │   │           │   │       └── OrderChargeRepository.java
    │   │           │   ├── overdue/
    │   │           │   │   ├── service/
    │   │           │   │   │   └── OverduePaymentService.java
    │   │           │   │   └── job/
    │   │           │   │       └── OverduePaymentJob.java  # BR-N21, N22: hủy quá hạn, gia hạn tối đa 24 giờ khi đang đối soát
    │   │           │   ├── api/
    │   │           │   │   └── CommerceApi.java
    │   │           │   └── event/
    │   │           │       └── CommerceEvents.java
    │   │           ├── auction/
    │   │           │   ├── rule/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── AuctionRuleController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── AuctionRuleService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── AuctionRuleRequest.java
    │   │           │   │   │   └── AuctionRuleResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── AuctionRuleVersion.java
    │   │           │   │   └── repository/
    │   │           │   │       └── AuctionRuleVersionRepository.java
    │   │           │   ├── schedule/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── AuctionScheduleController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── AuctionScheduleService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── AuctionScheduleRequest.java
    │   │           │   │   │   └── AuctionScheduleResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── Auction.java
    │   │           │   │   ├── repository/
    │   │           │   │   │   └── AuctionRepository.java
    │   │           │   │   └── job/
    │   │           │   │       └── AuctionScheduleJob.java
    │   │           │   ├── participation/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── ParticipationController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── ParticipationService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── ParticipationRequest.java
    │   │           │   │   │   └── ParticipationResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── AuctionParticipant.java
    │   │           │   │   │   └── BiddingRestriction.java  # BR-N20
    │   │           │   │   └── repository/
    │   │           │   │       ├── AuctionParticipantRepository.java
    │   │           │   │       └── BiddingRestrictionRepository.java
    │   │           │   ├── bidding/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── BiddingController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── BiddingService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── BiddingRequest.java
    │   │           │   │   │   └── BiddingResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── Bid.java
    │   │           │   │   │   └── BidInvalidation.java  # BR-N18
    │   │           │   │   ├── repository/
    │   │           │   │   │   ├── BidRepository.java
    │   │           │   │   │   └── BidInvalidationRepository.java
    │   │           │   │   └── realtime/
    │   │           │   │       └── BiddingGateway.java  # STOMP /topic/auctions/{id}; chỉ đẩy sau khi ghi DB
    │   │           │   ├── result/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── AuctionResultController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── AuctionResultService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── AuctionResultRequest.java
    │   │           │   │   │   └── AuctionResultResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── AuctionResult.java
    │   │           │   │   ├── repository/
    │   │           │   │   │   └── AuctionResultRepository.java
    │   │           │   │   └── job/
    │   │           │   │       └── AuctionCloseJob.java  # BR-N16: chờ 3 phút, đếm 3 × 5 giây, đóng đúng giờ
    │   │           │   ├── incident/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── AuctionIncidentController.java
    │   │           │   │   └── service/
    │   │           │   │       └── AuctionIncidentService.java
    │   │           │   ├── api/
    │   │           │   │   └── AuctionApi.java
    │   │           │   └── event/
    │   │           │       └── AuctionEvents.java
    │   │           ├── fulfillment/
    │   │           │   ├── plan/  # A089 hàng cồng kềnh ngoài pilot; pilot chỉ PARCEL, ONSITE
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── FulfillmentPlanController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── FulfillmentPlanService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── FulfillmentPlanRequest.java
    │   │           │   │   │   └── FulfillmentPlanResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── FulfillmentCase.java
    │   │           │   │   │   ├── FulfillmentMilestone.java  # giai đoạn 2: mốc giao ở cột carrier_* của FulfillmentCase
    │   │           │   │   │   └── FulfillmentEvidence.java  # giai đoạn 2: mốc giao ở cột carrier_* của FulfillmentCase
    │   │           │   │   └── repository/
    │   │           │   │       ├── FulfillmentCaseRepository.java
    │   │           │   │       ├── FulfillmentMilestoneRepository.java
    │   │           │   │       └── FulfillmentEvidenceRepository.java
    │   │           │   ├── delivery/  # giao hàng qua API hãng, thay inspectioncustody/shipment
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── DeliveryController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── DeliveryService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── CarrierOrderRequest.java
    │   │           │   │   │   └── DeliveryResponse.java
    │   │           │   │   ├── listener/
    │   │           │   │   │   └── CarrierStatusListener.java  # A059: cập nhật fulfillment_cases.carrier_*
    │   │           │   │   └── job/
    │   │           │   │       └── CarrierNoUpdateAlertJob.java  # BR-N25: quá 3 ngày chưa giao thì cảnh báo
    │   │           │   ├── handover/  # pilot: nhận tại kho, giao tại chỗ; A079 ngoài pilot
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── HandoverController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── HandoverService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── HandoverRequest.java
    │   │           │   │   │   └── HandoverResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── HandoverAppointment.java
    │   │           │   │   │   └── HandoverRecord.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── HandoverAppointmentRepository.java
    │   │           │   │       └── HandoverRecordRepository.java
    │   │           │   ├── transfer/  # ngoài pilot
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── TransferCaseController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── TransferCaseService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── TransferCaseRequest.java
    │   │           │   │   │   └── TransferCaseResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── TransferCase.java
    │   │           │   │   └── repository/
    │   │           │   │       └── TransferCaseRepository.java
    │   │           │   ├── entitlement/  # ngoài pilot
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── EntitlementController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── EntitlementService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── EntitlementRequest.java
    │   │           │   │   │   └── EntitlementResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── Entitlement.java
    │   │           │   │   │   └── EntitlementEvent.java
    │   │           │   │   ├── repository/
    │   │           │   │   │   ├── EntitlementRepository.java
    │   │           │   │   │   └── EntitlementEventRepository.java
    │   │           │   │   └── job/
    │   │           │   │       └── EntitlementJob.java
    │   │           │   ├── servicebooking/  # ngoài pilot; đổi tên từ service/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── ServiceBookingController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── ServiceBookingService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── ServiceBookingRequest.java
    │   │           │   │   │   └── ServiceBookingResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── ServiceBooking.java
    │   │           │   │   │   └── ServiceAcceptance.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── ServiceBookingRepository.java
    │   │           │   │       └── ServiceAcceptanceRepository.java
    │   │           │   ├── completion/
    │   │           │   │   ├── service/
    │   │           │   │   │   └── CompletionService.java
    │   │           │   │   └── job/
    │   │           │   │       └── ComplaintWindowJob.java  # BR-N26: hết 7 ngày không có vụ việc thì hoàn tất
    │   │           │   ├── api/
    │   │           │   │   └── FulfillmentApi.java
    │   │           │   └── event/
    │   │           │       └── FulfillmentEvents.java
    │   │           ├── finance/
    │   │           │   ├── payment/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── PaymentController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── PaymentService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── PaymentRequest.java
    │   │           │   │   │   └── PaymentResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── PaymentAttempt.java
    │   │           │   │   │   └── ProviderEvent.java
    │   │           │   │   ├── repository/
    │   │           │   │   │   ├── PaymentAttemptRepository.java
    │   │           │   │   │   └── ProviderEventRepository.java
    │   │           │   │   └── webhook/
    │   │           │   │       └── PaymentWebhookController.java
    │   │           │   ├── ledger/
    │   │           │   │   ├── service/
    │   │           │   │   │   └── LedgerService.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── LedgerAccount.java
    │   │           │   │   │   ├── LedgerTransaction.java
    │   │           │   │   │   └── LedgerEntry.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── LedgerAccountRepository.java
    │   │           │   │       ├── LedgerTransactionRepository.java
    │   │           │   │       └── LedgerEntryRepository.java
    │   │           │   ├── obligation/  # ngoài pilot (BR-N27: không trả theo đợt)
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── PaymentObligationController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── PaymentObligationService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── PaymentObligationRequest.java
    │   │           │   │   │   └── PaymentObligationResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── PaymentObligation.java
    │   │           │   │   │   └── ObligationPaymentAllocation.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── PaymentObligationRepository.java
    │   │           │   │       └── ObligationPaymentAllocationRepository.java
    │   │           │   ├── refund/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── RefundController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── RefundService.java  # Finance Maker lập, Finance Checker duyệt (BR-N28)
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── RefundRequest.java
    │   │           │   │   │   └── RefundResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── Refund.java
    │   │           │   │   └── repository/
    │   │           │   │       └── RefundRepository.java
    │   │           │   ├── settlement/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── SettlementController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── SettlementService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── SettlementRequest.java
    │   │           │   │   │   └── SettlementResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── Settlement.java
    │   │           │   │   │   └── SettlementLine.java
    │   │           │   │   └── repository/
    │   │           │   │       ├── SettlementRepository.java
    │   │           │   │       └── SettlementLineRepository.java
    │   │           │   ├── payout/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── PayoutController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── PayoutService.java  # Finance Maker lập, Finance Checker duyệt (BR-N28)
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── PayoutRequest.java
    │   │           │   │   │   └── PayoutResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── Payout.java
    │   │           │   │   └── repository/
    │   │           │   │       └── PayoutRepository.java
    │   │           │   ├── reconciliation/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── ReconciliationController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── ReconciliationService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── ReconciliationRequest.java
    │   │           │   │   │   └── ReconciliationResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── ReconciliationItem.java
    │   │           │   │   └── repository/
    │   │           │   │       └── ReconciliationItemRepository.java
    │   │           │   ├── recovery/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── RecoveryController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── RecoveryService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── RecoveryRequest.java
    │   │           │   │   │   └── RecoveryResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── RecoveryClaim.java
    │   │           │   │   └── repository/
    │   │           │   │       └── RecoveryClaimRepository.java
    │   │           │   ├── taxdocument/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── TaxDocumentController.java
    │   │           │   │   └── service/
    │   │           │   │       └── TaxDocumentService.java
    │   │           │   ├── api/
    │   │           │   │   └── FinanceApi.java
    │   │           │   └── event/
    │   │           │       └── FinanceEvents.java
    │   │           ├── dispute/
    │   │           │   ├── casemgmt/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── DisputeCaseController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── DisputeCaseService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── DisputeCaseRequest.java
    │   │           │   │   │   └── DisputeCaseResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   ├── DisputeCase.java  # 7 loại vụ việc (BR-N29)
    │   │           │   │   │   └── CaseEvidence.java
    │   │           │   │   ├── repository/
    │   │           │   │   │   ├── DisputeCaseRepository.java
    │   │           │   │   │   └── CaseEvidenceRepository.java
    │   │           │   │   └── job/
    │   │           │   │       └── CaseSlaJob.java  # BR-N10: cảnh báo vụ việc quá hạn
    │   │           │   ├── decision/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── CaseDecisionController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── CaseDecisionService.java  # Trưởng ca duyệt, khác người đề xuất (BR-N28)
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── CaseDecisionRequest.java
    │   │           │   │   │   └── CaseDecisionResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── CaseDecision.java
    │   │           │   │   └── repository/
    │   │           │   │       └── CaseDecisionRepository.java
    │   │           │   ├── returns/  # đổi tên: return là từ khóa Java
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── ReturnAuthorizationController.java
    │   │           │   │   ├── service/
    │   │           │   │   │   └── ReturnAuthorizationService.java
    │   │           │   │   ├── dto/
    │   │           │   │   │   ├── ReturnAuthorizationRequest.java
    │   │           │   │   │   └── ReturnAuthorizationResponse.java
    │   │           │   │   ├── entity/
    │   │           │   │   │   └── ReturnAuthorization.java
    │   │           │   │   ├── repository/
    │   │           │   │   │   └── ReturnAuthorizationRepository.java
    │   │           │   │   └── listener/
    │   │           │   │       └── ReturnCarrierListener.java  # cập nhật return_carrier_*
    │   │           │   ├── remediation/  # ngoài pilot
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── RemediationController.java
    │   │           │   │   └── service/
    │   │           │   │       └── RemediationService.java
    │   │           │   ├── api/
    │   │           │   │   └── DisputeApi.java
    │   │           │   └── event/
    │   │           │       └── DisputeEvents.java
    │   │           ├── reporting/
    │   │           │   ├── consignorview/
    │   │           │   │   ├── controller/
    │   │           │   │   │   └── ConsignorViewController.java
    │   │           │   │   └── service/
    │   │           │   │       └── ConsignorViewService.java
    │   │           │   └── ops/
    │   │           │       ├── controller/
    │   │           │       │   └── OpsReportController.java
    │   │           │       └── service/
    │   │           │           └── OpsReportService.java
    │   │           └── config/
    │   │               ├── JpaConfig.java
    │   │               ├── SchedulingConfig.java  # bật @Scheduled cho các job
    │   │               ├── RedisConfig.java  # tùy chọn: chỉ khi chạy nhiều instance
    │   │               └── WebSocketConfig.java  # STOMP, endpoint /ws
    │   └── resources/
    │       ├── application.yml  # jpa.hibernate.ddl-auto: validate; flyway.enabled: true
    │       └── db/
    │           └── migration/
    │               ├── V1__schema_v4.sql  # nguyên văn nexus_schema_v4.sql
    │               └── V2__seed_v4.sql  # nguyên văn nexus_seed_v4.sql
    └── test/
        └── java/
            └── com/
                └── nexus/
                    ├── asset/
                    │   └── CommitmentConcurrencyTest.java
                    ├── auction/
                    │   ├── BidConcurrencyTest.java
                    │   └── AuctionCloseJobTest.java
                    ├── finance/
                    │   └── LedgerInvariantTest.java
                    ├── platform/
                    │   └── CarrierWebhookIdempotencyTest.java
                    └── architecture/
                        ├── ModuleDependencyTest.java
                        └── SchemaValidationTest.java  # Testcontainers PostgreSQL + Flyway V1, V2 + Hibernate validate
```

Quy tắc: module khác chỉ gọi `<module>.api` và lắng nghe `<module>.event`; không import `entity`, `repository` của module khác (kiểm bằng `ModuleDependencyTest`, ví dụ ArchUnit, TBD).

Thư mục mới so với bản trước: `client/` (gọi hệ thống ngoài), `listener/` (nhận event của module khác hoặc của `platform/carrier`), `job/` (chạy định kỳ, xem mục H). Khóa ngoại sang bảng của module khác map thành cột `UUID` (ví dụ `ItemHold.caseId` trỏ `dispute_cases`), không dùng `@ManyToOne` chéo module. Feature ghi `# ngoài pilot` giữ trong cây để thấy ranh giới, nhưng Sprint pilot không viết code và không map entity cho chúng.

## D. FRONTEND DIRECTORY TREE

**React + TypeScript, build bằng Vite, chạy công cụ trên Node.js** (bản LTS, ghi trong `.nvmrc`); pnpm workspace là đề xuất. Node.js chỉ dùng cho cài gói, dev server và build; khi chạy thật FE là file tĩnh phục vụ bằng Nginx, mọi API gọi thẳng Spring Boot. Hai app tách bundle vì khác đối tượng và mức bảo mật (nhân viên cần MFA theo Mục 10.5). Feature không import chéo nhau; dùng chung qua `packages/`. Chú thích `#` ghi mã màn trên canvas "Nexus – UI" mà feature đó hiện thực.

```
frontend/
├── .nvmrc  # phiên bản Node.js LTS cả nhóm dùng
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── apps/
│   ├── customer-portal/
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── App.tsx
│   │   │   │   ├── routes.tsx
│   │   │   │   ├── RouteGuard.tsx
│   │   │   │   └── providers.tsx
│   │   │   ├── features/
│   │   │   │   ├── auth/  # Đăng nhập, Đăng ký (Người 1); khóa đăng nhập BR-N03
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── AuthPage.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── AuthPanel.tsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── authApi.ts
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── authSchema.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── kyc/  # Xác minh danh tính + CCCD (Người 1); BR-N01
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── KycPage.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── CitizenIdCapture.tsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── kycApi.ts
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── kycSchema.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── catalog/  # Trang chủ, Catalog (Người 1); M1 Chi tiết mua ngay
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── CatalogPage.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── CatalogPanel.tsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── catalogApi.ts
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useCatalog.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── watchlist/  # C4c; BR-N33
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── WatchlistPage.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── WatchButton.tsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── watchlistApi.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── account/  # C4a Hồ sơ, tài khoản nhận tiền
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── AccountPage.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── AccountPanel.tsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── accountApi.ts
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── accountSchema.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── consignment/  # C5-1…C5-5, C4e, C4f, C4g, C4h
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── ConsignmentPage.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── ConsignmentPanel.tsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── consignmentApi.ts
│   │   │   │   │   ├── schemas/
│   │   │   │   │   │   └── consignmentSchema.ts
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useConsignment.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── checkout/  # M2 Giỏ hàng, M3 Checkout giữ hàng 15 phút
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── CheckoutPage.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── CheckoutPanel.tsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── checkoutApi.ts
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useCheckout.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── orders/  # C3b, C4d: theo dõi vận đơn, xác nhận nhận hàng, khiếu nại 7 ngày
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── OrdersPage.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── OrdersPanel.tsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── ordersApi.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── payments/  # C3a Thanh toán
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── PaymentsPage.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── PaymentsPanel.tsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── paymentsApi.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── auctions/  # C1, C2, P1–P4, C4b Lịch sử đặt giá
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── AuctionsPage.tsx
│   │   │   │   │   │   └── MyBidsPage.tsx  # C4b
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── AuctionsPanel.tsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── auctionsApi.ts
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useAuctions.ts
│   │   │   │   │   ├── realtime/
│   │   │   │   │   │   └── useLiveAuction.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── notifications/  # C4i hộp thư và cài đặt kênh; BR-N32
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── NotificationsPage.tsx
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── PreferenceMatrix.tsx
│   │   │   │   │   ├── api/
│   │   │   │   │   │   └── notificationsApi.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── privacy/  # C4j yêu cầu dữ liệu cá nhân; BR-N34
│   │   │   │       ├── pages/
│   │   │   │       │   └── DataRequestPage.tsx
│   │   │   │       ├── components/
│   │   │   │       │   └── DataRequestForm.tsx
│   │   │   │       ├── api/
│   │   │   │       │   └── privacyApi.ts
│   │   │   │       ├── schemas/
│   │   │   │       │   └── dataRequestSchema.ts
│   │   │   │       └── index.ts
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── .env.example  # VITE_API_BASE_URL
│   │   └── vite.config.ts  # dev: proxy /api và /ws sang Spring Boot :8080
│   └── operations-portal/
│       ├── package.json
│       ├── src/
│       │   ├── app/
│       │   │   ├── App.tsx
│       │   │   ├── routes.tsx
│       │   │   ├── RouteGuard.tsx
│       │   │   └── providers.tsx
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   │   ├── pages/
│       │   │   │   │   └── AuthPage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── AuthPanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── authApi.ts
│       │   │   │   └── index.ts
│       │   │   ├── iam-admin/  # A2a Khách hàng, A2b Nhân viên & phân quyền, A2c Duyệt KYC cần xét tay
│       │   │   │   ├── pages/
│       │   │   │   │   ├── IamAdminPage.tsx
│       │   │   │   │   └── KycReviewPage.tsx  # A2c: hàng chờ CCCD cần xét tay, chi tiết và quyết định
│       │   │   │   ├── components/
│       │   │   │   │   └── IamAdminPanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── iamadminApi.ts
│       │   │   │   └── index.ts
│       │   │   ├── intake/  # A3a, A3b
│       │   │   │   ├── pages/
│       │   │   │   │   └── IntakePage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── IntakePanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── intakeApi.ts
│       │   │   │   ├── schemas/
│       │   │   │   │   └── intakeSchema.ts
│       │   │   │   └── index.ts
│       │   │   ├── warehouse/  # chưa có màn trên canvas: nhận hàng, vị trí, tạo vận đơn qua hãng
│       │   │   │   ├── pages/
│       │   │   │   │   └── WarehousePage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── WarehousePanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── warehouseApi.ts
│       │   │   │   ├── schemas/
│       │   │   │   │   └── warehouseSchema.ts
│       │   │   │   └── index.ts
│       │   │   ├── inspection/  # chưa có màn trên canvas
│       │   │   │   ├── pages/
│       │   │   │   │   └── InspectionPage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── InspectionPanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── inspectionApi.ts
│       │   │   │   ├── schemas/
│       │   │   │   │   └── inspectionSchema.ts
│       │   │   │   └── index.ts
│       │   │   ├── verification/  # ngoài pilot
│       │   │   │   ├── pages/
│       │   │   │   │   └── VerificationPage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── VerificationPanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── verificationApi.ts
│       │   │   │   ├── schemas/
│       │   │   │   │   └── verificationSchema.ts
│       │   │   │   └── index.ts
│       │   │   ├── listing/  # A4a Soạn, A4b Duyệt & công bố
│       │   │   │   ├── pages/
│       │   │   │   │   └── ListingPage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── ListingPanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── listingApi.ts
│       │   │   │   ├── schemas/
│       │   │   │   │   └── listingSchema.ts
│       │   │   │   └── index.ts
│       │   │   ├── taxonomy/  # chưa có màn trên canvas
│       │   │   │   ├── pages/
│       │   │   │   │   └── TaxonomyPage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── TaxonomyPanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── taxonomyApi.ts
│       │   │   │   ├── schemas/
│       │   │   │   │   └── taxonomySchema.ts
│       │   │   │   └── index.ts
│       │   │   ├── auction-ops/  # A4c Quản lý phiên
│       │   │   │   ├── pages/
│       │   │   │   │   └── AuctionOpsPage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── AuctionOpsPanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── auctionopsApi.ts
│       │   │   │   ├── hooks/
│       │   │   │   │   └── useAuctionOps.ts
│       │   │   │   └── index.ts
│       │   │   ├── orders/  # A5a Giao dịch
│       │   │   │   ├── pages/
│       │   │   │   │   └── OrdersPage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── OrdersPanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── ordersApi.ts
│       │   │   │   └── index.ts
│       │   │   ├── finance/  # A5a tab Chi tiền chủ hàng, hoàn tiền; Maker/Checker BR-N28
│       │   │   │   ├── pages/
│       │   │   │   │   └── FinancePage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── FinancePanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── financeApi.ts
│       │   │   │   ├── schemas/
│       │   │   │   │   └── financeSchema.ts
│       │   │   │   └── index.ts
│       │   │   ├── handover/  # pilot: nhận tại kho; phần đất, xe, vé, dịch vụ ngoài pilot
│       │   │   │   ├── pages/
│       │   │   │   │   └── HandoverPage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── HandoverPanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── handoverApi.ts
│       │   │   │   ├── schemas/
│       │   │   │   │   └── handoverSchema.ts
│       │   │   │   └── index.ts
│       │   │   ├── disputes/  # A5b Vụ việc & hoàn tiền
│       │   │   │   ├── pages/
│       │   │   │   │   └── DisputesPage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── DisputesPanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── disputesApi.ts
│       │   │   │   └── index.ts
│       │   │   ├── governance/  # tham số, yêu cầu dữ liệu phía nhân viên
│       │   │   │   ├── pages/
│       │   │   │   │   └── GovernancePage.tsx
│       │   │   │   ├── components/
│       │   │   │   │   └── GovernancePanel.tsx
│       │   │   │   ├── api/
│       │   │   │   │   └── governanceApi.ts
│       │   │   │   └── index.ts
│       │   │   └── reporting/  # A1 Bảng điều khiển
│       │   │       ├── pages/
│       │   │       │   └── ReportingPage.tsx
│       │   │       ├── components/
│       │   │       │   └── ReportingPanel.tsx
│       │   │       ├── api/
│       │   │       │   └── reportingApi.ts
│       │   │       └── index.ts
│       │   └── main.tsx
│       ├── index.html
│       ├── .env.example  # VITE_API_BASE_URL
│       └── vite.config.ts  # dev: proxy /api và /ws sang Spring Boot :8080
└── packages/
    ├── ui/
    │   ├── package.json
    │   ├── Button.tsx
    │   ├── DataTable.tsx
    │   ├── MoneyText.tsx
    │   ├── Countdown.tsx  # đếm giờ giữ hàng 15 phút, nhịp đóng phiên
    │   ├── StatusBadge.tsx
    │   └── FileUpload.tsx
    ├── api-client/
    │   ├── package.json
    │   ├── httpClient.ts
    │   ├── idempotency.ts
    │   └── errorMapper.ts
    ├── auth/
    │   ├── package.json
    │   ├── sessionStore.ts
    │   ├── permissions.ts
    │   └── MfaPrompt.tsx
    ├── realtime/
    │   ├── package.json
    │   └── wsClient.ts  # STOMP client
    └── utils/
        ├── package.json
        ├── formatVnd.ts
        └── formatDate.ts
```

## E. FEATURE RESPONSIBILITY MATRIX

Cột BE liệt kê bảng được ghi/đọc trong feature (lấy từ cột "Dữ liệu" của tài liệu, bổ sung theo DB v4), kèm tương tác liên module nếu có. API lấy từ Mục 10.3; TBD = tài liệu chưa nêu endpoint. Cột Pilot: Có / Một phần / Ngoài pilot theo BR-N36.

| Feature (BE)                     | Pilot       | Use case (actions)                                                                                                                                                                                                                                                              | FE phụ trách                                        | BE phụ trách                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | API (Mục 10.3)                                                                                 | Dùng chung                                       | Phụ thuộc feature/module khác                                                                                                       |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `catalog/search`                 | Có          | A001 Tìm và xem sản phẩm                                                                                                                                                                                                                                                        | customer/catalog                                    | Ghi/đọc: listing_revisions, listings                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, inspectioncustody                                                            |
| `iam/account`                    | Có          | A002 Đăng ký và xác minh liên hệ; A004 Cập nhật hồ sơ và địa chỉ                                                                                                                                                                                                                | customer/account, customer/auth                     | Ghi/đọc: addresses, identity_checks, parties, users<br>**Liên module:** A002: ghi chấp thuận điều khoản qua port `AcknowledgmentPort` (platform) do governance hiện thực                                                                                                                                                                                                                                                                                                                                           | TBD                                                                                            | platform (idempotency, audit, security)          | Module: — (chỉ platform)                                                                                                            |
| `iam/auth`                       | Có          | A003 Đăng nhập, MFA và thu hồi phiên                                                                                                                                                                                                                                            | customer/auth, ops/auth                             | Ghi/đọc: security_credentials, user_sessions, users (failed_login_count, locked_until – BR-N03)<br>**Liên module:** A003: ghi audit qua port `AuditTrail` (platform) do governance hiện thực                                                                                                                                                                                                                                                                                                                       | TBD                                                                                            | platform (idempotency, audit, security)          | Module: — (chỉ platform)                                                                                                            |
| `iam/identity`                   | Có          | A005 Gửi danh tính và tài khoản nhận tiền                                                                                                                                                                                                                                       | customer/kyc, customer/account, ops/iam-admin (A2c) | Ghi/đọc: bank_accounts, identity_checks (CHECK 5 trạng thái), citizen_id_verifications; đọc view v_party_kyc_status<br>**Liên module:** xác thực CCCD gọi nhà cung cấp eKYC qua `identity/client`; số CCCD chỉ lưu HMAC + bản mã hóa (`platform/security`); chấp thuận xử lý dữ liệu qua `AcknowledgmentPort`; lần xác thực NEEDS_REVIEW do Tiếp nhận duyệt tay ở A2c (`KycReviewController`)                                                                                                                      | `POST /citizen-id-verifications/{id}/reviews` (A2c); API phía khách TBD theo nhà cung cấp eKYC | platform (idempotency, audit, security)          | Module: — (chỉ platform)                                                                                                            |
| `iam/staffaccess`                | Có          | A006 Cấp và thu hồi quyền nhân viên                                                                                                                                                                                                                                             | ops/iam-admin                                       | Ghi/đọc: roles (15 vai trò seed v4, có SHIFT_LEAD, FINANCE_MAKER, FINANCE_CHECKER), user_roles, users<br>**Liên module:** A006: ghi audit qua port `AuditTrail`                                                                                                                                                                                                                                                                                                                                                    | TBD                                                                                            | platform (idempotency, audit, security)          | Module: — (chỉ platform)                                                                                                            |
| `governance/datarequest`         | Có          | A007 Xử lý yêu cầu quyền dữ liệu                                                                                                                                                                                                                                                | customer/privacy, ops/governance                    | Ghi/đọc: data_requests (hạn phản hồi, hoàn tất, gia hạn – BR-N34), retention_rules<br>**Liên module:** A007: governance phát `LegalHoldRequested`; asset áp hold khi nhận sự kiện                                                                                                                                                                                                                                                                                                                                  | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam                                                                                                                         |
| `consignment/request`            | Có          | A008 Tạo hồ sơ ký gửi; A009 Tải giấy tờ và cam kết trách nhiệm; A010 Bổ sung và gửi chính thức; A015 Hẹn giao hoặc gửi tài sản vào kho                                                                                                                                          | customer/consignment, ops/warehouse                 | Ghi/đọc: authority_reviews, consignment_requests (+ intake_carrier_*), request_documents, request_items<br>**Liên module:** A015: chọn gửi qua hãng thì tạo vận đơn bằng `platform/carrier`, trạng thái về qua `CarrierStatusChanged`; chủ sở hữu khai báo ghi `ownership_events` qua `asset.api`; job hạn bổ sung (BR-N05, N06)                                                                                                                                                                                   | `POST /consignment-requests`<br>`POST /consignment-requests/{id}/submit`                       | platform (idempotency, audit, security, carrier) | Module: iam, governance, taxonomy, asset                                                                                            |
| `consignment/authority`          | Có          | A011 Xét hồ sơ từ xa theo route A; A012 Xét quyền ký gửi và quyền bán                                                                                                                                                                                                           | ops/intake                                          | Ghi/đọc: authority_reviews                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset                                                                                            |
| `consignment/agreement`          | Có          | A013 Đề xuất hợp đồng và bảng phí; A014 Chấp thuận hoặc thương lượng điều khoản                                                                                                                                                                                                 | customer/consignment, ops/intake                    | Ghi/đọc: agreement_items, agreement_versions, agreements                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `POST /agreements/{id}/versions/{v}/accept`                                                    | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset                                                                                            |
| `reporting/consignorview`        | Có          | A016 Theo dõi ký gửi và quyết toán                                                                                                                                                                                                                                              | customer/consignment                                | Ghi/đọc: —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, inspectioncustody, catalog, commerce, auction, finance, fulfillment, dispute |
| `consignment/withdrawal`         | Có          | A017 Yêu cầu rút hoặc gia hạn ký gửi; A018 Quyết định trả hàng hoặc đóng ký gửi                                                                                                                                                                                                 | customer/consignment, ops/intake                    | Ghi/đọc: agreement_versions, agreements, withdrawal_requests (+ return_carrier_*), consignor_charges<br>**Liên module:** A018: consignment phát `WithdrawalApproved`; kho (inspectioncustody) ghi xuất kho; vận đơn trả tạo qua `platform/carrier`; phí rút trước hạn theo BR-N08                                                                                                                                                                                                                                  | TBD                                                                                            | platform (idempotency, audit, security, carrier) | Module: iam, governance, taxonomy, asset                                                                                            |
| `inspectioncustody/custody`      | Có          | A019 Nhận và đối chiếu hàng ký gửi; A020 Đặt vị trí và niêm phong; A024 Cách ly hàng có bất thường; A025 Kiểm kê và xử lý chênh lệch                                                                                                                                            | ops/warehouse                                       | Ghi/đọc: custody_events, locations<br>**Liên module:** A024: phát `ItemQuarantined`; dispute mở case; asset ghi hold; A025: phát `StocktakeDiscrepancy`; dispute mở case                                                                                                                                                                                                                                                                                                                                           | `POST /items/{id}/receive`                                                                     | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment                                                                               |
| `inspectioncustody/inspection`   | Có          | A021 Phân công kiểm định; A022 Kiểm định và lập báo cáo; A023 Hoàn tất, sửa hoặc thu hồi báo cáo                                                                                                                                                                                | ops/inspection                                      | Ghi/đọc: inspection_cases, inspection_reports<br>**Liên module:** A023: inspectioncustody phát `InspectionReportRevoked`; catalog đình chỉ listing; A022: món Không đạt thì gọi `consignment.api` lập phí kiểm định và phí gửi trả (BR-N07)                                                                                                                                                                                                                                                                        | `POST /inspection-cases/{id}/reports`                                                          | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment                                                                               |
| `catalog/listing`                | Có          | A026 Soạn bài đăng Nexus; A027 Duyệt độc lập và công bố; A028 Sửa nội dung và đình chỉ bài                                                                                                                                                                                      | ops/listing                                         | Ghi/đọc: listing_revisions, listing_verifications, listings<br>**Liên module:** A028: đình chỉ bài phát `ListingSuspended`; commerce hủy checkout đang mở (BR-N13)                                                                                                                                                                                                                                                                                                                                                 | `POST /listing-revisions/{id}/publish`                                                         | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, inspectioncustody                                                            |
| `taxonomy/master`                | Có          | A029 Quản lý mẫu và nhóm hàng; A069 Tạo hoặc mở rộng danh mục                                                                                                                                                                                                                   | ops/taxonomy                                        | Ghi/đọc: categories, category_policies, product_models                                                                                                                                                                                                                                                                                                                                                                                                                                                             | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance                                                                                                             |
| `commerce/cart`                  | Có          | A030 Thêm giỏ và xem tổng dự kiến                                                                                                                                                                                                                                               | customer/checkout                                   | Ghi/đọc: cart_items, carts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, taxonomy, asset, consignment, catalog                                                                                  |
| `commerce/checkout`              | Có          | A031 Checkout và giữ hàng có hạn; A033 Hết hạn checkout                                                                                                                                                                                                                         | customer/checkout                                   | Ghi/đọc: checkouts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `POST /checkouts`                                                                              | platform (idempotency, audit, security)          | Module: iam, taxonomy, asset, consignment, catalog                                                                                  |
| `commerce/order`                 | Có          | A032 Xác nhận đơn mua ngay; A034 Xem đơn và yêu cầu hủy; A035 Can thiệp đơn theo căn cứ                                                                                                                                                                                         | customer/checkout, customer/orders, ops/orders      | Ghi/đọc: order_charges, order_lines, orders<br>**Liên module:** A034: commerce phát `OrderCancelRequested`; finance lập hoàn; trạng thái thanh toán đọc qua `PaymentStatusPort`; A035: dispute subscribe sự kiện can thiệp đơn                                                                                                                                                                                                                                                                                     | `POST /checkouts/{id}/orders`                                                                  | platform (idempotency, audit, security)          | Module: iam, taxonomy, asset, consignment, catalog                                                                                  |
| `auction/rule`                   | Có          | A036 Chốt quy chế và chủ thể tổ chức                                                                                                                                                                                                                                            | ops/auction-ops                                     | Ghi/đọc: auction_rule_versions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, catalog, commerce                                                            |
| `auction/schedule`               | Có          | A037 Lập lịch phiên và dành hàng; A039 Mở phiên theo giờ máy chủ                                                                                                                                                                                                                | ops/auction-ops                                     | Ghi/đọc: auctions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, catalog, commerce                                                            |
| `auction/participation`          | Có          | A038 Đăng ký tham gia và chấp thuận quy chế                                                                                                                                                                                                                                     | customer/auctions                                   | Ghi/đọc: auction_participants, bidding_restrictions<br>**Liên module:** kiểm KYC và MFA qua `iam.api` (BR-N01, N02, N17); nhận `WinnerPaymentOverdue` để lập hạn chế 30 ngày (BR-N20)                                                                                                                                                                                                                                                                                                                              | `POST /auctions/{id}/participants`                                                             | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, catalog, commerce                                                            |
| `auction/bidding`                | Có          | A040 Gửi lượt trả giá; A041 Theo dõi lịch sử và giá dẫn đầu                                                                                                                                                                                                                     | customer/auctions                                   | Ghi/đọc: auctions, bids, bid_invalidations (BR-N18)<br>**Realtime:** đẩy giá dẫn đầu và nhịp đếm qua STOMP `/topic/auctions/{id}`; giá và giờ lấy từ DB (BR-C26)                                                                                                                                                                                                                                                                                                                                                   | `POST /auctions/{id}/bids`                                                                     | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, catalog, commerce                                                            |
| `auction/result`                 | Có          | A042 Đóng nhận giá và chốt kết quả; A043 Tạo đơn từ kết quả hợp lệ; A046 Điều chỉnh kết quả phiên                                                                                                                                                                               | ops/auction-ops                                     | Ghi/đọc: auction_results, auctions, bids<br>**Job:** `AuctionCloseJob` đóng phiên theo nhịp 3 phút + đếm 3 × 5 giây hoặc đúng giờ đóng (BR-N16); kết quả nghi vấn tạm giữ, chưa tạo đơn (BR-N19)                                                                                                                                                                                                                                                                                                                   | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, catalog, commerce                                                            |
| `commerce/overdue`               | Có          | A044 Xử lý người thắng quá hạn                                                                                                                                                                                                                                                  | ops/orders                                          | Ghi/đọc: orders (payment_review_until, cancel_reason)<br>**Liên module:** A044: commerce đọc `PaymentStatusPort` (finance hiện thực); đang chờ cổng xác nhận thì gia hạn tối đa 24 giờ (BR-N22); quá hạn thì hủy đơn và phát `WinnerPaymentOverdue` cho auction lập hạn chế đặt giá (BR-N20)                                                                                                                                                                                                                       | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, taxonomy, asset, consignment, catalog                                                                                  |
| `auction/incident`               | Có          | A045 Xử lý sự cố hoặc hủy phiên                                                                                                                                                                                                                                                 | ops/auction-ops                                     | Ghi/đọc: auction_results, auctions<br>**Liên module:** A045: auction phát `AuctionIncidentRaised`; dispute mở case                                                                                                                                                                                                                                                                                                                                                                                                 | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, catalog, commerce                                                            |
| `finance/payment`                | Có          | A047 Khởi tạo thanh toán; A048 Xử lý xác nhận tiền                                                                                                                                                                                                                              | customer/payments                                   | Ghi/đọc: ledger_entries, ledger_transactions, payment_attempts, provider_events                                                                                                                                                                                                                                                                                                                                                                                                                                    | `POST /provider/webhooks/payments`                                                             | platform (idempotency, audit, security)          | Module: iam, governance, asset, consignment, commerce, fulfillment, dispute                                                         |
| `finance/reconciliation`         | Có          | A049 Đối soát và xử lý chênh lệch                                                                                                                                                                                                                                               | ops/finance                                         | Ghi/đọc: ledger_transactions, reconciliation_items                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, asset, consignment, commerce, fulfillment, dispute                                                         |
| `finance/refund`                 | Có          | A050 Lập hoàn tiền; A051 Duyệt hoàn và thực hiện                                                                                                                                                                                                                                | ops/finance                                         | Ghi/đọc: ledger_transactions, provider_events, refunds<br>Finance Maker lập, Finance Checker duyệt (BR-N28)                                                                                                                                                                                                                                                                                                                                                                                                        | `POST /refunds/{id}/approve`                                                                   | platform (idempotency, audit, security)          | Module: iam, governance, asset, consignment, commerce, fulfillment, dispute                                                         |
| `finance/settlement`             | Có          | A052 Lập quyết toán ký gửi; A053 Duyệt quyết toán và thụ hưởng                                                                                                                                                                                                                  | ops/finance                                         | Ghi/đọc: payouts, settlement_lines, settlements                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, asset, consignment, commerce, fulfillment, dispute                                                         |
| `finance/payout`                 | Có          | A054 Lập, duyệt và theo dõi chi trả                                                                                                                                                                                                                                             | ops/finance (A5a, tab Chi tiền chủ hàng)            | Ghi/đọc: ledger_transactions, payouts, settlements<br>Finance Maker lập, Finance Checker duyệt (BR-N28)                                                                                                                                                                                                                                                                                                                                                                                                            | `POST /payouts/{id}/approve`                                                                   | platform (idempotency, audit, security)          | Module: iam, governance, asset, consignment, commerce, fulfillment, dispute                                                         |
| `finance/taxdocument`            | Có          | A055 Cấp chứng từ và báo cáo thuế                                                                                                                                                                                                                                               | ops/finance                                         | Ghi/đọc: settlement_lines                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, asset, consignment, commerce, fulfillment, dispute                                                         |
| `finance/recovery`               | Có          | A056 Thu hồi sau chi trả sai                                                                                                                                                                                                                                                    | ops/finance                                         | Ghi/đọc: ledger_transactions, recovery_claims                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, asset, consignment, commerce, fulfillment, dispute                                                         |
| `fulfillment/delivery`           | Có          | A057 Chọn vận chuyển và đóng gói; A058 Bàn giao cho hãng hoặc người nhận; A059 Cập nhật hành trình và ngoại lệ                                                                                                                                                                  | ops/warehouse, customer/orders                      | Ghi/đọc: fulfillment_cases (carrier_code, carrier_order_code, carrier_status, carrier_shipped_at, carrier_delivered_at, complaint_window_ends_at)<br>**Liên module:** A057: tạo đơn trên hãng qua `platform/carrier` khi đơn đã thanh toán và không có hold Giao (BR-C43); A058: ghi custody_event "giao cho hãng" qua `inspectioncustody.api`; A059: nhận `CarrierStatusChanged`, quá 3 ngày chưa giao thì cảnh báo nhân viên, không tự đổi trạng thái (BR-N25); sự cố phát `DeliveryExceptionRaised` cho dispute | `POST /fulfillment-cases/{id}/carrier-orders`<br>`POST /carrier/webhooks/{carrier}`            | platform (idempotency, audit, security, carrier) | Module: iam, governance, taxonomy, asset, consignment, inspectioncustody, commerce                                                  |
| `fulfillment/handover`           | Một phần    | A060 Xác nhận nhận hoặc phản ánh vấn đề; A079 Bàn giao bất động sản tại chỗ _(ngoài pilot)_                                                                                                                                                                                     | customer/orders, ops/handover                       | Ghi/đọc: entitlements, fulfillment_cases, fulfillment_milestones, handover_appointments, handover_records, service_acceptances<br>**Liên module:** A060: fulfillment phát `ReceiptDisputed`; dispute mở case                                                                                                                                                                                                                                                                                                       | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, inspectioncustody, commerce                                                  |
| `dispute/casemgmt`               | Một phần    | A061 Phân loại và điều tra tranh chấp; A064 Tiếp nhận tranh chấp từ người thứ ba/cơ quan; A085 Xử lý sự kiện hoãn/hủy hoặc vé bị từ chối _(ngoài pilot)_                                                                                                                        | ops/disputes                                        | Ghi/đọc: case_decisions, case_evidence, dispute_cases (7 loại – BR-N29; hạn xử lý – BR-N10)<br>**Liên module:** nhận `DeliveryExceptionRaised` để mở vụ việc CARRIER_SERVICE; A085 (ngoài pilot): dispute phát `CaseDecisionApproved` (hoàn tiền do finance thực thi)                                                                                                                                                                                                                                              | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, asset, inspectioncustody, commerce, fulfillment                                                            |
| `dispute/decision`               | Có          | A062 Ra quyết định và kháng nghị                                                                                                                                                                                                                                                | ops/disputes                                        | Ghi/đọc: case_decisions (người đề xuất khác Trưởng ca duyệt – BR-N28)<br>**Liên module:** A062: dispute phát `CaseDecisionApproved`; finance lập hoàn/thu hồi                                                                                                                                                                                                                                                                                                                                                      | `POST /cases/{id}/decisions`                                                                   | platform (idempotency, audit, security)          | Module: iam, governance, asset, inspectioncustody, commerce, fulfillment                                                            |
| `dispute/returns`                | Có          | A063 Nhận trả và kiểm định lại                                                                                                                                                                                                                                                  | ops/disputes                                        | Ghi/đọc: return_authorizations (+ return_carrier_*)<br>**Liên module:** vận đơn trả tạo qua `platform/carrier`; hàng về phải kiểm định lại qua `inspectioncustody.api` (BR-C46)                                                                                                                                                                                                                                                                                                                                    | TBD                                                                                            | platform (idempotency, audit, security, carrier) | Module: iam, governance, asset, inspectioncustody, commerce, fulfillment                                                            |
| `governance/operations`          | Có          | A065 Giám sát, backup và phục hồi                                                                                                                                                                                                                                               | ops/governance                                      | Ghi/đọc: audit_events<br>**Liên module:** A065: số liệu đối soát lấy từ reporting; governance chỉ giám sát outbox/audit                                                                                                                                                                                                                                                                                                                                                                                            | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam                                                                                                                         |
| `governance/policy`              | Có          | A066 Quản lý policy và feature gate                                                                                                                                                                                                                                             | ops/governance                                      | Ghi/đọc: audit_events, policy_versions                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam                                                                                                                         |
| `governance/notification`        | Có          | A067 Thông báo và tác vụ chạy lại                                                                                                                                                                                                                                               | customer/notifications (C4i); gửi do worker         | Ghi/đọc: notification_deliveries, notification_preferences (BR-N32: loại bắt buộc không tắt được)                                                                                                                                                                                                                                                                                                                                                                                                                  | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam                                                                                                                         |
| `reporting/ops`                  | Có          | A068 Xem báo cáo vận hành                                                                                                                                                                                                                                                       | ops/reporting                                       | Ghi/đọc: —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, inspectioncustody, catalog, commerce, auction, finance, fulfillment, dispute |
| `taxonomy/policy`                | Có          | A070 Duyệt điều kiện ngành hàng                                                                                                                                                                                                                                                 | ops/taxonomy                                        | Ghi/đọc: category_policies                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `POST /category-policies/{id}/approve`                                                         | platform (idempotency, audit, security)          | Module: iam, governance                                                                                                             |
| `taxonomy/profile`               | Có          | A071 Soạn và duyệt Fulfillment Profile                                                                                                                                                                                                                                          | ops/taxonomy                                        | Ghi/đọc: fulfillment_profiles                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance                                                                                                             |
| `asset/detail`                   | Một phần    | A072 Phân loại lot và đề xuất bàn giao; A073 Lập hồ sơ bất động sản _(ngoài pilot)_                                                                                                                                                                                             | ops/intake                                          | Ghi/đọc: asset_detail_revisions, asset_right_holders, items, real_estate_details<br>**Liên module:** A072: đọc category policy qua `taxonomy.api`                                                                                                                                                                                                                                                                                                                                                                  | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy                                                                                                   |
| `inspectioncustody/verification` | Ngoài pilot | A074 Xác minh khả năng chuyển quyền đất _(ngoài pilot)_; A075 Khảo sát thực địa và xem tài sản _(ngoài pilot)_; A080 Kiểm tra xe và hồ sơ đăng ký _(ngoài pilot)_; A082 Xác minh quyền sự kiện và nguồn vé _(ngoài pilot)_; A086 Đặc tả gói dịch vụ và năng lực _(ngoài pilot)_ | ops/verification                                    | Ghi/đọc: inspection_reports, verification_reviews                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `POST /items/{id}/verifications`                                                               | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment                                                                               |
| `fulfillment/transfer`           | Ngoài pilot | A076 Chốt thủ tục chuyển quyền và chi phí _(ngoài pilot)_; A077 Ghi căn cứ ký kết và nộp hồ sơ _(ngoài pilot)_; A078 Xác nhận kết quả đăng ký chuyển quyền _(ngoài pilot)_; A081 Điều phối giao xe và sang tên _(ngoài pilot)_                                                  | ops/handover                                        | Ghi/đọc: fulfillment_cases, fulfillment_evidence, fulfillment_milestones, handover_records, transfer_cases<br>**Liên module:** A076: fulfillment dùng `ObligationPort` (finance hiện thực)                                                                                                                                                                                                                                                                                                                         | `POST /transfer-cases/{id}/record-result`                                                      | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, inspectioncustody, commerce                                                  |
| `fulfillment/entitlement`        | Ngoài pilot | A083 Cấp hoặc chuyển vé/quyền _(ngoài pilot)_; A084 Xác nhận redeem quyền _(ngoài pilot)_; A090 Xác minh và cấp quyền số _(ngoài pilot)_                                                                                                                                        | ops/handover                                        | Ghi/đọc: entitlement_events, entitlements, fulfillment_milestones                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `POST /entitlements/{id}/redeem`                                                               | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, inspectioncustody, commerce                                                  |
| `fulfillment/servicebooking`     | Ngoài pilot | A087 Đặt hoặc đổi lịch dịch vụ _(ngoài pilot)_; A088 Thực hiện và nghiệm thu dịch vụ _(ngoài pilot)_                                                                                                                                                                            | ops/handover                                        | Ghi/đọc: fulfillment_cases, fulfillment_milestones, service_acceptances, service_bookings<br>**Liên module:** A088: fulfillment phát `AcceptanceDisputed`; dispute mở case                                                                                                                                                                                                                                                                                                                                         | `POST /service-bookings/{id}/acceptances`                                                      | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, inspectioncustody, commerce                                                  |
| `fulfillment/plan`               | Một phần    | A089 Lập phương án hàng cồng kềnh _(ngoài pilot)_; A095 Lập và thực hiện kế hoạch bàn giao                                                                                                                                                                                      | ops/handover                                        | Ghi/đọc: fulfillment_cases (mốc giao ở cột carrier_*; fulfillment_milestones, fulfillment_evidence để giai đoạn 2)                                                                                                                                                                                                                                                                                                                                                                                                 | `POST /fulfillment-cases/{id}/milestones/{code}/complete`                                      | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, inspectioncustody, commerce                                                  |
| `asset/lot`                      | Ngoài pilot | A091 Lập lot nhiều thành phần hoặc nhiều đơn vị _(ngoài pilot)_                                                                                                                                                                                                                 | ops/intake                                          | Ghi/đọc: asset_detail_revisions, lot_capacity_requirements, sale_lot_components                                                                                                                                                                                                                                                                                                                                                                                                                                    | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy                                                                                                   |
| `asset/capacity`                 | Ngoài pilot | A092 Giữ và chuyển capacity/component _(ngoài pilot)_                                                                                                                                                                                                                           | Không có UI (worker/webhook)                        | Ghi/đọc: capacity_reservations, component_allocations, item_commitments                                                                                                                                                                                                                                                                                                                                                                                                                                            | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy                                                                                                   |
| `finance/obligation`             | Ngoài pilot | A093 Lập nghĩa vụ thu theo mốc _(ngoài pilot)_; A094 Phân bổ thu và giải mốc _(ngoài pilot)_                                                                                                                                                                                    | ops/finance                                         | Ghi/đọc: obligation_payment_allocations, payment_attempts, payment_obligations                                                                                                                                                                                                                                                                                                                                                                                                                                     | `POST /orders/{id}/payment-allocations`                                                        | platform (idempotency, audit, security)          | Module: iam, governance, asset, consignment, commerce, fulfillment, dispute                                                         |
| `fulfillment/completion`         | Có          | A096 Xét hoàn tất theo profile                                                                                                                                                                                                                                                  | ops/handover                                        | Ghi/đọc: fulfillment_cases<br>**Job:** `ComplaintWindowJob` hoàn tất khi hết 7 ngày từ lúc hãng báo đã giao mà không có vụ việc (BR-N26)<br>**Liên module:** kiểm vụ việc đang mở qua port `OpenCasePort` (dispute hiện thực, vì dispute đứng sau fulfillment); A096: fulfillment phát `FulfillmentCompleted`; finance lập quyết toán                                                                                                                                                                              | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, taxonomy, asset, consignment, inspectioncustody, commerce                                                  |
| `dispute/remediation`            | Ngoài pilot | A097 Khắc phục giao dịch không chuyển quyền được _(ngoài pilot)_                                                                                                                                                                                                                | ops/disputes                                        | Ghi/đọc: case_decisions, dispute_cases<br>**Liên module:** A097: dispute phát `CaseDecisionApproved`; finance xử lý hoàn                                                                                                                                                                                                                                                                                                                                                                                           | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance, asset, inspectioncustody, commerce, fulfillment                                                            |
| `taxonomy/enablement`            | Có          | A098 Bật nhóm hàng sau nghiệm thu                                                                                                                                                                                                                                               | ops/taxonomy                                        | Ghi/đọc: category_policies<br>**Liên module:** A098: taxonomy dùng `AcceptanceEvidencePort` (inspectioncustody hiện thực)                                                                                                                                                                                                                                                                                                                                                                                          | TBD                                                                                            | platform (idempotency, audit, security)          | Module: iam, governance                                                                                                             |

Feature `[ĐX]` không có action riêng:

- `platform/document` – Lưu tài liệu riêng tư có version/hash; không xuất tệp gốc ra public.
- `platform/messaging` – Idempotency, outbox/inbox; `OutboxRelayJob` gửi event sau commit (RabbitMQ tùy chọn, mục H).
- `platform/security` – Filter xác thực, kiểm tra quyền theo đối tượng, MFA gate.
- `platform/common` – Money VND, clock DB, mã lỗi 401/403/409/422/503.
- `governance/audit` – Ghi/đọc audit_events append-only.
- `governance/acknowledgment` – Lưu chấp thuận điều khoản theo version/hash.
- `asset/item` – Aggregate Item, mã định danh, trạng thái vận hành, lịch sử quyền sở hữu (`ownership_events`).
- `asset/commitment` – Hàng rào chống bán trùng: một commitment ACTIVE mỗi item.
- `asset/hold` – 4 loại hold (Bán, Giao, Chi tiền, Pháp lý) đọc bởi mọi luồng bán, giao và chi.
- `finance/ledger` – Sổ cái ghi kép POSTED bất biến, business_key chống ghi trùng.
- `platform/carrier` – Client API hãng vận chuyển (báo giá, tạo vận đơn, tra hành trình) và webhook có kiểm chữ ký, chống trùng bằng `processed_events`; phát `CarrierStatusChanged`. Không có bảng riêng: mã vận đơn nằm ở bảng của module chủ.
- `consignment/charge` – Phí thu của chủ hàng khi không có giao dịch bán (`consignor_charges`: phí kiểm định món không đạt, phí rút trước hạn, phí gửi trả); người duyệt khác người lập (BR-C06, N07, N08).
- `catalog/watchlist` – Theo dõi bài mua ngay và phiên đấu giá (`watchlist_items`, BR-N33).

## F. REQUIREMENT TRACEABILITY

**F.1 – Theo mã FR.** Phụ lục A của tài liệu có 60 FR (FR001–FR060): 57 FR gắn action; FR051, FR059, FR060 ghi "Chưa bật" và team đã bỏ theo BR-N37. Tên FR lấy từ Phụ lục A; nội dung chi tiết vẫn cần SRS 2.0.

| FR    | Tên FR (Phụ lục A)             | Actions                                                                                        | BE feature                                                                                                                                                                                                                                            | FE feature                                                                                                      |
| ----- | ------------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| FR001 | Hồ sơ và vòng đời tài khoản    | A002, A004                                                                                     | `iam/account`                                                                                                                                                                                                                                         | customer/account, customer/auth                                                                                 |
| FR002 | Đăng nhập và phiên             | A002, A003                                                                                     | `iam/account`, `iam/auth`                                                                                                                                                                                                                             | customer/auth, ops/auth                                                                                         |
| FR003 | Đổi/khôi phục mật khẩu         | A003                                                                                           | `iam/auth`                                                                                                                                                                                                                                            | customer/auth, ops/auth                                                                                         |
| FR004 | Phân quyền                     | A006                                                                                           | `iam/staffaccess`                                                                                                                                                                                                                                     | ops/iam-admin                                                                                                   |
| FR005 | Xác minh danh tính chủ hàng    | A004, A005                                                                                     | `iam/account`, `iam/identity`                                                                                                                                                                                                                         | customer/account, customer/kyc                                                                                  |
| FR006 | Hồ sơ quyền bán                | A008, A009, A012, A064, A070, A073, A074, A080, A082, A090                                     | `asset/detail`, `consignment/authority`, `consignment/request`, `dispute/casemgmt`, `fulfillment/entitlement`, `inspectioncustody/verification`, `taxonomy/policy`                                                                                    | customer/consignment, ops/disputes, ops/handover, ops/intake, ops/taxonomy, ops/verification                    |
| FR007 | Lựa chọn A/B và gửi hồ sơ      | A008, A010, A072                                                                               | `asset/detail`, `consignment/request`                                                                                                                                                                                                                 | customer/consignment, ops/intake                                                                                |
| FR008 | Xét chứng cứ từ xa             | A010, A011, A074, A075, A082, A086                                                             | `consignment/authority`, `consignment/request`, `inspectioncustody/verification`                                                                                                                                                                      | customer/consignment, ops/intake, ops/verification                                                              |
| FR009 | Nhận hàng và kiểm định kho     | A015, A019, A021, A022                                                                         | `consignment/request`, `inspectioncustody/custody`, `inspectioncustody/inspection`                                                                                                                                                                    | customer/consignment, ops/inspection, ops/warehouse                                                             |
| FR010 | Báo cáo/kiểm định lại          | A021, A022, A023, A075, A080                                                                   | `inspectioncustody/inspection`, `inspectioncustody/verification`                                                                                                                                                                                      | ops/inspection, ops/verification                                                                                |
| FR011 | Cam kết trách nhiệm            | A009, A013, A014                                                                               | `consignment/agreement`, `consignment/request`                                                                                                                                                                                                        | customer/consignment, ops/intake                                                                                |
| FR012 | Duyệt công bố                  | A011, A026, A027, A070, A074                                                                   | `catalog/listing`, `consignment/authority`, `inspectioncustody/verification`, `taxonomy/policy`                                                                                                                                                       | ops/intake, ops/listing, ops/taxonomy, ops/verification                                                         |
| FR013 | Quản lý sản phẩm               | A008, A026, A028, A072, A073, A080, A082, A086, A091                                           | `asset/detail`, `asset/lot`, `catalog/listing`, `consignment/request`, `inspectioncustody/verification`                                                                                                                                               | customer/consignment, ops/intake, ops/listing, ops/verification                                                 |
| FR014 | Danh mục ba tầng               | A029, A069                                                                                     | `taxonomy/master`                                                                                                                                                                                                                                     | ops/taxonomy                                                                                                    |
| FR015 | Ảnh/tài liệu private và public | A026, A073                                                                                     | `asset/detail`, `catalog/listing`                                                                                                                                                                                                                     | ops/intake, ops/listing                                                                                         |
| FR016 | Tìm kiếm                       | A001, A029                                                                                     | `catalog/search`, `taxonomy/master`                                                                                                                                                                                                                   | customer/catalog, ops/taxonomy                                                                                  |
| FR017 | Chi tiết sản phẩm              | A001, A027, A075                                                                               | `catalog/listing`, `catalog/search`, `inspectioncustody/verification`                                                                                                                                                                                 | customer/catalog, ops/listing, ops/verification                                                                 |
| FR018 | Xem và tham gia phiên          | A001, A038, A041                                                                               | `auction/bidding`, `auction/participation`, `catalog/search`                                                                                                                                                                                          | customer/auctions, customer/catalog                                                                             |
| FR019 | Giỏ hàng                       | A030                                                                                           | `commerce/cart`                                                                                                                                                                                                                                       | customer/checkout                                                                                               |
| FR020 | Checkout tổng tiền             | A031, A093                                                                                     | `commerce/checkout`, `finance/obligation`                                                                                                                                                                                                             | customer/checkout, ops/finance                                                                                  |
| FR021 | Đơn mua ngay                   | A032                                                                                           | `commerce/order`                                                                                                                                                                                                                                      | customer/checkout                                                                                               |
| FR022 | Lịch sử đơn                    | A034, A060                                                                                     | `commerce/order`, `fulfillment/handover`                                                                                                                                                                                                              | customer/orders                                                                                                 |
| FR023 | Can thiệp đơn có quyền         | A016, A017, A034, A035, A077, A097                                                             | `commerce/order`, `consignment/withdrawal`, `dispute/remediation`, `fulfillment/transfer`, `reporting/consignorview`                                                                                                                                  | customer/consignment, customer/orders, ops/disputes, ops/handover, ops/orders                                   |
| FR024 | Biên nhận/chứng từ             | A032, A055                                                                                     | `commerce/order`, `finance/taxdocument`                                                                                                                                                                                                               | customer/checkout, ops/finance                                                                                  |
| FR025 | Lập/lên lịch phiên             | A036, A037                                                                                     | `auction/rule`, `auction/schedule`                                                                                                                                                                                                                    | ops/auction-ops                                                                                                 |
| FR026 | Mở phiên                       | A039                                                                                           | `auction/schedule`                                                                                                                                                                                                                                    | —                                                                                                               |
| FR027 | Nhận lượt giá                  | A038, A040                                                                                     | `auction/bidding`, `auction/participation`                                                                                                                                                                                                            | customer/auctions                                                                                               |
| FR028 | Lịch sử/giá dẫn đầu            | A040, A041                                                                                     | `auction/bidding`                                                                                                                                                                                                                                     | customer/auctions                                                                                               |
| FR029 | Gia hạn cuối phiên             | A040                                                                                           | `auction/bidding`                                                                                                                                                                                                                                     | customer/auctions                                                                                               |
| FR030 | Hủy/sự cố phiên                | A017, A028, A045                                                                               | `auction/incident`, `catalog/listing`, `consignment/withdrawal`                                                                                                                                                                                       | customer/consignment, ops/auction-ops, ops/listing                                                              |
| FR031 | Đóng/chốt kết quả              | A042                                                                                           | `auction/result`                                                                                                                                                                                                                                      | ops/auction-ops                                                                                                 |
| FR032 | Kết quả sang đơn               | A043, A076                                                                                     | `auction/result`, `fulfillment/transfer`                                                                                                                                                                                                              | ops/handover                                                                                                    |
| FR033 | Hạn thanh toán người thắng     | A043, A093                                                                                     | `auction/result`, `finance/obligation`                                                                                                                                                                                                                | ops/finance                                                                                                     |
| FR034 | Quá hạn/tiền muộn              | A044, A097                                                                                     | `commerce/overdue`, `dispute/remediation`                                                                                                                                                                                                             | ops/disputes, ops/orders                                                                                        |
| FR035 | Điều chỉnh có lịch sử          | A028, A035, A042, A045, A046                                                                   | `auction/incident`, `auction/result`, `catalog/listing`, `commerce/order`                                                                                                                                                                             | ops/auction-ops, ops/listing, ops/orders                                                                        |
| FR036 | Một cam kết active             | A031, A037, A091, A092                                                                         | `asset/capacity`, `asset/lot`, `auction/schedule`, `commerce/checkout`                                                                                                                                                                                | customer/checkout, ops/auction-ops, ops/intake                                                                  |
| FR037 | Tồn/vật phẩm/vị trí            | A019, A020, A025, A072, A084, A087, A091                                                       | `asset/detail`, `asset/lot`, `fulfillment/entitlement`, `fulfillment/servicebooking`, `inspectioncustody/custody`                                                                                                                                     | ops/handover, ops/intake, ops/warehouse                                                                         |
| FR038 | Giữ và giải phóng hàng         | A020, A025, A031, A033, A087, A092                                                             | `asset/capacity`, `commerce/checkout`, `fulfillment/servicebooking`, `inspectioncustody/custody`                                                                                                                                                      | customer/checkout, ops/handover, ops/warehouse                                                                  |
| FR039 | Nhập/lấy/đóng gói/bàn giao     | A015, A018, A019, A057, A058, A071, A077, A078, A079, A081, A083, A087, A088, A089, A090, A095 | `consignment/request`, `consignment/withdrawal`, `fulfillment/delivery`, `fulfillment/entitlement`, `fulfillment/handover`, `fulfillment/plan`, `fulfillment/servicebooking`, `fulfillment/transfer`, `inspectioncustody/custody`, `taxonomy/profile` | customer/consignment, ops/handover, ops/intake, ops/taxonomy, ops/warehouse                                     |
| FR040 | Báo giá vận chuyển             | A015, A057, A089                                                                               | `consignment/request`, `fulfillment/delivery`, `fulfillment/plan`                                                                                                                                                                                     | customer/consignment, ops/handover, ops/warehouse                                                               |
| FR041 | Vận đơn/theo dõi               | A058, A059                                                                                     | `fulfillment/delivery`                                                                                                                                                                                                                                | customer/orders, ops/warehouse                                                                                  |
| FR042 | Ngoại lệ giao hàng             | A059, A079, A081, A085, A088, A089, A096                                                       | `dispute/casemgmt`, `fulfillment/completion`, `fulfillment/delivery`, `fulfillment/handover`, `fulfillment/plan`, `fulfillment/servicebooking`, `fulfillment/transfer`                                                                                | customer/orders, ops/disputes, ops/handover, ops/warehouse                                                      |
| FR043 | Khởi tạo thu tiền              | A047, A093                                                                                     | `finance/obligation`, `finance/payment`                                                                                                                                                                                                               | customer/payments, ops/finance                                                                                  |
| FR044 | Xác nhận thanh toán            | A048, A094                                                                                     | `finance/obligation`, `finance/payment`                                                                                                                                                                                                               | ops/finance                                                                                                     |
| FR045 | Sổ phụ/đối soát                | A044, A048, A049, A094                                                                         | `commerce/overdue`, `finance/obligation`, `finance/payment`, `finance/reconciliation`                                                                                                                                                                 | ops/finance, ops/orders                                                                                         |
| FR046 | Hoàn tiền                      | A034, A050, A051, A085, A097                                                                   | `commerce/order`, `dispute/casemgmt`, `dispute/remediation`, `finance/refund`                                                                                                                                                                         | customer/orders, ops/disputes, ops/finance                                                                      |
| FR047 | Quyết toán/chi chủ hàng        | A005, A013, A016, A052, A053, A054, A076, A081, A088, A096                                     | `consignment/agreement`, `finance/payout`, `finance/settlement`, `fulfillment/completion`, `fulfillment/servicebooking`, `fulfillment/transfer`, `iam/identity`, `reporting/consignorview`                                                            | customer/account, customer/consignment, customer/kyc, ops/finance, ops/handover, ops/intake                     |
| FR048 | Thuế/chứng từ/thu hồi          | A052, A055, A056, A076                                                                         | `finance/recovery`, `finance/settlement`, `finance/taxdocument`, `fulfillment/transfer`                                                                                                                                                               | ops/finance, ops/handover                                                                                       |
| FR049 | Vụ việc/gian lận               | A012, A018, A024, A056, A060, A061, A062, A064, A078, A085, A097                               | `consignment/authority`, `consignment/withdrawal`, `dispute/casemgmt`, `dispute/decision`, `dispute/remediation`, `finance/recovery`, `fulfillment/handover`, `fulfillment/transfer`, `inspectioncustody/custody`                                     | customer/orders, ops/disputes, ops/finance, ops/handover, ops/intake, ops/warehouse                             |
| FR050 | Trả và kiểm định lại           | A023, A024, A061, A063, A090                                                                   | `dispute/casemgmt`, `dispute/returns`, `fulfillment/entitlement`, `inspectioncustody/custody`, `inspectioncustody/inspection`                                                                                                                         | ops/disputes, ops/handover, ops/inspection, ops/warehouse                                                       |
| FR051 | Uy tín đối tác                 | —                                                                                              | — (bỏ theo BR-N37)                                                                                                                                                                                                                                    | —                                                                                                               |
| FR052 | Thông báo/lựa chọn kênh        | A016, A067, A083                                                                               | `fulfillment/entitlement`, `governance/notification`, `reporting/consignorview`                                                                                                                                                                       | customer/consignment, ops/handover                                                                              |
| FR053 | Nhật ký/sự kiện                | A065, A067, A077, A078, A083, A084                                                             | `fulfillment/entitlement`, `fulfillment/transfer`, `governance/notification`, `governance/operations`                                                                                                                                                 | ops/governance, ops/handover                                                                                    |
| FR054 | Giám sát/hàng đợi              | A025, A065, A084                                                                               | `fulfillment/entitlement`, `governance/operations`, `inspectioncustody/custody`                                                                                                                                                                       | ops/governance, ops/handover, ops/warehouse                                                                     |
| FR055 | Chính sách có version          | A013, A014, A017, A036, A066, A069, A070, A071, A086, A095, A098                               | `auction/rule`, `consignment/agreement`, `consignment/withdrawal`, `fulfillment/plan`, `governance/policy`, `inspectioncustody/verification`, `taxonomy/enablement`, `taxonomy/master`, `taxonomy/policy`, `taxonomy/profile`                         | customer/consignment, ops/auction-ops, ops/governance, ops/handover, ops/intake, ops/taxonomy, ops/verification |
| FR056 | Quyền dữ liệu                  | A005, A007, A064                                                                               | `dispute/casemgmt`, `governance/datarequest`, `iam/identity`                                                                                                                                                                                          | customer/account, customer/kyc, customer/privacy, ops/disputes, ops/governance                                  |
| FR057 | Báo cáo vận hành               | A068                                                                                           | `reporting/ops`                                                                                                                                                                                                                                       | ops/reporting                                                                                                   |
| FR058 | Gate phát hành                 | A065, A066, A096, A098                                                                         | `fulfillment/completion`, `governance/operations`, `governance/policy`, `taxonomy/enablement`                                                                                                                                                         | ops/governance, ops/handover, ops/taxonomy                                                                      |
| FR059 | Khuyến mãi                     | —                                                                                              | — (bỏ theo BR-N37)                                                                                                                                                                                                                                    | —                                                                                                               |
| FR060 | Đánh giá sản phẩm              | —                                                                                              | — (bỏ theo BR-N37)                                                                                                                                                                                                                                    | —                                                                                                               |

**FR không có action:** FR051 (uy tín đối tác), FR059 (khuyến mãi), FR060 (đánh giá sản phẩm). Phụ lục A ghi "Chưa bật" và BR-N37 đã chốt bỏ khỏi bản này, nên đây không phải yêu cầu bị bỏ sót; đơn hàng không có nút đánh giá.

**F.2 – Theo action** (98 dòng). Cột "Chỉ BE" = action chạy tự động/webhook, không có màn hình. Cột Pilot theo BR-N36: 23 action ngoài pilot, còn lại 75 action làm trong pilot.

| Action | Tên                                          | Nhóm | Pilot       | BE module/feature                | FE                                  | FR                      |
| ------ | -------------------------------------------- | ---- | ----------- | -------------------------------- | ----------------------------------- | ----------------------- |
| A001   | Tìm và xem sản phẩm                          | 01   | Có          | `catalog/search`                 | customer/catalog                    | FR016,FR017,FR018       |
| A002   | Đăng ký và xác minh liên hệ                  | 01   | Có          | `iam/account`                    | customer/auth                       | FR001,FR002             |
| A003   | Đăng nhập, MFA và thu hồi phiên              | 01   | Có          | `iam/auth`                       | customer/auth, ops/auth             | FR002,FR003             |
| A004   | Cập nhật hồ sơ và địa chỉ                    | 01   | Có          | `iam/account`                    | customer/account                    | FR001,FR005             |
| A005   | Gửi danh tính và tài khoản nhận tiền         | 01   | Có          | `iam/identity`                   | customer/kyc, customer/account      | FR005,FR047,FR056       |
| A006   | Cấp và thu hồi quyền nhân viên               | 01   | Có          | `iam/staffaccess`                | ops/iam-admin                       | FR004                   |
| A007   | Xử lý yêu cầu quyền dữ liệu                  | 01   | Có          | `governance/datarequest`         | customer/privacy, ops/governance    | FR056                   |
| A008   | Tạo hồ sơ ký gửi                             | 02   | Có          | `consignment/request`            | customer/consignment                | FR006,FR007,FR013       |
| A009   | Tải giấy tờ và cam kết trách nhiệm           | 02   | Có          | `consignment/request`            | customer/consignment                | FR006,FR011             |
| A010   | Bổ sung và gửi chính thức                    | 02   | Có          | `consignment/request`            | customer/consignment                | FR007,FR008             |
| A011   | Xét hồ sơ từ xa theo route A                 | 02   | Có          | `consignment/authority`          | ops/intake                          | FR008,FR012             |
| A012   | Xét quyền ký gửi và quyền bán                | 02   | Có          | `consignment/authority`          | ops/intake                          | FR006,FR049             |
| A013   | Đề xuất hợp đồng và bảng phí                 | 02   | Có          | `consignment/agreement`          | ops/intake                          | FR011,FR047,FR055       |
| A014   | Chấp thuận hoặc thương lượng điều khoản      | 02   | Có          | `consignment/agreement`          | customer/consignment                | FR011,FR055             |
| A015   | Hẹn giao hoặc gửi tài sản vào kho            | 02   | Có          | `consignment/request`            | customer/consignment, ops/warehouse | FR009,FR039,FR040       |
| A016   | Theo dõi ký gửi và quyết toán                | 02   | Có          | `reporting/consignorview`        | customer/consignment                | FR023,FR047,FR052       |
| A017   | Yêu cầu rút hoặc gia hạn ký gửi              | 02   | Có          | `consignment/withdrawal`         | customer/consignment                | FR023,FR030,FR055       |
| A018   | Quyết định trả hàng hoặc đóng ký gửi         | 02   | Có          | `consignment/withdrawal`         | ops/intake                          | FR039,FR049             |
| A019   | Nhận và đối chiếu hàng ký gửi                | 03   | Có          | `inspectioncustody/custody`      | ops/warehouse                       | FR009,FR037,FR039       |
| A020   | Đặt vị trí và niêm phong                     | 03   | Có          | `inspectioncustody/custody`      | ops/warehouse                       | FR037,FR038             |
| A021   | Phân công kiểm định                          | 03   | Có          | `inspectioncustody/inspection`   | ops/inspection                      | FR009,FR010             |
| A022   | Kiểm định và lập báo cáo                     | 03   | Có          | `inspectioncustody/inspection`   | ops/inspection                      | FR009,FR010             |
| A023   | Hoàn tất, sửa hoặc thu hồi báo cáo           | 03   | Có          | `inspectioncustody/inspection`   | ops/inspection                      | FR010,FR050             |
| A024   | Cách ly hàng có bất thường                   | 03   | Có          | `inspectioncustody/custody`      | ops/warehouse                       | FR049,FR050             |
| A025   | Kiểm kê và xử lý chênh lệch                  | 03   | Có          | `inspectioncustody/custody`      | ops/warehouse                       | FR037,FR038,FR054       |
| A026   | Soạn bài đăng Nexus                          | 04   | Có          | `catalog/listing`                | ops/listing                         | FR012,FR013,FR015       |
| A027   | Duyệt độc lập và công bố                     | 04   | Có          | `catalog/listing`                | ops/listing                         | FR012,FR017             |
| A028   | Sửa nội dung và đình chỉ bài                 | 04   | Có          | `catalog/listing`                | ops/listing                         | FR013,FR030,FR035       |
| A029   | Quản lý mẫu và nhóm hàng                     | 04   | Có          | `taxonomy/master`                | ops/taxonomy                        | FR014,FR016             |
| A030   | Thêm giỏ và xem tổng dự kiến                 | 05   | Có          | `commerce/cart`                  | customer/checkout                   | FR019                   |
| A031   | Checkout và giữ hàng có hạn                  | 05   | Có          | `commerce/checkout`              | customer/checkout                   | FR020,FR036,FR038       |
| A032   | Xác nhận đơn mua ngay                        | 05   | Có          | `commerce/order`                 | customer/checkout                   | FR021,FR024             |
| A033   | Hết hạn checkout                             | 05   | Có          | `commerce/checkout`              | Chỉ BE                              | FR038                   |
| A034   | Xem đơn và yêu cầu hủy                       | 05   | Có          | `commerce/order`                 | customer/orders                     | FR022,FR023,FR046       |
| A035   | Can thiệp đơn theo căn cứ                    | 05   | Có          | `commerce/order`                 | ops/orders                          | FR023,FR035             |
| A036   | Chốt quy chế và chủ thể tổ chức              | 06   | Có          | `auction/rule`                   | ops/auction-ops                     | FR025,FR055             |
| A037   | Lập lịch phiên và dành hàng                  | 06   | Có          | `auction/schedule`               | ops/auction-ops                     | FR025,FR036             |
| A038   | Đăng ký tham gia và chấp thuận quy chế       | 06   | Có          | `auction/participation`          | customer/auctions                   | FR018,FR027             |
| A039   | Mở phiên theo giờ máy chủ                    | 06   | Có          | `auction/schedule`               | Chỉ BE                              | FR026                   |
| A040   | Gửi lượt trả giá                             | 06   | Có          | `auction/bidding`                | customer/auctions                   | FR027,FR028,FR029       |
| A041   | Theo dõi lịch sử và giá dẫn đầu              | 06   | Có          | `auction/bidding`                | customer/auctions                   | FR028,FR018             |
| A042   | Đóng nhận giá và chốt kết quả                | 06   | Có          | `auction/result`                 | ops/auction-ops                     | FR031,FR035             |
| A043   | Tạo đơn từ kết quả hợp lệ                    | 06   | Có          | `auction/result`                 | Chỉ BE                              | FR032,FR033             |
| A044   | Xử lý người thắng quá hạn                    | 06   | Có          | `commerce/overdue`               | ops/orders                          | FR034,FR045             |
| A045   | Xử lý sự cố hoặc hủy phiên                   | 06   | Có          | `auction/incident`               | ops/auction-ops                     | FR030,FR035             |
| A046   | Điều chỉnh kết quả phiên                     | 06   | Có          | `auction/result`                 | ops/auction-ops                     | FR035                   |
| A047   | Khởi tạo thanh toán                          | 07   | Có          | `finance/payment`                | customer/payments                   | FR043                   |
| A048   | Xử lý xác nhận tiền                          | 07   | Có          | `finance/payment`                | Chỉ BE                              | FR044,FR045             |
| A049   | Đối soát và xử lý chênh lệch                 | 07   | Có          | `finance/reconciliation`         | ops/finance                         | FR045                   |
| A050   | Lập hoàn tiền                                | 07   | Có          | `finance/refund`                 | ops/finance                         | FR046                   |
| A051   | Duyệt hoàn và thực hiện                      | 07   | Có          | `finance/refund`                 | ops/finance                         | FR046                   |
| A052   | Lập quyết toán ký gửi                        | 07   | Có          | `finance/settlement`             | ops/finance                         | FR047,FR048             |
| A053   | Duyệt quyết toán và thụ hưởng                | 07   | Có          | `finance/settlement`             | ops/finance                         | FR047                   |
| A054   | Lập, duyệt và theo dõi chi trả               | 07   | Có          | `finance/payout`                 | ops/finance                         | FR047                   |
| A055   | Cấp chứng từ và báo cáo thuế                 | 07   | Có          | `finance/taxdocument`            | ops/finance                         | FR024,FR048             |
| A056   | Thu hồi sau chi trả sai                      | 07   | Có          | `finance/recovery`               | ops/finance                         | FR048,FR049             |
| A057   | Chọn vận chuyển và đóng gói                  | 08   | Có          | `fulfillment/delivery`           | ops/warehouse                       | FR039,FR040             |
| A058   | Bàn giao cho hãng hoặc người nhận            | 08   | Có          | `fulfillment/delivery`           | ops/warehouse                       | FR039,FR041             |
| A059   | Cập nhật hành trình và ngoại lệ              | 08   | Có          | `fulfillment/delivery`           | ops/warehouse, customer/orders      | FR041,FR042             |
| A060   | Xác nhận nhận hoặc phản ánh vấn đề           | 08   | Có          | `fulfillment/handover`           | customer/orders                     | FR022,FR049             |
| A061   | Phân loại và điều tra tranh chấp             | 08   | Có          | `dispute/casemgmt`               | ops/disputes                        | FR049,FR050             |
| A062   | Ra quyết định và kháng nghị                  | 08   | Có          | `dispute/decision`               | ops/disputes                        | FR049                   |
| A063   | Nhận trả và kiểm định lại                    | 08   | Có          | `dispute/returns`                | ops/disputes                        | FR050                   |
| A064   | Tiếp nhận tranh chấp từ người thứ ba/cơ quan | 08   | Có          | `dispute/casemgmt`               | ops/disputes                        | FR006,FR049,FR056       |
| A065   | Giám sát, backup và phục hồi                 | 08   | Có          | `governance/operations`          | ops/governance                      | FR053,FR054,FR058       |
| A066   | Quản lý policy và feature gate               | 08   | Có          | `governance/policy`              | ops/governance                      | FR055,FR058             |
| A067   | Thông báo và tác vụ chạy lại                 | 08   | Có          | `governance/notification`        | Chỉ BE                              | FR052,FR053             |
| A068   | Xem báo cáo vận hành                         | 08   | Có          | `reporting/ops`                  | ops/reporting                       | FR057                   |
| A069   | Tạo hoặc mở rộng danh mục                    | 09   | Có          | `taxonomy/master`                | ops/taxonomy                        | FR014,FR055             |
| A070   | Duyệt điều kiện ngành hàng                   | 09   | Có          | `taxonomy/policy`                | ops/taxonomy                        | FR006,FR012,FR055       |
| A071   | Soạn và duyệt Fulfillment Profile            | 09   | Có          | `taxonomy/profile`               | ops/taxonomy                        | FR039,FR055             |
| A072   | Phân loại lot và đề xuất bàn giao            | 09   | Có          | `asset/detail`                   | ops/intake                          | FR007,FR013,FR037       |
| A073   | Lập hồ sơ bất động sản                       | 09   | Ngoài pilot | `asset/detail`                   | ops/intake                          | FR006,FR013,FR015       |
| A074   | Xác minh khả năng chuyển quyền đất           | 09   | Ngoài pilot | `inspectioncustody/verification` | ops/verification                    | FR006,FR008,FR012       |
| A075   | Khảo sát thực địa và xem tài sản             | 09   | Ngoài pilot | `inspectioncustody/verification` | ops/verification                    | FR008,FR010,FR017       |
| A076   | Chốt thủ tục chuyển quyền và chi phí         | 09   | Ngoài pilot | `fulfillment/transfer`           | ops/handover                        | FR032,FR047,FR048       |
| A077   | Ghi căn cứ ký kết và nộp hồ sơ               | 09   | Ngoài pilot | `fulfillment/transfer`           | ops/handover                        | FR023,FR039,FR053       |
| A078   | Xác nhận kết quả đăng ký chuyển quyền        | 09   | Ngoài pilot | `fulfillment/transfer`           | ops/handover                        | FR039,FR049,FR053       |
| A079   | Bàn giao bất động sản tại chỗ                | 09   | Ngoài pilot | `fulfillment/handover`           | ops/handover                        | FR039,FR042             |
| A080   | Kiểm tra xe và hồ sơ đăng ký                 | 09   | Ngoài pilot | `inspectioncustody/verification` | ops/verification                    | FR006,FR010,FR013       |
| A081   | Điều phối giao xe và sang tên                | 09   | Ngoài pilot | `fulfillment/transfer`           | ops/handover                        | FR039,FR042,FR047       |
| A082   | Xác minh quyền sự kiện và nguồn vé           | 09   | Ngoài pilot | `inspectioncustody/verification` | ops/verification                    | FR006,FR008,FR013       |
| A083   | Cấp hoặc chuyển vé/quyền                     | 09   | Ngoài pilot | `fulfillment/entitlement`        | ops/handover                        | FR039,FR052,FR053       |
| A084   | Xác nhận redeem quyền                        | 09   | Ngoài pilot | `fulfillment/entitlement`        | ops/handover                        | FR037,FR053,FR054       |
| A085   | Xử lý sự kiện hoãn/hủy hoặc vé bị từ chối    | 09   | Ngoài pilot | `dispute/casemgmt`               | ops/disputes                        | FR042,FR046,FR049       |
| A086   | Đặc tả gói dịch vụ và năng lực               | 09   | Ngoài pilot | `inspectioncustody/verification` | ops/verification                    | FR008,FR013,FR055       |
| A087   | Đặt hoặc đổi lịch dịch vụ                    | 09   | Ngoài pilot | `fulfillment/servicebooking`     | ops/handover                        | FR037,FR038,FR039       |
| A088   | Thực hiện và nghiệm thu dịch vụ              | 09   | Ngoài pilot | `fulfillment/servicebooking`     | ops/handover                        | FR039,FR042,FR047       |
| A089   | Lập phương án hàng cồng kềnh                 | 09   | Ngoài pilot | `fulfillment/plan`               | ops/handover                        | FR039,FR040,FR042       |
| A090   | Xác minh và cấp quyền số                     | 09   | Ngoài pilot | `fulfillment/entitlement`        | ops/handover                        | FR006,FR039,FR050       |
| A091   | Lập lot nhiều thành phần hoặc nhiều đơn vị   | 09   | Ngoài pilot | `asset/lot`                      | ops/intake                          | FR013,FR036,FR037       |
| A092   | Giữ và chuyển capacity/component             | 09   | Ngoài pilot | `asset/capacity`                 | Chỉ BE                              | FR036,FR038             |
| A093   | Lập nghĩa vụ thu theo mốc                    | 09   | Ngoài pilot | `finance/obligation`             | ops/finance                         | FR020,FR033,FR043       |
| A094   | Phân bổ thu và giải mốc                      | 09   | Ngoài pilot | `finance/obligation`             | ops/finance                         | FR044,FR045             |
| A095   | Lập và thực hiện kế hoạch bàn giao           | 09   | Có          | `fulfillment/plan`               | ops/handover                        | FR039,FR055             |
| A096   | Xét hoàn tất theo profile                    | 09   | Có          | `fulfillment/completion`         | ops/handover                        | FR042,FR047,FR058       |
| A097   | Khắc phục giao dịch không chuyển quyền được  | 09   | Ngoài pilot | `dispute/remediation`            | ops/disputes                        | FR023,FR034,FR046,FR049 |
| A098   | Bật nhóm hàng sau nghiệm thu                 | 09   | Có          | `taxonomy/enablement`            | ops/taxonomy                        | FR055,FR058             |

## G. SHARED COMPONENTS

| Thành phần                                                            | Nằm ở                                               | Vì sao không thuộc một feature                                                                                                                                                                  |
| --------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Money (VND, số nguyên), DbClock (clock_timestamp sau khóa)            | BE `platform/common`                                | Mọi module tính tiền và giờ theo cùng quy ước (Mục 10.4); sao chép sẽ lệch nghiệp vụ.                                                                                                           |
| Idempotency, outbox, inbox, RabbitMQ publisher                        | BE `platform/messaging`                             | Mục 10.1: event sau commit qua outbox; mọi command nhạy cảm cần idempotency key.                                                                                                                |
| Security/ObjectAccessGuard, MFA gate, FieldCrypto (HMAC + mã hóa cột) | BE `platform/security`                              | Chống IDOR là yêu cầu NFR toàn hệ thống (Mục 10.5), không phải của riêng IAM. Số CCCD, địa chỉ, serial cùng một cách băm và mã hóa (BR-C50).                                                    |
| Lưu tài liệu riêng tư (documents)                                     | BE `platform/document`                              | Mọi luồng (ký gửi, kiểm định, tranh chấp, hồ sơ chuyển quyền) cùng cần version/hash và không public.                                                                                            |
| Client và webhook hãng vận chuyển                                     | BE `platform/carrier`                               | Consignment (gửi vào kho, trả chủ hàng), fulfillment (giao người mua) và dispute (hàng trả về) cùng dùng một hãng, một cách kiểm chữ ký; mỗi module tự cập nhật mã vận đơn trong bảng của mình. |
| Port `AuditTrail`, `AcknowledgmentPort`, `OpenCasePort`               | BE `platform/port`, governance và dispute hiện thực | Tránh iam/asset… phụ thuộc ngược governance, và fulfillment phụ thuộc ngược dispute.                                                                                                            |
| Item, commitment, hold (module `asset`)                               | BE `asset`                                          | Là hàng rào chống bán trùng dùng chung cho commerce, auction, consignment, dispute; không thuộc luồng bán nào.                                                                                  |
| Đọc tham số đã chốt (`PolicyParams`)                                  | BE `governance.api`                                 | Thời hạn, phí, SLA dùng ở nhiều module; đọc từ `policy_versions` (seed v4) để đổi tham số không phải sửa code.                                                                                  |
| Khóa job (`JobLock`)                                                  | BE `platform/common`                                | Các job ở mục H chỉ được chạy một lần mỗi nhịp khi BE chạy nhiều instance.                                                                                                                      |
| UI kit, DataTable, MoneyText, FileUpload, Countdown                   | FE `packages/ui`                                    | Dùng ở cả hai portal; Countdown dùng cho giữ hàng 15 phút (M3) và nhịp đóng phiên (C2).                                                                                                         |
| HTTP client, ánh xạ lỗi 401/403/409/422/503, Idempotency-Key          | FE `packages/api-client`                            | Mục 10.3 quy định mã lỗi và idempotency chung cho mọi command.                                                                                                                                  |
| Session, permission, MFA prompt                                       | FE `packages/auth`                                  | Cả hai portal cần cùng cơ chế phiên và kiểm quyền; ẩn nút không thay kiểm tra phía server (Mục 3.1).                                                                                            |
| WebSocket client (STOMP)                                              | FE `packages/realtime`                              | Phòng đấu giá (C2) dùng; thông báo trong app (C4i) có thể dùng sau. Chỉ hiển thị, giá và giờ vẫn theo DB (BR-C51).                                                                              |

## H. ARCHITECTURE DECISIONS

**Quyết định chính**

- **Modular monolith, một PostgreSQL, ranh giới module rõ** – theo đề xuất P02 (Mục 10.1) để một transaction bao item, commitment, bid/result/order và nghĩa vụ tiền.
- **Giữ 10 module của tài liệu, thêm `platform` và 3 module đề xuất** – `taxonomy` (nhóm hàng, policy, profile) tách khỏi Catalog, `asset` (item, commitment, hold, lot, capacity, chi tiết theo loại) tách khỏi Consignment, `reporting` (read model). Lý do: nếu gộp như cũ thì Consignment ↔ Catalog và Finance ↔ Fulfillment tạo phụ thuộc vòng.
- **Liên module chỉ qua `<module>.api`, event (outbox) hoặc port** – các action chạm bảng của module khác (ví dụ A024, A034, A062, A096) được liệt kê ở cột "Liên module" của mục E.
- **Thứ tự phụ thuộc (không vòng):** platform → iam → governance → taxonomy → asset → consignment → inspectioncustody → catalog → commerce → auction → fulfillment → dispute → finance → reporting.
- **Command theo thứ tự khóa của Mục 10.4** (item/lot → auction/checkout/order → commitment → capacity pools → allocations) được đặt trong `asset.api`, để feature khác không tự khóa sai thứ tự.
- **FE hai portal** (customer, operations) đúng Mục 10.1; feature FE không import chéo, chung qua `packages/`.
- **Cấu trúc thư mục thích nghi:** feature chỉ có worker thì không có controller; feature không sở hữu bảng thì không có entity. Thêm `client/`, `listener/`, `job/` khi feature thật sự gọi hệ thống ngoài, nhận event hoặc chạy định kỳ.
- **Giao hàng qua API hãng vận chuyển** (team chốt 13/10, BR-N25). Không có module hay bảng shipment. `platform/carrier` gói client và webhook; module nào giữ mã vận đơn thì tự cập nhật bảng của mình khi nhận `CarrierStatusChanged`: consignment (gửi vào kho, trả chủ hàng), fulfillment (giao người mua), dispute (hàng trả về). Trạng thái của hãng chỉ để hiển thị; "đã giao" không tự hoàn tất đơn (BR-C44).
- **DB là `nexus_schema_v4.sql` (82 bảng pilot), chạy bằng Flyway.** `V1__schema_v4.sql` là nguyên văn file schema v4, `V2__seed_v4.sql` là seed v4 (có 2 kiểu bàn giao PARCEL, ONSITE); thay đổi sau thêm `V3__…`, không sửa file đã chạy. 19 bảng hoãn nằm trong `nexus_giai_doan_2.sql`, khi mở rộng thì đổi tên thành một bản Flyway mới. Không chia DDL theo module vì khóa ngoại đi chéo module (ví dụ `item_holds.case_id` → `dispute_cases`). `nexus_migration_v4.sql` chỉ dành cho DB đã chạy v3, không đưa vào Flyway. Hibernate chạy `ddl-auto: validate` (entity sai tên cột thì app không khởi động); không dùng `update`.
- **Ánh xạ entity theo DB v4:** `uuid` → `UUID` (DB tự sinh); `timestamptz` → `OffsetDateTime`; cột `*_vnd bigint` → `long`, không dùng `double` (BR-C33); `jsonb` → `@JdbcTypeCode(SqlTypes.JSON)`; cột text có CHECK → `enum` với `@Enumerated(STRING)`, giá trị đúng như CHECK; `numeric` → `BigDecimal`, `smallint` → `short`; cột `char(n)` (ví dụ `orders.currency`, `citizen_id_verifications.id_number_last4`) thêm `@JdbcTypeCode(SqlTypes.CHAR)` để validate khớp kiểu; `created_at` do DB sinh → `insertable = false, updatable = false`; khóa ngoại sang module khác giữ dạng `UUID`. `SchemaValidationTest` bắt lỗi ánh xạ ngay khi build.
- **Tham số không viết cứng:** thời hạn, phí, SLA đọc từ `policy_versions` (11 bộ trong seed v4) qua `governance.api` (`PolicyParams`).
- **Phân quyền theo 15 vai trò của seed v4.** Quyết định vụ việc do Trưởng ca (SHIFT_LEAD) duyệt; lệnh hoàn và lệnh chi do FINANCE_MAKER lập, FINANCE_CHECKER duyệt; người lập khác người duyệt (BR-N28, DB có CHECK).
- **Realtime phòng đấu giá:** Spring WebSocket + STOMP ngay trong app BE, endpoint `/ws`, topic `/topic/auctions/{id}`. Server chỉ đẩy sau khi đã ghi DB; giờ và thứ tự giá theo DB (BR-C26, BR-C51).
- **RabbitMQ và Redis là tùy chọn ở pilot.** Tài liệu gốc có cả hai. Pilot chạy 1 instance BE: `OutboxRelayJob` đọc `outbox_events` rồi gọi listener trong cùng app, chống trùng bằng `processed_events`. Giữ interface `OutboxPublisher` để bật RabbitMQ (và Redis cho WebSocket) khi chạy nhiều instance mà không sửa nghiệp vụ.
- **FE: React + TypeScript, build bằng Vite trên Node.js.** Node.js (bản LTS, ghi trong `.nvmrc`) chỉ chạy công cụ: cài gói, dev server, build. Khi dev, Vite proxy `/api` và `/ws` sang Spring Boot (cổng 8080). Build ra file tĩnh, phục vụ bằng container Nginx; không có server Node khi chạy thật nên không cần lớp BFF.
- **Phạm vi pilot (BR-N36):** chỉ vật phẩm giao kiện (PARCEL) và giao tại chỗ (ONSITE). 23 action ngoài pilot (cột Pilot ở F.2), gồm cả A091, A092 vì BR-C71 đã chuyển Ngoài pilot. Feature ngoài pilot giữ trong sơ đồ nhưng không viết code, không map entity; bảng của chúng nằm trong `nexus_giai_doan_2.sql`, DB pilot không tạo. DB còn chặn bằng CHECK: `items.asset_type` chỉ MOVABLE, `items.custody_mode` chỉ NEXUS_WAREHOUSE.
- **Không lưu trùng (v4):** món thuộc hồ sơ nào đọc ở `request_items`; trạng thái KYC tổng đọc view `v_party_kyc_status` (map bằng entity chỉ đọc `@Immutable` hoặc query); việc giao của một món quyết toán lấy qua `fulfillment_cases.order_line_id`; hạn giữ hàng chỉ ở `checkouts.expires_at`; `asset_detail_revisions.detail_snapshot` chỉ chứa thuộc tính riêng của danh mục, không lặp cột của `movable_details`; `items.declared_owner_id` chỉ đổi cùng giao dịch ghi `ownership_events`.

**Job định kỳ** (Spring `@Scheduled`; nhịp là gợi ý, chỉnh khi test):

| Job                       | Feature                   | Việc làm (luật)                                                                                      | Nhịp gợi ý |
| ------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- | ---------- |
| `OutboxRelayJob`          | `platform/messaging`      | BR-C51: gửi event sau commit, chống trùng                                                            | 1 giây     |
| `CheckoutJob`             | `commerce/checkout`       | BR-N12: nhả hàng sau 15 phút                                                                         | 30 giây    |
| `AuctionCloseJob`         | `auction/result`          | BR-N16: chờ 3 phút, đếm 3 × 5 giây, đóng đúng giờ; đọc `idle_deadline_at` cùng khóa với lệnh đặt giá | 1 giây     |
| `OverduePaymentJob`       | `commerce/overdue`        | BR-N21, N22: hủy đơn quá hạn, gia hạn tối đa 24 giờ khi đang đối soát                                | 1 phút     |
| `NotificationJob`         | `governance/notification` | A067, BR-C52: gửi lại thông báo lỗi                                                                  | 1 phút     |
| `CaseSlaJob`              | `dispute/casemgmt`        | BR-N10: gắn nhãn vụ việc quá hạn, không chặn thao tác                                                | 15 phút    |
| `ConsignmentDeadlineJob`  | `consignment/request`     | BR-N05, N06: đóng hồ sơ quá hạn bổ sung, ẩn hồ sơ bị từ chối sau 3 ngày                              | 1 giờ      |
| `CarrierNoUpdateAlertJob` | `fulfillment/delivery`    | BR-N25: quá 3 ngày hãng chưa báo đã giao thì cảnh báo                                                | 1 giờ      |
| `ComplaintWindowJob`      | `fulfillment/completion`  | BR-N26: hết 7 ngày không có vụ việc thì hoàn tất                                                     | 1 giờ      |
| `DataRequestDeadlineJob`  | `governance/datarequest`  | BR-N34: nhắc hạn phản hồi và hạn hoàn tất                                                            | 1 giờ      |
| `RetentionJob`            | `governance/datarequest`  | BR-C53: xóa hoặc ẩn danh theo `retention_rules`, bỏ qua legal hold                                   | 1 ngày     |

**Giả định (cần xác nhận)**

- Package gốc `com.nexus`, build Maven: **TBD**.
- Vite + pnpm workspace: **đề xuất**; dùng npm workspaces cũng được nếu nhóm quen.
- Hãng vận chuyển (GHN, GHTK, Viettel Post…) và nhà cung cấp eKYC cho CCCD: **TBD**. Code gọi qua `CarrierClient` và `EkycProviderClient` nên đổi nhà cung cấp chỉ thay adapter.
- Quyền xem dữ liệu nhạy cảm và ma trận quyền chi tiết (Mục 3.1) triển khai ở `platform/security` + từng feature: cách mã hóa quyền **TBD**.

**Câu hỏi cho BA/mentor**

- P02 (modular monolith) đã được chủ dự án phê duyệt chưa? Nếu phải giữ microservices (Mục 10.2) thì cấu trúc này đổi thế nào?
- Có thể cung cấp **SRS 2.0** để đối chiếu nội dung chi tiết từng FR (mục F.1 mới có tên FR) không?
- Chương 16 còn các quyết định mở (mã L01–L09 và P01–P13) – quyết định nào ảnh hưởng ranh giới module (ví dụ cổng thanh toán, mô hình pháp lý đấu giá)?
- Danh sách bảng ở Phụ lục 2 do mình chia module – BA có đồng ý ranh giới sở hữu dữ liệu này không?

## I. VALIDATION CHECKLIST

| Câu hỏi kiểm tra                | Kết quả                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Có action nào chưa được ánh xạ? | Không: 98/98 action có đúng một module/feature BE (mục F.2); 23 action ngoài pilot.                                                                                                                                                                                                                                                           |
| Có yêu cầu SRS chưa ánh xạ?     | 57/60 FR trỏ tới feature. FR051, FR059, FR060 được Phụ lục A ghi "Chưa bật" và BR-N37 đã bỏ, không phải bỏ sót.                                                                                                                                                                                                                               |
| Feature trùng trách nhiệm?      | Không có action nào thuộc hai feature BE. Cần theo dõi: `inspectioncustody/verification` vs `inspection`, `fulfillment/plan` vs `completion`, `fulfillment/delivery` (giao qua hãng) vs `handover` (nhận tại kho, giao tại chỗ).                                                                                                              |
| Folder không cần thiết?         | Feature không có action riêng: asset/item, asset/commitment, asset/hold, governance/audit, governance/acknowledgment, finance/ledger, platform/carrier, consignment/charge, catalog/watchlist; đều có bảng hoặc tích hợp thật (xem E). Feature ngoài pilot không viết code trong Sprint pilot. 6 action chạy tự động nên không có thư mục FE. |
| Khớp DB v4?                     | 82/82 bảng pilot có đúng một module chủ (Phụ lục 2); 19 bảng giai đoạn 2 ghi riêng. Không còn entity cho `shipments`, `shipment_items`, `shipment_events`; 6 bảng mới ở v3 đã có entity; không entity nào dùng 4 cột đã bỏ ở v4.                                                                                                              |
| Khớp BR chuẩn?                  | 37/37 luật BR-N có nơi thực thi (mục J). Tham số đã chốt đọc từ `policy_versions`, không viết cứng.                                                                                                                                                                                                                                           |
| Phụ thuộc vòng?                 | Bản trước đã kiểm bằng script: **không có vòng** ở mức module. Phụ thuộc thêm ở bản sửa đều theo thứ tự ở mục H (fulfillment → inspectioncustody, inspectioncustody → consignment, dispute → inspectioncustody) hoặc qua event; `platform/carrier` chỉ phát event, không gọi module nghiệp vụ.                                                |
| Tên package hợp lệ?             | Có sau khi đổi `dispute/return` → `dispute/returns` (`return` là từ khóa Java) và `fulfillment/service` → `fulfillment/servicebooking`.                                                                                                                                                                                                       |
| Ranh giới FE và BE?             | FE chỉ gọi API, kiểm quyền cuối cùng ở BE (Mục 3.1: A/E phải là command phía server). Action chỉ BE: A033, A039, A043, A048, A067, A092.                                                                                                                                                                                                      |
| Phát triển song song?           | Nhóm 7 người: gợi ý 3 luồng (xem dưới). Tài liệu nói rõ không gán nhân sự, nên đây chỉ là gợi ý **[ĐX]**.                                                                                                                                                                                                                                     |

**Gợi ý luồng song song [ĐX]:** (1) platform (gồm carrier) + iam + governance + taxonomy; (2) asset + consignment + inspectioncustody + catalog; (3) commerce + auction + finance; sau đó fulfillment (delivery, completion) + dispute + reporting. FE: 1–2 người cho customer, 1–2 người cho operations, theo mã màn ghi ở mục D.

## J. ĐỐI CHIẾU BR-N → NƠI THỰC THI

Mỗi luật mới (BR-N) có feature BE chịu trách nhiệm và màn FE thể hiện. Luật BR-C xem cột "Màn hình" và "DB thực thi" trong bộ BR chuẩn.

| Luật   | Nội dung ngắn                                                       | BE thực thi                                                                                                     | FE / màn                                                       |
| ------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| BR-N01 | KYC theo mức rủi ro; mua ngay chỉ cần email, đấu giá cần KYC        | `iam/identity` (`citizen_id_verifications`), `auction/participation`                                            | customer/kyc, customer/account (C4a), P1a, ops/iam-admin (A2c) |
| BR-N02 | MFA khi đăng ký phiên và khai tài khoản nhận tiền                   | `iam/auth`, `platform/security` (MFA gate)                                                                      | customer/auctions (P1a), customer/account, ops/iam-admin (A2b) |
| BR-N03 | Sai 5 lần khóa 15 phút; 3 lần/24 giờ thì liên hệ CSKH               | `iam/auth` (`LoginLockService`, tham số LOGIN_LOCK)                                                             | customer/auth, ops/iam-admin (A2a)                             |
| BR-N04 | Chấp thuận hợp đồng trên app bằng OTP                               | `consignment/agreement`, `governance/acknowledgment`                                                            | customer/consignment (C4g)                                     |
| BR-N05 | Hạn bổ sung hồ sơ 10 ngày, quá hạn tự đóng                          | `consignment/request` (`ConsignmentDeadlineJob`)                                                                | C4h, C4e, ops/intake (A3b)                                     |
| BR-N06 | Kết quả xét theo từng món; hồ sơ bị từ chối ẩn sau 3 ngày           | `consignment/authority`, `ConsignmentDeadlineJob`                                                               | C4e, C4f, A3b                                                  |
| BR-N07 | Hàng không đạt: chủ hàng chịu phí kiểm định và gửi trả              | `inspectioncustody/inspection` → `consignment/charge`; vận đơn trả qua `platform/carrier`                       | C4f, A3b                                                       |
| BR-N08 | Hợp đồng 60 ngày; phí rút trước hạn                                 | `consignment/agreement`, `consignment/withdrawal`, `consignment/charge`                                         | C4f, C4g                                                       |
| BR-N09 | Luồng đăng bài: soạn → duyệt (người khác) → lên kệ hoặc về Nháp     | `catalog/listing`                                                                                               | ops/listing (A4a, A4b), ops/auction-ops (A4c)                  |
| BR-N10 | SLA nội bộ, quá hạn chỉ cảnh báo                                    | `dispute/casemgmt` (`CaseSlaJob`), `reporting/ops`; tham số INTERNAL_SLA, CASE_SLA                              | A1, A3a, A4b, A5b                                              |
| BR-N11 | Mua nguyên lot; mỗi lần checkout một món                            | `commerce/cart`, `commerce/checkout`                                                                            | M1, M2                                                         |
| BR-N12 | Checkout giữ hàng 15 phút, cảnh báo còn 2 phút                      | `commerce/checkout` (`CheckoutJob`)                                                                             | M3                                                             |
| BR-N13 | Đình chỉ bài thì hủy checkout đang mở                               | `catalog/listing` phát `ListingSuspended` → `commerce/checkout`                                                 | M3                                                             |
| BR-N14 | Không giá sàn ẩn                                                    | `auction/schedule`, `auction/result`                                                                            | C1, C2, P4                                                     |
| BR-N15 | Đặt giá theo hệ số bước x1/x2/x5                                    | `auction/bidding`                                                                                               | C2, P2                                                         |
| BR-N16 | Đóng phiên: chờ 3 phút, đếm 3 × 5 giây, đóng đúng giờ               | `auction/result` (`AuctionCloseJob`), `auction/bidding` (realtime)                                              | C2, A4c                                                        |
| BR-N17 | Đăng ký phiên tự duyệt                                              | `auction/participation`                                                                                         | P1a, P1b, C1                                                   |
| BR-N18 | Loại người tham gia giữa phiên, đánh dấu giá không hợp lệ           | `auction/bidding` (`bid_invalidations`)                                                                         | C2, C4b, A4c                                                   |
| BR-N19 | Giữ kết quả nghi vấn trước khi tạo đơn                              | `auction/result`                                                                                                | A4c, C1                                                        |
| BR-N20 | Bỏ thanh toán 2 lần thì hạn chế đặt giá 30 ngày                     | `commerce/overdue` → `auction/participation` (`bidding_restrictions`)                                           | C1, A2a                                                        |
| BR-N21 | Hạn thanh toán: đấu giá 24 giờ, mua ngay 30 phút                    | `commerce/order`, `commerce/overdue` (`OverduePaymentJob`)                                                      | P3, C3a, M3, C4d                                               |
| BR-N22 | Gia hạn tối đa 24 giờ khi đang đối soát                             | `commerce/overdue`, `finance/reconciliation`                                                                    | C3a, C4d, A5a                                                  |
| BR-N23 | Không có phí người mua; phí vận chuyển theo báo giá hãng            | `commerce/order` (`order_charges`), `platform/carrier` (báo giá)                                                | C3a, M3                                                        |
| BR-N24 | Chọn giao tận nơi hoặc nhận tại kho lúc thanh toán                  | `commerce/order`, `platform/carrier`                                                                            | C3a, M3                                                        |
| BR-N25 | Giao qua hãng; quá 3 ngày chưa giao thì cảnh báo                    | `fulfillment/delivery` (`CarrierNoUpdateAlertJob`), `platform/carrier`                                          | C3b, A5a                                                       |
| BR-N26 | Khiếu nại trong 7 ngày, hết hạn tự hoàn tất                         | `fulfillment/completion` (`ComplaintWindowJob`)                                                                 | C3b, C4d                                                       |
| BR-N27 | Hủy đơn có xét, người lập khác người duyệt                          | `commerce/order`, `finance/refund`                                                                              | C3b, A5b                                                       |
| BR-N28 | Hai lớp duyệt: Trưởng ca cho vụ việc, Maker/Checker cho tiền        | `dispute/decision`, `finance/refund`, `finance/payout`                                                          | A5b, A5a (tab Chi tiền chủ hàng), A2b                          |
| BR-N29 | 7 loại vụ việc, 4 loại hold                                         | `dispute/casemgmt`, `asset/hold`                                                                                | A5b, A3b                                                       |
| BR-N30 | Hàng hỏng, mất trong kho mở vụ việc                                 | `dispute/casemgmt` (STORAGE_DAMAGE)                                                                             | C4f, A5b                                                       |
| BR-N31 | Biểu phí mẫu (hoa hồng 10%, kiểm định 300.000 đ)                    | `consignment/agreement` đọc FEE_SCHEDULE_SAMPLE                                                                 | C5-4, C4g, C4f                                                 |
| BR-N32 | Kênh thông báo; loại bắt buộc không tắt được                        | `governance/notification` (`notification_preferences`)                                                          | customer/notifications (C4i)                                   |
| BR-N33 | Watchlist                                                           | `catalog/watchlist`                                                                                             | customer/watchlist (C4c), C1, M1                               |
| BR-N34 | Yêu cầu dữ liệu cá nhân: 2 ngày làm việc, 10/20 ngày, gia hạn 1 lần | `governance/datarequest` (`DataRequestDeadlineJob`)                                                             | customer/privacy (C4j), ops/governance                         |
| BR-N35 | Bộ trạng thái bổ sung (rút, hủy đơn, checkout, người tham gia)      | `consignment/withdrawal`, `commerce/order`, `commerce/checkout`, `auction/participation` (enum Java khớp CHECK) | M3, P1b, C4f, C3b                                              |
| BR-N36 | Pilot chỉ PARCEL và ONSITE                                          | `taxonomy/policy`, `taxonomy/profile`                                                                           | C5-1                                                           |
| BR-N37 | Bỏ uy tín đối tác, khuyến mãi, đánh giá sản phẩm                    | không có feature                                                                                                | C3b, C4d (không có nút đánh giá)                               |

## K. NHẬT KÝ SỬA (14/10/2026)

Những chỗ bản trước chưa hợp lý hoặc đã cũ so với BR chuẩn, DB v4 và UI, và cách đã sửa.

| #   | Bản trước                                                                                                                            | Đã sửa thành                                                                                                                                                                                                         | Lý do / căn cứ                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | Module `inspectioncustody/shipment` có 3 entity Shipment, ShipmentItem, ShipmentEvent                                                | Bỏ; thêm `platform/carrier` và `fulfillment/delivery`; A015 sang `consignment/request`                                                                                                                               | Team chốt giao qua API hãng; DB v3 đã xóa 3 bảng này                               |
| 2   | "98 bảng"; thiếu entity cho bảng mới                                                                                                 | 101 bảng ở v3 (v4: 82 bảng pilot + 19 bảng giai đoạn 2); thêm entity cho `citizen_id_verifications`, `watchlist_items`, `notification_preferences`, `bidding_restrictions`, `bid_invalidations`, `consignor_charges` | DB v3                                                                              |
| 3   | "76 business rules"                                                                                                                  | 113 luật (76 BR-C + 37 BR-N); thêm mục J                                                                                                                                                                             | Bộ BR chuẩn                                                                        |
| 4   | Package `dispute/return`                                                                                                             | `dispute/returns`                                                                                                                                                                                                    | `return` là từ khóa Java, package `com.nexus.dispute.return` không biên dịch được  |
| 5   | Package `fulfillment/service` chứa thư mục `service/`                                                                                | `fulfillment/servicebooking`                                                                                                                                                                                         | Tránh `fulfillment.service.service` khó đọc                                        |
| 6   | DTO `WithdrawalRequest.java` trùng tên entity `WithdrawalRequest.java`                                                               | DTO đổi thành `CreateWithdrawalRequest.java`                                                                                                                                                                         | Service dùng cả hai, trùng tên phải viết tên đầy đủ package                        |
| 7   | Flyway chia 4 file theo module (V001…V030), không khớp file DB đang có                                                               | `V1__schema_v4.sql` + `V2__seed_v4.sql`                                                                                                                                                                              | Khóa ngoại đi chéo module; schema v4 đã kiểm chạy được nguyên file                 |
| 8   | Không có job đóng phiên, job hạn thanh toán, hạn khiếu nại…                                                                          | Bảng 11 job ở mục H, có trong cây BE                                                                                                                                                                                 | BR-N05, N06, N10, N12, N16, N21, N22, N25, N26, N34, BR-C53                        |
| 9   | `ownership_events` ở `consignment/authority`                                                                                         | Chuyển sang `asset/item`                                                                                                                                                                                             | Là lịch sử của món, ghi từ nhiều luồng (khai chủ khi ký gửi, chuyển quyền khi bán) |
| 10  | `LotCapacityRequirement` ở `asset/lot`                                                                                               | Chuyển sang `asset/capacity`, đánh dấu ngoài pilot                                                                                                                                                                   | Gom phần ngoài pilot vào một feature                                               |
| 11  | Không phân biệt phạm vi pilot; còn câu hỏi "Pilot bật nhóm hàng nào?"                                                                | Thêm cột Pilot ở E và F.2; đánh dấu feature ngoài pilot                                                                                                                                                              | BR-N36 (cả hàng cồng kềnh A089 cũng ngoài pilot)                                   |
| 12  | "Nội dung FR là TBD", "FR051 nguy cơ bỏ sót", "57 mã FR001–FR058"                                                                    | Thêm tên 60 FR; FR051, FR059, FR060 là phần bỏ có chủ đích                                                                                                                                                           | Phụ lục A của báo cáo; BR-N37                                                      |
| 13  | FE "Giả định React + TS + Vite", chưa nói Node.js                                                                                    | Ghi rõ Node.js LTS chỉ cho công cụ; thêm `.nvmrc`, `package.json` từng app/package, `.env.example`, proxy dev                                                                                                        | Công nghệ team dùng                                                                |
| 14  | FE thiếu feature cho màn đã vẽ                                                                                                       | Thêm `kyc`, `watchlist`, `notifications`, `privacy`; ghi mã màn cho mọi feature                                                                                                                                      | Canvas "Nexus – UI"                                                                |
| 15  | Câu hỏi realtime; RabbitMQ, Redis bắt buộc                                                                                           | STOMP trong app BE; RabbitMQ, Redis tùy chọn khi chạy nhiều instance                                                                                                                                                 | Pilot 1 instance; BR-C51                                                           |
| 16  | `item_holds` mô tả "publication, bid, shipment hoặc settlement"                                                                      | 4 loại: SALE, HANDOVER, PAYOUT, LEGAL                                                                                                                                                                                | DB v3, BR-N29                                                                      |
| 17  | Thiết kế 101 bảng cho pilot, gồm cả phần không dùng                                                                                  | DB v4: 82 bảng pilot; 19 bảng (ngoài pilot, bộ hàng nhiều thành phần, mốc giao chi tiết) sang `nexus_giai_doan_2.sql`; A091, A092 thành ngoài pilot                                                                  | Góp ý thu gọn ngày 14/10; BR-C71 chuyển Ngoài pilot                                |
| 18  | 4 cột lưu trùng: `items.request_id`, `parties.verification_status`, `settlements.fulfillment_case_id`, `item_commitments.expires_at` | Bỏ ở v4; thêm view `v_party_kyc_status` và CHECK trạng thái KYC                                                                                                                                                      | Tránh hai nguồn dữ liệu lệch nhau                                                  |
| 19  | Không nói ai duyệt quyết định vụ việc, hoàn, chi                                                                                     | Trưởng ca; Finance Maker/Checker                                                                                                                                                                                     | BR-N28                                                                             |

## Phương án khuyến nghị duy nhất

**Modular monolith (Spring Boot) gồm `platform` + 13 module nghiệp vụ, hai app React (customer, operations) build bằng Vite trên Node.js, feature độc lập và `packages/` dùng chung; DB PostgreSQL theo schema v4 (82 bảng pilot) qua Flyway; giao hàng qua API hãng vận chuyển.** Chọn vì khớp P02 của tài liệu, giữ được transaction bảo vệ bán trùng và tiền, không vòng phụ thuộc, khớp 113 luật và DB v4 đã chốt, và chia được cho nhóm. Cần xác nhận P02 và các câu hỏi ở mục H trước khi implementation.

## Phụ lục 1. Số liệu từ tài liệu

Actions theo nhóm: 01 Truy cập, tài khoản và danh tính: 7; 02 Ký gửi và quyền bán: 11; 03 Kho và kiểm định: 7; 04 Công bố và định giá: 4; 05 Mua ngay và đơn: 6; 06 Đấu giá: 11; 07 Thu, hoàn, quyết toán và chi: 10; 08 Giao hàng, hậu mãi và kiểm soát: 12; 09 Danh mục mở rộng và hoàn tất theo loại tài sản: 30.

## Phụ lục 2. Bảng thuộc module nào (DB v4: 82 bảng pilot + 19 bảng giai đoạn 2)

So với bản trước: bỏ `shipments`, `shipment_items`, `shipment_events`; thêm 6 bảng (v3); `ownership_events` chuyển từ consignment sang asset; 19 bảng không dùng trong pilot tách sang giai đoạn 2 (v4).

| Module                    | Bảng (mô tả ngắn, lấy từ chú thích trong `nexus_v4.dbml`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **platform** (4)          | `documents`: Kho tệp dùng chung: ảnh, giấy tờ, hợp đồng, báo cáo. Lưu đường dẫn tệp, mã kiểm tra, đã quét mã độc chưa, mức độ riêng tư; `idempotency_records`: Ghi nhớ các yêu cầu đã xử lý, để khi người dùng bấm hai lần hoặc mạng gửi lại thì hệ thống không làm hai lần; `outbox_events`: Hàng đợi sự kiện chờ gửi đi (thông báo, cập nhật màn hình), được ghi cùng lúc với nghiệp vụ để không bị mất; `processed_events`: Danh sách sự kiện mỗi dịch vụ đã xử lý, để không xử lý trùng                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **iam** (10)              | `users`: Tài khoản đăng nhập: email, mật khẩu (đã băm), bật xác thực 2 lớp chưa, đang bị khóa đến khi nào. Mỗi khách hàng hoặc nhân viên có một dòng; `parties`: Hồ sơ của một người hoặc tổ chức tham gia giao dịch: người mua, chủ hàng, chuyên gia, hãng vận chuyển. Tách khỏi users vì có bên không cần đăng nhập. Trạng thái KYC không lưu ở đây, xem view v_party_kyc_status; `roles`: Danh sách vai trò, ví dụ Người mua, Chủ hàng, Finance Checker, Trưởng ca; `user_roles`: Ai đang giữ vai trò nào, ai cấp, hiệu lực từ ngày nào đến ngày nào; `identity_checks`: Một hồ sơ KYC của một người cho một mục đích (đấu giá, nhận tiền): trạng thái, ai duyệt, hết hạn khi nào. Chỉ chuyển PASSED khi có một lần xác thực CCCD PASSED; `citizen_id_verifications`: Từng lần xác thực căn cước công dân trong một lần KYC: cách làm (chụp thẻ và khuôn mặt, đọc chip, VNeID) và kết quả. Không lưu số CCCD dạng đọc được; mỗi CCCD chỉ gắn với một tài khoản đang hiệu lực; `addresses`: Sổ địa chỉ nhận hàng của khách, đã mã hóa; `bank_accounts`: Tài khoản ngân hàng nhận tiền của chủ hàng. Phải được xác minh trước khi Nexus chi tiền vào; `user_sessions`: Các phiên đăng nhập đang mở. Dùng để đăng xuất từ xa hoặc thu hồi phiên khi đổi mật khẩu; `security_credentials`: Phương thức xác thực 2 lớp của tài khoản, ví dụ ứng dụng tạo mã OTP |
| **governance** (7)        | `policy_versions`: Các bộ quy định và tham số theo phiên bản (thời hạn, phí, SLA...). Code đọc tham số ở đây thay vì viết cứng; `acknowledgments`: Bằng chứng người dùng đã bấm đồng ý: đồng ý điều khoản, hợp đồng hay quy chế nào, phiên bản nào, lúc nào; `audit_events`: Nhật ký ai làm gì, lúc nào, trên dữ liệu nào. Dùng để tra lại và làm bằng chứng; `data_requests`: Yêu cầu tải bản sao, sửa hoặc xóa dữ liệu cá nhân của khách: hạn phản hồi 2 ngày làm việc, hạn hoàn tất 10 hoặc 20 ngày, gia hạn một lần; `retention_rules`: Mỗi loại dữ liệu được giữ bao lâu và hết hạn thì xử lý thế nào (xóa hay ẩn danh); `notification_deliveries`: Từng thông báo đã gửi qua email, trong app hoặc SMS: gửi được chưa, khách đã đọc chưa; `notification_preferences`: Khách bật hay tắt loại thông báo nào trên kênh nào. Thông báo bắt buộc không nằm ở đây nên không tắt được                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **taxonomy** (4)          | `categories`: Cây danh mục hàng hóa để khách tìm kiếm, ví dụ Đồng hồ > Đồng hồ cơ; `product_models`: Danh mục mẫu sản phẩm (hãng, dòng, mã tham chiếu) để mô tả các món cho thống nhất; `category_policies`: Quy định của từng danh mục theo phiên bản: được bán loại tài sản nào, cần kiểm định gì, được giao theo cách nào; `fulfillment_profiles`: Kiểu bàn giao. Pilot chỉ có 2 dòng cố định: PARCEL (giao qua hãng vận chuyển) và ONSITE (nhận tại kho). Cột JSON chỉ mô tả các bước, code không đọc để chạy quy trình                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **asset** (8)             | `items`: Mỗi món hàng Nexus nhận ký gửi: mã món, số lượng, đang nằm ở đâu, ai đang được khai là chủ. Pilot chỉ có vật phẩm (MOVABLE) giữ tại kho; một bộ hàng là một món. Món thuộc hồ sơ nào xem ở request_items; `item_identifiers`: Số định danh của món như số serial, số máy. Lưu mã hóa, chỉ hiện ra một phần; `ownership_events`: Nhật ký thay đổi quyền sở hữu của món, ví dụ khi bán xong và chuyển sang người mua; `item_commitments`: Món đang được giữ cho việc gì: một checkout, một phiên đấu giá hay một đơn hàng. Mỗi món chỉ có một cam kết còn hiệu lực. Hạn giữ lấy từ bảng gốc (checkouts.expires_at), không lưu lại ở đây; `item_holds`: Lệnh tạm chặn trên một món: chặn bán, chặn giao, chặn chi tiền hoặc giữ vì lý do pháp lý. Một món có thể bị nhiều lệnh cùng lúc; `asset_detail_revisions`: Bản mô tả chi tiết của món theo từng phiên bản. Sửa mô tả thì tạo bản mới, không ghi đè bản cũ; `movable_details`: Thông tin riêng của vật phẩm thường: cân nặng, kích thước, tình trạng, lưu ý khi vận chuyển; `asset_right_holders`: Những người cùng có quyền với món (đồng sở hữu) và văn bản đồng ý cho bán của họ                                                                                                                                                                                                              |
| **consignment** (9)       | `consignment_requests`: Hồ sơ ký gửi chủ hàng gửi lên: đang xét tới đâu, nhân viên phụ trách, hạn bổ sung giấy tờ, mã vận đơn khi gửi hàng về kho; `request_items`: Từng món trong một hồ sơ ký gửi, người khai là chủ trong hồ sơ đó và kết quả xét riêng của món: đạt, không đạt hay cần bổ sung. Một món có thể xuất hiện ở nhiều hồ sơ (gửi lại sau khi rút, hoặc người mua ký gửi lại); `request_documents`: Giấy tờ chủ hàng nộp kèm hồ sơ (hóa đơn, phiếu bảo hành...) và kết quả kiểm tra từng giấy; `authority_reviews`: Kết quả xét quyền bán: người gửi có đúng là chủ, hoặc được ủy quyền bán món này, hay không; `agreements`: Hợp đồng ký gửi giữa Nexus và chủ hàng. Trỏ tới phiên bản hợp đồng đang có hiệu lực; `agreement_versions`: Mỗi lần sửa hợp đồng là một phiên bản mới: thời hạn, hoa hồng, phí, lúc chủ hàng chấp thuận bằng OTP; `agreement_items`: Món nào nằm trong hợp đồng nào, bán theo cách nào (mua ngay hay đấu giá) và giá chủ hàng đã chốt; `withdrawal_requests`: Yêu cầu rút hàng của chủ hàng: được duyệt hay bị từ chối, mã vận đơn khi gửi trả hàng; `consignor_charges`: Các khoản phí thu của chủ hàng khi không có giao dịch bán: phí kiểm định món không đạt, phí rút trước hạn, phí gửi trả                                                                                                                   |
| **inspectioncustody** (5) | `locations`: Danh sách kho, kệ, khu vực nơi Nexus cất giữ hàng; `custody_events`: Nhật ký giữ hàng: ai giao cho ai, chuyển từ đâu đến đâu, tình trạng lúc giao. Chỉ thêm dòng mới, không sửa; `inspection_cases`: Một lần đưa món đi kiểm định: lý do, chuyên gia phụ trách, trạng thái; `inspection_reports`: Báo cáo kiểm định: thật, không phải hàng thật hay chưa đủ căn cứ, tình trạng, giới hạn của lần kiểm định. Báo cáo đã chốt không được sửa, chỉ tạo bản mới; `verification_reviews`: Kết quả xác minh từng mặt của món ngoài chuyện thật giả, ví dụ giấy tờ, quyền bán, hiện trạng                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **catalog** (4)           | `listings`: Bài đăng bán của một món (mỗi món một bài) và phiên bản nội dung đang hiển thị; `listing_revisions`: Từng phiên bản nội dung bài đăng: ai soạn, ai duyệt hay trả về Nháp, lúc lên kệ. Người duyệt phải khác người soạn; `listing_verifications`: Bài đăng đã dựa trên những kết quả xác minh nào để đủ điều kiện lên kệ; `watchlist_items`: Bài đăng khách đang theo dõi. Bỏ theo dõi thì ghi lại thời điểm bỏ, không xóa dòng                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **commerce** (6)          | `carts`: Giỏ hàng của khách, kể cả khách chưa đăng nhập. Bỏ vào giỏ không có nghĩa là đã giữ hàng; `cart_items`: Các bài đăng đang nằm trong giỏ hàng; `checkouts`: Một lần bấm "Thanh toán món này" ở mua ngay: giữ hàng 15 phút, chốt giá, phí và địa chỉ nhận; `orders`: Đơn hàng sinh ra từ mua ngay hoặc từ kết quả đấu giá: tổng tiền, hạn thanh toán, thời gian chờ đối soát, lý do hủy nếu có; `order_lines`: Món trong đơn kèm bản chụp thông tin lúc bán (mô tả, giá, cách giao), để sau này dữ liệu mới không làm đổi đơn cũ; `order_charges`: Các khoản cộng thêm vào đơn ngoài giá hàng, ví dụ phí vận chuyển theo báo giá của hãng                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **auction** (7)           | `auction_rule_versions`: Quy chế đấu giá theo phiên bản: bước giá tối thiểu, chờ 3 phút, đếm 3 lần mỗi lần 5 giây, hạn thanh toán 24 giờ; `auctions`: Mỗi phiên đấu giá: món nào, giờ mở, giờ đóng, giá khởi điểm, lúc kết thúc và lý do (đúng giờ, chốt sớm hay hủy); `auction_participants`: Người đã đăng ký vào một phiên: đã KYC chưa, được duyệt chưa, đã đồng ý quy chế phiên bản nào; `bids`: Từng lần đặt giá, đánh số thứ tự theo máy chủ để biết ai đặt trước. Không bao giờ xóa; `bid_invalidations`: Giá bị đánh dấu không hợp lệ, ví dụ người đặt bị loại giữa phiên. Giá gốc vẫn còn trong bảng bids; `auction_results`: Kết quả phiên: có người thắng hay không có ai đặt giá. Sửa kết quả thì tạo bản mới thay thế, không sửa bản cũ; `bidding_restrictions`: Lệnh cấm một người đăng ký phiên mới trong một thời gian, ví dụ 30 ngày sau 2 lần thắng mà bỏ thanh toán                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **finance** (11)          | `payment_attempts`: Mỗi lần khách trả tiền qua cổng thanh toán và kết quả: thành công, thất bại hay chưa rõ; `provider_events`: Thông báo cổng thanh toán gửi về (webhook), đã kiểm tra chữ ký. Dùng để xác nhận Nexus đã nhận tiền; `refunds`: Lệnh hoàn tiền cho người mua: lý do, ai lập, ai duyệt (phải khác người lập), kết quả từ cổng thanh toán; `settlements`: Bảng quyết toán cho chủ hàng của một món đã bán: tổng tiền, số chủ hàng được nhận, đủ điều kiện chi từ khi nào; `settlement_lines`: Chi tiết từng dòng của quyết toán: giá bán, trừ hoa hồng, trừ phí kiểm định; `payouts`: Lệnh chi tiền cho chủ hàng: chi vào tài khoản nào, Finance Maker lập, Finance Checker duyệt, ngân hàng đã chi chưa; `ledger_accounts`: Danh sách tài khoản trong sổ tiền nội bộ, ví dụ tiền thu hộ, doanh thu phí, tiền phải trả chủ hàng; `ledger_transactions`: Mỗi nghiệp vụ tiền (thu, hoàn, chi, điều chỉnh) là một giao dịch sổ, có khóa riêng để không bị ghi trùng; `ledger_entries`: Các dòng ghi nợ, ghi có của một giao dịch sổ. Tổng nợ luôn bằng tổng có; `reconciliation_items`: Kết quả đối chiếu số tiền hệ thống ghi với sao kê ngân hàng hoặc cổng thanh toán, và cách xử lý khi lệch; `recovery_claims`: Khoản tiền cần thu hồi sau khi đã chi, ví dụ chủ hàng phải trả lại khi phát hiện hàng giả                                     |
| **fulfillment** (3)       | `fulfillment_cases`: Việc giao một món của đơn: mã vận đơn và trạng thái lấy từ API của hãng, lúc hãng lấy hàng, lúc hãng báo đã giao, hạn khiếu nại 7 ngày. Các mốc giao nằm ở các cột này; không có bảng giao hàng nội bộ; `handover_appointments`: Lịch hẹn nhận hàng tại kho hoặc giao tại chỗ: thời gian, địa điểm, người liên hệ; `handover_records`: Biên bản bàn giao trực tiếp: ai giao, ai nhận, lúc nào, có chữ ký                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **dispute** (4)           | `dispute_cases`: Vụ việc hoặc khiếu nại, gồm 7 loại: hàng giả hoặc kém chất lượng, sai món, vận chuyển, thanh toán, quyền sở hữu, sự cố phiên, hỏng hoặc mất trong kho. Có người phụ trách và hạn xử lý; `case_evidence`: Bằng chứng đính kèm vụ việc (ảnh, video, báo cáo) và ai đã nộp; `case_decisions`: Quyết định xử lý vụ việc theo phiên bản: hướng xử lý, người đề xuất và người duyệt (phải khác nhau); `return_authorizations`: Phiếu cho phép người mua trả hàng: gửi trả qua hãng nào, mã vận đơn, kết quả kiểm tra khi hàng về kho                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **reporting** (0)         | Không sở hữu bảng nghiệp vụ; chỉ đọc qua `api` của module khác.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Giai đoạn 2** (19)      | `real_estate_details` (asset); `vehicle_details` (asset); `event_offerings` (asset); `service_offerings` (asset); `digital_right_details` (asset); `capacity_pools` (asset); `lot_capacity_requirements` (asset); `capacity_reservations` (asset); `sale_lot_components` (asset); `component_allocations` (asset); `payment_obligations` (finance); `obligation_payment_allocations` (finance); `fulfillment_milestones` (fulfillment); `fulfillment_evidence` (fulfillment); `transfer_cases` (fulfillment); `entitlements` (fulfillment); `entitlement_events` (fulfillment); `service_bookings` (fulfillment); `service_acceptances` (fulfillment). Có trong `nexus_giai_doan_2.sql`, không tạo trong pilot.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
