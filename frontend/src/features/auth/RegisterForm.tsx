import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { ApiError } from '../../lib/api'
import {
  EmailInput,
  Field,
  FormAlert,
  NameInput,
  PasswordInput,
  PrimaryButton,
  SecurityNote,
} from './parts'

/** Form đăng ký tài khoản mới (họ tên + Gmail + mật khẩu). */
export default function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    // Kiểm tra sơ bộ phía client (backend vẫn kiểm tra lại).
    if (fullName.trim().length < 2) {
      setError('Họ và tên cần ít nhất 2 ký tự.')
      return
    }
    if (!email.trim()) {
      setError('Vui lòng nhập Gmail.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu cần ít nhất 6 ký tự.')
      return
    }

    setLoading(true)
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      })
      navigate('/') // Đăng ký xong -> tự đăng nhập -> về trang chính
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đăng ký thất bại, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex w-[440px] flex-col items-start gap-[18px]" onSubmit={handleSubmit} noValidate>
      {error && <FormAlert message={error} />}

      <Field label="Họ và tên">
        <NameInput value={fullName} onChange={setFullName} autoFocus />
      </Field>
      <Field label="Gmail">
        <EmailInput value={email} onChange={setEmail} />
      </Field>
      <Field label="Mật khẩu">
        <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" />
      </Field>
      <PrimaryButton label="Tạo tài khoản" loading={loading} />
      <SecurityNote text="Mật khẩu được mã hoá bằng BCrypt · Thông tin của bạn luôn được bảo vệ" />
    </form>
  )
}
