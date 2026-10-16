// ============================================================
//  PKCE helper cho đăng nhập Zalo (OAuth v4)
//  - code_verifier: chuỗi ngẫu nhiên (lưu tạm ở sessionStorage)
//  - code_challenge = BASE64URL( SHA-256( code_verifier ) )
//  Dùng Web Crypto API có sẵn trong trình duyệt (không cần thư viện).
// ============================================================

/** Mã hoá mảng byte sang Base64URL (không dấu "=", thay +/ thành -_). */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Sinh code_verifier ngẫu nhiên (43 ký tự an toàn URL). */
export function generateCodeVerifier(): string {
  const random = new Uint8Array(32)
  crypto.getRandomValues(random)
  return base64UrlEncode(random)
}

/** Tính code_challenge = BASE64URL(SHA-256(verifier)). */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(digest))
}

/** Sinh chuỗi state ngẫu nhiên chống CSRF. */
export function generateState(): string {
  const random = new Uint8Array(16)
  crypto.getRandomValues(random)
  return base64UrlEncode(random)
}
