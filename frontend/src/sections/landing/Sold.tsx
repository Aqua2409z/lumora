import { SectionHeading } from './primitives'
import sold1 from '../../assets/landing/sold-1.png'
import sold2 from '../../assets/landing/sold-2.png'
import sold3 from '../../assets/landing/sold-3.png'
import sold4 from '../../assets/landing/sold-4.png'
import sold5 from '../../assets/landing/sold-5.png'
import sold6 from '../../assets/landing/sold-6.png'

const SOLD = [
  { img: sold1, title: 'Xe thể thao 2019, 12.000 km', price: '2,35 tỷ đ', meta: 'Mua ngay · 04/10' },
  { img: sold2, title: 'Tranh sơn dầu, thập niên 1990', price: '186 triệu đ', meta: 'Đấu giá · 03/10' },
  { img: sold3, title: 'Nhẫn kim cương 1,02 ct', price: '64 triệu đ', meta: 'Đấu giá · 03/10' },
  { img: sold4, title: 'Guitar acoustic thủ công', price: '22 triệu đ', meta: 'Mua ngay · 02/10' },
  { img: sold5, title: 'Căn hộ 2PN, Quận 7', price: '4,1 tỷ đ', meta: 'Đấu giá · 01/10' },
  { img: sold6, title: 'Laptop 14", gần như mới', price: '31 triệu đ', meta: 'Mua ngay · 01/10' },
]

export default function Sold() {
  return (
    <section className="relative mx-auto max-w-[1280px] px-10 py-14">
      <SectionHeading
        label="Kết quả"
        title="Vừa bán thành công"
        subtitle="Giá và giờ do máy chủ ghi lại, công khai sau mỗi phiên."
        seeAll="Xem tất cả kết quả"
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {SOLD.map((s) => (
          <article data-sold-card key={s.title} className="overflow-hidden rounded-[16px] bg-white shadow-[0_16px_36px_-18px_rgba(23,15,10,0.22)]">
            <div className="relative">
              <img src={s.img} alt={s.title} className="h-[130px] w-full object-cover" draggable={false} />
              <span className="absolute right-2 top-2 rotate-[-8deg] rounded border-[1.5px] border-brand bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-brand">
                Đã bán
              </span>
            </div>
            <div className="p-3">
              <h3 className="min-h-[38px] text-[13px] font-semibold leading-snug text-ink">{s.title}</h3>
              <div className="mt-1.5 text-[17px] font-extrabold text-brand">{s.price}</div>
              <div className="mt-0.5 text-[12px] text-ink-500">{s.meta}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
