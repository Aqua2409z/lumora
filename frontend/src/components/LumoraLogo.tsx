import { useId } from 'react'

/** Biểu tượng Lumora — thẻ đấu giá (lot tag) nét vàng gold */
export function LumoraMark({ size = 52 }: { size?: number }) {
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
      {/* Dây buộc */}
      <path d="M12 12 18.5 18.5" stroke={`url(#${id})`} strokeWidth="2.4" strokeLinecap="round" />
      {/* Thẻ lot (viền) */}
      <path
        d="M23.5 13 H39 a3 3 0 0 1 3 3 V36 a3 3 0 0 1 -3 3 H19 a3 3 0 0 1 -3 -3 V22.5 Z"
        stroke={`url(#${id})`}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Lỗ xỏ */}
      <circle cx="21.6" cy="20.6" r="2.1" stroke={`url(#${id})`} strokeWidth="2" />
      {/* Dấu tick */}
      <path
        d="M24 28.5 27.5 32 34 24.5"
        stroke={`url(#${id})`}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ánh sáng / chấm sáng */}
      <path d="M44 9 44.6 11.2 46.8 11.8 44.6 12.4 44 14.6 43.4 12.4 41.2 11.8 43.4 11.2 Z" fill={`url(#${id})`} />
      <circle cx="47.4" cy="16" r="1.3" fill={`url(#${id})`} />
    </svg>
  )
}

/** Logo đầy đủ: biểu tượng + chữ "Lumora" */
export default function LumoraLogo() {
  return (
    <div className="flex items-center gap-1.5" style={{ height: 52 }}>
      <LumoraMark size={52} />
      <span className="font-serif font-semibold text-[30px] leading-10 text-cream-light">
        Lumora
      </span>
    </div>
  )
}
