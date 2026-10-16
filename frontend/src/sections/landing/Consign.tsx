import { Blob, HandNote, TornPhoto } from './primitives'
import { CheckIcon } from '../../components/icons'
import { Sparkle } from '../../components/icons'
import consignWatch from '../../assets/landing/consign-watch.png'

const STEPS = [
  { n: '1', title: 'Gửi ảnh', desc: 'Vài tấm rõ nét' },
  { n: '2', title: 'Nhận đề xuất', desc: 'Giá & kênh bán' },
  { n: '3', title: 'Lumora bán thay', desc: 'Bàn giao theo mốc' },
]

export default function Consign() {
  return (
    <section className="relative w-full overflow-hidden bg-[#3D0A18]">
      {/* Vệt màu nước nền — dùng đỏ sẫm để hoà vào nền, không hiện thành hình tròn lộ */}
      <Blob color="#7B1034" w={500} h={380} opacity={0.55} blur={90} style={{ left: 200, top: -80 }} />
      <Blob color="#3D0A18" w={520} h={360} opacity={0.7}  blur={100} style={{ right: -100, top: -60 }} />
      <Blob color="#6B0B27" w={380} h={300} opacity={0.5}  blur={80}  style={{ right: 160, bottom: -70 }} />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-10 py-16 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        {/* Trái: ảnh xé giấy + thẻ định giá */}
        <div data-consign-left className="relative mx-auto w-full max-w-[440px]">
          <TornPhoto src={consignWatch} alt="Đồng hồ ký gửi" rotate={-2} className="h-[420px] w-[360px]" pad={18} />
          <div className="absolute -bottom-4 right-0 w-[220px] bg-[#fffdf8] px-5 py-4 shadow-[0_18px_34px_-10px_rgba(13,5,5,0.4)]">
            <div className="font-caveat text-[18px] text-ink-600">Đề xuất của chuyên viên</div>
            <div className="text-[22px] font-extrabold text-brand">82 – 90 triệu đ</div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[13px] text-ink-600">
              <CheckIcon size={14} className="text-gold-deep" strokeWidth={2.4} />
              Phản hồi sau 4 giờ
            </div>
          </div>
        </div>

        {/* Phải: nội dung trên nền đỏ */}
        <div data-consign-right className="relative">
          <span className="inline-flex items-center rounded-full border border-gold/50 bg-white/8 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
            Dành cho người bán
          </span>
          <h2 className="mt-6 text-[52px] font-extrabold leading-[1.05] text-white">
            Bạn có món đồ
            <span className="mt-2 block font-caveat font-bold text-gold-soft" style={{ fontSize: 62, letterSpacing: '0.02em' }}>
              muốn bán?
            </span>
          </h2>
          <p className="mt-5 max-w-[480px] text-[15px] leading-[1.7] text-cream-light">
            Gửi vài tấm ảnh — chuyên viên Lumora đề xuất giá và cách bán phù hợp nhất cho bạn.
          </p>

          {/* 3 bước */}
          <div className="mt-10 flex flex-wrap gap-x-12 gap-y-5">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-gold font-mono text-[15px] font-bold text-gold shadow-[0_8px_24px_-8px_rgba(233,207,132,0.4)]">
                  {s.n}
                </span>
                <div className="mt-0.5">
                  <div className="text-[15px] font-semibold text-white">{s.title}</div>
                  <div className="text-[13px] text-cream-light/75">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA + handwritten note */}
          <div className="mt-12 flex flex-col items-start gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="rounded-full bg-gold-grad px-8 py-3.5 text-[15px] font-semibold text-[#2a1a06] shadow-[0_14px_30px_-10px_rgba(212,175,55,0.6)] transition hover:brightness-105"
              >
                Nhận định giá miễn phí
              </button>
              <button
                type="button"
                className="rounded-full border border-cream-light/50 px-7 py-3.5 text-[15px] font-semibold text-cream-light transition hover:bg-white/10"
              >
                Xem biểu phí
              </button>
            </div>
            {/* Doodle + handwritten message */}
            <div className="flex items-end gap-2">
              <svg width="54" height="60" viewBox="0 0 54 60" fill="none" className="mb-1">
                <path d="M8 8c16 0 32 10 40 28" stroke="#F4DC92" strokeWidth="2" strokeLinecap="round" />
                <path d="M48 36c2-7 2-12 0-18-5 4-10 6-16 8" stroke="#F4DC92" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <HandNote rotate={-5} size={23} color="#F4DC92" className="mb-1">
                Let us tell
                <br />
                its story
              </HandNote>
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-2.5 text-[14px] text-cream-light">
            <Sparkle size={16} className="text-gold-soft" />
            <span className="font-medium">1.240 món đã được định giá tháng này</span>
          </div>
        </div>
      </div>
    </section>
  )
}
