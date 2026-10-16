/**
 * SmoothScrollProvider — bọc toàn bộ app bằng Lenis.
 * GSAP ticker lái Lenis (autoRaf: false) để ScrollTrigger đồng bộ chính xác.
 * Nguồn: https://dev.to/thebitforge/your-scroll-animations-look-amateur-heres-the-gsap-lenis-setup-that-fixes-it-48ni
 */
import { useRef, useEffect, type ReactNode } from 'react'
import ReactLenis, { type LenisRef } from 'lenis/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Đăng ký một lần ở module scope — tránh double-register trong React Strict Mode
gsap.registerPlugin(ScrollTrigger)

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null)

  useEffect(() => {
    // GSAP ticker lái Lenis thay vì để Lenis tự RAF
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000)
    }
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0) // tránh giật khi chuyển tab

    return () => gsap.ticker.remove(update)
  }, [])

  return (
    <ReactLenis
      ref={lenisRef}
      root
      autoRaf={false} // GSAP ticker thay thế RAF của Lenis
      options={{
        lerp: 0.1,        // hệ số nội suy: 0.1 = đệm đủ mượt, không quá chậm
        duration: 1.2,
        syncTouch: true,  // smooth scroll trên thiết bị cảm ứng
        // easing mũ: khởi đầu nhanh, kết thúc chậm — cảm giác vật lý tự nhiên
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      {children}
    </ReactLenis>
  )
}
