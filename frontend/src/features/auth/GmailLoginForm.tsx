import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { ApiError } from '../../lib/api'
import {
  Divider,
  EmailInput,
  Field,
  FormAlert,
  PasswordInput,
  PrimaryButton,
  RememberCheckbox,
  SecurityNote,
} from './parts'
import GoogleSignInButton from './GoogleSignInButton'
import ZaloSignInButton from './ZaloSignInButton'

/** Form đăng nhập bằng Gmail + mật khẩu (gọi API backend). */
export default function GmailLoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Vui lòng nhập Gmail và mật khẩu.')
      return
    }

    setLoading(true)
    try {
      await login({ email: email.trim().toLowerCase(), password })
      navigate('/') // Đăng nhập xong -> về trang chính
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đăng nhập thất bại, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex w-[440px] flex-col items-start gap-[18px]" onSubmit={handleSubmit} noValidate>
      <GoogleSignInButton onError={setError} />
      <ZaloSignInButton onError={setError} />
      <Divider label="hoặc dùng Gmail & mật khẩu" />

      {error && <FormAlert message={error} />}

      <Field label="Gmail">
        <EmailInput value={email} onChange={setEmail} autoFocus />
      </Field>
      <Field
        label="Mật khẩu"
        action={
          <button type="button" className="text-[13px] font-medium leading-4 text-brand">
            Quên mật khẩu?
          </button>
        }
      >
        <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
      </Field>
      <RememberCheckbox />
      <PrimaryButton label="Đăng nhập" loading={loading} />
      <SecurityNote text="Bảo mật 2 lớp · Thông tin của bạn luôn được mã hoá" />
    </form>
  )
}
