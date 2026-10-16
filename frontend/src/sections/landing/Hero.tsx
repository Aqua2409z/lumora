import { useState } from 'react'
import { Blob, HandNote, Tape, TornPhoto } from './primitives'
import { ArrowRightIcon, StarOutlineIcon } from '../../components/icons'
import { ClockIcon, GavelIcon, ShieldCheckIcon, TruckIcon } from '../../components/icons/landing'
import carImg from '../../assets/landing/hero-car.png'
import thumb1 from '../../assets/landing/hero-thumb-1.png'
import thumb2 from '../../assets/landing/hero-thumb-2.png'
import thumb3 from '../../assets/landing/hero-thumb-3.png'

const TRUST = [
  { icon: GavelIcon, label: 'Đấu giá minh bạch' },
  { icon: ShieldCheckIcon, label: 'Xác thực nguồn gốc' },
  { icon: TruckIcon, label: 'Giao dịch an toàn' },
]

// Dữ liệu từng slide của carousel
const SLIDES = [
  {
    img: carImg,
    thumb: thumb1,
    note: ['Xe thể thao,', 'bản giới hạn 2019'],
    lot: 'LÔ 0250',
    price: '2.350.000.000 đ',
    time: '02 : 14 : 37',
  },
  {
    img: thumb2,
    thumb: thumb2,
    note: ['Đồng hồ cổ,', 'phiên bản hiếm'],
    lot: 'LÔ 0251',
    price: '205.000.000 đ',
    time: '04 : 41 : 55',
  },
  {
    img: thumb3,
    thumb: thumb3,
    note: ['Tranh sơn dầu,', 'thập niên 1990'],
    lot: 'LÔ 0252',
    price: '186.000.000 đ',
    time: '01 : 08 : 22',
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const slide = SLIDES[current]

  function next() {
    setCurrent((prev) => (prev + 1) % SLIDES.length)
  }

  return (
    <section className="relative mx-auto max-w-[1280px] px-10 pt-10 pb-6">
      {/* Vệt màu nước nền */}
      <Blob color="#F4DC92" w={360} h={300} opacity={0.5} blur={44} style={{ left: -40, bottom: -30 }} />
      <Blob color="#9F1239" w={300} h={280} opacity={0.12} blur={40} style={{ right: 360, top: 120 }} />

      <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
        {/* ---------------- Cột trái ---------------- */}
        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <HandNote rotate={-8} size={22} className="text-ink-600">
              Rare finds.
              <br />
              Real stories.
            </HandNote>
            <StarOutlineIcon className="mt-1 text-ink-500" size={22} />
          </div>

          <h1 data-hero-heading className="font-sans font-extrabold text-ink" style={{ fontSize: 68, lineHeight: 1.04 }}>
            Những giá trị
            <span className="relative mt-1 block">
              <StarOutlineIcon className="absolute -left-1 top-3 text-brand" size={26} />
              <span className="font-caveat font-bold text-brand" style={{ fontSize: 60, paddingLeft: 34 }}>
                thật, không chỉ là
              </span>
            </span>
            <span className="relative mt-1 inline-block">
              vật chất.
              <svg
                width="240"
                height="20"
                viewBox="0 0 240 20"
                fill="none"
                className="absolute -bottom-2 left-0"
              >
                <path d="M4 12c44-8 96-10 150-7 28 2 56 5 82 9" stroke="#D4AF37" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p data-hero-body className="mt-7 max-w-[460px] text-[15px] leading-[1.7] text-ink-600">
            <span className="font-display text-[17px] font-bold text-ink">Lumora</span> là nền tảng đấu giá kết hợp
            mua ngay — nơi những tài sản độc bản, quý hiếm được kết nối với những người thực sự trân trọng chúng.
          </p>

          {/* CTA */}
          <div data-hero-cta className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="group inline-flex items-center gap-3 rounded-full bg-brand py-2.5 pl-6 pr-2.5 text-[15px] font-semibold text-white shadow-btn-brand transition hover:bg-brand-dark"
            >
              Khám phá ngay
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 transition group-hover:translate-x-0.5">
                <ArrowRightIcon size={18} />
              </span>
            </button>
            <button
              type="button"
              className="rounded-full border border-[#e4dccf] bg-white px-7 py-3.5 text-[15px] font-semibold text-ink transition hover:border-brand hover:text-brand"
            >
              Xem danh mục
            </button>
          </div>

          {/* Cam kết */}
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 text-[14px] text-ink-600">
            {TRUST.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon className="text-brand" size={17} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ---------------- Cột phải (collage) ---------------- */}
        <div data-hero-right className="relative mx-auto h-[470px] w-full max-w-[640px]">
          {/* Vệt màu nước sau ảnh */}
          <Blob color="#9F1239" w={220} h={260} opacity={0.5} blur={30} style={{ left: -30, top: 150 }} />
          <Blob color="#F4DC92" w={200} h={200} opacity={0.6} blur={34} style={{ right: 10, top: 60 }} />
          <Blob color="#9F1239" w={200} h={220} opacity={0.4} blur={30} style={{ right: -20, bottom: 0 }} />

          {/* Ghi chú viết tay — đổi theo slide */}
          <HandNote rotate={-7} size={22} className="absolute left-8 top-0 z-20 text-ink-500">
            {slide.note[0]}
            <br />
            {slide.note[1]}
          </HandNote>
          <HandNote rotate={8} size={20} className="absolute right-0 top-40 z-20 text-ink-500">
            Classic
            <br />
            never
            <br />
            gets old
          </HandNote>

          {/* Ảnh xé giấy — đổi theo slide */}
          <TornPhoto
            src={slide.img}
            alt={slide.note.join(' ')}
            rotate={-1.5}
            className="absolute left-4 top-16 z-10 h-[300px] w-[440px]"
          />

          {/* Thẻ LOT — đổi theo slide */}
          <div className="absolute right-0 top-6 z-30 w-[200px] rotate-[2deg] overflow-hidden bg-[#fffdf8] shadow-[0_16px_30px_-8px_rgba(13,5,5,0.3)]">
            <Tape w={70} h={26} rotate={-8} tone="gold" style={{ left: 22, top: -12 }} />
            {/* Ảnh mini của lô */}
            <img
              src={slide.thumb}
              alt={slide.lot}
              className="h-[90px] w-full object-cover"
              draggable={false}
            />
            <div className="px-4 py-3">
              <div className="text-[15px] font-bold tracking-wide text-ink">{slide.lot}</div>
              <div className="my-2 h-px bg-[#ece5da]" />
              <div className="text-[11px] text-ink-500">Giá hiện tại</div>
              <div className="text-[16px] font-extrabold leading-snug text-brand">{slide.price}</div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-ink-600">
                <ClockIcon size={13} className="text-ink-500" />
                <span className="font-mono">{slide.time}</span>
              </div>
            </div>
          </div>

          {/* Dải thumbnail — bấm để đổi slide */}
          <div className="absolute bottom-0 right-6 z-30 flex items-center gap-2.5">
            {SLIDES.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-[46px] w-[66px] overflow-hidden rounded-lg transition focus:outline-none ${
                  i === current
                    ? 'ring-2 ring-brand ring-offset-2 ring-offset-cream-light'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img src={s.thumb} alt="" className="h-full w-full object-cover" draggable={false} />
              </button>
            ))}
            {/* Nút tiếp → đổi sang slide kế */}
            <button
              type="button"
              onClick={next}
              aria-label="Slide tiếp theo"
              className="grid h-9 w-9 place-items-center rounded-full border border-[#ece5da] bg-white text-ink shadow-sm transition hover:bg-brand hover:text-white"
            >
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Chấm carousel — sáng theo slide hiện tại */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition focus:outline-none ${
              i === current ? 'h-1.5 w-6 bg-brand' : 'h-1.5 w-1.5 bg-ink-500/30 hover:bg-ink-500/60'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
