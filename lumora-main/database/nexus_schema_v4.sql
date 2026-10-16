-- =====================================================================
-- NEXUS – Ký gửi cá nhân, bán và đấu giá
-- Schema PostgreSQL (>= 13) – BẢN v4 PILOT (14/10/2026)
-- Nguồn: NXA-BA-DATA-01 v2.0 + bộ BR chuẩn (113 luật) + DB v3 + 12 đề xuất thu gọn chốt 14/10
--
-- GIAO HÀNG: dùng API của đơn vị vận chuyển. Không có bảng giao hàng nội bộ.
-- PILOT: chỉ vật phẩm giao kiện (PARCEL) hoặc nhận tại kho (ONSITE) – BR-N36.
--
-- THAY ĐỔI v4 SO VỚI v3
--   Hoãn 19 bảng sang nexus_giai_doan_2.sql (không tạo trong pilot):
--     15 bảng ngoài pilot: đất, xe, vé, dịch vụ, quyền số, nguồn số lượng, trả nhiều đợt
--     sale_lot_components, component_allocations   (BR-C71 chuyển Ngoài pilot: một bộ hàng = một món)
--     fulfillment_milestones, fulfillment_evidence (mốc giao đã ở cột carrier_* của fulfillment_cases)
--   Bỏ cột lưu trùng:
--     items.request_id                  (món thuộc hồ sơ nào: xem request_items)
--     parties.verification_status       (thay bằng view v_party_kyc_status)
--     settlements.fulfillment_case_id   (lấy qua fulfillment_cases.order_line_id)
--     item_commitments.expires_at       (hạn giữ hàng chỉ ở checkouts.expires_at)
--   Ràng buộc: items.asset_type chỉ MOVABLE, items.custody_mode chỉ NEXUS_WAREHOUSE,
--              identity_checks.status có CHECK 5 giá trị
--   Thêm: view v_party_kyc_status, 2 index, chú thích quy ước cho 6 cột
--   Dữ liệu cấu hình: chạy nexus_seed_v4.sql sau file này (thêm 2 kiểu bàn giao PARCEL, ONSITE).
--
-- Tổng: 82 bảng, 230 khóa ngoại, 29 index, 1 view.
-- Thứ tự chạy: 1) CREATE TABLE  2) FOREIGN KEY  3) INDEX  4) VIEW  5) COMMENT
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1. BẢNG
-- =====================================================================

-- users
CREATE TABLE users (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   email_normalized text NOT NULL,
   password_hash text,
   status text NOT NULL,
   mfa_enabled boolean NOT NULL DEFAULT false,
   auth_version integer NOT NULL DEFAULT 1,
   closed_at timestamptz,
   failed_login_count integer NOT NULL DEFAULT 0,
   locked_until timestamptz,
   kyc_prompt_dismissed_at timestamptz,
   CHECK (status IN ('ACTIVE','SUSPENDED','CLOSED')),
   CHECK (auth_version > 0),
   CHECK (failed_login_count >= 0),
   UNIQUE (email_normalized)
);

-- parties
CREATE TABLE parties (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   user_id uuid,
   party_type text NOT NULL,
   display_name text NOT NULL,
   legal_name_encrypted text,
   phone_encrypted text,
   CHECK (party_type IN ('PERSON','ORGANIZATION')),
   UNIQUE (user_id)
);

-- roles
CREATE TABLE roles (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   code text NOT NULL,
   description text NOT NULL,
   UNIQUE (code)
);

-- user_roles
CREATE TABLE user_roles (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   user_id uuid NOT NULL,
   role_id uuid NOT NULL,
   granted_by uuid NOT NULL,
   valid_from timestamptz NOT NULL,
   valid_until timestamptz,
   revoked_at timestamptz,
   CHECK (valid_until IS NULL OR valid_until > valid_from)
);

-- identity_checks
CREATE TABLE identity_checks (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   party_id uuid NOT NULL,
   provider_ref text,
   purpose text NOT NULL,
   status text NOT NULL,
   reviewed_by uuid,
   reviewed_at timestamptz,
   expires_at timestamptz,
   evidence_document_id uuid,
   CONSTRAINT ck_identity_check_status CHECK (status IN ('PENDING','NEEDS_REVIEW','PASSED','FAILED','EXPIRED')),
   UNIQUE (id, party_id)
);

-- addresses
CREATE TABLE addresses (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   party_id uuid NOT NULL,
   label text NOT NULL,
   recipient_encrypted text NOT NULL,
   address_encrypted text NOT NULL,
   active boolean NOT NULL DEFAULT true
);

-- bank_accounts
CREATE TABLE bank_accounts (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   party_id uuid NOT NULL,
   bank_code text NOT NULL,
   account_encrypted text NOT NULL,
   account_fingerprint text NOT NULL,
   holder_encrypted text NOT NULL,
   status text NOT NULL,
   verified_by uuid,
   verified_at timestamptz,
   UNIQUE (party_id, bank_code, account_fingerprint)
);

-- documents
CREATE TABLE documents (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   uploaded_by uuid NOT NULL,
   object_key text NOT NULL,
   sha256 text NOT NULL,
   mime_type text NOT NULL,
   size_bytes bigint NOT NULL,
   classification text NOT NULL,
   scan_status text NOT NULL,
   issuer_party_id uuid,
   issued_at timestamptz,
   supersedes_id uuid,
   CHECK (size_bytes > 0),
   UNIQUE (object_key)
);

-- consignment_requests
CREATE TABLE consignment_requests (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   request_no text NOT NULL,
   consignor_id uuid NOT NULL,
   intake_route text NOT NULL,
   status text NOT NULL,
   submitted_at timestamptz,
   assigned_intake_id uuid,
   reason text,
   intake_carrier_code text,
   intake_carrier_order_code text,
   info_due_at timestamptz,
   closed_at timestamptz,
   UNIQUE (request_no)
);

-- categories
CREATE TABLE categories (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   parent_id uuid,
   name text NOT NULL,
   slug text NOT NULL,
   depth smallint NOT NULL,
   active boolean NOT NULL DEFAULT true,
   CHECK (depth BETWEEN 1 AND 3),
   UNIQUE (slug)
);

-- product_models
CREATE TABLE product_models (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   category_id uuid NOT NULL,
   brand_name text NOT NULL,
   model_name text NOT NULL,
   reference_code text,
   attributes jsonb NOT NULL
);

-- items
CREATE TABLE items (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   item_code text NOT NULL,
   model_id uuid,
   declared_owner_id uuid NOT NULL,
   category_id uuid NOT NULL,
   title text NOT NULL,
   operational_status text NOT NULL,
   current_location_id uuid,
   version integer NOT NULL DEFAULT 1,
   asset_type text NOT NULL,
   quantity numeric(18,3) NOT NULL DEFAULT 1,
   unit_code text NOT NULL,
   custody_mode text NOT NULL,
   detail_revision_id uuid,
   CHECK (quantity > 0),
   CONSTRAINT ck_items_asset_type CHECK (asset_type IN ('MOVABLE')),
   CONSTRAINT ck_items_custody_mode CHECK (custody_mode IN ('NEXUS_WAREHOUSE')),
   UNIQUE (item_code)
);

-- item_identifiers
CREATE TABLE item_identifiers (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   item_id uuid NOT NULL,
   kind text NOT NULL,
   value_encrypted text NOT NULL,
   public_mask text,
   verified_by uuid,
   document_id uuid
);

-- authority_reviews
CREATE TABLE authority_reviews (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   item_id uuid NOT NULL,
   claimant_id uuid NOT NULL,
   basis text NOT NULL,
   document_id uuid,
   status text NOT NULL,
   reviewed_by uuid,
   reviewed_at timestamptz,
   limitations text NOT NULL
);

-- agreements
CREATE TABLE agreements (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   agreement_no text NOT NULL,
   request_id uuid NOT NULL,
   consignor_id uuid NOT NULL,
   status text NOT NULL,
   current_version_id uuid,
   UNIQUE (agreement_no)
);

-- agreement_versions
CREATE TABLE agreement_versions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   agreement_id uuid NOT NULL,
   version_no integer NOT NULL,
   terms_document_id uuid NOT NULL,
   valid_from timestamptz NOT NULL,
   valid_until timestamptz NOT NULL,
   commission_bps integer NOT NULL,
   fixed_fee_vnd bigint NOT NULL DEFAULT 0,
   fee_policy_id uuid NOT NULL,
   accepted_by uuid,
   accepted_at timestamptz,
   acceptance_evidence jsonb NOT NULL,
   CHECK (version_no > 0),
   CHECK (commission_bps BETWEEN 0 AND 10000),
   CHECK (fixed_fee_vnd >= 0),
   CHECK (valid_until > valid_from),
   UNIQUE (agreement_id, version_no)
);

-- agreement_items
CREATE TABLE agreement_items (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   agreement_version_id uuid NOT NULL,
   item_id uuid NOT NULL,
   sale_mode text NOT NULL,
   approved_price_vnd bigint NOT NULL,
   authority_until timestamptz NOT NULL,
   CHECK (sale_mode IN ('BUY_NOW','AUCTION')),
   CHECK (approved_price_vnd > 0),
   UNIQUE (agreement_version_id, item_id)
);

-- locations
CREATE TABLE locations (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   code text NOT NULL,
   parent_id uuid,
   location_type text NOT NULL,
   active boolean NOT NULL DEFAULT true,
   UNIQUE (code)
);

-- custody_events
CREATE TABLE custody_events (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   item_id uuid NOT NULL,
   event_type text NOT NULL,
   from_party_id uuid,
   to_party_id uuid,
   from_location_id uuid,
   to_location_id uuid,
   performed_by uuid NOT NULL,
   occurred_at timestamptz NOT NULL,
   condition_snapshot jsonb NOT NULL,
   evidence_document_id uuid NOT NULL
);

-- inspection_cases
CREATE TABLE inspection_cases (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   item_id uuid NOT NULL,
   reason text NOT NULL,
   assigned_expert_id uuid,
   external_expert_party_id uuid,
   status text NOT NULL,
   opened_at timestamptz NOT NULL
);

-- inspection_reports
CREATE TABLE inspection_reports (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   case_id uuid NOT NULL,
   version_no integer NOT NULL,
   authenticity text NOT NULL,
   condition_grade text NOT NULL,
   scope_and_method text NOT NULL,
   findings jsonb NOT NULL,
   limitations text NOT NULL,
   author_id uuid NOT NULL,
   expert_signature_document_id uuid NOT NULL,
   finalized_at timestamptz,
   supersedes_id uuid,
   CHECK (authenticity IN ('AUTHENTIC','NOT_AUTHENTIC','INCONCLUSIVE')),
   UNIQUE (case_id, version_no)
);

-- item_holds
CREATE TABLE item_holds (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   item_id uuid NOT NULL,
   case_id uuid,
   scope text NOT NULL,
   reason text NOT NULL,
   placed_by uuid NOT NULL,
   released_by uuid,
   released_at timestamptz,
   release_reason text,
   CHECK (scope IN ('SALE','HANDOVER','PAYOUT','LEGAL'))
);

-- listings
CREATE TABLE listings (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   item_id uuid NOT NULL,
   status text NOT NULL,
   current_revision_id uuid,
   created_by uuid NOT NULL,
   UNIQUE (item_id)
);

-- listing_revisions
CREATE TABLE listing_revisions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   listing_id uuid NOT NULL,
   revision_no integer NOT NULL,
   agreement_item_id uuid NOT NULL,
   report_id uuid,
   authority_review_id uuid NOT NULL,
   content_snapshot jsonb NOT NULL,
   policy_version_id uuid NOT NULL,
   submitted_by uuid NOT NULL,
   approved_by uuid,
   published_at timestamptz,
   category_policy_id uuid NOT NULL,
   fulfillment_profile_id uuid NOT NULL,
   detail_revision_id uuid NOT NULL,
   returned_by uuid,
   returned_at timestamptz,
   return_reason text,
   CHECK (approved_by IS NULL OR approved_by <> submitted_by),
   CHECK (returned_by IS NULL OR returned_by <> submitted_by),
   CHECK (returned_by IS NULL OR (returned_at IS NOT NULL AND return_reason IS NOT NULL)),
   CHECK (approved_by IS NULL OR returned_by IS NULL),
   UNIQUE (listing_id, revision_no)
);

