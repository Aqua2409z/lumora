import type { ReactNode } from 'react'
import { MailIcon, MobileIcon, StarOutlineIcon } from '../../components/icons'
import type { AuthMode, AuthTab } from './scenes'
import GmailLoginForm from './GmailLoginForm'
import PhoneLoginForm from './PhoneLoginForm'
import RegisterForm from './RegisterForm'

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-[22px] transition-all ${
        active ? 'bg-cream-card shadow-tab' : ''
      }`}
    >
      <span className={active ? 'text-brand' : 'text-ink-500'}>{icon}</span>
      <span className={`text-[14px] leading-[18px] ${active ? 'font-semibold text-ink' : 'font-medium text-ink-500'}`}>
        {label}
      </span>
    </button>
  )
}

export default function AuthForm({
  mode,
  tab,
  onTabChange,
}: {
  mode: AuthMode
  tab: AuthTab
  onTabChange: (t: AuthTab) => void
}) {
  const isLogin = mode === 'login'

  // Tiêu đề 2 dòng (chữ đậm + chữ viết tay) đổi theo chế độ.
  const titleBold = isLogin ? 'Chào mừng' : 'Gia nhập'
  const titleScript = isLogin ? 'trở lại' : 'Lumora,'

  const subtitle = isLogin
    ? tab === 'gmail'
      ? 'Đăng nhập để đặt giá, theo dõi phiên đấu giá và quản lý tài sản ký gửi của bạn.'
      : 'Nhập số điện thoại — chúng tôi gửi mã OTP để bạn đăng nhập ngay, không cần mật khẩu.'
    : 'Tạo tài khoản để đặt giá, theo dõi phiên đấu giá và ký gửi tài sản của riêng bạn.'

  return (
    <div className="flex w-[440px] flex-col items-start gap-[18px]">
      {/* Nhãn Thành viên Lumora */}
      <div className="flex h-6 items-center rounded-[20px] bg-pink px-[11px]">
        <span className="text-[11px] font-semibold leading-[14px] tracking-[0.06em] text-brand">
          Thành viên Lumora
        </span>
      </div>

      {/* Tiêu đề + mô tả */}
      <div className="flex w-full flex-col items-start gap-2">
        <div className="relative h-[106px] w-[311px]">
          <span className="absolute left-0 top-0 text-[52px] font-extrabold leading-[58px] text-ink">
            {titleBold}
          </span>
          <span
            className="absolute font-script text-[67px] leading-[70px] text-brand"
            style={{ left: 56, top: 35.1, transform: 'rotate(-3deg)' }}
          >
            {titleScript}
          </span>
          <div className="absolute text-gold-muted" style={{ left: 315, top: 6 }}>
            <StarOutlineIcon size={24} />
          </div>
        </div>
        <p className="w-[420px] text-[15px] leading-6 text-ink-600">{subtitle}</p>
      </div>

      {/* Chọn cách đăng nhập — chỉ hiện ở chế độ Đăng nhập */}
      {isLogin && (
        <div className="flex h-[54px] w-[440px] items-center gap-1 rounded-[27px] bg-cream-tab p-[5px]">
          <TabButton active={tab === 'gmail'} onClick={() => onTabChange('gmail')} icon={<MailIcon size={17} />} label="Gmail" />
          <TabButton active={tab === 'phone'} onClick={() => onTabChange('phone')} icon={<MobileIcon size={17} />} label="Số điện thoại" />
        </div>
      )}

      {/* Nội dung form theo chế độ + tab */}
      {isLogin ? tab === 'gmail' ? <GmailLoginForm /> : <PhoneLoginForm /> : <RegisterForm />}
    </div>
  )
}
