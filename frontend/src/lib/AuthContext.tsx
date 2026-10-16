// ============================================================
//  AuthContext — trạng thái đăng nhập dùng chung toàn app
//  Cung cấp: user, token, isAuthenticated, login(), register(), logout()
// ============================================================
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getMeApi,
  googleLoginApi,
  loginApi,
  registerApi,
  zaloLoginApi,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from './api'
import { clearSession, getStoredUser, getToken, saveSession } from './auth'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  loginWithZalo: (code: string, codeVerifier: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())
  const [token, setToken] = useState<string | null>(() => getToken())

  // Có token sẵn (lần mở lại trang) -> xác thực lại với backend.
  // Token hỏng/hết hạn thì tự đăng xuất.
  useEffect(() => {
    if (!token) return
    let cancelled = false
    getMeApi(token)
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        if (cancelled) return
        clearSession()
        setToken(null)
        setUser(null)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await loginApi(payload)
    saveSession(res.token, res.user)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await registerApi(payload)
    saveSession(res.token, res.user)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const loginWithGoogle = useCallback(async (credential: string) => {
    const res = await googleLoginApi(credential)
    saveSession(res.token, res.user)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const loginWithZalo = useCallback(async (code: string, codeVerifier: string) => {
    const res = await zaloLoginApi(code, codeVerifier)
    saveSession(res.token, res.user)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      register,
      loginWithGoogle,
      loginWithZalo,
      logout,
    }),
    [user, token, login, register, loginWithGoogle, loginWithZalo, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
  return ctx
}
