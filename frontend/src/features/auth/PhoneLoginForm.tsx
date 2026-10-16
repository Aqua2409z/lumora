import { useState } from 'react'
import {
  Divider,
  Field,
  FormAlert,
  OtpHint,
  PhoneInput,
  PrimaryButton,
  RememberCheckbox,
  SecurityNote,
} from './parts'
import GoogleSignInButton from './GoogleSignInButton'
import ZaloSignInButton from './ZaloSignInButton'

/**
 * Form đăng nhập bằng số điện thoại.
 * OTP qua SMS tốn phí nên chưa làm → ô SĐT + nút "Nhận mã OTP" chỉ là giao diện.
 * Thay vào đó dùng đăng nhập Zalo (miễn phí, chính là tài khoản gắn với SĐT) hoặc Google.
 */
export default function PhoneLoginForm() {
  const [error, setError] = useState<string | null>(null)

  return (
    <form className="flex w-[440px] flex-col items-start gap-[18px]" onSubmit={(e) => e.preventDefault()}>
      {error && <FormAlert message={error} />}
      <Field label="Số điện thoại">
        <PhoneInput />
      </Field>
      <OtpHint />
      <RememberCheckbox />
      <PrimaryButton label="Nhận mã OTP" disabled />
      <Divider label="hoặc đăng nhập miễn phí bằng" />
      <ZaloSignInButton onError={setError} />
      <GoogleSignInButton onError={setError} />
      <SecurityNote text="OTP qua SMS đang phát triển — hãy đăng nhập bằng Zalo (gắn với SĐT của bạn) hoặc Google." />
    </form>
  )
}
