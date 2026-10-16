// ============================================================
//  Lưu / đọc phiên đăng nhập trong localStorage
//  (token JWT + thông tin user). Dùng bởi AuthContext.
// ============================================================
import type { AuthUser } from './api'

const TOKEN_KEY = 'lumora.token'
const USER_KEY = 'lumora.user'

/** Lưu token + user sau khi đăng nhập/đăng ký thành công. */
export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

/** Xoá phiên (đăng xuất). */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
