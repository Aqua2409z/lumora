import { SectionHeading } from './primitives'
import { HeartIcon, MapPinIcon, ClockIcon, ShieldCheckIcon } from '../../components/icons/landing'
import { ArrowRightIcon } from '../../components/icons'
import lot1 from '../../assets/landing/lot-1.png'
import lot2 from '../../assets/landing/lot-2.png'
import lot3 from '../../assets/landing/lot-3.png'
import lot4 from '../../assets/landing/lot-4.png'

type Lot = {
  img: string
  status: { text: string; solid: boolean }
  title: string
  category: string
  price: string
  action: { type: 'countdown'; time: string } | { type: 'buy' }
  place: string
  meta: string
}

const LOTS: Lot[] = [
  {
    img: lot1,
    status: { text: 'Đang đấu giá', solid: false },
    title: 'Đồng hồ cơ dây da, mặt số trắng',
    category: 'Đồng hồ',
    price: '86.500.000 đ',
    action: { type: 'countdown', time: '02:14:37' },
    place: 'TP.HCM',
    meta: '23 lượt đặt giá',
  },
  {
    img: lot2,
    status: { text: 'Mua ngay', solid: true },
    title: 'Đồng hồ thép, mặt số đen, đủ hộp sổ',
    category: 'Đồng hồ',
    price: '205.000.000 đ',
    action: { type: 'buy' },
    place: 'TP.HCM',
    meta: '41 lượt quan tâm',
  },
  {
    img: lot3,
    status: { text: 'Đấu giá', solid: false },
    title: 'Túi da đỏ, phiên bản giới hạn',
    category: 'Túi xách',
    price: '38.000.000 đ',
    action: { type: 'countdown', time: '04:41:55' },
    place: 'Đà Nẵng',
    meta: '17 lượt đặt giá',
  },
  {
    img: lot4,
    status: { text: 'Mua ngay', solid: true },
    title: 'Tranh sơn dầu — Cánh đồng lúa mì',
    category: 'Nghệ thuật',
    price: '42.000.000 đ',
    action: { type: 'buy' },
    place: 'Hà Nội',
    meta: '19 lượt quan tâm',
  },
]

function StatusPill({ status }: { status: Lot['status'] }) {
  if (status.solid) {
    return (
      <span className="rounded-full bg-brand px-3 py-1 text-[12px] font-semibold text-white">
        {status.text}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-ink shadow-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      {status.text}
    </span>
  )
}

function LotCard({ lot }: { lot: Lot }) {
  return (
    <article data-lot-card className="flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_18px_40px_-16px_rgba(23,15,10,0.22)]">
      {/* Ảnh + nhãn */}
      <div className="relative">
        <img src={lot.img} alt={lot.title} className="h-[172px] w-full object-cover" draggable={false} />
        <div className="absolute left-3 top-3">
          <StatusPill status={lot.status} />
        </div>
        <button
          type="button"
          aria-label="Yêu thích"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow-sm transition hover:text-brand"
        >
          <HeartIcon size={18} />
        </button>
      </div>

      {/* Thân thẻ */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="min-h-[44px] text-[16px] font-semibold leading-snug text-ink">{lot.title}</h3>
        <p className="mt-1 text-[13px] text-ink-500">{lot.category}</p>

        {/* Giá + hành động: luôn cùng 1 dòng */}
        <div className="mt-3 flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-[17px] font-extrabold text-ink">
            {lot.price}
          </span>
          {lot.action.type === 'countdown' ? (
            <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink px-3 text-[12px] font-semibold text-white">
              <ClockIcon size={13} />
              <span className="font-mono">{lot.action.time}</span>
            </span>
          ) : (
            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center rounded-full bg-brand px-4 text-[12px] font-semibold text-white transition hover:bg-brand-dark"
            >
              Mua ngay
            </button>
          )}
        </div>

        {/* Chân thẻ */}
        <div className="mt-4 flex items-center justify-between border-t border-[#f0e9df] pt-3 text-[13px] text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPinIcon size={15} />
            {lot.place}
          </span>
          <span className="inline-flex items-center gap-1.5 text-gold-muted">
            <ShieldCheckIcon size={14} />
            <span className="text-ink-500">{lot.meta}</span>
          </span>
        </div>
      </div>
    </article>
  )
}

export default function Auction() {
  return (
    <section className="relative mx-auto max-w-[1280px] px-10 py-14">
      <SectionHeading
        label=""
        title="Đấu giá sắp kết thúc"
        subtitle="Những tài sản đang nhận được nhiều sự quan tâm nhất"
        seeAll="Xem tất cả"
      />
      <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {LOTS.map((lot) => (
          <LotCard key={lot.title} lot={lot} />
        ))}
        {/* Nút tiếp (carousel) */}
        <button
          type="button"
          aria-label="Xem thêm"
          className="absolute -right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#ece5da] bg-white text-ink shadow-md transition hover:bg-brand hover:text-white lg:grid"
        >
          <ArrowRightIcon size={18} />
        </button>
      </div>
    </section>
  )
}
