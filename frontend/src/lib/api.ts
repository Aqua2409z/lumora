// ============================================================
//  Lớp gọi API tới backend Lumora (Spring Boot)
//  - Base URL lấy từ biến môi trường VITE_API_BASE_URL
//  - Tự parse lỗi JSON của backend thành ApiError (có message tiếng Việt)
// ============================================================

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080/api'

/** Thông tin người dùng trả về từ backend. */
export type AuthUser = {
  id: number
  fullName: string
  email: string
  avatarUrl?: string | null
  createdAt: string
}

/** Kết quả khi đăng ký / đăng nhập thành công. */
export type AuthResponse = {
  token: string
  tokenType: string
  user: AuthUser
}

export type RegisterPayload = {
  fullName: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

/** Lỗi API, giữ nguyên status + thông điệp tiếng Việt từ backend. */
export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string>

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    })
  } catch {
    // Không gọi được server: backend chưa chạy, sai cổng, hoặc mất mạng.
    throw new ApiError(0, 'Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa (cổng 8080).')
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message = (data && data.message) || 'Đã xảy ra lỗi, vui lòng thử lại.'
    throw new ApiError(res.status, message, data?.fieldErrors ?? undefined)
  }

  return data as T
}

/** POST /api/auth/register */
export function registerApi(payload: RegisterPayload) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** POST /api/auth/login */
export function loginApi(payload: LoginPayload) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** POST /api/auth/google — đăng nhập bằng Google (credential = ID token của Google). */
export function googleLoginApi(credential: string) {
  return request<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  })
}

/** POST /api/auth/zalo — đăng nhập bằng Zalo (code + codeVerifier của luồng OAuth v4 + PKCE). */
export function zaloLoginApi(code: string, codeVerifier: string) {
  return request<AuthResponse>('/auth/zalo', {
    method: 'POST',
    body: JSON.stringify({ code, codeVerifier }),
  })
}

/** GET /api/auth/me — cần gửi token qua header Authorization. */
export function getMeApi(token: string) {
  return request<AuthUser>('/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
}
