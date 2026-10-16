/**
 * useScrollAnimations — tập hợp toàn bộ hiệu ứng cuộn kiểu storytelling cho landing page.
 * Dùng GSAP ScrollTrigger (đã sync với Lenis qua SmoothScrollProvider).
 *
 * Triết lý "storytelling":
 *   • Hero xuất hiện ngay (không cần cuộn) — kéo người dùng vào câu chuyện
 *   • Mỗi section "đến" với mục đích — fade + translate, không chỉ là hiệu ứng trang trí
 *   • Parallax nhẹ trên ảnh hero — tạo chiều sâu
 *   • Cards stagger — từng món đồ "bước ra sân khấu" theo lượt
 *   • Easing expo.out — nhanh vào, chậm dừng = cảm giác cao cấp
 */
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function useScrollAnimations() {
  useEffect(() => {
    // requestAnimationFrame đảm bảo DOM đã paint trước khi GSAP set trạng thái ban đầu
    const raf = requestAnimationFrame(() => {
      const ctx = gsap.context(() => {

        // ══════════════════════════════════════════════════════════
        // 1. HERO — xuất hiện ngay, không cần cuộn
        // ══════════════════════════════════════════════════════════
        const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } })
        heroTl
          .from('[data-hero-heading]', { y: 80, opacity: 0, duration: 1.1 })
          .from('[data-hero-body]',    { y: 40, opacity: 0, duration: 0.9 }, '-=0.7')
          .from('[data-hero-cta]',     { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
          .from('[data-hero-right]',   { x: 60, opacity: 0, duration: 1.2 }, '-=1.0')

        // Parallax cột phải hero khi cuộn xuống (ảnh lưu lại chút sau trang)
        gsap.to('[data-hero-right]', {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-hero-right]',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        })

        // ══════════════════════════════════════════════════════════
        // 2. SECTION HEADINGS — fade lên khi vào viewport
        // ══════════════════════════════════════════════════════════
        gsap.utils.toArray<HTMLElement>('[data-section-head]').forEach((el) => {
          gsap.from(el, {
            y: 36, opacity: 0, duration: 0.9, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          })
        })

        // ══════════════════════════════════════════════════════════
        // 3. AUCTION CARDS — stagger từng thẻ lô
        // ══════════════════════════════════════════════════════════
        const lotCards = gsap.utils.toArray<HTMLElement>('[data-lot-card]')
        if (lotCards.length) {
          gsap.from(lotCards, {
            y: 60, opacity: 0,
            stagger: { each: 0.1, from: 'start' },
            duration: 0.85, ease: 'expo.out',
            scrollTrigger: {
              trigger: lotCards[0].parentElement!,
              start: 'top 82%',
            },
          })
        }

        // ══════════════════════════════════════════════════════════
        // 4. PROOF — trái/phải trượt vào từ hai phía (kể chuyện)
        // ══════════════════════════════════════════════════════════
        gsap.from('[data-proof-left]', {
          x: -55, opacity: 0, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: '[data-proof-left]', start: 'top 80%' },
        })
        gsap.from('[data-proof-right]', {
          x: 55, opacity: 0, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: '[data-proof-right]', start: 'top 80%' },
        })

        // ══════════════════════════════════════════════════════════
        // 5. WHY FEATURES — stagger từ trái sang phải
        // ══════════════════════════════════════════════════════════
        const whyItems = gsap.utils.toArray<HTMLElement>('[data-why-item]')
        if (whyItems.length) {
          gsap.from(whyItems, {
            y: 28, opacity: 0,
            stagger: { each: 0.08, from: 'start' },
            duration: 0.7, ease: 'expo.out',
            scrollTrigger: {
              trigger: whyItems[0].closest('section'),
              start: 'top 80%',
            },
          })
        }

        // ══════════════════════════════════════════════════════════
        // 6. CATEGORY POLAROIDS — fan vào từ bên dưới, lần lượt
        // ══════════════════════════════════════════════════════════
        const catItems = gsap.utils.toArray<HTMLElement>('[data-cat-item]')
        if (catItems.length) {
          gsap.from(catItems, {
            y: 70, opacity: 0,
            stagger: { each: 0.09, from: 'start' },
            duration: 0.95, ease: 'expo.out',
            scrollTrigger: {
              trigger: catItems[0].closest('section'),
              start: 'top 78%',
            },
          })
        }

        // ══════════════════════════════════════════════════════════
        // 7. CONSIGN — ảnh trượt từ trái, text stagger từ phải
        // ══════════════════════════════════════════════════════════
        gsap.from('[data-consign-left]', {
          x: -65, opacity: 0, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: '[data-consign-left]', start: 'top 80%' },
        })
        // Từng phần tử con của cột phải lần lượt xuất hiện
        gsap.from('[data-consign-right] > *', {
          y: 28, opacity: 0,
          stagger: { each: 0.1, from: 'start' },
          duration: 0.85, ease: 'expo.out',
          scrollTrigger: { trigger: '[data-consign-right]', start: 'top 78%' },
        })

        // ══════════════════════════════════════════════════════════
        // 8. SOLD CARDS — grid reveal từ trái sang phải
        // ══════════════════════════════════════════════════════════
        const soldCards = gsap.utils.toArray<HTMLElement>('[data-sold-card]')
        if (soldCards.length) {
          gsap.from(soldCards, {
            y: 50, opacity: 0,
            stagger: { each: 0.07, from: 'start' },
            duration: 0.75, ease: 'expo.out',
            scrollTrigger: {
              trigger: soldCards[0].parentElement!,
              start: 'top 82%',
            },
          })
        }

        // ══════════════════════════════════════════════════════════
        // 9. FOOTER — fade in phần thân footer
        // ══════════════════════════════════════════════════════════
        gsap.from('footer > div > :not([data-footer-wordmark])', {
          opacity: 0, y: 20, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: 'footer', start: 'top 88%' },
        })

        // ══════════════════════════════════════════════════════════
        // 10. FOOTER WORDMARK — hiệu ứng "viết chữ" tự chạy
        //     khi cuộn tới: bút bắt đầu ghi từ trái sang phải 1 lần
        // ══════════════════════════════════════════════════════════
        gsap.set('[data-footer-wordmark] span', {
          clipPath: 'inset(0 100% 0 0)',
          willChange: 'clip-path',
        })
        gsap.to('[data-footer-wordmark] span', {
          clipPath: 'inset(0 0% 0 0)',
          duration: 2.4,               // 2.4s — nhịp viết tự nhiên
          ease: 'power2.inOut',        // bắt đầu chậm → nhanh → kết thúc chậm như nét chữ
          scrollTrigger: {
            trigger: '[data-footer-wordmark]',
            start: 'top 88%',          // kích hoạt khi vào viewport → tự chạy 1 lần
            toggleActions: 'play none none none',
          },
        })

      }) // end gsap.context

      // cleanup: huỷ mọi ScrollTrigger và animation khi unmount
      return () => ctx.revert()
    })

    return () => cancelAnimationFrame(raf)
  }, [])
}
