import { useId } from 'react'

type IconProps = {
  className?: string
  size?: number
  strokeWidth?: number
}

/** Envelope / Gmail */
export function MailIcon({ className, size = 18, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Mobile phone */
export function MobileIcon({ className, size = 18, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="7" y="2" width="10" height="20" rx="2.6" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M11 18.5h2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

/** Arrow right */
export function ArrowRightIcon({ className, size = 18, strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Arrow left */
export function ArrowLeftIcon({ className, size = 16, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H6M11 6l-6 6 6 6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Check / tick */
export function CheckIcon({ className, size = 14, strokeWidth = 2 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 12.5 10 17.5 19 7" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Eye (hiện/ẩn mật khẩu) */
export function EyeIcon({ className, size = 18, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  )
}

/** User (ô Họ và tên) */
export function UserIcon({ className, size = 18, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

/** Lock (ô mật khẩu) */
export function LockIcon({ className, size = 18, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

/** Chevron down */
export function ChevronDownIcon({ className, size = 14, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Info */
export function InfoIcon({ className, size = 14, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M12 11v5M12 8h.01" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

/** Shield (bảo mật) */
export function ShieldIcon({ className, size = 16, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3 5 6v5c0 4.2 2.8 7.6 7 9 4.2-1.4 7-4.8 7-9V6l-7-3Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Ngôi sao viền (trang trí) */
export function StarOutlineIcon({ className, size = 24, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3c.4 3.6 1.4 4.6 5 5-3.6.4-4.6 1.4-5 5-.4-3.6-1.4-4.6-5-5 3.6-.4 4.6-1.4 5-5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Lấp lánh — ngôi sao 4 cánh tô gradient vàng */
export function Sparkle({ className, size = 18 }: { className?: string; size?: number }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8C6A2B" />
          <stop offset="18.57%" stopColor="#E9CF84" />
          <stop offset="31.43%" stopColor="#FFF3C8" />
          <stop offset="42.86%" stopColor="#D4AF37" />
          <stop offset="57.14%" stopColor="#A67C2E" />
          <stop offset="71.43%" stopColor="#EBD08A" />
        </linearGradient>
      </defs>
      <path
        d="M12 1c.7 5.3 4 8.6 11 9.5-7 .9-10.3 4.2-11 9.5-.7-5.3-4-8.6-11-9.5 7-.9 10.3-4.2 11-9.5Z"
        fill={`url(#${id})`}
      />
    </svg>
  )
}
