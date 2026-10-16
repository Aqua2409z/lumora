import { Link } from 'react-router-dom'
import { LumoraWordmark } from './primitives'
import { SearchIcon } from '../../components/icons/landing'
import { ArrowRightIcon } from '../../components/icons'
import { useAuth } from '../../lib/AuthContext'

/** Mark Lumora màu đỏ brand (dùng trên nền kem của header). */
function LumoraMarkRed({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      {/* Thẻ lot nghiêng, nền đỏ */}
      <g transform="rotate(-10 24 24)">
        <rect x="11" y="13" width="26" height="22" rx="5" fill="#9F1239" />
        <circle cx="17.5" cy="19.5" r="1.8" fill="#FFFDF8" />
        {/* Dấu tick trắng */}
        <path d="M18 26 22 30 30 20" stroke="#FFFDF8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Lấp lánh vàng */}
      <path d="M37 8 37.7 10.4 40.1 11.1 37.7 11.8 37 14.2 36.3 11.8 33.9 11.1 36.3 10.4 Z" fill="#D4AF37" />
      <circle cx="40" cy="15.5" r="1.1" fill="#D4AF37" />
    </svg>
  )
}

const NAV = [
  { label: 'Trang chủ', active: true },
  { label: 'Đấu giá', active: false },
  { label: 'Mua ngay', active: false },
  { label: 'Danh mục', active: false },
  { label: 'Ký gửi', active: false },
]

/** Avatar chữ cái — hiện khi user không có ảnh. */
function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-[13px] font-bold text-white">
      {initials}
    </span>
  )
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-[#ece5da] bg-cream-light/90 backdrop-blur-sm">
      <div className="mx-auto flex h-24 max-w-[1280px] items-center justify-between px-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5">
          <LumoraMarkRed size={42} />
          <LumoraWordmark size={30} />
        </Link>

        {/* Điều hướng giữa */}
        <nav className="hidden items-center gap-9 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`relative text-[15px] transition-colors ${
                item.active ? 'font-semibold text-ink' : 'font-medium text-ink-600 hover:text-ink'
              }`}
            >
              {item.label}
              {item.active && (
                <svg
                  width="54"
                  height="8"
                  viewBox="0 0 54 8"
                  fill="none"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                >
                  <path d="M2 5c12-3 38-4 50-1" stroke="#9F1239" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              )}
            </a>
          ))}
        </nav>

        {/* Hành động phải: tìm kiếm + Đăng nhập / Đăng ký */}
        <div className="flex items-center gap-3">
          {/* Ô tìm kiếm */}
          <div className="hidden items-center gap-2 rounded-full border border-[#ece5da] bg-white py-1.5 pl-4 pr-1.5 shadow-[0_6px_18px_-8px_rgba(31,18,13,0.15)] xl:flex">
            <SearchIcon className="text-ink-500" size={17} />
            <input
              type="text"
              placeholder="Tìm tài sản..."
              className="w-28 bg-transparent text-[14px] text-ink placeholder:text-ink-500 focus:outline-none"
            />
            <button
              type="button"
              aria-label="Tìm kiếm"
              className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-dark"
            >
              <ArrowRightIcon size={16} />
            </button>
          </div>

          {isAuthenticated && user ? (
            /* ── Đã đăng nhập ── */
            <div className="flex items-center gap-3">
              {/* Đến trang thành viên */}
              <Link
                to="/home"
                className="rounded-full px-4 py-2.5 text-[14px] font-semibold text-ink transition hover:text-brand"
              >
                Trang của tôi
              </Link>
              {/* Avatar + tên (dropdown đơn giản) */}
              <div className="flex items-center gap-2.5 rounded-full border border-[#ece5da] bg-white py-1.5 pl-2 pr-4 shadow-sm">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <AvatarFallback name={user.fullName} />
                )}
                <span className="max-w-[120px] truncate text-[14px] font-semibold text-ink">
                  {user.fullName.split(' ').slice(-1)[0]}
                </span>
              </div>
              {/* Đăng xuất */}
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-[#ece5da] px-4 py-2.5 text-[13px] font-medium text-ink-600 transition hover:border-brand hover:text-brand"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            /* ── Chưa đăng nhập ── */
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2.5 text-[14px] font-semibold text-ink transition hover:text-brand"
              >
                Đăng nhập
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-brand px-5 py-2.5 text-[14px] font-semibold text-white shadow-btn-brand transition hover:bg-brand-dark"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
