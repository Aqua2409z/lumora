import { useId } from 'react'

type IconProps = {
  className?: string
  size?: number
  strokeWidth?: number
}

/** Kính lúp (ô tìm kiếm) */
export function SearchIcon({ className, size = 18, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

/** Chuông thông báo */
export function BellIcon({ className, size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 9a6 6 0 0 1 12 0c0 4 1.2 5.5 2 6.5H4c.8-1 2-2.5 2-6.5Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

/** Giỏ hàng */
export function CartIcon({ className, size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 4h2l2.2 11.3a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.5-1.2L20 7H6"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17.5" cy="20" r="1.4" fill="currentColor" />
    </svg>
  )
}

/** Trái tim (yêu thích) — viền */
export function HeartIcon({ className, size = 20, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 20S4 15 4 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Ghim vị trí */
export function MapPinIcon({ className, size = 16, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 21c4-4.5 7-7.6 7-11a7 7 0 1 0-14 0c0 3.4 3 6.5 7 11Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  )
}

/** Đồng hồ (đếm ngược) */
export function ClockIcon({ className, size = 15, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Ngôi sao đặc (tô màu hiện tại) */
export function StarFillIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5c.5 3.8 2 5.3 5.8 5.8-3.8.5-5.3 2-5.8 5.8-.5-3.8-2-5.3-5.8-5.8 3.8-.5 5.3-2 5.8-5.8Z" />
    </svg>
  )
}

/** Búa đấu giá */
export function GavelIcon({ className, size = 18, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m14 6 4 4M9.5 10.5 6 14M4 20h8" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <rect x="10.5" y="3.2" width="6" height="4" rx="1" transform="rotate(45 13.5 5.2)" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="m12 12 4 4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

/** Túi mua sắm */
export function BagIcon({ className, size = 18, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5.5 8h13l-1 12H6.5l-1-12Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="M8.5 9V6.5a3.5 3.5 0 0 1 7 0V9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  )
}

/** Shield + check (kiểm định) */
export function ShieldCheckIcon({ className, size = 18, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3 5 6v5c0 4.2 2.8 7.6 7 9 4.2-1.4 7-4.8 7-9V6l-7-3Z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Chứng nhận / giao hàng (xe tải nhỏ) */
export function TruckIcon({ className, size = 16, strokeWidth = 1.7 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 6h10v9H3zM13 9h4l3 3v3h-7z" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.6" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="17" cy="18" r="1.6" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  )
}

export function FacebookIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.3c0-.8.3-1.4 1.5-1.4h1.4V5.4C15.9 5.3 15 5.2 14 5.2c-2.1 0-3.5 1.3-3.5 3.6v2.4H8v2.8h2.5V21h3Z" />
    </svg>
  )
}

export function InstagramIcon({ className, size = 18, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="5" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" />
    </svg>
  )
}

export function YoutubeIcon({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.5 8.2a2.5 2.5 0 0 0-1.8-1.8C18 6 12 6 12 6s-6 0-7.7.4A2.5 2.5 0 0 0 2.5 8.2 26 26 0 0 0 2.2 12a26 26 0 0 0 .3 3.8 2.5 2.5 0 0 0 1.8 1.8C6 18 12 18 12 18s6 0 7.7-.4a2.5 2.5 0 0 0 1.8-1.8 26 26 0 0 0 .3-3.8 26 26 0 0 0-.3-3.8ZM10 15V9l5 3-5 3Z" />
    </svg>
  )
}

/** Mark Lumora cỡ nhỏ cho header/footer (nét gradient vàng) */
export function LumoraMarkSmall({ size = 34 }: { size?: number }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" aria-hidden>
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
      <path d="M12 12 18.5 18.5" stroke={`url(#${id})`} strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M23.5 13 H39 a3 3 0 0 1 3 3 V36 a3 3 0 0 1 -3 3 H19 a3 3 0 0 1 -3 -3 V22.5 Z"
        stroke={`url(#${id})`}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="21.6" cy="20.6" r="2.1" stroke={`url(#${id})`} strokeWidth="2" />
      <path d="M24 28.5 27.5 32 34 24.5" stroke={`url(#${id})`} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 9 44.6 11.2 46.8 11.8 44.6 12.4 44 14.6 43.4 12.4 41.2 11.8 43.4 11.2 Z" fill={`url(#${id})`} />
      <circle cx="47.4" cy="16" r="1.3" fill={`url(#${id})`} />
    </svg>
  )
}
