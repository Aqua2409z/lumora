import { useId, type CSSProperties, type ReactNode } from 'react'

/* ============================================================
 *  Các thành phần trang trí dùng chung cho landing (phong cách
 *  scrapbook: vệt màu nước, băng dính, ảnh xé giấy, polaroid,
 *  chữ viết tay, doodle). Dùng lại ở nhiều section.
 * ========================================================== */

/** Wordmark "Lumora" — "Lum" đậm + "ora" vàng gold (Cormorant Garamond). */
export function LumoraWordmark({
  size = 30,
  tone = 'ink',
  className = '',
}: {
  size?: number
  /** 'ink' = chữ đen (nền sáng); 'cream' = chữ kem (nền tối) */
  tone?: 'ink' | 'cream'
  className?: string
}) {
  const base = tone === 'cream' ? 'text-cream-light' : 'text-ink'
  return (
    <span
      className={`font-display font-bold leading-none ${base} ${className}`}
      style={{ fontSize: size, letterSpacing: '0.01em' }}
    >
      Lum<span className="text-gold-grad">ora</span>
    </span>
  )
}

/** Vệt màu nước — khối mờ hữu cơ nằm dưới nội dung (trang trí). */
export function Blob({
  color = '#9F1239',
  w = 320,
  h = 240,
  opacity = 0.14,
  blur = 36,
  rotate = 0,
  radius = '47% 53% 62% 38% / 42% 46% 54% 58%',
  className = '',
  style,
}: {
  color?: string
  w?: number
  h?: number
  opacity?: number
  blur?: number
  rotate?: number
  radius?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: w,
        height: h,
        background: color,
        opacity,
        filter: `blur(${blur}px)`,
        borderRadius: radius,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    />
  )
}

/** Băng dính giấy — dải mờ chéo (dán góc ảnh/thẻ). */
export function Tape({
  w = 92,
  h = 30,
  rotate = -4,
  className = '',
  tone = 'cream',
  style,
}: {
  w?: number
  h?: number
  rotate?: number
  className?: string
  tone?: 'cream' | 'gold'
  style?: CSSProperties
}) {
  const bg =
    tone === 'gold'
      ? 'linear-gradient(180deg, rgba(233,207,132,0.72), rgba(212,175,55,0.5))'
      : 'linear-gradient(180deg, rgba(245,240,232,0.82), rgba(236,229,218,0.62))'
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: w,
        height: h,
        background: bg,
        transform: `rotate(${rotate}deg)`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        ...style,
      }}
    />
  )
}

/**
 * Ảnh xé giấy — ảnh có viền giấy trắng với mép xé lởm chởm.
 * Mép xé tạo bằng SVG filter feTurbulence + displacement trên lớp giấy trắng,
 * ảnh thật nằm trên nên không bị méo.
 */
export function TornPhoto({
  src,
  alt = '',
  rotate = 0,
  pad = 16,
  className = '',
  imgClassName = '',
  style,
  children,
}: {
  src: string
  alt?: string
  rotate?: number
  pad?: number
  className?: string
  imgClassName?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const id = useId().replace(/:/g, '')
  return (
    <div
      className={`relative ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      {/* Lớp giấy trắng mép xé */}
      <svg width="0" height="0" className="absolute">
        <filter id={`torn-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="3" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div
        aria-hidden
        className="absolute bg-[#fffdf8]"
        style={{ inset: -pad, filter: `url(#torn-${id})`, boxShadow: '0 18px 36px rgba(23,15,10,0.35)' }}
      />
      {/* Ảnh thật */}
      <img
        src={src}
        alt={alt}
        className={`relative block h-full w-full object-cover ${imgClassName}`}
        draggable={false}
      />
      {children}
    </div>
  )
}

/** Khung polaroid — ảnh viền trắng dày (đáy dày hơn), nghiêng nhẹ. */
export function Polaroid({
  src,
  alt = '',
  caption,
  count,
  rotate = 0,
  w = 186,
  className = '',
  style,
}: {
  src: string
  alt?: string
  caption?: string
  count?: string
  rotate?: number
  w?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={`bg-[#fffdf8] p-3 pb-2 shadow-polaroid ${className}`}
      style={{ width: w, transform: `rotate(${rotate}deg)`, ...style }}
    >
      <img src={src} alt={alt} className="block h-[180px] w-full object-cover" draggable={false} />
      {(caption || count) && (
        <div className="flex items-center justify-between px-1 pt-2.5">
          <span className="font-hand text-[18px] leading-none text-ink">{caption}</span>
          {count && <span className="text-[13px] font-semibold text-brand">{count}</span>}
        </div>
      )}
    </div>
  )
}

/** Ghi chú viết tay (Caveat). */
export function HandNote({
  children,
  rotate = -6,
  color = '#5E5757',
  size = 22,
  className = '',
  style,
}: {
  children: ReactNode
  rotate?: number
  color?: string
  size?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      className={`font-caveat leading-tight ${className}`}
      style={{ transform: `rotate(${rotate}deg)`, color, fontSize: size, display: 'inline-block', ...style }}
    >
      {children}
    </span>
  )
}

/** Nhãn nhỏ dạng viên (pill) — nền hồng nhạt, chữ brand, in hoa. */
export function TagLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-pink px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand ${className}`}
    >
      {children}
    </span>
  )
}

/** Tiêu đề section: nhãn pill + tiêu đề + mô tả (trái), link "Xem tất cả" (phải). */
export function SectionHeading({
  label,
  title,
  subtitle,
  seeAll,
}: {
  label: string
  title: string
  subtitle?: string
  seeAll?: string
}) {
  return (
    <div data-section-head className="mb-8 flex items-end justify-between gap-4">
      <div>
        <TagLabel className="mb-3">{label}</TagLabel>
        <h2 className="text-[32px] font-bold leading-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-1.5 text-[15px] text-ink-600">{subtitle}</p>}
      </div>
      {seeAll && (
        <a href="#" className="group inline-flex shrink-0 items-center gap-1.5 pb-1 text-[14px] font-medium text-ink-600 hover:text-brand">
          {seeAll}
          <svg width="18" height="12" viewBox="0 0 24 16" fill="none" className="transition group-hover:translate-x-0.5">
            <path d="M3 8h17M14 2l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}
    </div>
  )
}
