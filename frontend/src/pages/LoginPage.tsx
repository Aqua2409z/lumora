import { useState } from 'react'
import AuthShowcase from '../features/auth/AuthShowcase'
import AuthForm from '../features/auth/AuthForm'
import { SCENES, type AuthMode, type AuthTab } from '../features/auth/scenes'
import { ArrowLeftIcon, Sparkle } from '../components/icons'
import { CurvedArrow } from '../components/icons/Doodles'

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [tab, setTab] = useState<AuthTab>('gmail')
  const scene = SCENES[tab]
  const isLogin = mode === 'login'

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-cream">
      {/* Khung thiết kế 1440×1024 */}
      <div className="relative h-[1024px] w-[1440px] shrink-0 bg-cream">
        {/* Panel trái (collage) */}
        <AuthShowcase scene={scene} />

        {/* Về trang chủ */}
        <a
          href="http://localhost:5173/"
          className="group absolute flex items-center gap-2 rounded-full px-3 py-2 text-ink transition-all duration-200 hover:bg-[rgba(23,23,23,0.06)]"
          style={{ left: 752, top: 40 }}
        >
          <ArrowLeftIcon
            size={16}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          <span className="text-[13.5px] font-medium leading-[17px] transition-colors duration-200 group-hover:text-brand">
            Về trang chủ
          </span>
        </a>

        {/* Chuyển đổi Đăng nhập ⇄ Đăng ký (góc phải trên) */}
        <div className="absolute flex items-center gap-3" style={{ left: 1110, top: 38 }}>
          <span className="text-[13.5px] leading-[17px] text-ink-600">
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          </span>
          <button
            onClick={() => setMode(isLogin ? 'register' : 'login')}
            className="flex h-[38px] items-center rounded-[19px] border border-[rgba(23,23,23,0.2)] px-[18px] text-[13.5px] font-semibold leading-[17px] text-ink transition-colors hover:bg-[rgba(23,23,23,0.04)]"
          >
            {isLogin ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>
        </div>

        {/* Biểu mẫu — căn giữa theo chiều dọc ở nửa phải */}
        <div className="absolute flex h-[1024px] flex-col justify-center" style={{ left: 850, top: 0 }}>
          <AuthForm mode={mode} tab={tab} onTabChange={setTab} />
        </div>

        {/* Ghi chú viết tay cạnh form */}
        <div
          className="absolute font-hand text-[22px] leading-[23px] text-brand"
          style={{ left: scene.sideNote.left, top: scene.sideNote.top, transform: `rotate(${scene.sideNote.rotate}deg)` }}
        >
          {scene.sideNote.lines.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </div>
        <div className="absolute" style={{ left: scene.sideNote.left, top: scene.sideNote.top + 58 }}>
          <CurvedArrow />
        </div>
        <div className="absolute" style={{ left: 1316, top: 300 }}>
          <Sparkle size={16} />
        </div>
      </div>
    </div>
  )
}