-- item_commitments
CREATE TABLE item_commitments (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   item_id uuid NOT NULL,
   kind text NOT NULL,
   checkout_id uuid,
   auction_id uuid,
   order_id uuid,
   state text NOT NULL,
   released_at timestamptz,
   CHECK (kind IN ('CHECKOUT','AUCTION','ORDER')),
   CHECK (state IN ('ACTIVE','RELEASED','CONSUMED')),
   CHECK ((kind='CHECKOUT' AND checkout_id IS NOT NULL AND auction_id IS NULL AND order_id IS NULL) OR
     (kind='AUCTION' AND auction_id IS NOT NULL AND checkout_id IS NULL AND order_id IS NULL) OR
     (kind='ORDER' AND order_id IS NOT NULL AND checkout_id IS NULL AND auction_id IS NULL))
);

-- auction_rule_versions
CREATE TABLE auction_rule_versions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   code text NOT NULL,
   version_no integer NOT NULL,
   policy_version_id uuid NOT NULL,
   min_step_vnd bigint NOT NULL,
   idle_close_s integer NOT NULL,
   countdown_steps smallint NOT NULL,
   countdown_step_s integer NOT NULL,
   payment_timeout_s integer NOT NULL,
   approved_by uuid NOT NULL,
   CHECK (min_step_vnd > 0),
   CHECK (idle_close_s > 0),
   CHECK (countdown_steps > 0),
   CHECK (countdown_step_s > 0),
   CHECK (payment_timeout_s > 0),
   UNIQUE (code, version_no)
);

-- auctions
CREATE TABLE auctions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   auction_no text NOT NULL,
   item_id uuid NOT NULL,
   listing_revision_id uuid NOT NULL,
   rule_version_id uuid NOT NULL,
   organizer_party_id uuid NOT NULL,
   status text NOT NULL,
   starts_at timestamptz NOT NULL,
   original_ends_at timestamptz NOT NULL,
   effective_ends_at timestamptz NOT NULL,
   opening_price_vnd bigint NOT NULL,
   next_bid_seq bigint NOT NULL DEFAULT 1,
   idle_deadline_at timestamptz,
   closed_at timestamptz,
   close_reason text,
   CHECK (opening_price_vnd > 0),
   CHECK (original_ends_at > starts_at),
   CHECK (effective_ends_at >= original_ends_at),
   CHECK (next_bid_seq > 0),
   CHECK (close_reason IS NULL OR close_reason IN ('SCHEDULED_END','IDLE_TIMEOUT','CANCELLED')),
   CHECK (closed_at IS NULL OR close_reason IS NOT NULL),
   UNIQUE (auction_no)
);

-- auction_participants
CREATE TABLE auction_participants (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   auction_id uuid NOT NULL,
   buyer_id uuid NOT NULL,
   rule_version_id uuid NOT NULL,
   identity_check_id uuid NOT NULL,
   eligibility text NOT NULL,
   accepted_at timestamptz NOT NULL,
   relationship_declaration jsonb NOT NULL,
   UNIQUE (auction_id, buyer_id)
);

-- bids
CREATE TABLE bids (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   auction_id uuid NOT NULL,
   participant_id uuid NOT NULL,
   server_seq bigint NOT NULL,
   amount_vnd bigint NOT NULL,
   accepted_at timestamptz NOT NULL,
   idempotency_key text NOT NULL,
   request_hash text NOT NULL,
   CHECK (amount_vnd > 0),
   CHECK (server_seq > 0),
   UNIQUE (auction_id, server_seq),
   UNIQUE (participant_id, idempotency_key)
);

-- auction_results
CREATE TABLE auction_results (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   auction_id uuid NOT NULL,
   version_no integer NOT NULL,
   winning_bid_id uuid,
   outcome text NOT NULL,
   reason text NOT NULL,
   finalized_by uuid,
   finalized_at timestamptz NOT NULL,
   supersedes_id uuid,
   is_effective boolean NOT NULL DEFAULT true,
   UNIQUE (auction_id, version_no)
);

-- carts
CREATE TABLE carts (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   buyer_id uuid,
   guest_token_hash text,
   status text NOT NULL,
   expires_at timestamptz NOT NULL
);

-- cart_items
CREATE TABLE cart_items (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   cart_id uuid NOT NULL,
   listing_id uuid NOT NULL,
   UNIQUE (cart_id, listing_id)
);

-- checkouts
CREATE TABLE checkouts (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   buyer_id uuid NOT NULL,
   listing_revision_id uuid NOT NULL,
   item_id uuid NOT NULL,
   address_snapshot jsonb,
   quote_snapshot jsonb NOT NULL,
   total_vnd bigint NOT NULL,
   status text NOT NULL,
   expires_at timestamptz NOT NULL,
   handover_snapshot jsonb NOT NULL,
   CHECK (total_vnd > 0)
);

-- orders
CREATE TABLE orders (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   order_no text NOT NULL,
   buyer_id uuid NOT NULL,
   source text NOT NULL,
   checkout_id uuid,
   auction_result_id uuid,
   status text NOT NULL,
   currency char(3) NOT NULL DEFAULT 'VND',
   total_vnd bigint NOT NULL,
   payment_due_at timestamptz NOT NULL,
   buyer_snapshot jsonb NOT NULL,
   terms_snapshot jsonb NOT NULL,
   payment_review_until timestamptz,
   cancelled_at timestamptz,
   cancel_reason text,
   CHECK (currency='VND'),
   CHECK (total_vnd > 0),
   CHECK (cancel_reason IS NULL OR cancel_reason IN ('PAYMENT_TIMEOUT','BUYER_REQUEST','RESULT_VOIDED','OTHER')),
   CHECK ((cancelled_at IS NULL) = (cancel_reason IS NULL)),
   CHECK (payment_review_until IS NULL OR (payment_review_until > payment_due_at AND payment_review_until <= payment_due_at + interval '24 hours')),
   CHECK ((source='BUY_NOW' AND checkout_id IS NOT NULL AND auction_result_id IS NULL) OR
     (source='AUCTION' AND auction_result_id IS NOT NULL AND checkout_id IS NULL)),
   UNIQUE (order_no),
   UNIQUE (checkout_id),
   UNIQUE (auction_result_id)
);

-- order_lines
CREATE TABLE order_lines (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   order_id uuid NOT NULL,
   item_id uuid NOT NULL,
   listing_revision_id uuid NOT NULL,
   agreement_item_id uuid NOT NULL,
   item_snapshot jsonb NOT NULL,
   sale_price_vnd bigint NOT NULL,
   quantity numeric(18,3) NOT NULL,
   unit_code text NOT NULL,
   fulfillment_profile_id uuid NOT NULL,
   category_policy_id uuid NOT NULL,
   handover_snapshot jsonb,
   CHECK (sale_price_vnd > 0),
   UNIQUE (order_id, item_id)
);

-- order_charges
CREATE TABLE order_charges (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   order_id uuid NOT NULL,
   code text NOT NULL,
   amount_vnd bigint NOT NULL,
   policy_version_id uuid NOT NULL,
   calculation_snapshot jsonb NOT NULL
);

-- payment_attempts
CREATE TABLE payment_attempts (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   order_id uuid NOT NULL,
   provider text NOT NULL,
   merchant_request_key text NOT NULL,
   provider_payment_id text,
   amount_vnd bigint NOT NULL,
   status text NOT NULL,
   confirmed_at timestamptz,
   CHECK (amount_vnd > 0),
   UNIQUE (provider, merchant_request_key),
   UNIQUE (provider, provider_payment_id)
);

-- provider_events
CREATE TABLE provider_events (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   provider text NOT NULL,
   provider_event_id text NOT NULL,
   payment_attempt_id uuid,
   payload_hash text NOT NULL,
   payload_redacted jsonb NOT NULL,
   signature_valid boolean NOT NULL,
   processing_status text NOT NULL,
   processed_at timestamptz,
   UNIQUE (provider, provider_event_id)
);

-- refunds
CREATE TABLE refunds (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   order_id uuid NOT NULL,
   case_id uuid,
   amount_vnd bigint NOT NULL,
   reason text NOT NULL,
   status text NOT NULL,
   requested_by uuid NOT NULL,
   approved_by uuid,
   provider_request_key text NOT NULL,
   provider_ref text,
   CHECK (amount_vnd > 0),
   CHECK (approved_by IS NULL OR approved_by <> requested_by),
   UNIQUE (provider_request_key)
);

-- settlements
CREATE TABLE settlements (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   order_line_id uuid NOT NULL,
   version_no integer NOT NULL,
   consignor_id uuid NOT NULL,
   agreement_version_id uuid NOT NULL,
   gross_vnd bigint NOT NULL,
   net_payable_vnd bigint NOT NULL,
   status text NOT NULL,
   eligibility_at timestamptz,
   approved_by uuid,
   supersedes_id uuid,
   is_effective boolean NOT NULL DEFAULT true,
   CHECK (gross_vnd >= 0),
   CHECK (net_payable_vnd >= 0),
   UNIQUE (order_line_id, version_no)
);

-- settlement_lines
CREATE TABLE settlement_lines (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   settlement_id uuid NOT NULL,
   code text NOT NULL,
   amount_vnd bigint NOT NULL,
   policy_version_id uuid NOT NULL,
   calculation_snapshot jsonb NOT NULL
);

-- payouts
CREATE TABLE payouts (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   settlement_id uuid NOT NULL,
   bank_account_id uuid NOT NULL,
   beneficiary_snapshot jsonb NOT NULL,
   amount_vnd bigint NOT NULL,
   status text NOT NULL,
   requested_by uuid NOT NULL,
   approved_by uuid,
   provider_request_key text NOT NULL,
   provider_ref text,
   paid_at timestamptz,
   CHECK (amount_vnd > 0),
   CHECK (approved_by IS NULL OR approved_by <> requested_by),
   UNIQUE (provider_request_key)
);

-- ledger_accounts
CREATE TABLE ledger_accounts (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   code text NOT NULL,
   party_id uuid,
   currency char(3) NOT NULL DEFAULT 'VND',
   normal_side char(1) NOT NULL,
   CHECK (currency='VND'),
   CHECK (normal_side IN ('D','C')),
   UNIQUE (code)
);

-- ledger_transactions
CREATE TABLE ledger_transactions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   business_key text NOT NULL,
   kind text NOT NULL,
   status text NOT NULL,
   order_id uuid,
   refund_id uuid,
   payout_id uuid,
   reverses_id uuid,
   posted_at timestamptz,
   UNIQUE (business_key)
);

-- ledger_entries
CREATE TABLE ledger_entries (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   transaction_id uuid NOT NULL,
   account_id uuid NOT NULL,
   side char(1) NOT NULL,
   amount_vnd bigint NOT NULL,
   line_no integer NOT NULL,
   CHECK (side IN ('D','C')),
   CHECK (amount_vnd > 0),
   CHECK (line_no > 0),
   UNIQUE (transaction_id, line_no)
);

-- reconciliation_items
CREATE TABLE reconciliation_items (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   run_key text NOT NULL,
   source_ref text NOT NULL,
   ledger_transaction_id uuid,
   expected_vnd bigint NOT NULL,
   observed_vnd bigint NOT NULL,
   status text NOT NULL,
   resolved_by uuid,
   resolution text,
   UNIQUE (run_key, source_ref)
);

