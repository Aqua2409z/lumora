// Khai báo kiểu tối thiểu cho thư viện Google Identity Services (GIS)
// được nạp từ https://accounts.google.com/gsi/client

export {}

type GoogleCredentialResponse = {
  credential: string
  select_by?: string
}

type GoogleIdConfig = {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
}

type GoogleButtonOptions = {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: number | string
  locale?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void
          renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void
          prompt: () => void
        }
      }
    }
  }
}
