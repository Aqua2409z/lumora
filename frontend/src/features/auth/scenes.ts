// Ảnh thật lấy từ trang chính (src/assets/landing/) — dùng ES module import
// để Vite xử lý hash, tối ưu, và TypeScript kiểm tra file tồn tại.
import consignWatch from '../../assets/landing/consign-watch.png'
import whyRing from '../../assets/landing/why-ring.png'
import lot3Bag from '../../assets/landing/lot-3.png'
import sold3Ring from '../../assets/landing/sold-3.png'

export type AuthTab = 'gmail' | 'phone'
/** Chế độ biểu mẫu: đăng nhập hoặc đăng ký. */
export type AuthMode = 'login' | 'register'

export type Scene = {
  mainPhoto: { src: string; alt: string; rotate: number; left: number; top: number }
  lotCard: {
    lot: string
    item: string
    price: string
    rotate: number
    left: number
    top: number
  }
  polaroid: { src: string; alt: string; caption: string; rotate: number; left: number; top: number }
  handNote: { lines: string[]; rotate: number; left: number; top: number; width: number }
  /** Ghi chú viết tay cạnh biểu mẫu (toạ độ theo khung 1440) */
  sideNote: { lines: string[]; left: number; top: number; rotate: number }
}

export const SCENES: Record<AuthTab, Scene> = {
  // Tab Gmail — ảnh đồng hồ cơ + nhẫn kim cương
  gmail: {
    mainPhoto: { src: consignWatch, alt: 'Đồng hồ cơ 1968', rotate: 4, left: 98.79, top: 150 },
    lotCard: {
      lot: 'LÔ 0247',
      item: 'Đồng hồ cơ, 1968',
      price: '86.000.000 ₫',
      rotate: -5,
      left: 400,
      top: 95,
    },
    polaroid: {
      src: whyRing,
      alt: 'Nhẫn kim cương',
      caption: 'Nhẫn kim cương 1.02 ct',
      rotate: -7,
      left: 420,
      top: 306.84,
    },
    handNote: { lines: ['chào mừng', 'bạn trở lại ♡'], rotate: 6, left: 64.15, top: 470, width: 140 },
    sideNote: { lines: ['1 chạm', 'là xong!'], left: 1300, top: 286, rotate: 8 },
  },
  // Tab Số điện thoại — ảnh túi da đỏ + nhẫn kim cương
  phone: {
    mainPhoto: { src: lot3Bag, alt: 'Túi da đỏ phiên bản giới hạn', rotate: -3, left: 120, top: 131.47 },
    lotCard: {
      lot: 'LÔ 0251',
      item: 'Túi da đỏ, giới hạn',
      price: '38.000.000 ₫',
      rotate: 4,
      left: 390.16,
      top: 115,
    },
    polaroid: {
      src: sold3Ring,
      alt: 'Nhẫn kim cương 1.02 ct',
      caption: 'Nhẫn kim cương 1.02 ct',
      rotate: 6,
      left: 395.75,
      top: 330,
    },
    handNote: { lines: ['không cần nhớ', 'mật khẩu ✦'], rotate: 6, left: 64.15, top: 470, width: 150 },
    sideNote: { lines: ['nhanh &', 'an toàn!'], left: 1296, top: 446, rotate: 8 },
  },
}
