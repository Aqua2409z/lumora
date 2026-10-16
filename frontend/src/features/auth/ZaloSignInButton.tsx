import { useState } from 'react'
import { generateCodeChallenge, generateCodeVerifier, generateState } from '../../lib/pkce'

// Cấu hình lấy từ biến môi trường (.env của frontend).
const ZALO_APP_ID = (import.meta.env.VITE_ZALO_APP_ID as string | undefined)?.trim()
const ZALO_REDIRECT_URI = (
  (import.meta.env.VITE_ZALO_REDIRECT_URI as string | undefined) ??
  'http://localhost:5173/auth/zalo/callback'
).trim()

// Trang cấp quyền của Zalo (OAuth v4 + PKCE).
const ZALO_PERMISSION_URL = 'https://oauth.zaloapp.com/v4/permission'

// Khoá lưu tạm giữa 2 lần tải trang (trước khi sang Zalo và lúc quay về).
export const ZALO_VERIFIER_KEY = 'lumora.zalo.code_verifier'
export const ZALO_STATE_KEY = 'lumora.zalo.state'

/** Logo Zalo: ô bo góc xanh + chữ "Zalo" trắng (SVG, không dùng ảnh ngoài). */
function ZaloLogo() {
  return (
    <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-[#0068FF]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3C6.48 3 2 6.74 2 11.35c0 2.6 1.42 4.92 3.66 6.45-.12.9-.5 2.17-1.2 3.1-.2.27.02.65.35.57 1.9-.46 3.2-1.18 3.95-1.7.98.24 2.04.38 3.24.38 5.52 0 10-3.74 10-8.8S17.52 3 12 3Z"
          fill="#fff"
        />
      </svg>
    </span>
  )
}

/**
 * Nút "Tiếp tục với Zalo".
 * - Có cấu hình App ID: bấm vào sẽ sinh PKCE rồi chuyển sang trang cấp quyền Zalo.
 * - Chưa cấu hình: hiện nút trang trí (khoá) để app không vỡ giao diện.
 */
export default function ZaloSignInButton({ onError }: { onError?: (message: string) => void }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!ZALO_APP_ID) return
    setLoading(true)
    try {
      // 1) Sinh code_verifier + state, lưu tạm để lúc quay về còn dùng.
      const codeVerifier = generateCodeVerifier()
      const state = generateState()
      sessionStorage.setItem(ZALO_VERIFIER_KEY, codeVerifier)
      sessionStorage.setItem(ZALO_STATE_KEY, state)

      // 2) code_challenge = BASE64URL(SHA-256(code_verifier)).
      const codeChallenge = await generateCodeChallenge(codeVerifier)

      // 3) Chuyển hướng sang trang cấp quyền của Zalo.
      const params = new URLSearchParams({
        app_id: ZALO_APP_ID,
        redirect_uri: ZALO_REDIRECT_URI,
        code_challenge: codeChallenge,
        state,
      })
      window.location.href = `${ZALO_PERMISSION_URL}?${params.toString()}`
    } catch {
      setLoading(false)
      onError?.('Không mở được đăng nhập Zalo, vui lòng thử lại.')
    }
  }

  // Chưa cấu hình App ID -> nút trang trí (khoá).
  const disabled = !ZALO_APP_ID || loading

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={ZALO_APP_ID ? 'Đăng nhập bằng tài khoản Zalo' : 'Đăng nhập Zalo đang được cấu hình'}
      className={`flex h-14 w-[440px] items-center justify-center gap-3 rounded-[28px] border border-[rgba(23,23,23,0.14)] bg-white shadow-btn-google transition-transform active:scale-[0.99] ${
        disabled ? 'cursor-not-allowed opacity-70 active:scale-100' : 'hover:bg-[#f7faff]'
      }`}
    >
      <ZaloLogo />
      <span className="text-[15px] font-semibold leading-[19px] text-ink">
        {loading ? 'Đang chuyển tới Zalo…' : 'Tiếp tục với Zalo'}
      </span>
    </button>
  )
}
