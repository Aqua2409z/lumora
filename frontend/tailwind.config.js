/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Thương hiệu (đỏ crimson Lumora)
        brand: {
          DEFAULT: '#9F1239',
          dark: '#6B0B27',
          deep: '#5E0A22',
          deepest: '#3D0A18', // nền footer đỏ sẫm
        },
        // Nền kem / giấy
        cream: {
          DEFAULT: '#F6F1E9', // nền trang
          card: '#FFFDF8', // thẻ / giấy
          light: '#F5F0E8', // chữ sáng trên nền đỏ
          tab: '#EDE4D6', // rãnh tab
        },
        // Vàng gold
        gold: {
          DEFAULT: '#E9CF84',
          deep: '#D4AF37',
          soft: '#F4DC92',
          muted: '#C9A24A',
        },
        // Chữ
        ink: {
          DEFAULT: '#171717',
          700: '#3A3434',
          600: '#5E5757',
          500: '#737373',
        },
        pink: '#F7E4E9', // nền nhãn "Thành viên Lumora"
        success: '#2F6B4F', // dấu check xanh
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        display: ['"Cormorant Garamond"', 'serif'], // wordmark "Lumora" + nhấn nghiêng
        script: ['"Alex Brush"', 'cursive'],
        hand: ['"Patrick Hand"', 'cursive'],
        caveat: ['"Caveat"', 'cursive'], // chữ viết tay ghi chú
        mono: ['"JetBrains Mono"', 'monospace'], // mã số / đồng hồ đếm ngược
        charm: ['"Charm"', 'cursive'],
      },
      boxShadow: {
        photo: '0px 14px 30px rgba(23, 15, 10, 0.35)',
        polaroid: '0px 16px 30px -6px rgba(13, 5, 5, 0.3)',
        lot: '0px 12px 24px -6px rgba(13, 5, 5, 0.25)',
        tape: '0px 2px 4px rgba(0, 0, 0, 0.08)',
        tab: '0px 10px 30px -4px rgba(31, 18, 13, 0.12)',
        'btn-brand': '0px 12px 24px -8px rgba(158, 18, 56, 0.28)',
        'btn-google': '0px 10px 30px -4px rgba(31, 18, 13, 0.06)',
        'ring-brand': '0px 0px 0px 4px rgba(158, 18, 56, 0.12)',
      },
    },
  },
  plugins: [],
}
