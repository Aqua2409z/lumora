import { LumoraWordmark, HandNote } from './primitives'
import { LumoraMarkSmall, FacebookIcon, InstagramIcon, YoutubeIcon } from '../../components/icons/landing'
import { Sparkle, StarOutlineIcon } from '../../components/icons'

const COLS = [
  { head: 'Khám phá', links: ['Phiên đang diễn ra', 'Sắp mở', 'Mua ngay', 'Danh mục', 'Kết quả đấu giá'] },
  { head: 'Chủ hàng', links: ['Gửi hồ sơ ký gửi', 'Biểu phí', 'Quy trình kiểm định', 'Quyết toán & thanh toán'] },
  { head: 'Hỗ trợ', links: ['Trung tâm trợ giúp', 'Quy chế đấu giá', 'Khiếu nại & phản ánh', 'Liên hệ'] },
  { head: 'Pháp lý', links: ['Điều khoản sử dụng', 'Chính sách bảo mật', 'Chính sách hoàn tiền'] },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-brand-deepest text-cream-light">
      <div className="relative mx-auto max-w-[1280px] px-10 pt-14 pb-6">
        {/* Ghi chú góc phải */}
        <div className="absolute right-10 top-10 flex items-center gap-2">
          <StarOutlineIcon className="text-gold" size={20} />
          <HandNote rotate={-4} size={22} color="#E9CF84">
            Rare finds. Real stories.
          </HandNote>
          <Sparkle size={18} />
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
          {/* Cột thương hiệu */}
          <div className="max-w-[360px]">
            <div className="flex items-center gap-1.5">
              <LumoraMarkSmall size={34} />
              <LumoraWordmark size={26} tone="cream" />
            </div>
            <p className="mt-4 text-[14px] leading-[1.7] text-cream-light/75">
              Nền tảng ký gửi, mua ngay và đấu giá tài sản, quyền và dịch vụ tại Việt Nam — kiểm định độc lập, giao
              dịch minh bạch.
            </p>
            <div className="mt-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-gold">Nhận tin phiên mới</div>
            <form className="mt-3 flex max-w-[360px]" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email của bạn"
                className="min-w-0 flex-1 border border-cream-light/25 bg-transparent px-4 py-3 text-[14px] text-cream-light placeholder:text-cream-light/50 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                className="bg-gold-grad px-6 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#2a1a06] transition hover:brightness-105"
              >
                Đăng ký
              </button>
            </form>
          </div>

          {/* 4 cột link */}
          {COLS.map((col) => (
            <div key={col.head}>
              <div className="mb-4 text-[12px] font-bold uppercase tracking-[0.14em] text-gold">{col.head}</div>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[14px] text-cream-light/80 transition hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Thanh dưới */}
        <div className="mt-10 border-t border-cream-light/15 pt-5">
          <div className="flex flex-col items-center gap-4 text-[13px] text-cream-light/65 md:flex-row md:justify-between">
            <span>© 2026 Lumora. Thông tin trên trang là dữ liệu minh họa.</span>
            <div className="flex items-center gap-4 text-cream-light/80">
              <a href="#" aria-label="Facebook" className="transition hover:text-white"><FacebookIcon size={18} /></a>
              <a href="#" aria-label="Instagram" className="transition hover:text-white"><InstagramIcon size={18} /></a>
              <a href="#" aria-label="YouTube" className="transition hover:text-white"><YoutubeIcon size={18} /></a>
            </div>
            <span className="font-semibold uppercase tracking-[0.14em] text-gold">Ký gửi · Kiểm định · Đấu giá</span>
          </div>
        </div>

        {/* Wordmark lớn */}
        <div data-footer-wordmark className="pointer-events-none select-none pt-6 text-center">
          <span className="font-script text-gold-grad" style={{ fontSize: 150, lineHeight: 1 }}>
            Lumora
          </span>
        </div>
      </div>
    </footer>
  )
}
