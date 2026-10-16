import { useState, type ReactNode } from 'react'
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  EyeIcon,
  InfoIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  Sparkle,
  UserIcon,
} from '../../components/icons'

/* ---------- Nhóm trường (nhãn + ô nhập) ---------- */
export function Field({
  label,
  action,
  children,
}: {
  label: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex w-[440px] flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold leading-4 text-ink">{label}</span>
        {action}
      </div>
      {children}
    </div>
  )
}

/* ---------- Ô nhập Họ và tên ---------- */
export function NameInput({
  value,
  onChange,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
}) {
  return (
    <div className="flex h-14 w-[440px] items-center gap-3 rounded-[18px] border-[1.5px] border-[rgba(23,23,23,0.14)] bg-cream-card px-[18px] focus-within:border-brand focus-within:shadow-ring-brand">
      <span className="text-ink-500">
        <UserIcon size={18} />
      </span>
      <input
        type="text"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nguyễn Văn A"
        autoComplete="name"
        className="flex-1 bg-transparent text-[15px] leading-[19px] text-ink caret-brand outline-none placeholder:text-ink-500/60"
      />
    </div>
  )
}

/* ---------- Ô nhập Gmail ---------- */
export function EmailInput({
  value,
  onChange,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
}) {
  return (
    <div className="flex h-14 w-[440px] items-center gap-3 rounded-[18px] border-[1.5px] border-[rgba(23,23,23,0.14)] bg-cream-card px-[18px] focus-within:border-brand focus-within:shadow-ring-brand">
      <span className="text-ink-500">
        <MailIcon size={18} />
      </span>
      <input
        type="email"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ban@gmail.com"
        autoComplete="email"
        className="flex-1 bg-transparent text-[15px] leading-[19px] text-ink caret-brand outline-none placeholder:text-ink-500/60"
      />
    </div>
  )
}

/* ---------- Ô nhập mật khẩu ---------- */
export function PasswordInput({
  value,
  onChange,
  autoComplete = 'current-password',
}: {
  value: string
  onChange: (v: string) => void
  autoComplete?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex h-14 w-[440px] items-center gap-3 rounded-[18px] border-[1.5px] border-[rgba(23,23,23,0.14)] bg-cream-card px-[18px] focus-within:border-brand focus-within:shadow-ring-brand">
      <span className="text-ink-500">
        <LockIcon size={18} />
      </span>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập mật khẩu của bạn"
        autoComplete={autoComplete}
        className="flex-1 bg-transparent text-[15px] leading-[19px] text-ink caret-brand outline-none placeholder:text-ink-500/60 placeholder:tracking-normal tracking-[0.18em]"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        className="text-ink-500 transition-colors hover:text-ink"
      >
        <EyeIcon size={18} />
      </button>
    </div>
  )
}

/* ---------- Ô nhập số điện thoại (trang trí — OTP chưa làm) ---------- */
export function PhoneInput() {
  return (
    <div className="flex h-14 w-[440px] items-center gap-3 rounded-[18px] border-[1.5px] border-brand bg-cream-card px-[18px] shadow-ring-brand">
      {/* Mã vùng */}
      <div className="flex items-center gap-2">
        <span className="flex h-[15px] w-[22px] items-center justify-center rounded-[3px]" style={{ background: '#C8102E' }}>
          <Sparkle size={8} />
        </span>
        <span className="text-[15px] font-semibold leading-[19px] text-ink">+84</span>
        <span className="text-ink-500">
          <ChevronDownIcon size={14} />
        </span>
      </div>
      <span className="h-6 w-px" style={{ background: 'rgba(23,23,23,0.14)' }} />
      <input
        type="tel"
        defaultValue="912 345 678"
        className="flex-1 bg-transparent text-[15px] font-medium leading-[19px] text-ink caret-brand outline-none"
      />
      <span className="text-success">
        <CheckIcon size={18} />
      </span>
    </div>
  )
}

