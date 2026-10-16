import LumoraLogo from '../../components/LumoraLogo'
import { CheckIcon, Sparkle, StarOutlineIcon } from '../../components/icons'
import { LoopSwirl, Underline } from '../../components/icons/Doodles'
import type { Scene } from './scenes'

const COMMITMENTS = ['Kiểm định độc lập', 'Ký quỹ an toàn', 'Quyết toán minh bạch']

/** Panel trái — collage đỏ crimson (680×984) */
export default function AuthShowcase({ scene }: { scene: Scene }) {
  const { mainPhoto, lotCard, polaroid, handNote } = scene

  return (
    <div className="absolute left-5 top-5 h-[984px] w-[680px] overflow-hidden rounded-[32px] bg-brand">
      {/* Vệt màu nước (texture nền) */}
      <div className="pointer-events-none absolute left-[320px] top-[-120px] h-[420px] w-[520px] rounded-full blur-[48px]" style={{ background: 'rgba(94,10,34,0.55)' }} />
      <div className="pointer-events-none absolute left-[-210px] top-[734px] h-[360px] w-[460px] rounded-full blur-[48px]" style={{ background: 'rgba(212,175,55,0.22)' }} />
      <div className="pointer-events-none absolute left-[120px] top-[260px] h-[240px] w-[300px] rounded-full blur-[48px]" style={{ background: 'rgba(245,240,232,0.07)' }} />
      <div className="pointer-events-none absolute left-[-120px] top-[80px] h-[300px] w-[380px] rounded-full blur-[48px]" style={{ background: 'rgba(107,11,39,0.5)' }} />

      {/* Logo */}
      <div className="absolute left-12 top-10">
        <LumoraLogo />
      </div>

      {/* Nhãn: 3 phiên đang diễn ra */}
      <div
        className="absolute flex h-6 items-center gap-1.5 rounded-[20px] px-[11px]"
        style={{ left: 476, top: 52, background: 'rgba(255,255,255,0.12)' }}
      >
        <span className="text-[11px] font-semibold leading-[14px] tracking-[0.06em] text-gold-soft">
          ● 3 phiên đang diễn ra
        </span>
      </div>

      {/* Thẻ LOT */}
      <div
        className="absolute flex flex-col items-start gap-1 rounded-[6px] bg-cream-card px-5 py-4 shadow-lot"
        style={{ left: lotCard.left, top: lotCard.top, width: 230, height: 141, transform: `rotate(${lotCard.rotate}deg)`, zIndex: 10 }}
      >
        <div className="flex w-[190px] items-center justify-between">
          <span className="text-[19px] font-extrabold leading-6 tracking-[0.04em] text-ink">{lotCard.lot}</span>
          <span className="h-[9px] w-[9px] rounded-full bg-brand" />
        </div>
        <span className="font-hand text-[18px] leading-6 text-ink-600">{lotCard.item}</span>
        <span className="font-charm text-[16px] leading-[25px] text-brand">Giá hiện tại</span>
        <span className="text-[19px] font-extrabold leading-6 text-ink">{lotCard.price}</span>
      </div>

      {/* Ảnh chính (giấy ảnh) */}
      <div
        className="absolute"
        style={{ left: mainPhoto.left, top: mainPhoto.top, width: 354, height: 304, transform: `rotate(${mainPhoto.rotate}deg)` }}
      >
        <div className="h-full w-full bg-cream-card p-[12px] shadow-photo">
          <img src={mainPhoto.src} alt={mainPhoto.alt} className="block h-full w-full object-cover" />
        </div>
        {/* Băng dính */}
        <div
          className="absolute"
          style={{ left: 128, top: -12, width: 96, height: 28, transform: 'rotate(10deg)', background: 'rgba(239,227,200,0.78)', boxShadow: '0px 2px 4px rgba(0,0,0,0.08)' }}
        />
      </div>

      {/* Polaroid */}
      <div
        className="absolute flex flex-col items-center bg-white shadow-polaroid"
        style={{ left: polaroid.left, top: polaroid.top, width: 190, height: 232, padding: '12px 12px 14px', gap: 10, transform: `rotate(${polaroid.rotate}deg)` }}
      >
        <img src={polaroid.src} alt={polaroid.alt} className="block object-cover" style={{ width: 166, height: 170, background: '#ECE5DA' }} />
        <span className="font-hand text-[19px] leading-[26px] text-ink">{polaroid.caption}</span>
        {/* Băng dính */}
        <div
          className="absolute"
          style={{ left: 84, top: -12, width: 80, height: 24, transform: 'rotate(-12deg)', background: 'rgba(239,227,200,0.78)', boxShadow: '0px 2px 4px rgba(0,0,0,0.08)' }}
        />
      </div>

      {/* Ghi chú viết tay */}
      <div
        className="absolute font-hand text-[26px] leading-[28px] text-cream-light"
        style={{ left: handNote.left, top: handNote.top, width: handNote.width, transform: `rotate(${handNote.rotate}deg)` }}
      >
        {handNote.lines.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </div>

      {/* Nét vẽ tay — vòng xoắn */}
      <div className="absolute" style={{ left: 210, top: 500 }}>
        <LoopSwirl />
      </div>

      {/* Lấp lánh */}
      <div className="absolute" style={{ left: 90, top: 130 }}>
        <Sparkle size={18} />
      </div>
      <div className="absolute" style={{ left: 590, top: 300 }}>
        <Sparkle size={14} />
      </div>
      <div className="absolute" style={{ left: 360, top: 560 }}>
        <Sparkle size={12} />
      </div>
      <div className="absolute text-gold" style={{ left: 560, top: 654 }}>
        <StarOutlineIcon size={20} />
      </div>

      {/* Khẩu hiệu */}
      <div className="absolute" style={{ left: 56, top: 684, width: 560, height: 240 }}>
        <span className="absolute left-0 top-0 text-[58px] font-extrabold leading-[64px] text-cream-light">
          Những giá trị
        </span>
        <span
          className="text-gold-grad absolute font-script text-[68px] leading-[74px]"
          style={{ left: 40, top: 60.27, transform: 'rotate(-3deg)' }}
        >
          thật, không chỉ là
        </span>
        <span className="absolute left-0 text-[58px] font-extrabold leading-[64px] text-cream-light" style={{ top: 134 }}>
          vật chất.
        </span>
        <div className="absolute" style={{ left: -4, top: 196 }}>
          <Underline />
        </div>
      </div>

      {/* Cam kết */}
      <div className="absolute flex items-center gap-[18px]" style={{ left: 56, top: 928 }}>
        {COMMITMENTS.map((c) => (
          <div key={c} className="flex items-center gap-1.5">
            <span className="text-gold">
              <CheckIcon size={14} />
            </span>
            <span className="whitespace-nowrap text-[12.5px] leading-4" style={{ color: 'rgba(245,240,232,0.82)' }}>
              {c}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