-- dispute_cases
CREATE TABLE dispute_cases (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   case_no text NOT NULL,
   item_id uuid NOT NULL,
   order_id uuid,
   opened_by_party_id uuid NOT NULL,
   category text NOT NULL,
   status text NOT NULL,
   assigned_user_id uuid,
   due_at timestamptz NOT NULL,
   CHECK (category IN ('COUNTERFEIT_QUALITY','WRONG_OR_MISSING','CARRIER_SERVICE','PAYMENT','OWNERSHIP','AUCTION_INCIDENT','STORAGE_DAMAGE')),
   UNIQUE (case_no)
);

-- case_evidence
CREATE TABLE case_evidence (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   case_id uuid NOT NULL,
   document_id uuid NOT NULL,
   submitted_by_party_id uuid NOT NULL,
   description text NOT NULL,
   UNIQUE (case_id, document_id)
);

-- case_decisions
CREATE TABLE case_decisions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   case_id uuid NOT NULL,
   version_no integer NOT NULL,
   decision_type text NOT NULL,
   reason text NOT NULL,
   proposed_by uuid NOT NULL,
   approved_by uuid NOT NULL,
   action_plan jsonb NOT NULL,
   CHECK (proposed_by <> approved_by),
   UNIQUE (case_id, version_no)
);

-- return_authorizations
CREATE TABLE return_authorizations (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   case_id uuid NOT NULL,
   item_id uuid NOT NULL,
   return_carrier_code text,
   return_carrier_order_code text,
   status text NOT NULL,
   expected_contents jsonb NOT NULL,
   received_report_id uuid
);

-- recovery_claims
CREATE TABLE recovery_claims (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   case_id uuid NOT NULL,
   debtor_party_id uuid NOT NULL,
   amount_vnd bigint NOT NULL,
   recovered_vnd bigint NOT NULL DEFAULT 0,
   status text NOT NULL,
   basis_document_id uuid NOT NULL,
   CHECK (amount_vnd > 0),
   CHECK (recovered_vnd BETWEEN 0 AND amount_vnd)
);

-- withdrawal_requests
CREATE TABLE withdrawal_requests (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   agreement_id uuid NOT NULL,
   item_id uuid NOT NULL,
   requested_by uuid NOT NULL,
   status text NOT NULL,
   decision_reason text,
   decided_by uuid,
   return_carrier_code text,
   return_carrier_order_code text
);

-- policy_versions
CREATE TABLE policy_versions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   code text NOT NULL,
   version_no integer NOT NULL,
   content jsonb NOT NULL,
   document_id uuid,
   effective_from timestamptz NOT NULL,
   approved_by uuid NOT NULL,
   UNIQUE (code, version_no)
);

-- acknowledgments
CREATE TABLE acknowledgments (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   user_id uuid NOT NULL,
   policy_version_id uuid NOT NULL,
   item_id uuid,
   agreement_version_id uuid,
   accepted_at timestamptz NOT NULL,
   evidence jsonb NOT NULL
);

-- audit_events
CREATE TABLE audit_events (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   actor_user_id uuid,
   service_actor text,
   action_code text NOT NULL,
   object_type text NOT NULL,
   object_id uuid,
   trace_id text NOT NULL,
   reason text,
   diff_redacted jsonb NOT NULL
);

-- idempotency_records
CREATE TABLE idempotency_records (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   scope text NOT NULL,
   request_key text NOT NULL,
   request_hash text NOT NULL,
   status text NOT NULL,
   response_snapshot jsonb,
   expires_at timestamptz,
   UNIQUE (scope, request_key)
);

-- outbox_events
CREATE TABLE outbox_events (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   event_key text NOT NULL,
   aggregate_type text NOT NULL,
   aggregate_id uuid NOT NULL,
   aggregate_version bigint NOT NULL,
   event_type text NOT NULL,
   payload jsonb NOT NULL,
   published_at timestamptz,
   attempts integer NOT NULL DEFAULT 0,
   UNIQUE (event_key)
);

-- processed_events
CREATE TABLE processed_events (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   consumer text NOT NULL,
   event_key text NOT NULL,
   payload_hash text NOT NULL,
   processed_at timestamptz NOT NULL,
   UNIQUE (consumer, event_key)
);

-- notification_deliveries
CREATE TABLE notification_deliveries (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   party_id uuid NOT NULL,
   source_event_key text NOT NULL,
   channel text NOT NULL,
   template_code text NOT NULL,
   status text NOT NULL,
   provider_ref text,
   attempts integer NOT NULL DEFAULT 0,
   read_at timestamptz,
   UNIQUE (party_id, source_event_key, channel, template_code)
);

-- data_requests
CREATE TABLE data_requests (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   party_id uuid NOT NULL,
   request_type text NOT NULL,
   status text NOT NULL,
   due_at timestamptz NOT NULL,
   handled_by uuid,
   decision text,
   reauth_at timestamptz NOT NULL,
   ack_due_at timestamptz NOT NULL,
   acknowledged_at timestamptz,
   extended_due_at timestamptz,
   extension_reason text,
   completed_at timestamptz,
   CHECK (request_type IN ('EXPORT','RECTIFY','ERASE')),
   CHECK (status IN ('SUBMITTED','IN_PROGRESS','COMPLETED','REJECTED')),
   CHECK (ack_due_at > created_at),
   CHECK (due_at > created_at AND due_at <= created_at + CASE WHEN request_type = 'ERASE' THEN interval '20 days' ELSE interval '10 days' END),
   CHECK (extended_due_at IS NULL OR (extension_reason IS NOT NULL AND extended_due_at > due_at AND extended_due_at <= due_at + CASE WHEN request_type = 'ERASE' THEN interval '20 days' ELSE interval '10 days' END)),
   CHECK (status NOT IN ('COMPLETED','REJECTED') OR (completed_at IS NOT NULL AND decision IS NOT NULL))
);

-- retention_rules
CREATE TABLE retention_rules (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   record_class text NOT NULL,
   policy_version_id uuid NOT NULL,
   trigger_event text NOT NULL,
   duration_days integer,
   disposal_method text NOT NULL,
   legal_basis_note text NOT NULL,
   CHECK (duration_days IS NULL OR duration_days > 0),
   UNIQUE (record_class, policy_version_id)
);

-- user_sessions
CREATE TABLE user_sessions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   user_id uuid NOT NULL,
   refresh_token_hash text NOT NULL,
   family_key uuid NOT NULL,
   auth_version integer NOT NULL,
   expires_at timestamptz NOT NULL,
   revoked_at timestamptz,
   last_seen_at timestamptz,
   UNIQUE (refresh_token_hash)
);

-- security_credentials
CREATE TABLE security_credentials (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   user_id uuid NOT NULL,
   credential_type text NOT NULL,
   secret_or_public_data text NOT NULL,
   status text NOT NULL,
   activated_at timestamptz,
   revoked_at timestamptz
);

-- request_documents
CREATE TABLE request_documents (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   request_id uuid NOT NULL,
   item_id uuid,
   document_id uuid NOT NULL,
   purpose text NOT NULL,
   verified_status text NOT NULL,
   review_note text,
   UNIQUE (request_id, document_id)
);

-- request_items
CREATE TABLE request_items (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   request_id uuid NOT NULL,
   item_id uuid NOT NULL,
   claimant_party_id uuid NOT NULL,
   claim_snapshot jsonb NOT NULL,
   status text NOT NULL,
   UNIQUE (request_id, item_id)
);

-- ownership_events
CREATE TABLE ownership_events (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   item_id uuid NOT NULL,
   from_party_id uuid,
   to_party_id uuid NOT NULL,
   order_id uuid,
   event_type text NOT NULL,
   basis_document_id uuid NOT NULL,
   occurred_at timestamptz NOT NULL,
   recorded_by uuid NOT NULL,
   limitations text NOT NULL
);

-- fulfillment_profiles
CREATE TABLE fulfillment_profiles (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   code text NOT NULL,
   version_no integer NOT NULL,
   name text NOT NULL,
   status text NOT NULL,
   workflow_definition jsonb NOT NULL,
   completion_definition jsonb NOT NULL,
   approved_by uuid,
   effective_from timestamptz,
   CHECK (version_no > 0),
   UNIQUE (code, version_no)
);

-- category_policies
CREATE TABLE category_policies (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   category_id uuid NOT NULL,
   version_no integer NOT NULL,
   status text NOT NULL,
   allowed_asset_types jsonb NOT NULL,
   allowed_profile_codes jsonb NOT NULL,
   required_verifications jsonb NOT NULL,
   restrictions jsonb NOT NULL,
   approved_by uuid,
   approved_at timestamptz,
   CHECK (version_no > 0),
   UNIQUE (category_id, version_no)
);

-- asset_detail_revisions
CREATE TABLE asset_detail_revisions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   item_id uuid NOT NULL,
   version_no integer NOT NULL,
   schema_code text NOT NULL,
   detail_snapshot jsonb NOT NULL,
   prepared_by uuid NOT NULL,
   finalized_at timestamptz,
   supersedes_id uuid,
   UNIQUE (item_id, version_no)
);

-- movable_details
CREATE TABLE movable_details (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   detail_revision_id uuid NOT NULL,
   weight_kg numeric(12,3),
   dimensions jsonb,
   condition_description text NOT NULL,
   transport_flags jsonb NOT NULL,
   expiry_date date,
   special_handling text,
   CHECK (weight_kg IS NULL OR weight_kg > 0),
   UNIQUE (detail_revision_id)
);

-- asset_right_holders
CREATE TABLE asset_right_holders (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   detail_revision_id uuid NOT NULL,
   party_id uuid NOT NULL,
   right_role text NOT NULL,
   consent_document_id uuid,
   limitations text NOT NULL,
   UNIQUE (detail_revision_id, party_id, right_role)
);

-- verification_reviews
CREATE TABLE verification_reviews (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   item_id uuid NOT NULL,
   detail_revision_id uuid NOT NULL,
   dimension text NOT NULL,
   result text NOT NULL,
   provider_party_id uuid,
   reviewed_by uuid NOT NULL,
   method_and_scope text NOT NULL,
   evidence_document_id uuid NOT NULL,
   reviewed_at timestamptz NOT NULL,
   expires_at timestamptz,
   supersedes_id uuid,
   CHECK (result IN ('SUFFICIENT','INSUFFICIENT','INCONCLUSIVE','REVOKED'))
);

-- listing_verifications
CREATE TABLE listing_verifications (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   listing_revision_id uuid NOT NULL,
   verification_review_id uuid NOT NULL,
   requirement_code text NOT NULL,
   UNIQUE (listing_revision_id, requirement_code, verification_review_id)
);

-- fulfillment_cases
CREATE TABLE fulfillment_cases (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   order_line_id uuid NOT NULL,
   profile_id uuid NOT NULL,
   status text NOT NULL,
   plan_snapshot jsonb NOT NULL,
   started_at timestamptz,
   fulfilled_at timestamptz,
   closed_by uuid,
   carrier_code text,
   carrier_order_code text,
   carrier_status text,
   carrier_status_at timestamptz,
   carrier_shipped_at timestamptz,
   carrier_delivered_at timestamptz,
   complaint_window_ends_at timestamptz,
   CHECK (carrier_order_code IS NULL OR carrier_code IS NOT NULL),
   CHECK (complaint_window_ends_at IS NULL OR carrier_delivered_at IS NOT NULL),
   UNIQUE (carrier_code, carrier_order_code),
   UNIQUE (order_line_id)
);

-- handover_appointments
CREATE TABLE handover_appointments (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   case_id uuid NOT NULL,
   scheduled_at timestamptz NOT NULL,
   location_snapshot jsonb NOT NULL,
   contact_snapshot_encrypted text NOT NULL,
   status text NOT NULL,
   supersedes_id uuid
);

-- handover_records
CREATE TABLE handover_records (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   case_id uuid NOT NULL,
   appointment_id uuid,
   from_party_id uuid NOT NULL,
   to_party_id uuid NOT NULL,
   occurred_at timestamptz NOT NULL,
   handover_scope jsonb NOT NULL,
   signed_document_id uuid NOT NULL
);

