type DoodleProps = {
  className?: string
  color?: string
}

/** Nét vẽ tay — vòng xoắn + mũi tên (dưới ghi chú trong collage) */
export function LoopSwirl({ className, color = '#E9CF84' }: DoodleProps) {
  return (
    <svg width="90" height="56" viewBox="0 0 90 56" fill="none" className={className}>
      <path
        d="M4 20c10-14 24-6 20 6-3 9-16 7-15-3C10 10 30 6 50 14c14 6 24 16 34 20"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M78 28c4 2 7 4 10 6-4 1-7 2-10 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Nét vẽ tay — gạch chân (dưới chữ "vật chất.") */
export function Underline({ className, color = '#E9CF84' }: DoodleProps) {
  return (
    <svg width="234" height="26" viewBox="0 0 234 26" fill="none" className={className}>
      <path
        d="M4 14c40-8 90-11 140-8 30 2 60 6 86 10"
        stroke={color}
        strokeWidth="3.96"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Nét vẽ tay — mũi tên cong (trỏ vào form) */
export function CurvedArrow({ className, color = '#9F1239' }: DoodleProps) {
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" fill="none" className={className}>
      <path d="M60 4C44 2 24 8 10 24" stroke={color} strokeWidth="1.28" strokeLinecap="round" />
      <path d="M6 16c0 6 1 9 4 14 4-3 8-5 13-6" stroke={color} strokeWidth="1.28" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
