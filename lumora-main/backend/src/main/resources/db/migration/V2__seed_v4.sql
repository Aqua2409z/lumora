-- =====================================================================
-- NEXUS – Dữ liệu cấu hình v4 (14/10/2026)
-- Chạy SAU nexus_schema_v4.sql (hoặc sau nexus_migration_v4.sql). Chạy lại nhiều lần không bị trùng.
-- Gồm: 1 tài khoản hệ thống, 15 vai trò, 11 bộ tham số đã chốt, 10 dòng thời hạn lưu, 2 kiểu bàn giao.
-- Số liệu lấy từ bộ BR chuẩn ("Nexus — Đặc tả Business Rules (bản chuẩn)").
-- Hoa hồng 10% và phí kiểm định 300.000 đ là SỐ LIỆU MẪU (Q-17), thay khi có biểu phí thật.
-- =====================================================================

BEGIN;

-- 1. Tài khoản hệ thống: chỉ để ký các bản cấu hình mặc định, không đăng nhập được (không có mật khẩu)
INSERT INTO users (id, email_normalized, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'system@nexus.local', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 2. Vai trò (ACT trong tài liệu gốc + Trưởng ca theo Q-36)
INSERT INTO roles (code, description) VALUES
  ('BUYER',             'ACT02 – Người mua, người đặt giá'),
  ('CONSIGNOR',         'ACT03 – Chủ hàng ký gửi'),
  ('INTAKE_OFFICER',    'ACT04 – Tiếp nhận ký gửi; duyệt tay CCCD ở trạng thái NEEDS_REVIEW'),
  ('AUTHENTICATOR',     'ACT05 – Chuyên gia kiểm định'),
  ('CATALOG_PUBLISHER', 'ACT06 – Quản lý danh mục, duyệt công bố'),
  ('CUSTODY',           'ACT07 – Kho và điều phối bàn giao'),
  ('AUCTION_OPS',       'ACT08 – Vận hành đấu giá'),
  ('FINANCE_MAKER',     'ACT09 – Tài chính lập lệnh hoàn, lệnh chi'),
  ('FINANCE_CHECKER',   'ACT10 – Tài chính duyệt lệnh hoàn, lệnh chi (khác người lập)'),
  ('SUPPORT_CASE',      'ACT11 – Chăm sóc khách hàng và vụ việc'),
  ('LEGAL_DATA',        'ACT12 – Pháp lý và bảo vệ dữ liệu'),
  ('ADMIN_SECURITY',    'ACT13 – Quản trị và an toàn'),
  ('SYSTEM_WORKER',     'ACT15 – Tác vụ tự động'),
  ('ASSET_TRANSFER',    'ACT16 – Chuyên viên tài sản và chuyển quyền (ngoài pilot)'),
  ('SHIFT_LEAD',        'Trưởng ca – duyệt quyết định vụ việc một cấp, khác người đề xuất (Q-36, BR-N28)')
ON CONFLICT (code) DO NOTHING;

-- 3. Bộ tham số đã chốt (policy_versions.content là JSON; code đọc từ đây, không viết cứng)
INSERT INTO policy_versions (code, version_no, content, effective_from, approved_by)
SELECT v.code, 1, v.content::jsonb, timestamptz '2026-10-14 00:00:00+07', '00000000-0000-0000-0000-000000000001'
FROM (VALUES
  ('LOGIN_LOCK',            '{"max_failed": 5, "lock_minutes": 15, "locks_before_support": 3, "window_hours": 24, "rule": "BR-N03"}'),
  ('CONSIGNMENT',           '{"term_days": 60, "info_due_days": 10, "rejected_hide_days": 3, "early_withdrawal": {"bps": 500, "min_vnd": 300000}, "rule": "BR-N05, N06, N08"}'),
  ('INTERNAL_SLA',          '{"consignment_review_hours": 24, "listing_review_hours": 4, "overdue_blocks_action": false, "rule": "BR-N10"}'),
  ('CASE_SLA',              '{"unit": "working_day", "COUNTERFEIT_QUALITY": 3, "WRONG_OR_MISSING": 3, "CARRIER_SERVICE": 5, "PAYMENT": 1, "OWNERSHIP": 7, "AUCTION_INCIDENT": 1, "STORAGE_DAMAGE": 7, "rule": "BR-N10, N29"}'),
  ('CHECKOUT_PAYMENT',      '{"checkout_hold_minutes": 15, "checkout_warn_minutes": 2, "buy_now_pay_minutes": 30, "auction_pay_hours": 24, "payment_review_max_hours": 24, "buyer_premium_bps": 0, "rule": "BR-N12, N21, N22, N23"}'),
  ('AUCTION_CLOSE',         '{"idle_close_s": 180, "countdown_steps": 3, "countdown_step_s": 5, "bid_multipliers": [1, 2, 5], "confirm_above_multiplier": 20, "rule": "BR-N15, N16"}'),
  ('BIDDING_RESTRICTION',   '{"abandon_count": 2, "window_months": 12, "restrict_days": 30, "rule": "BR-N20"}'),
  ('DELIVERY_COMPLAINT',    '{"complaint_days": 7, "carrier_no_update_alert_days": 3, "counterfeit_claim_any_time": true, "rule": "BR-N25, N26"}'),
  ('DATA_REQUEST_DEADLINE', '{"ack_working_days": 2, "complete_days": {"EXPORT": 10, "RECTIFY": 10, "ERASE": 20}, "max_extensions": 1, "extension_max_days": {"EXPORT": 10, "RECTIFY": 10, "ERASE": 20}, "basis": "Điều 5 Nghị định 356/2025/NĐ-CP", "rule": "BR-N34"}'),
  ('FEE_SCHEDULE_SAMPLE',   '{"sample": true, "commission_bps": 1000, "inspection_fee_vnd": 300000, "rule": "BR-N31"}'),
  ('DATA_RETENTION',        '{"note": "Thời hạn lưu chốt ngày 14/10, chi tiết ở bảng retention_rules", "rule": "BR-C53"}')
) AS v(code, content)
ON CONFLICT (code, version_no) DO NOTHING;

-- 4. Thời hạn lưu (BR-C53). duration_days NULL = xóa khi khách yêu cầu hoặc khi đóng tài khoản.
--    Legal hold luôn chặn xóa (BR-C53); job xóa phải kiểm tra item_holds/legal hold trước.
INSERT INTO retention_rules (record_class, policy_version_id, trigger_event, duration_days, disposal_method, legal_basis_note)
SELECT r.record_class, p.id, r.trigger_event, r.duration_days, r.disposal_method, r.note
FROM policy_versions p
JOIN (VALUES
  ('FINANCIAL_RECORDS',     'TRANSACTION_CLOSED', 3650, 'DELETE',    'Đơn hàng, thanh toán, hoàn, chi, sổ tiền, quyết toán: 10 năm (Điều 13 Nghị định 174/2016/NĐ-CP)'),
  ('CONSIGNMENT_CONTRACTS', 'AGREEMENT_ENDED',    3650, 'DELETE',    'Hợp đồng ký gửi, biên bản bàn giao, báo cáo kiểm định: căn cứ của khoản tiền, giữ cùng thời hạn 10 năm'),
  ('AUCTION_RECORDS',       'AUCTION_CLOSED',     1825, 'DELETE',    'Giá đã đặt, kết quả phiên, nhật ký phiên: 5 năm, dài hơn thời hiệu khởi kiện hợp đồng 3 năm (Điều 429 BLDS 2015)'),
  ('CASE_EVIDENCE',         'CASE_CLOSED',        1825, 'DELETE',    'Bằng chứng vụ việc: 5 năm sau khi đóng; có legal hold thì giữ đến khi gỡ'),
  ('KYC_WITH_TRANSACTIONS', 'ACCOUNT_CLOSED',     1825, 'ANONYMIZE', 'Ảnh CCCD, bản mã hóa số CCCD khi tài khoản từng giao dịch: 5 năm sau khi đóng tài khoản'),
  ('KYC_NO_TRANSACTIONS',   'ACCOUNT_CLOSED',       30, 'DELETE',    'Ảnh CCCD khi tài khoản chưa từng giao dịch: xóa 30 ngày sau khi đóng'),
  ('LOGIN_LOGS',            'EVENT_CREATED',       365, 'DELETE',    'Nhật ký đăng nhập, IP: 12 tháng (tham chiếu Nghị định 53/2022/NĐ-CP)'),
  ('NOTIFICATIONS',         'EVENT_CREATED',       365, 'DELETE',    'Thông báo đã gửi: 12 tháng, chỉ để tra lỗi gửi'),
  ('REJECTED_CONSIGNMENTS', 'REQUEST_CLOSED',      365, 'DELETE',    'Hồ sơ ký gửi bị từ chối, không có giao dịch: 1 năm để nhận ra món bị gửi lại'),
  ('USER_PREFERENCES',      'USER_REQUEST',       NULL, 'DELETE',    'Watchlist, cài đặt thông báo, ảnh đại diện, địa chỉ không gắn đơn: xóa khi khách yêu cầu hoặc đóng tài khoản')
) AS r(record_class, trigger_event, duration_days, disposal_method, note) ON TRUE
WHERE p.code = 'DATA_RETENTION' AND p.version_no = 1
ON CONFLICT (record_class, policy_version_id) DO NOTHING;

-- 5. Kiểu bàn giao của pilot (BR-N36). JSON chỉ mô tả các bước; code dùng mã PARCEL / ONSITE cố định.
INSERT INTO fulfillment_profiles (code, version_no, name, status, workflow_definition, completion_definition, approved_by, effective_from)
VALUES
  ('PARCEL', 1, 'Giao kiện qua hãng vận chuyển', 'ACTIVE',
   '{"steps": ["CARRIER_ORDER_CREATED", "PICKED_UP_BY_CARRIER", "DELIVERED_BY_CARRIER"], "source": "fulfillment_cases.carrier_*", "rule": "BR-N25"}',
   '{"complete_when": "7 ngày sau carrier_delivered_at và không có vụ việc mở", "rule": "BR-N26"}',
   '00000000-0000-0000-0000-000000000001', timestamptz '2026-10-14 00:00:00+07'),
  ('ONSITE', 1, 'Nhận tại kho', 'ACTIVE',
   '{"steps": ["APPOINTMENT_BOOKED", "HANDED_OVER_AT_WAREHOUSE"], "source": "handover_appointments, handover_records", "rule": "BR-N24"}',
   '{"complete_when": "7 ngày sau khi ký biên bản nhận và không có vụ việc mở", "rule": "BR-N26"}',
   '00000000-0000-0000-0000-000000000001', timestamptz '2026-10-14 00:00:00+07')
ON CONFLICT (code, version_no) DO NOTHING;

COMMIT;
