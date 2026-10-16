import { Blob, Polaroid, SectionHeading, Tape } from './primitives'
import cat1 from '../../assets/landing/cat-1.png'
import cat2 from '../../assets/landing/cat-2.png'
import cat3 from '../../assets/landing/cat-3.png'
import cat4 from '../../assets/landing/cat-4.png'
import cat5 from '../../assets/landing/cat-5.png'
import cat6 from '../../assets/landing/cat-6.png'

const CATS = [
  { img: cat1, name: 'Đồng hồ', count: '128 lô', rotate: -4, mt: 20 },
  { img: cat2, name: 'Nghệ thuật', count: '64 lô', rotate: 3, mt: -6 },
  { img: cat3, name: 'Trang sức', count: '51 lô', rotate: -3, mt: 24 },
  { img: cat4, name: 'Thời trang', count: '87 lô', rotate: 2, mt: 0 },
  { img: cat5, name: 'Xe & Mô tô', count: '23 lô', rotate: -3, mt: 26 },
  { img: cat6, name: 'Nhà đất', count: '12 lô', rotate: 3, mt: 6 },
]

export default function Category() {
  return (
    <section className="relative mx-auto max-w-[1280px] px-10 py-14">
      <SectionHeading
        label="Bộ sưu tập"
        title="Khám phá theo danh mục"
        subtitle="Mỗi món đồ là một câu chuyện — chọn thế giới bạn yêu thích."
        seeAll="Tất cả danh mục"
      />
      <div className="relative">
        <Blob color="#9F1239" w={300} h={200} opacity={0.14} blur={40} style={{ left: 120, bottom: -10 }} />
        <Blob color="#F4DC92" w={240} h={180} opacity={0.4} blur={40} style={{ right: 160, bottom: 10 }} />
        <div className="relative flex flex-wrap items-start justify-center gap-3 lg:flex-nowrap lg:justify-between">
          {CATS.map((c) => (
            <div data-cat-item key={c.name} className="relative" style={{ marginTop: c.mt }}>
              <Polaroid src={c.img} alt={c.name} caption={c.name} count={c.count} rotate={c.rotate} w={178} />
              <Tape w={58} h={22} rotate={c.rotate < 0 ? 6 : -6} style={{ left: 58, top: -8 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