-- watchlist_items (Q-41)
CREATE TABLE watchlist_items (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   party_id uuid NOT NULL,
   listing_id uuid NOT NULL,
   removed_at timestamptz
);

-- notification_preferences (Q-24)
CREATE TABLE notification_preferences (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   party_id uuid NOT NULL,
   category text NOT NULL,
   channel text NOT NULL,
   enabled boolean NOT NULL,
   updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   CHECK (channel IN ('EMAIL','IN_APP','SMS')),
   UNIQUE (party_id, category, channel)
);

-- bidding_restrictions (Q-37)
CREATE TABLE bidding_restrictions (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   party_id uuid NOT NULL,
   reason text NOT NULL,
   basis jsonb NOT NULL,
   starts_at timestamptz NOT NULL,
   ends_at timestamptz NOT NULL,
   placed_by uuid,
   released_at timestamptz,
   released_by uuid,
   release_reason text,
   CHECK (ends_at > starts_at),
   CHECK (released_at IS NULL OR (released_by IS NOT NULL AND release_reason IS NOT NULL))
);

-- consignor_charges (Q-18, Q-40)
CREATE TABLE consignor_charges (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   consignor_id uuid NOT NULL,
   code text NOT NULL,
   request_id uuid,
   item_id uuid,
   withdrawal_request_id uuid,
   amount_vnd bigint NOT NULL,
   policy_version_id uuid NOT NULL,
   calculation_snapshot jsonb NOT NULL,
   status text NOT NULL,
   created_by uuid NOT NULL,
   approved_by uuid,
   paid_at timestamptz,
   payment_ref text,
   CHECK (code IN ('INSPECTION_FEE','EARLY_WITHDRAWAL_FEE','RETURN_SHIPPING','OTHER')),
   CHECK (amount_vnd > 0),
   CHECK (status IN ('PENDING','PAID','WAIVED','CANCELLED')),
   CHECK (approved_by IS NULL OR approved_by <> created_by),
   CHECK (request_id IS NOT NULL OR item_id IS NOT NULL OR withdrawal_request_id IS NOT NULL),
   CHECK (status <> 'PAID' OR paid_at IS NOT NULL)
);

-- bid_invalidations (Q-20)
CREATE TABLE bid_invalidations (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   bid_id uuid NOT NULL,
   source text NOT NULL,
   reason text NOT NULL,
   case_id uuid,
   decided_by uuid,
   approved_by uuid,
   CHECK (source IN ('PARTICIPANT_REVOKED','DECISION')),
   CHECK (source <> 'DECISION' OR (decided_by IS NOT NULL AND approved_by IS NOT NULL AND approved_by <> decided_by)),
   UNIQUE (bid_id)
);

