import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { ApiError } from '../../lib/api'
import { GoogleButton } from './parts'

// Client ID lấy từ Google Cloud Console (biến môi trường VITE_GOOGLE_CLIENT_ID).
const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim()
const GIS_SRC = 'https://accounts.google.com/gsi/client'

// Nạp script GIS đúng 1 lần cho cả app.
let gisPromise: Promise<void> | null = null

function loadGis(): Promise<void> {
  if (gisPromise) return gisPromise
  gisPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = GIS_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Không tải được Google Sign-In'))
    document.head.appendChild(s)
  })
  return gisPromise
}

/**
 * Nút "Tiếp tục với Google".
 * - Có cấu hình Client ID: render nút chính thức của Google, đăng nhập thật.
 * - Chưa cấu hình: hiện nút trang trí (khoá) để app không vỡ giao diện.
 */
export default function GoogleSignInButton({ onError }: { onError?: (message: string) => void }) {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const renderedRef = useRef(false)  // Tránh render button nhiều lần (React StrictMode)
  // Giữ onError mới nhất mà không khiến effect chạy lại.
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || renderedRef.current) return
    let cancelled = false

    loadGis()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return

        // Khởi tạo callback (an toàn gọi nhiều lần, Google tự xử)
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              await loginWithGoogle(response.credential)
              navigate('/')
            } catch (err) {
              onErrorRef.current?.(
                err instanceof ApiError ? err.message : 'Đăng nhập Google thất bại, vui lòng thử lại.',
              )
            }
          },
        })

        // Render button chỉ 1 lần (renderButton có thể trigger API call lặp lại nếu gọi nhiều)
        if (!renderedRef.current) {
          renderedRef.current = true
          window.google.accounts.id.renderButton(containerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'center',
            width: 400,
            locale: 'vi',
          })
        }
      })
      .catch(() => onErrorRef.current?.('Không tải được Google Sign-In. Hãy kiểm tra kết nối mạng.'))

    return () => {
      cancelled = true
    }
  }, [])

  // Chưa cấu hình Client ID -> giữ nút trang trí cũ.
  if (!GOOGLE_CLIENT_ID) {
    return <GoogleButton />
  }

  // Google render nút vào trong div này; căn giữa cho khớp khung 440px.
  return <div ref={containerRef} className="flex h-14 w-[440px] items-center justify-center" />
}
