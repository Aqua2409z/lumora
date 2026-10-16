import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { ApiError } from '../lib/api'
import { ZALO_STATE_KEY, ZALO_VERIFIER_KEY } from '../features/auth/ZaloSignInButton'

/**
 * Trang nhận chuyển hướng từ Zalo sau khi người dùng đồng ý cấp quyền.
 * URL dạng: /auth/zalo/callback?code=...&state=...
 * Quy trình: kiểm tra state -> lấy code_verifier đã lưu -> gọi backend đổi lấy token.
 */
export default function ZaloCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithZalo } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const ranRef = useRef(false) // Chỉ chạy 1 lần (tránh StrictMode gọi đôi -> code dùng 2 lần).

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const code = params.get('code')
    const state = params.get('state')
    const savedState = sessionStorage.getItem(ZALO_STATE_KEY)
    const codeVerifier = sessionStorage.getItem(ZALO_VERIFIER_KEY)

    // Dọn dữ liệu tạm ngay, dù thành công hay thất bại.
    sessionStorage.removeItem(ZALO_STATE_KEY)
    sessionStorage.removeItem(ZALO_VERIFIER_KEY)

    // Người dùng bấm "Từ chối" trên Zalo, hoặc thiếu tham số.
    if (!code || !codeVerifier) {
      setError('Đăng nhập Zalo đã bị huỷ hoặc thiếu thông tin. Vui lòng thử lại.')
      return
    }
    // Chống CSRF: state trả về phải khớp state đã gửi đi.
    if (!state || state !== savedState) {
      setError('Phiên đăng nhập Zalo không hợp lệ. Vui lòng thử lại.')
      return
    }

    loginWithZalo(code, codeVerifier)
      .then(() => navigate('/', { replace: true }))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Đăng nhập Zalo thất bại, vui lòng thử lại.')
      })
  }, [params, loginWithZalo, navigate])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-cream">
      <div className="flex w-[440px] flex-col items-center gap-4 text-center">
        {error ? (
          <>
            <p className="text-[15px] leading-[22px] text-brand-dark">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="flex h-12 items-center rounded-[24px] bg-brand px-7 text-[15px] font-semibold text-cream-light shadow-btn-brand transition-transform active:scale-[0.99]"
            >
              Quay lại đăng nhập
            </button>
          </>
        ) : (
          <>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" className="animate-spin text-brand">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <p className="text-[15px] leading-[22px] text-ink-700">Đang hoàn tất đăng nhập Zalo…</p>
          </>
        )}
      </div>
    </div>
  )
}