/* ---------- Gợi ý nhỏ (icon + text) ---------- */
export function Hint({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-ink-500">{icon}</span>
      <span className="text-[12.5px] leading-4 text-ink-500">{children}</span>
    </div>
  )
}

export function OtpHint() {
  return <Hint icon={<InfoIcon size={14} />}>Mã OTP gồm 6 số sẽ được gửi qua SMS trong vài giây.</Hint>
}

/* ---------- Thông báo lỗi (hiện khi API trả lỗi) ---------- */
export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex w-[440px] items-start gap-2 rounded-[14px] border border-brand/25 bg-pink px-4 py-3"
    >
      <span className="mt-[1px] text-brand">
        <InfoIcon size={16} />
      </span>
      <span className="text-[13px] leading-[18px] text-brand-dark">{message}</span>
    </div>
  )
}

/* ---------- Checkbox "Ghi nhớ đăng nhập" ---------- */
export function RememberCheckbox() {
  const [checked, setChecked] = useState(true)
  return (
    <button
      type="button"
      onClick={() => setChecked((c) => !c)}
      className="flex select-none items-center gap-2.5"
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-[6px] ${
          checked ? 'bg-brand text-cream-light' : 'border border-[rgba(23,23,23,0.2)] bg-cream-card text-transparent'
        }`}
      >
        <CheckIcon size={13} strokeWidth={2.4} />
      </span>
      <span className="text-[13.5px] leading-[17px] text-ink-700">Ghi nhớ đăng nhập trên thiết bị này</span>
    </button>
  )
}

/* ---------- Nút chính (Đăng nhập / Đăng ký / Nhận mã OTP) ---------- */
export function PrimaryButton({
  label,
  loading,
  disabled,
}: {
  label: string
  loading?: boolean
  disabled?: boolean
}) {
  const inactive = loading || disabled
  return (
    <button
      type="submit"
      disabled={inactive}
      className={`flex h-14 w-[440px] items-center justify-between rounded-[28px] bg-brand pl-7 pr-2 shadow-btn-brand transition-transform active:scale-[0.99] ${
        inactive ? 'cursor-not-allowed opacity-60 active:scale-100' : ''
      }`}
    >
      <span className="text-[15px] font-semibold leading-[19px] text-cream-light">
        {loading ? 'Đang xử lý…' : label}
      </span>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-light text-brand">
        {loading ? <Spinner /> : <ArrowRightIcon size={18} />}
      </span>
    </button>
  )
}

/* ---------- Vòng xoay chờ ---------- */
function Spinner() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/* ---------- Nút Google (trang trí — đăng nhập Google chưa làm) ---------- */
export function GoogleButton() {
  return (
    <button
      type="button"
      title="Đăng nhập bằng Google đang được phát triển"
      className="flex h-14 w-[440px] cursor-not-allowed items-center justify-center gap-3 rounded-[28px] border border-[rgba(23,23,23,0.14)] bg-white opacity-80 shadow-btn-google"
    >
      <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[rgba(23,23,23,0.18)]">
        <span className="text-[13px] font-bold leading-4 text-ink">G</span>
      </span>
      <span className="text-[15px] font-semibold leading-[19px] text-ink">Tiếp tục với Google</span>
    </button>
  )
}

/* ---------- Đường phân cách có chữ ---------- */
export function Divider({ label }: { label: string }) {
  return (
    <div className="flex h-4 w-[440px] items-center gap-3.5">
      <span className="h-px flex-1" style={{ background: 'rgba(23,23,23,0.12)' }} />
      <span className="whitespace-nowrap text-[12.5px] leading-4 text-ink-500">{label}</span>
      <span className="h-px flex-1" style={{ background: 'rgba(23,23,23,0.12)' }} />
    </div>
  )
}

/* ---------- Dòng bảo mật cuối form ---------- */
export function SecurityNote({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-ink-500">
        <ShieldIcon size={16} />
      </span>
      <span className="text-[12.5px] leading-4 text-ink-500">{text}</span>
    </div>
  )
}
