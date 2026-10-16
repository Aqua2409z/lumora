import { HandNote, Polaroid, TagLabel, Tape } from './primitives'
import { StarFillIcon, GavelIcon, BagIcon, ShieldCheckIcon } from '../../components/icons/landing'
import type { ComponentType } from 'react'
import ringImg from '../../assets/landing/why-ring.png'

type Feature = {
  icon: ComponentType<{ size?: number; className?: string }>
  tone: 'pink' | 'gold'
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  { icon: StarFillIcon, tone: 'pink', title: 'Tài sản độc bản', desc: 'Món đồ có giá trị, số lượng giới hạn.' },
  { icon: GavelIcon, tone: 'gold', title: 'Đấu giá trực tuyến', desc: 'Mọi lúc, mọi nơi — giờ do máy chủ ghi.' },
  { icon: BagIcon, tone: 'pink', title: 'Mua ngay linh hoạt', desc: 'Sở hữu ngay với giá niêm yết.' },
  { icon: ShieldCheckIcon, tone: 'gold', title: 'Kiểm định độc lập', desc: 'Báo cáo công khai cho từng lô.' },
]

export default function Why() {
  return (
    <section className="relative mx-auto max-w-[1280px] px-10 py-12">
      <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center">
        {/* Trái: tiêu đề */}
        <div className="w-full shrink-0 lg:w-[230px]">
          <TagLabel className="mb-4">Tiện ích nổi bật</TagLabel>
          <h2 className="text-[30px] font-bold leading-tight text-ink">Vì sao chọn Lumora?</h2>
          <p className="mt-3 text-[15px] leading-[1.6] text-ink-600">
            Ký gửi, kiểm định và đấu giá trong một nơi — minh bạch từ đầu đến cuối.
          </p>
        </div>

        {/* Giữa: bảng 4 tiện ích */}
        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-8 rounded-[24px] bg-white p-8 shadow-[0_20px_50px_-24px_rgba(23,15,10,0.2)] lg:grid-cols-4 lg:divide-x lg:divide-[#f0e9df]">
          {FEATURES.map(({ icon: Icon, tone, title, desc }) => (
            <div data-why-item key={title} className="lg:px-5 lg:first:pl-0">
              <div
                className={`mb-4 grid h-11 w-11 place-items-center rounded-full ${
                  tone === 'pink' ? 'bg-pink text-brand' : 'bg-[#f6ecd2] text-gold-deep'
                }`}
              >
                <Icon size={19} />
              </div>
              <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-[14px] leading-[1.5] text-ink-500">{desc}</p>
            </div>
          ))}
        </div>

        {/* Phải: polaroid nhẫn */}
        <div className="relative hidden shrink-0 lg:block">
          <Polaroid src={ringImg} alt="Nhẫn kim cương" rotate={5} w={180} />
          <Tape w={70} h={26} rotate={-10} tone="gold" style={{ left: 54, top: -10 }} />
          <div className="absolute -right-24 top-10 flex items-start gap-1">
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none" className="mt-1">
              <path d="M38 4C26 2 10 8 3 20" stroke="#5E5757" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M2 12c0 4 1 6 3 9 3-2 6-3 9-4" stroke="#5E5757" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <HandNote rotate={8} size={19} className="text-ink-500">
              Collect
              <br />
              your
              <br />
              moments
            </HandNote>
          </div>
        </div>
      </div>
    </section>
  )
}