-- citizen_id_verifications (xác thực căn cước công dân, BR-N01)
CREATE TABLE citizen_id_verifications (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
   identity_check_id uuid NOT NULL,
   party_id uuid NOT NULL,
   attempt_no smallint NOT NULL,
   method text NOT NULL,
   provider text NOT NULL,
   provider_request_key text NOT NULL,
   provider_ref text,
   consent_ack_id uuid NOT NULL,
   id_number_hash text NOT NULL,
   id_number_last4 char(4) NOT NULL,
   id_number_encrypted text NOT NULL,
   full_name_encrypted text NOT NULL,
   date_of_birth date NOT NULL,
   issued_on date NOT NULL,
   expires_on date,
   front_image_id uuid,
   back_image_id uuid,
   selfie_image_id uuid,
   chip_verified boolean,
   face_match_score numeric(5,4),
   liveness_passed boolean,
   status text NOT NULL,
   fail_reason text,
   reviewed_by uuid,
   reviewed_at timestamptz,
   verified_at timestamptz,
   superseded_at timestamptz,
   purge_after timestamptz,
   CHECK (attempt_no > 0),
   CHECK (method IN ('OCR_SELFIE','NFC_CHIP','VNEID')),
   CHECK (id_number_last4 ~ '^[0-9]{4}$'),
   CHECK (expires_on IS NULL OR expires_on > issued_on),
   CHECK (face_match_score IS NULL OR face_match_score BETWEEN 0 AND 1),
   CHECK (method <> 'OCR_SELFIE' OR (front_image_id IS NOT NULL AND back_image_id IS NOT NULL AND selfie_image_id IS NOT NULL)),
   CHECK (status IN ('PENDING','PASSED','FAILED','NEEDS_REVIEW','EXPIRED')),
   CHECK (status <> 'PASSED' OR verified_at IS NOT NULL),
   CHECK (status <> 'PASSED' OR method <> 'NFC_CHIP' OR chip_verified),
   CHECK (status <> 'PASSED' OR method <> 'OCR_SELFIE' OR (liveness_passed AND face_match_score IS NOT NULL)),
   CHECK (status <> 'PASSED' OR expires_on IS NULL OR expires_on > (verified_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date),
   CHECK (status <> 'FAILED' OR fail_reason IS NOT NULL),
   CHECK (reviewed_by IS NULL OR reviewed_at IS NOT NULL),
   CHECK (superseded_at IS NULL OR status = 'PASSED'),
   UNIQUE (identity_check_id, attempt_no),
   UNIQUE (provider, provider_request_key)
);

-- =====================================================================
-- 2. KHÓA NGOẠI
-- =====================================================================

ALTER TABLE user_roles ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE user_roles ADD FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT;
ALTER TABLE user_roles ADD FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE identity_checks ADD FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE identity_checks ADD FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE identity_checks ADD FOREIGN KEY (evidence_document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE addresses ADD FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE bank_accounts ADD FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE bank_accounts ADD FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE documents ADD FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE documents ADD FOREIGN KEY (issuer_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE documents ADD FOREIGN KEY (supersedes_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE consignment_requests ADD FOREIGN KEY (consignor_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE consignment_requests ADD FOREIGN KEY (assigned_intake_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE categories ADD FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE RESTRICT;
ALTER TABLE product_models ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
ALTER TABLE items ADD FOREIGN KEY (model_id) REFERENCES product_models(id) ON DELETE RESTRICT;
ALTER TABLE items ADD FOREIGN KEY (declared_owner_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE items ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
ALTER TABLE items ADD FOREIGN KEY (current_location_id) REFERENCES locations(id) ON DELETE RESTRICT;
ALTER TABLE items ADD FOREIGN KEY (detail_revision_id) REFERENCES asset_detail_revisions(id) ON DELETE RESTRICT;
ALTER TABLE item_identifiers ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE item_identifiers ADD FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE item_identifiers ADD FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE authority_reviews ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE authority_reviews ADD FOREIGN KEY (claimant_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE authority_reviews ADD FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE authority_reviews ADD FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE agreements ADD FOREIGN KEY (request_id) REFERENCES consignment_requests(id) ON DELETE RESTRICT;
ALTER TABLE agreements ADD FOREIGN KEY (consignor_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE agreements ADD FOREIGN KEY (current_version_id) REFERENCES agreement_versions(id) ON DELETE RESTRICT;
ALTER TABLE agreement_versions ADD FOREIGN KEY (agreement_id) REFERENCES agreements(id) ON DELETE RESTRICT;
ALTER TABLE agreement_versions ADD FOREIGN KEY (terms_document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE agreement_versions ADD FOREIGN KEY (fee_policy_id) REFERENCES policy_versions(id) ON DELETE RESTRICT;
ALTER TABLE agreement_versions ADD FOREIGN KEY (accepted_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE agreement_items ADD FOREIGN KEY (agreement_version_id) REFERENCES agreement_versions(id) ON DELETE RESTRICT;
ALTER TABLE agreement_items ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE locations ADD FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE RESTRICT;
ALTER TABLE custody_events ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE custody_events ADD FOREIGN KEY (from_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE custody_events ADD FOREIGN KEY (to_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE custody_events ADD FOREIGN KEY (from_location_id) REFERENCES locations(id) ON DELETE RESTRICT;
ALTER TABLE custody_events ADD FOREIGN KEY (to_location_id) REFERENCES locations(id) ON DELETE RESTRICT;
ALTER TABLE custody_events ADD FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE custody_events ADD FOREIGN KEY (evidence_document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE inspection_cases ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE inspection_cases ADD FOREIGN KEY (assigned_expert_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE inspection_cases ADD FOREIGN KEY (external_expert_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE inspection_reports ADD FOREIGN KEY (case_id) REFERENCES inspection_cases(id) ON DELETE RESTRICT;
ALTER TABLE inspection_reports ADD FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE inspection_reports ADD FOREIGN KEY (expert_signature_document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE inspection_reports ADD FOREIGN KEY (supersedes_id) REFERENCES inspection_reports(id) ON DELETE RESTRICT;
ALTER TABLE item_holds ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE item_holds ADD FOREIGN KEY (case_id) REFERENCES dispute_cases(id) ON DELETE RESTRICT;
ALTER TABLE item_holds ADD FOREIGN KEY (placed_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE item_holds ADD FOREIGN KEY (released_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE listings ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE listings ADD FOREIGN KEY (current_revision_id) REFERENCES listing_revisions(id) ON DELETE RESTRICT;
ALTER TABLE listings ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE listing_revisions ADD FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE RESTRICT;
ALTER TABLE listing_revisions ADD FOREIGN KEY (agreement_item_id) REFERENCES agreement_items(id) ON DELETE RESTRICT;
ALTER TABLE listing_revisions ADD FOREIGN KEY (report_id) REFERENCES inspection_reports(id) ON DELETE RESTRICT;
ALTER TABLE listing_revisions ADD FOREIGN KEY (authority_review_id) REFERENCES authority_reviews(id) ON DELETE RESTRICT;
ALTER TABLE listing_revisions ADD FOREIGN KEY (policy_version_id) REFERENCES policy_versions(id) ON DELETE RESTRICT;
ALTER TABLE listing_revisions ADD FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE listing_revisions ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE listing_revisions ADD FOREIGN KEY (category_policy_id) REFERENCES category_policies(id) ON DELETE RESTRICT;
ALTER TABLE listing_revisions ADD FOREIGN KEY (fulfillment_profile_id) REFERENCES fulfillment_profiles(id) ON DELETE RESTRICT;
ALTER TABLE listing_revisions ADD FOREIGN KEY (detail_revision_id) REFERENCES asset_detail_revisions(id) ON DELETE RESTRICT;
ALTER TABLE item_commitments ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE item_commitments ADD FOREIGN KEY (checkout_id) REFERENCES checkouts(id) ON DELETE RESTRICT;
ALTER TABLE item_commitments ADD FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE RESTRICT;
ALTER TABLE item_commitments ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;
ALTER TABLE auction_rule_versions ADD FOREIGN KEY (policy_version_id) REFERENCES policy_versions(id) ON DELETE RESTRICT;
ALTER TABLE auction_rule_versions ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE auctions ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE auctions ADD FOREIGN KEY (listing_revision_id) REFERENCES listing_revisions(id) ON DELETE RESTRICT;
ALTER TABLE auctions ADD FOREIGN KEY (rule_version_id) REFERENCES auction_rule_versions(id) ON DELETE RESTRICT;
ALTER TABLE auctions ADD FOREIGN KEY (organizer_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE auction_participants ADD FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE RESTRICT;
ALTER TABLE auction_participants ADD FOREIGN KEY (buyer_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE auction_participants ADD FOREIGN KEY (rule_version_id) REFERENCES auction_rule_versions(id) ON DELETE RESTRICT;
ALTER TABLE auction_participants ADD FOREIGN KEY (identity_check_id) REFERENCES identity_checks(id) ON DELETE RESTRICT;
ALTER TABLE bids ADD FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE RESTRICT;
ALTER TABLE bids ADD FOREIGN KEY (participant_id) REFERENCES auction_participants(id) ON DELETE RESTRICT;
ALTER TABLE auction_results ADD FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE RESTRICT;
ALTER TABLE auction_results ADD FOREIGN KEY (winning_bid_id) REFERENCES bids(id) ON DELETE RESTRICT;
ALTER TABLE auction_results ADD FOREIGN KEY (finalized_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE auction_results ADD FOREIGN KEY (supersedes_id) REFERENCES auction_results(id) ON DELETE RESTRICT;
ALTER TABLE carts ADD FOREIGN KEY (buyer_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE cart_items ADD FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE RESTRICT;
ALTER TABLE cart_items ADD FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE RESTRICT;
ALTER TABLE checkouts ADD FOREIGN KEY (buyer_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE checkouts ADD FOREIGN KEY (listing_revision_id) REFERENCES listing_revisions(id) ON DELETE RESTRICT;
ALTER TABLE checkouts ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE orders ADD FOREIGN KEY (buyer_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE orders ADD FOREIGN KEY (checkout_id) REFERENCES checkouts(id) ON DELETE RESTRICT;
ALTER TABLE orders ADD FOREIGN KEY (auction_result_id) REFERENCES auction_results(id) ON DELETE RESTRICT;
ALTER TABLE order_lines ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;
ALTER TABLE order_lines ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE order_lines ADD FOREIGN KEY (listing_revision_id) REFERENCES listing_revisions(id) ON DELETE RESTRICT;
ALTER TABLE order_lines ADD FOREIGN KEY (agreement_item_id) REFERENCES agreement_items(id) ON DELETE RESTRICT;
ALTER TABLE order_lines ADD FOREIGN KEY (fulfillment_profile_id) REFERENCES fulfillment_profiles(id) ON DELETE RESTRICT;
ALTER TABLE order_lines ADD FOREIGN KEY (category_policy_id) REFERENCES category_policies(id) ON DELETE RESTRICT;
ALTER TABLE order_charges ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;
ALTER TABLE order_charges ADD FOREIGN KEY (policy_version_id) REFERENCES policy_versions(id) ON DELETE RESTRICT;
ALTER TABLE payment_attempts ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;
ALTER TABLE provider_events ADD FOREIGN KEY (payment_attempt_id) REFERENCES payment_attempts(id) ON DELETE RESTRICT;
ALTER TABLE refunds ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;
ALTER TABLE refunds ADD FOREIGN KEY (case_id) REFERENCES dispute_cases(id) ON DELETE RESTRICT;
ALTER TABLE refunds ADD FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE refunds ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE settlements ADD FOREIGN KEY (order_line_id) REFERENCES order_lines(id) ON DELETE RESTRICT;
ALTER TABLE settlements ADD FOREIGN KEY (consignor_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE settlements ADD FOREIGN KEY (agreement_version_id) REFERENCES agreement_versions(id) ON DELETE RESTRICT;
ALTER TABLE settlements ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE settlements ADD FOREIGN KEY (supersedes_id) REFERENCES settlements(id) ON DELETE RESTRICT;
ALTER TABLE settlement_lines ADD FOREIGN KEY (settlement_id) REFERENCES settlements(id) ON DELETE RESTRICT;
ALTER TABLE settlement_lines ADD FOREIGN KEY (policy_version_id) REFERENCES policy_versions(id) ON DELETE RESTRICT;
ALTER TABLE payouts ADD FOREIGN KEY (settlement_id) REFERENCES settlements(id) ON DELETE RESTRICT;
ALTER TABLE payouts ADD FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE RESTRICT;
ALTER TABLE payouts ADD FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE payouts ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE ledger_accounts ADD FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE ledger_transactions ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;
ALTER TABLE ledger_transactions ADD FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE RESTRICT;
ALTER TABLE ledger_transactions ADD FOREIGN KEY (payout_id) REFERENCES payouts(id) ON DELETE RESTRICT;
ALTER TABLE ledger_transactions ADD FOREIGN KEY (reverses_id) REFERENCES ledger_transactions(id) ON DELETE RESTRICT;
ALTER TABLE ledger_entries ADD FOREIGN KEY (transaction_id) REFERENCES ledger_transactions(id) ON DELETE RESTRICT;
ALTER TABLE ledger_entries ADD FOREIGN KEY (account_id) REFERENCES ledger_accounts(id) ON DELETE RESTRICT;
ALTER TABLE reconciliation_items ADD FOREIGN KEY (ledger_transaction_id) REFERENCES ledger_transactions(id) ON DELETE RESTRICT;
ALTER TABLE reconciliation_items ADD FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE dispute_cases ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE dispute_cases ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;
ALTER TABLE dispute_cases ADD FOREIGN KEY (opened_by_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE dispute_cases ADD FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE case_evidence ADD FOREIGN KEY (case_id) REFERENCES dispute_cases(id) ON DELETE RESTRICT;
ALTER TABLE case_evidence ADD FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE case_evidence ADD FOREIGN KEY (submitted_by_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE case_decisions ADD FOREIGN KEY (case_id) REFERENCES dispute_cases(id) ON DELETE RESTRICT;
ALTER TABLE case_decisions ADD FOREIGN KEY (proposed_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE case_decisions ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE return_authorizations ADD FOREIGN KEY (case_id) REFERENCES dispute_cases(id) ON DELETE RESTRICT;
ALTER TABLE return_authorizations ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE return_authorizations ADD FOREIGN KEY (received_report_id) REFERENCES inspection_reports(id) ON DELETE RESTRICT;
ALTER TABLE recovery_claims ADD FOREIGN KEY (case_id) REFERENCES dispute_cases(id) ON DELETE RESTRICT;
ALTER TABLE recovery_claims ADD FOREIGN KEY (debtor_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE recovery_claims ADD FOREIGN KEY (basis_document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE withdrawal_requests ADD FOREIGN KEY (agreement_id) REFERENCES agreements(id) ON DELETE RESTRICT;
ALTER TABLE withdrawal_requests ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE withdrawal_requests ADD FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE withdrawal_requests ADD FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE policy_versions ADD FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE policy_versions ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE acknowledgments ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE acknowledgments ADD FOREIGN KEY (policy_version_id) REFERENCES policy_versions(id) ON DELETE RESTRICT;
ALTER TABLE acknowledgments ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE acknowledgments ADD FOREIGN KEY (agreement_version_id) REFERENCES agreement_versions(id) ON DELETE RESTRICT;
ALTER TABLE audit_events ADD FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE notification_deliveries ADD FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE data_requests ADD FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE data_requests ADD FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE retention_rules ADD FOREIGN KEY (policy_version_id) REFERENCES policy_versions(id) ON DELETE RESTRICT;
ALTER TABLE user_sessions ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE security_credentials ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE request_documents ADD FOREIGN KEY (request_id) REFERENCES consignment_requests(id) ON DELETE RESTRICT;
ALTER TABLE request_documents ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE request_documents ADD FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE request_items ADD FOREIGN KEY (request_id) REFERENCES consignment_requests(id) ON DELETE RESTRICT;
ALTER TABLE request_items ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE request_items ADD FOREIGN KEY (claimant_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE ownership_events ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE ownership_events ADD FOREIGN KEY (from_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE ownership_events ADD FOREIGN KEY (to_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE ownership_events ADD FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT;
ALTER TABLE ownership_events ADD FOREIGN KEY (basis_document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE ownership_events ADD FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE fulfillment_profiles ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE category_policies ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
ALTER TABLE category_policies ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE asset_detail_revisions ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE asset_detail_revisions ADD FOREIGN KEY (prepared_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE asset_detail_revisions ADD FOREIGN KEY (supersedes_id) REFERENCES asset_detail_revisions(id) ON DELETE RESTRICT;
ALTER TABLE movable_details ADD FOREIGN KEY (detail_revision_id) REFERENCES asset_detail_revisions(id) ON DELETE RESTRICT;
ALTER TABLE asset_right_holders ADD FOREIGN KEY (detail_revision_id) REFERENCES asset_detail_revisions(id) ON DELETE RESTRICT;
ALTER TABLE asset_right_holders ADD FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE asset_right_holders ADD FOREIGN KEY (consent_document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE verification_reviews ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE verification_reviews ADD FOREIGN KEY (detail_revision_id) REFERENCES asset_detail_revisions(id) ON DELETE RESTRICT;
ALTER TABLE verification_reviews ADD FOREIGN KEY (provider_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE verification_reviews ADD FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE verification_reviews ADD FOREIGN KEY (evidence_document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE verification_reviews ADD FOREIGN KEY (supersedes_id) REFERENCES verification_reviews(id) ON DELETE RESTRICT;
ALTER TABLE listing_verifications ADD FOREIGN KEY (listing_revision_id) REFERENCES listing_revisions(id) ON DELETE RESTRICT;
ALTER TABLE listing_verifications ADD FOREIGN KEY (verification_review_id) REFERENCES verification_reviews(id) ON DELETE RESTRICT;
ALTER TABLE fulfillment_cases ADD FOREIGN KEY (order_line_id) REFERENCES order_lines(id) ON DELETE RESTRICT;
ALTER TABLE fulfillment_cases ADD FOREIGN KEY (profile_id) REFERENCES fulfillment_profiles(id) ON DELETE RESTRICT;
ALTER TABLE fulfillment_cases ADD FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE handover_appointments ADD FOREIGN KEY (case_id) REFERENCES fulfillment_cases(id) ON DELETE RESTRICT;
ALTER TABLE handover_appointments ADD FOREIGN KEY (supersedes_id) REFERENCES handover_appointments(id) ON DELETE RESTRICT;
ALTER TABLE handover_records ADD FOREIGN KEY (case_id) REFERENCES fulfillment_cases(id) ON DELETE RESTRICT;
ALTER TABLE handover_records ADD FOREIGN KEY (appointment_id) REFERENCES handover_appointments(id) ON DELETE RESTRICT;
ALTER TABLE handover_records ADD FOREIGN KEY (from_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE handover_records ADD FOREIGN KEY (to_party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE handover_records ADD FOREIGN KEY (signed_document_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE listing_revisions ADD FOREIGN KEY (returned_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE watchlist_items ADD FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE watchlist_items ADD FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE RESTRICT;
ALTER TABLE notification_preferences ADD FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE bidding_restrictions ADD FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE bidding_restrictions ADD FOREIGN KEY (placed_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE bidding_restrictions ADD FOREIGN KEY (released_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE consignor_charges ADD FOREIGN KEY (consignor_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE consignor_charges ADD FOREIGN KEY (request_id) REFERENCES consignment_requests(id) ON DELETE RESTRICT;
ALTER TABLE consignor_charges ADD FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT;
ALTER TABLE consignor_charges ADD FOREIGN KEY (withdrawal_request_id) REFERENCES withdrawal_requests(id) ON DELETE RESTRICT;
ALTER TABLE consignor_charges ADD FOREIGN KEY (policy_version_id) REFERENCES policy_versions(id) ON DELETE RESTRICT;
ALTER TABLE consignor_charges ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE consignor_charges ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE bid_invalidations ADD FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE RESTRICT;
ALTER TABLE bid_invalidations ADD FOREIGN KEY (case_id) REFERENCES dispute_cases(id) ON DELETE RESTRICT;
ALTER TABLE bid_invalidations ADD FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE bid_invalidations ADD FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE citizen_id_verifications ADD FOREIGN KEY (identity_check_id, party_id) REFERENCES identity_checks(id, party_id) ON DELETE RESTRICT;
ALTER TABLE citizen_id_verifications ADD FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT;
ALTER TABLE citizen_id_verifications ADD FOREIGN KEY (consent_ack_id) REFERENCES acknowledgments(id) ON DELETE RESTRICT;
ALTER TABLE citizen_id_verifications ADD FOREIGN KEY (front_image_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE citizen_id_verifications ADD FOREIGN KEY (back_image_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE citizen_id_verifications ADD FOREIGN KEY (selfie_image_id) REFERENCES documents(id) ON DELETE RESTRICT;
ALTER TABLE citizen_id_verifications ADD FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT;

-- =====================================================================
-- 3. INDEX
-- =====================================================================

CREATE UNIQUE INDEX uq_role_active ON user_roles(user_id,role_id) WHERE revoked_at IS NULL;
CREATE INDEX ix_request_queue ON consignment_requests(status,submitted_at);
CREATE INDEX ix_custody_item_time ON custody_events(item_id,occurred_at);
CREATE INDEX ix_holds_active ON item_holds(item_id,scope) WHERE released_at IS NULL;
CREATE UNIQUE INDEX uq_item_active_commitment ON item_commitments(item_id) WHERE state='ACTIVE';
CREATE INDEX ix_auction_clock ON auctions(status,effective_ends_at);
CREATE INDEX ix_bid_leader ON bids(auction_id,amount_vnd DESC,server_seq);
CREATE UNIQUE INDEX uq_result_effective ON auction_results(auction_id) WHERE is_effective;
CREATE UNIQUE INDEX uq_cart_buyer_active ON carts(buyer_id) WHERE status='ACTIVE' AND buyer_id IS NOT NULL;
CREATE INDEX ix_order_buyer_time ON orders(buyer_id,created_at DESC);
CREATE UNIQUE INDEX uq_settlement_effective ON settlements(order_line_id) WHERE is_effective;
CREATE INDEX ix_case_queue ON dispute_cases(status,due_at);
CREATE INDEX ix_outbox_pending ON outbox_events(created_at) WHERE published_at IS NULL;
CREATE INDEX ix_session_user ON user_sessions(user_id,revoked_at);
CREATE UNIQUE INDEX uq_item_consignment_active ON request_items(item_id) WHERE status='ACCEPTED';
CREATE UNIQUE INDEX uq_watch_active ON watchlist_items(party_id,listing_id) WHERE removed_at IS NULL;
CREATE INDEX ix_bid_restriction_active ON bidding_restrictions(party_id,ends_at) WHERE released_at IS NULL;
CREATE INDEX ix_consignor_charge_status ON consignor_charges(consignor_id,status);
CREATE INDEX ix_auction_idle ON auctions(status,idle_deadline_at) WHERE idle_deadline_at IS NOT NULL;
CREATE INDEX ix_notification_unread ON notification_deliveries(party_id,created_at DESC) WHERE channel='IN_APP' AND read_at IS NULL;
CREATE UNIQUE INDEX uq_cccd_active ON citizen_id_verifications(id_number_hash) WHERE status='PASSED' AND superseded_at IS NULL;
CREATE UNIQUE INDEX uq_cccd_party_active ON citizen_id_verifications(party_id) WHERE status='PASSED' AND superseded_at IS NULL;
CREATE INDEX ix_cccd_review ON citizen_id_verifications(created_at) WHERE status='NEEDS_REVIEW';
CREATE INDEX ix_cccd_purge ON citizen_id_verifications(purge_after) WHERE purge_after IS NOT NULL;
CREATE INDEX ix_order_abandoned ON orders(buyer_id,cancelled_at) WHERE source='AUCTION' AND cancel_reason='PAYMENT_TIMEOUT';
CREATE INDEX ix_order_payment_review ON orders(payment_review_until) WHERE payment_review_until IS NOT NULL;
CREATE INDEX ix_data_request_open ON data_requests(due_at) WHERE completed_at IS NULL;
CREATE INDEX ix_identity_check_party ON identity_checks(party_id,created_at DESC);
CREATE INDEX ix_checkout_expiry ON checkouts(expires_at) WHERE status='HELD';

-- =====================================================================
-- 4. VIEW
-- =====================================================================

CREATE VIEW v_party_kyc_status AS
SELECT p.id AS party_id,
       lc.status AS latest_status,
       lc.created_at AS latest_check_at,
       EXISTS (SELECT 1 FROM identity_checks ic
               WHERE ic.party_id = p.id AND ic.status = 'PASSED'
                 AND (ic.expires_at IS NULL OR ic.expires_at > clock_timestamp())) AS kyc_passed
FROM parties p
LEFT JOIN LATERAL (SELECT ic.status, ic.created_at FROM identity_checks ic
                   WHERE ic.party_id = p.id ORDER BY ic.created_at DESC LIMIT 1) lc ON true;
COMMENT ON VIEW v_party_kyc_status IS 'Trạng thái KYC tổng của khách, tính từ identity_checks (không lưu riêng). kyc_passed = có hồ sơ KYC PASSED còn hạn.';

-- =====================================================================
-- 5. CHÚ THÍCH CỘT VÀ BẢNG
-- =====================================================================

COMMENT ON COLUMN fulfillment_cases.carrier_code IS 'Mã hãng vận chuyển, vd GHN, GHTK, VTP. NULL nếu giao trực tiếp hoặc không có vận chuyển (đất, quyền số, dịch vụ)';
COMMENT ON COLUMN fulfillment_cases.carrier_order_code IS 'Mã vận đơn do API hãng trả về; dùng để tra hành trình và đối chiếu webhook';
COMMENT ON COLUMN fulfillment_cases.carrier_status IS 'Trạng thái gần nhất lấy từ API hãng, chỉ để hiển thị. Carrier báo đã giao KHÔNG tự hoàn tất case';
COMMENT ON COLUMN fulfillment_cases.carrier_status_at IS 'Thời điểm hãng ghi nhận carrier_status';
COMMENT ON COLUMN consignment_requests.intake_carrier_code IS 'Hãng chở món từ chủ hàng về kho Nexus (nếu gửi qua hãng)';
COMMENT ON COLUMN consignment_requests.intake_carrier_order_code IS 'Mã vận đơn chiều nhận ký gửi';
COMMENT ON COLUMN return_authorizations.return_carrier_code IS 'Hãng chở hàng người mua trả về (thay return_shipment_id)';
COMMENT ON COLUMN return_authorizations.return_carrier_order_code IS 'Mã vận đơn chiều trả hàng';
COMMENT ON COLUMN withdrawal_requests.return_carrier_code IS 'Hãng chở trả món cho chủ hàng khi rút ký gửi (thay return_shipment_id)';
COMMENT ON COLUMN withdrawal_requests.return_carrier_order_code IS 'Mã vận đơn trả chủ hàng';
COMMENT ON COLUMN users.failed_login_count IS 'Q-01: số lần sai mật khẩu liên tiếp; đủ 5 thì khóa, đăng nhập đúng thì về 0';
COMMENT ON COLUMN consignment_requests.info_due_at IS 'Q-35: hạn bổ sung giấy tờ khi NEED_INFO (10 ngày); quá hạn hồ sơ tự đóng';
COMMENT ON COLUMN consignment_requests.closed_at IS 'Q-10: thời điểm đóng hồ sơ; sau 3 ngày từ khi bị từ chối thì ẩn khỏi trang chủ hàng, không xóa';
COMMENT ON COLUMN listing_revisions.returned_by IS 'Q-08: quản lý trả bài về Nháp; phải khác người soạn';
COMMENT ON COLUMN listing_revisions.return_reason IS 'Q-08: lý do trả bài (A027 bắt buộc có lý do)';
COMMENT ON COLUMN auction_rule_versions.idle_close_s IS 'Q-13: thời gian chờ giá mới sau giá cao nhất (180 giây)';
COMMENT ON COLUMN auction_rule_versions.countdown_steps IS 'Q-13: số lần đếm ngược trước khi chốt (3)';
COMMENT ON COLUMN auction_rule_versions.countdown_step_s IS 'Q-13: độ dài mỗi lần đếm (5 giây)';
COMMENT ON COLUMN auctions.effective_ends_at IS 'Giờ đóng cứng; chỉ lớn hơn original_ends_at khi bù giờ do tạm dừng sự cố (Q-34)';
COMMENT ON COLUMN auctions.idle_deadline_at IS 'Q-13: thời điểm chốt sớm nếu không có giá mới = giá cao nhất + 3 phút + 3 x 5 giây; cập nhật cùng transaction với bid; NULL khi chưa có giá';
COMMENT ON COLUMN auctions.close_reason IS 'SCHEDULED_END (đến giờ đóng), IDLE_TIMEOUT (chốt sớm theo Q-13), CANCELLED';
COMMENT ON COLUMN fulfillment_cases.carrier_shipped_at IS 'Q-16: lúc hãng nhận hàng; quá 3 ngày chưa có carrier_delivered_at thì cảnh báo nhân viên';
COMMENT ON COLUMN fulfillment_cases.carrier_delivered_at IS 'Q-16: lúc API hãng báo đã giao';
COMMENT ON COLUMN fulfillment_cases.complaint_window_ends_at IS 'Q-16: hạn trả hàng/khiếu nại = đã giao + 7 ngày; khiếu nại hàng giả vẫn nhận sau hạn (BR-C45)';
COMMENT ON COLUMN order_lines.handover_snapshot IS 'Q-31: cách nhận hàng đã chốt; NULL với đơn đấu giá cho đến khi người thắng chọn lúc thanh toán';
COMMENT ON COLUMN notification_deliveries.read_at IS 'Q-24/Q-43: lúc người dùng đọc thông báo trong app (kênh IN_APP)';
COMMENT ON COLUMN users.locked_until IS 'Q-01, BR-N03: khóa đăng nhập 15 phút; giá trị ''infinity'' = khóa lần 3 trong 24 giờ, chờ CSKH mở; lịch sử khóa ở audit_events';
COMMENT ON COLUMN users.kyc_prompt_dismissed_at IS 'BR-N01: lúc khách bấm "Để sau" ở bước gợi ý KYC; có giá trị thì không hỏi lại khi đăng nhập, chỉ nhắc ở C4a và khi đăng ký phiên';
COMMENT ON COLUMN orders.payment_review_until IS 'BR-N22 (Q-07): quá hạn mà có giao dịch chờ cổng xác nhận thì giữ đơn đến mốc này, tối đa 24 giờ sau payment_due_at; không tính bỏ thanh toán';
COMMENT ON COLUMN orders.cancelled_at IS 'Thời điểm hủy đơn; đi cùng cancel_reason';
COMMENT ON COLUMN orders.cancel_reason IS 'PAYMENT_TIMEOUT (quá hạn, BR-N21; đơn đấu giá tính 1 lần bỏ thanh toán cho BR-N20), BUYER_REQUEST (BR-N27), RESULT_VOIDED (kết quả phiên bị thay, BR-C30), OTHER';
COMMENT ON COLUMN dispute_cases.category IS 'BR-N29: COUNTERFEIT_QUALITY hàng giả/chất lượng, WRONG_OR_MISSING sai món/thiếu, CARRIER_SERVICE dịch vụ vận chuyển, PAYMENT thanh toán, OWNERSHIP quyền sở hữu, AUCTION_INCIDENT sự cố phiên, STORAGE_DAMAGE hỏng/mất trong kho (BR-N30)';
COMMENT ON COLUMN dispute_cases.due_at IS 'BR-N10: hạn xử lý tính theo ngày làm việc từ policy CASE_SLA; quá hạn chỉ cảnh báo, không chặn thao tác';
COMMENT ON COLUMN item_holds.scope IS 'BR-C18: SALE chặn bán, HANDOVER chặn giao, PAYOUT chặn chi tiền, LEGAL giữ theo quy trình pháp lý';
COMMENT ON COLUMN data_requests.request_type IS 'BR-N34: EXPORT tải bản sao, RECTIFY sửa thông tin (xong trong 10 ngày), ERASE xóa dữ liệu/đóng tài khoản (xong trong 20 ngày)';
COMMENT ON COLUMN data_requests.reauth_at IS 'Lúc khách nhập lại mật khẩu và mã MFA trước khi gửi yêu cầu (màn C4j)';
COMMENT ON COLUMN data_requests.ack_due_at IS 'BR-N34: hạn phản hồi = 2 ngày làm việc từ lúc gửi (Điều 5 Nghị định 356/2025/NĐ-CP)';
COMMENT ON COLUMN data_requests.due_at IS 'BR-N34: hạn hoàn tất, tối đa 10 ngày (EXPORT, RECTIFY) hoặc 20 ngày (ERASE)';
COMMENT ON COLUMN data_requests.extended_due_at IS 'BR-N34: gia hạn 1 lần, thêm tối đa 10 hoặc 20 ngày; bắt buộc có extension_reason gửi cho khách';
COMMENT ON COLUMN citizen_id_verifications.method IS 'OCR_SELFIE: chụp 2 mặt thẻ + ảnh khuôn mặt; NFC_CHIP: đọc chip trên CCCD; VNEID: xác thực qua tài khoản định danh điện tử';
COMMENT ON COLUMN citizen_id_verifications.provider_request_key IS 'Khóa gửi nhà cung cấp eKYC; gửi lại dùng đúng khóa này, không tạo khóa mới (BR-C40)';
COMMENT ON COLUMN citizen_id_verifications.consent_ack_id IS 'Bằng chứng khách đồng ý cho xử lý dữ liệu căn cước và ảnh khuôn mặt trước khi xác thực';
COMMENT ON COLUMN citizen_id_verifications.id_number_hash IS 'HMAC-SHA256 của số CCCD với khóa bí mật phía máy chủ; dùng để chặn một CCCD cho hai tài khoản đang hiệu lực';
COMMENT ON COLUMN citizen_id_verifications.id_number_encrypted IS 'Số CCCD mã hóa ở tầng ứng dụng (khóa ở KMS); chỉ giải mã khi lập hợp đồng hoặc theo yêu cầu pháp lý';
COMMENT ON COLUMN citizen_id_verifications.expires_on IS 'Ngày hết hạn ghi trên thẻ; NULL nếu thẻ không ghi thời hạn';
COMMENT ON COLUMN citizen_id_verifications.superseded_at IS 'Lúc kết quả PASSED bị thay bằng lần xác thực mới (thẻ hết hạn, đổi thẻ)';
COMMENT ON COLUMN citizen_id_verifications.purge_after IS 'BR-C53: hạn xóa ảnh và bản mã hóa sau khi đóng tài khoản (30 ngày nếu chưa từng giao dịch, 5 năm nếu đã có); legal hold thì chưa xóa';
COMMENT ON COLUMN asset_detail_revisions.detail_snapshot IS 'Chỉ chứa thuộc tính riêng của danh mục theo schema_code (ví dụ số tham chiếu, bộ máy đồng hồ). Không lặp các cột của movable_details: cân nặng, kích thước, tình trạng lấy ở movable_details.';
COMMENT ON COLUMN items.declared_owner_id IS 'Chủ hiện tại theo khai báo. Chỉ đổi trong cùng giao dịch ghi ownership_events.';
COMMENT ON COLUMN request_items.claimant_party_id IS 'Người khai là chủ trong hồ sơ này. Không sửa sau khi hồ sơ đã gửi.';
COMMENT ON COLUMN checkouts.expires_at IS 'Nguồn duy nhất của hạn giữ hàng 15 phút (BR-N12, C23). Job nhả hàng đọc cột này.';
COMMENT ON COLUMN identity_checks.status IS 'PENDING chờ nhà cung cấp, NEEDS_REVIEW chờ nhân viên duyệt tay, PASSED khi có một lần xác thực CCCD PASSED, FAILED, EXPIRED. Tầng dưới: citizen_id_verifications (từng lần thử); tầng trên: view v_party_kyc_status.';
COMMENT ON COLUMN settlements.order_line_id IS 'Món được quyết toán. Việc giao của món lấy qua fulfillment_cases.order_line_id (UNIQUE), không lưu thêm liên kết.';

COMMENT ON TABLE users IS '[Tài khoản, KYC và bảo mật] Tài khoản đăng nhập: email, mật khẩu (đã băm), bật xác thực 2 lớp chưa, đang bị khóa đến khi nào. Mỗi khách hàng hoặc nhân viên có một dòng.';
COMMENT ON TABLE parties IS '[Tài khoản, KYC và bảo mật] Hồ sơ của một người hoặc tổ chức tham gia giao dịch: người mua, chủ hàng, chuyên gia, hãng vận chuyển. Tách khỏi users vì có bên không cần đăng nhập. Trạng thái KYC không lưu ở đây, xem view v_party_kyc_status.';
COMMENT ON TABLE roles IS '[Tài khoản, KYC và bảo mật] Danh sách vai trò, ví dụ Người mua, Chủ hàng, Finance Checker, Trưởng ca.';
COMMENT ON TABLE user_roles IS '[Tài khoản, KYC và bảo mật] Ai đang giữ vai trò nào, ai cấp, hiệu lực từ ngày nào đến ngày nào.';
COMMENT ON TABLE user_sessions IS '[Tài khoản, KYC và bảo mật] Các phiên đăng nhập đang mở. Dùng để đăng xuất từ xa hoặc thu hồi phiên khi đổi mật khẩu.';
COMMENT ON TABLE security_credentials IS '[Tài khoản, KYC và bảo mật] Phương thức xác thực 2 lớp của tài khoản, ví dụ ứng dụng tạo mã OTP.';
COMMENT ON TABLE identity_checks IS '[Tài khoản, KYC và bảo mật] Một hồ sơ KYC của một người cho một mục đích (đấu giá, nhận tiền): trạng thái, ai duyệt, hết hạn khi nào. Chỉ chuyển PASSED khi có một lần xác thực CCCD PASSED.';
COMMENT ON TABLE citizen_id_verifications IS '[Tài khoản, KYC và bảo mật] Từng lần xác thực căn cước công dân trong một lần KYC: cách làm (chụp thẻ và khuôn mặt, đọc chip, VNeID) và kết quả. Không lưu số CCCD dạng đọc được; mỗi CCCD chỉ gắn với một tài khoản đang hiệu lực.';
COMMENT ON TABLE addresses IS '[Tài khoản, KYC và bảo mật] Sổ địa chỉ nhận hàng của khách, đã mã hóa.';
COMMENT ON TABLE bank_accounts IS '[Tài khoản, KYC và bảo mật] Tài khoản ngân hàng nhận tiền của chủ hàng. Phải được xác minh trước khi Nexus chi tiền vào.';
COMMENT ON TABLE acknowledgments IS '[Tài khoản, KYC và bảo mật] Bằng chứng người dùng đã bấm đồng ý: đồng ý điều khoản, hợp đồng hay quy chế nào, phiên bản nào, lúc nào.';
COMMENT ON TABLE consignment_requests IS '[Ký gửi và hợp đồng] Hồ sơ ký gửi chủ hàng gửi lên: đang xét tới đâu, nhân viên phụ trách, hạn bổ sung giấy tờ, mã vận đơn khi gửi hàng về kho.';
COMMENT ON TABLE request_items IS '[Ký gửi và hợp đồng] Từng món trong một hồ sơ ký gửi, người khai là chủ trong hồ sơ đó và kết quả xét riêng của món: đạt, không đạt hay cần bổ sung. Một món có thể xuất hiện ở nhiều hồ sơ (gửi lại sau khi rút, hoặc người mua ký gửi lại).';
COMMENT ON TABLE request_documents IS '[Ký gửi và hợp đồng] Giấy tờ chủ hàng nộp kèm hồ sơ (hóa đơn, phiếu bảo hành...) và kết quả kiểm tra từng giấy.';
COMMENT ON TABLE agreements IS '[Ký gửi và hợp đồng] Hợp đồng ký gửi giữa Nexus và chủ hàng. Trỏ tới phiên bản hợp đồng đang có hiệu lực.';
COMMENT ON TABLE agreement_versions IS '[Ký gửi và hợp đồng] Mỗi lần sửa hợp đồng là một phiên bản mới: thời hạn, hoa hồng, phí, lúc chủ hàng chấp thuận bằng OTP.';
COMMENT ON TABLE agreement_items IS '[Ký gửi và hợp đồng] Món nào nằm trong hợp đồng nào, bán theo cách nào (mua ngay hay đấu giá) và giá chủ hàng đã chốt.';
COMMENT ON TABLE authority_reviews IS '[Ký gửi và hợp đồng] Kết quả xét quyền bán: người gửi có đúng là chủ, hoặc được ủy quyền bán món này, hay không.';
COMMENT ON TABLE withdrawal_requests IS '[Ký gửi và hợp đồng] Yêu cầu rút hàng của chủ hàng: được duyệt hay bị từ chối, mã vận đơn khi gửi trả hàng.';
COMMENT ON TABLE consignor_charges IS '[Ký gửi và hợp đồng] Các khoản phí thu của chủ hàng khi không có giao dịch bán: phí kiểm định món không đạt, phí rút trước hạn, phí gửi trả.';
COMMENT ON TABLE items IS '[Món hàng, kiểm định và kho] Mỗi món hàng Nexus nhận ký gửi: mã món, số lượng, đang nằm ở đâu, ai đang được khai là chủ. Pilot chỉ có vật phẩm (MOVABLE) giữ tại kho; một bộ hàng là một món. Món thuộc hồ sơ nào xem ở request_items.';
COMMENT ON TABLE item_identifiers IS '[Món hàng, kiểm định và kho] Số định danh của món như số serial, số máy. Lưu mã hóa, chỉ hiện ra một phần.';
COMMENT ON TABLE product_models IS '[Món hàng, kiểm định và kho] Danh mục mẫu sản phẩm (hãng, dòng, mã tham chiếu) để mô tả các món cho thống nhất.';
COMMENT ON TABLE categories IS '[Món hàng, kiểm định và kho] Cây danh mục hàng hóa để khách tìm kiếm, ví dụ Đồng hồ > Đồng hồ cơ.';
COMMENT ON TABLE category_policies IS '[Món hàng, kiểm định và kho] Quy định của từng danh mục theo phiên bản: được bán loại tài sản nào, cần kiểm định gì, được giao theo cách nào.';
COMMENT ON TABLE asset_detail_revisions IS '[Món hàng, kiểm định và kho] Bản mô tả chi tiết của món theo từng phiên bản. Sửa mô tả thì tạo bản mới, không ghi đè bản cũ.';
COMMENT ON TABLE movable_details IS '[Món hàng, kiểm định và kho] Thông tin riêng của vật phẩm thường: cân nặng, kích thước, tình trạng, lưu ý khi vận chuyển.';
COMMENT ON TABLE asset_right_holders IS '[Món hàng, kiểm định và kho] Những người cùng có quyền với món (đồng sở hữu) và văn bản đồng ý cho bán của họ.';
COMMENT ON TABLE verification_reviews IS '[Món hàng, kiểm định và kho] Kết quả xác minh từng mặt của món ngoài chuyện thật giả, ví dụ giấy tờ, quyền bán, hiện trạng.';
COMMENT ON TABLE inspection_cases IS '[Món hàng, kiểm định và kho] Một lần đưa món đi kiểm định: lý do, chuyên gia phụ trách, trạng thái.';
COMMENT ON TABLE inspection_reports IS '[Món hàng, kiểm định và kho] Báo cáo kiểm định: thật, không phải hàng thật hay chưa đủ căn cứ, tình trạng, giới hạn của lần kiểm định. Báo cáo đã chốt không được sửa, chỉ tạo bản mới.';
COMMENT ON TABLE locations IS '[Món hàng, kiểm định và kho] Danh sách kho, kệ, khu vực nơi Nexus cất giữ hàng.';
COMMENT ON TABLE custody_events IS '[Món hàng, kiểm định và kho] Nhật ký giữ hàng: ai giao cho ai, chuyển từ đâu đến đâu, tình trạng lúc giao. Chỉ thêm dòng mới, không sửa.';
COMMENT ON TABLE ownership_events IS '[Món hàng, kiểm định và kho] Nhật ký thay đổi quyền sở hữu của món, ví dụ khi bán xong và chuyển sang người mua.';
COMMENT ON TABLE item_holds IS '[Món hàng, kiểm định và kho] Lệnh tạm chặn trên một món: chặn bán, chặn giao, chặn chi tiền hoặc giữ vì lý do pháp lý. Một món có thể bị nhiều lệnh cùng lúc.';
COMMENT ON TABLE item_commitments IS '[Món hàng, kiểm định và kho] Món đang được giữ cho việc gì: một checkout, một phiên đấu giá hay một đơn hàng. Mỗi món chỉ có một cam kết còn hiệu lực. Hạn giữ lấy từ bảng gốc (checkouts.expires_at), không lưu lại ở đây.';
COMMENT ON TABLE listings IS '[Bài đăng] Bài đăng bán của một món (mỗi món một bài) và phiên bản nội dung đang hiển thị.';
COMMENT ON TABLE listing_revisions IS '[Bài đăng] Từng phiên bản nội dung bài đăng: ai soạn, ai duyệt hay trả về Nháp, lúc lên kệ. Người duyệt phải khác người soạn.';
COMMENT ON TABLE listing_verifications IS '[Bài đăng] Bài đăng đã dựa trên những kết quả xác minh nào để đủ điều kiện lên kệ.';
COMMENT ON TABLE watchlist_items IS '[Bài đăng] Bài đăng khách đang theo dõi. Bỏ theo dõi thì ghi lại thời điểm bỏ, không xóa dòng.';
COMMENT ON TABLE auction_rule_versions IS '[Đấu giá] Quy chế đấu giá theo phiên bản: bước giá tối thiểu, chờ 3 phút, đếm 3 lần mỗi lần 5 giây, hạn thanh toán 24 giờ.';
COMMENT ON TABLE auctions IS '[Đấu giá] Mỗi phiên đấu giá: món nào, giờ mở, giờ đóng, giá khởi điểm, lúc kết thúc và lý do (đúng giờ, chốt sớm hay hủy).';
COMMENT ON TABLE auction_participants IS '[Đấu giá] Người đã đăng ký vào một phiên: đã KYC chưa, được duyệt chưa, đã đồng ý quy chế phiên bản nào.';
COMMENT ON TABLE bids IS '[Đấu giá] Từng lần đặt giá, đánh số thứ tự theo máy chủ để biết ai đặt trước. Không bao giờ xóa.';
COMMENT ON TABLE bid_invalidations IS '[Đấu giá] Giá bị đánh dấu không hợp lệ, ví dụ người đặt bị loại giữa phiên. Giá gốc vẫn còn trong bảng bids.';
COMMENT ON TABLE auction_results IS '[Đấu giá] Kết quả phiên: có người thắng hay không có ai đặt giá. Sửa kết quả thì tạo bản mới thay thế, không sửa bản cũ.';
COMMENT ON TABLE bidding_restrictions IS '[Đấu giá] Lệnh cấm một người đăng ký phiên mới trong một thời gian, ví dụ 30 ngày sau 2 lần thắng mà bỏ thanh toán.';
COMMENT ON TABLE carts IS '[Mua ngay và đơn hàng] Giỏ hàng của khách, kể cả khách chưa đăng nhập. Bỏ vào giỏ không có nghĩa là đã giữ hàng.';
COMMENT ON TABLE cart_items IS '[Mua ngay và đơn hàng] Các bài đăng đang nằm trong giỏ hàng.';
COMMENT ON TABLE checkouts IS '[Mua ngay và đơn hàng] Một lần bấm "Thanh toán món này" ở mua ngay: giữ hàng 15 phút, chốt giá, phí và địa chỉ nhận.';
COMMENT ON TABLE orders IS '[Mua ngay và đơn hàng] Đơn hàng sinh ra từ mua ngay hoặc từ kết quả đấu giá: tổng tiền, hạn thanh toán, thời gian chờ đối soát, lý do hủy nếu có.';
COMMENT ON TABLE order_lines IS '[Mua ngay và đơn hàng] Món trong đơn kèm bản chụp thông tin lúc bán (mô tả, giá, cách giao), để sau này dữ liệu mới không làm đổi đơn cũ.';
COMMENT ON TABLE order_charges IS '[Mua ngay và đơn hàng] Các khoản cộng thêm vào đơn ngoài giá hàng, ví dụ phí vận chuyển theo báo giá của hãng.';
COMMENT ON TABLE payment_attempts IS '[Tiền: thu, hoàn, chi và sổ tiền] Mỗi lần khách trả tiền qua cổng thanh toán và kết quả: thành công, thất bại hay chưa rõ.';
COMMENT ON TABLE provider_events IS '[Tiền: thu, hoàn, chi và sổ tiền] Thông báo cổng thanh toán gửi về (webhook), đã kiểm tra chữ ký. Dùng để xác nhận Nexus đã nhận tiền.';
COMMENT ON TABLE refunds IS '[Tiền: thu, hoàn, chi và sổ tiền] Lệnh hoàn tiền cho người mua: lý do, ai lập, ai duyệt (phải khác người lập), kết quả từ cổng thanh toán.';
COMMENT ON TABLE settlements IS '[Tiền: thu, hoàn, chi và sổ tiền] Bảng quyết toán cho chủ hàng của một món đã bán: tổng tiền, số chủ hàng được nhận, đủ điều kiện chi từ khi nào.';
COMMENT ON TABLE settlement_lines IS '[Tiền: thu, hoàn, chi và sổ tiền] Chi tiết từng dòng của quyết toán: giá bán, trừ hoa hồng, trừ phí kiểm định...';
COMMENT ON TABLE payouts IS '[Tiền: thu, hoàn, chi và sổ tiền] Lệnh chi tiền cho chủ hàng: chi vào tài khoản nào, Finance Maker lập, Finance Checker duyệt, ngân hàng đã chi chưa.';
COMMENT ON TABLE ledger_accounts IS '[Tiền: thu, hoàn, chi và sổ tiền] Danh sách tài khoản trong sổ tiền nội bộ, ví dụ tiền thu hộ, doanh thu phí, tiền phải trả chủ hàng.';
COMMENT ON TABLE ledger_transactions IS '[Tiền: thu, hoàn, chi và sổ tiền] Mỗi nghiệp vụ tiền (thu, hoàn, chi, điều chỉnh) là một giao dịch sổ, có khóa riêng để không bị ghi trùng.';
COMMENT ON TABLE ledger_entries IS '[Tiền: thu, hoàn, chi và sổ tiền] Các dòng ghi nợ, ghi có của một giao dịch sổ. Tổng nợ luôn bằng tổng có.';
COMMENT ON TABLE reconciliation_items IS '[Tiền: thu, hoàn, chi và sổ tiền] Kết quả đối chiếu số tiền hệ thống ghi với sao kê ngân hàng hoặc cổng thanh toán, và cách xử lý khi lệch.';
COMMENT ON TABLE fulfillment_profiles IS '[Giao nhận (qua API hãng vận chuyển)] Kiểu bàn giao. Pilot chỉ có 2 dòng cố định: PARCEL (giao qua hãng vận chuyển) và ONSITE (nhận tại kho). Cột JSON chỉ mô tả các bước, code không đọc để chạy quy trình.';
COMMENT ON TABLE fulfillment_cases IS '[Giao nhận (qua API hãng vận chuyển)] Việc giao một món của đơn: mã vận đơn và trạng thái lấy từ API của hãng, lúc hãng lấy hàng, lúc hãng báo đã giao, hạn khiếu nại 7 ngày. Các mốc giao nằm ở các cột này; không có bảng giao hàng nội bộ.';
COMMENT ON TABLE handover_appointments IS '[Giao nhận (qua API hãng vận chuyển)] Lịch hẹn nhận hàng tại kho hoặc giao tại chỗ: thời gian, địa điểm, người liên hệ.';
COMMENT ON TABLE handover_records IS '[Giao nhận (qua API hãng vận chuyển)] Biên bản bàn giao trực tiếp: ai giao, ai nhận, lúc nào, có chữ ký.';
COMMENT ON TABLE return_authorizations IS '[Giao nhận (qua API hãng vận chuyển)] Phiếu cho phép người mua trả hàng: gửi trả qua hãng nào, mã vận đơn, kết quả kiểm tra khi hàng về kho.';
COMMENT ON TABLE dispute_cases IS '[Vụ việc và tranh chấp] Vụ việc hoặc khiếu nại, gồm 7 loại: hàng giả hoặc kém chất lượng, sai món, vận chuyển, thanh toán, quyền sở hữu, sự cố phiên, hỏng hoặc mất trong kho. Có người phụ trách và hạn xử lý.';
COMMENT ON TABLE case_evidence IS '[Vụ việc và tranh chấp] Bằng chứng đính kèm vụ việc (ảnh, video, báo cáo) và ai đã nộp.';
COMMENT ON TABLE case_decisions IS '[Vụ việc và tranh chấp] Quyết định xử lý vụ việc theo phiên bản: hướng xử lý, người đề xuất và người duyệt (phải khác nhau).';
COMMENT ON TABLE recovery_claims IS '[Vụ việc và tranh chấp] Khoản tiền cần thu hồi sau khi đã chi, ví dụ chủ hàng phải trả lại khi phát hiện hàng giả.';
COMMENT ON TABLE documents IS '[Hệ thống, thông báo và dữ liệu cá nhân] Kho tệp dùng chung: ảnh, giấy tờ, hợp đồng, báo cáo. Lưu đường dẫn tệp, mã kiểm tra, đã quét mã độc chưa, mức độ riêng tư.';
COMMENT ON TABLE policy_versions IS '[Hệ thống, thông báo và dữ liệu cá nhân] Các bộ quy định và tham số theo phiên bản (thời hạn, phí, SLA...). Code đọc tham số ở đây thay vì viết cứng.';
COMMENT ON TABLE audit_events IS '[Hệ thống, thông báo và dữ liệu cá nhân] Nhật ký ai làm gì, lúc nào, trên dữ liệu nào. Dùng để tra lại và làm bằng chứng.';
COMMENT ON TABLE idempotency_records IS '[Hệ thống, thông báo và dữ liệu cá nhân] Ghi nhớ các yêu cầu đã xử lý, để khi người dùng bấm hai lần hoặc mạng gửi lại thì hệ thống không làm hai lần.';
COMMENT ON TABLE outbox_events IS '[Hệ thống, thông báo và dữ liệu cá nhân] Hàng đợi sự kiện chờ gửi đi (thông báo, cập nhật màn hình), được ghi cùng lúc với nghiệp vụ để không bị mất.';
COMMENT ON TABLE processed_events IS '[Hệ thống, thông báo và dữ liệu cá nhân] Danh sách sự kiện mỗi dịch vụ đã xử lý, để không xử lý trùng.';
COMMENT ON TABLE notification_deliveries IS '[Hệ thống, thông báo và dữ liệu cá nhân] Từng thông báo đã gửi qua email, trong app hoặc SMS: gửi được chưa, khách đã đọc chưa.';
COMMENT ON TABLE notification_preferences IS '[Hệ thống, thông báo và dữ liệu cá nhân] Khách bật hay tắt loại thông báo nào trên kênh nào. Thông báo bắt buộc không nằm ở đây nên không tắt được.';
COMMENT ON TABLE data_requests IS '[Hệ thống, thông báo và dữ liệu cá nhân] Yêu cầu tải bản sao, sửa hoặc xóa dữ liệu cá nhân của khách: hạn phản hồi 2 ngày làm việc, hạn hoàn tất 10 hoặc 20 ngày, gia hạn một lần.';
COMMENT ON TABLE retention_rules IS '[Hệ thống, thông báo và dữ liệu cá nhân] Mỗi loại dữ liệu được giữ bao lâu và hết hạn thì xử lý thế nào (xóa hay ẩn danh).';

COMMIT;
