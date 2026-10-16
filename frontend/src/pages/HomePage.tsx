import { LumoraMark } from '../components/LumoraLogo'
import { CheckIcon } from '../components/icons'
import { useAuth } from '../lib/AuthContext'

/**
 * Trang tạm sau khi đăng nhập — xác nhận phiên hoạt động.
 * Sẽ được thay bằng trang chủ Lumora thật sau này.
 */
export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-cream px-4">
      <div className="flex w-full max-w-[460px] flex-col items-center gap-8 rounded-[28px] border border-[rgba(23,23,23,0.08)] bg-cream-card px-10 py-16 shadow-tab">
        <div className="flex items-center gap-1.5">
          <LumoraMark size={44} />
          <span className="font-serif text-[28px] font-semibold leading-9 text-brand">Lumora</span>
        </div>

        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            referrerPolicy="no-referrer"
            className="h-16 w-16 rounded-full border-2 border-brand object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-cream-light">
            <CheckIcon size={24} strokeWidth={2.4} />
          </div>
        )}

        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-[24px] font-extrabold leading-8 text-ink">
            Xin chào, {user?.fullName ?? 'bạn'} 👋
          </h1>
          <p className="text-[14px] leading-5 text-ink-600">Bạn đã đăng nhập thành công vào Lumora.</p>
        </div>

        <dl className="flex w-full flex-col gap-2 rounded-[16px] bg-cream px-5 py-4 text-[13.5px]">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Mã tài khoản</dt>
            <dd className="font-semibold text-ink">#{user?.id}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-500">Gmail</dt>
            <dd className="font-semibold text-ink">{user?.email}</dd>
          </div>
        </dl>

        <button
          onClick={logout}
          className="flex h-12 w-full items-center justify-center rounded-[24px] bg-brand text-[15px] font-semibold text-cream-light shadow-btn-brand transition-transform active:scale-[0.99]"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
