import { Blob, HandNote, LumoraWordmark, TagLabel, Tape } from './primitives'
import { ArrowRightIcon, CheckIcon } from '../../components/icons'
import reportWatch from '../../assets/landing/report-watch.png'

const CHECKS = [
  'Xác minh đúng theo loại: vật phẩm, đất, xe, vé, dịch vụ, quyền số.',
  'Mỗi phiên gắn quy chế có phiên bản; giá và giờ do máy chủ ghi.',
  'Tiền của chủ hàng theo dõi tách khỏi phí của Lumora.',
]

const FIELDS = [
  { k: 'PHƯƠNG PHÁP', v: 'Kiểm tra trực tiếp', brand: false, mono: false },
  { k: 'XÁC THỰC', v: 'Đạt, trong phạm vi', brand: true, mono: false },
  { k: 'GIỚI HẠN', v: 'Không mở bộ máy', brand: false, mono: false },
  { k: 'PHIÊN BẢN', v: 'v2 · 03/10/2026', brand: false, mono: true },
]

/** Con dấu vàng "ĐÃ KIỂM ĐỊNH". */
function Seal() {
  return (
    <div className="relative grid h-[110px] w-[110px] place-items-center rounded-full bg-gold-grad shadow-[0_12px_26px_-8px_rgba(154,120,30,0.6)]">
      <div className="grid h-[88px] w-[88px] place-items-center rounded-full border-2 border-[#2a1a06]/30">
        <div className="text-center text-[#2a1a06]">
          <CheckIcon size={22} className="mx-auto" strokeWidth={2.6} />
          <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em]">Đã kiểm định</div>
        </div>
      </div>
    </div>
  )
}

export default function Proof() {
  return (
    <section className="relative mx-auto max-w-[1280px] px-10 py-16">
      <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* ---------------- Cột trái ---------------- */}
        <div data-proof-left className="relative">
          <Blob color="#F4DC92" w={360} h={260} opacity={0.4} blur={46} style={{ left: -60, top: 60 }} />
          <TagLabel className="relative mb-4">Vì sao tin Lumora</TagLabel>
          <h2 className="relative text-[40px] font-bold leading-[1.1] text-ink">
            Bán bằng bằng chứng,
            <span className="mt-1 block font-caveat font-bold text-brand" style={{ fontSize: 48 }}>
              không bằng lời hứa.
            </span>
          </h2>
          <p className="relative mt-6 max-w-[500px] text-[15px] leading-[1.7] text-ink-600">
            Lumora nhận ký gửi tài sản, quyền và dịch vụ từ cá nhân, xác minh đúng theo từng loại, rồi bán thay bạn
            bằng mua ngay hoặc đấu giá — bàn giao theo mốc và quyết toán có đối soát.
          </p>

          <ul className="relative mt-7 space-y-3.5">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-start gap-3 text-[14px] text-ink-700">
                <span className="mt-0.5 shrink-0 text-brand">
                  <CheckIcon size={16} strokeWidth={2.4} />
                </span>
                {c}
              </li>
            ))}
          </ul>

          <div className="relative mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="group inline-flex items-center gap-3 rounded-full bg-brand py-2.5 pl-6 pr-2.5 text-[15px] font-semibold text-white shadow-btn-brand transition hover:bg-brand-dark"
            >
              Xem phiên đang mở
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 transition group-hover:translate-x-0.5">
                <ArrowRightIcon size={18} />
              </span>
            </button>
            <button
              type="button"
              className="rounded-full border border-[#e4dccf] bg-white px-7 py-3.5 text-[15px] font-semibold text-ink transition hover:border-brand hover:text-brand"
            >
              Tôi muốn ký gửi
            </button>
          </div>
        </div>

        {/* ---------------- Cột phải (thẻ báo cáo) ---------------- */}
        <div data-proof-right className="relative mx-auto w-full max-w-[560px]">
          <Blob color="#F4DC92" w={200} h={200} opacity={0.5} blur={30} style={{ right: -10, bottom: 10 }} />

          {/* Thẻ giấy báo cáo */}
          <div className="relative rotate-[1.2deg] bg-[#fffdf8] p-7 shadow-[0_26px_50px_-18px_rgba(23,15,10,0.4)]">
            <Tape w={96} h={30} rotate={-6} style={{ left: 60, top: -14 }} />
            <Tape w={96} h={30} rotate={5} style={{ right: 60, top: -14 }} />

            <div className="border border-[#f1d9df] p-6">
              {/* Đầu báo cáo */}
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand">
                  Báo cáo kiểm định · Bản công khai
                </span>
                <div className="text-right">
                  <LumoraWordmark size={18} />
                  <div className="font-mono text-[10px] text-ink-500">v2 · 03/10/2026</div>
                </div>
              </div>
              <h3 className="mt-3 font-display text-[23px] font-semibold leading-tight text-ink">
                Lô N-0241 — Đồng hồ dây da, mặt số trắng
              </h3>
              <div className="my-4 h-px bg-[#ece5da]" />

              {/* Thân: ảnh + thông số */}
              <div className="flex gap-5">
                <div className="relative w-[150px] shrink-0">
                  <img src={reportWatch} alt="Đồng hồ" className="h-[190px] w-full object-cover" draggable={false} />
                  <span className="absolute right-1 top-14 bg-ink px-2 py-1 font-mono text-[10px] text-white">
                    mặt số: nguyên bản
                  </span>
                  <span className="absolute bottom-3 left-1 bg-ink px-2 py-1 font-mono text-[10px] text-white">
                    dây da: đã thay, có công bố
                  </span>
                </div>
                <dl className="flex-1 space-y-3.5">
                  {FIELDS.map((f) => (
                    <div key={f.k}>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-500">{f.k}</dt>
                      <dd
                        className={`text-[16px] font-medium ${f.brand ? 'text-brand' : 'text-ink'} ${
                          f.mono ? 'font-mono text-[13px]' : 'font-display'
                        }`}
                      >
                        {f.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Chữ ký */}
              <div className="mt-5">
                <svg width="90" height="24" viewBox="0 0 90 24" fill="none">
                  <path
                    d="M3 16c5-10 9 2 13-2s5-8 8 0 5 6 9 1 6-4 10 2 7 3 11-2 8-6 12 0"
                    stroke="#171717"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="mt-1 w-[150px] border-t border-[#d8cfc1] pt-1 text-[12px] text-ink-600">
                  Chuyên viên thẩm định
                </div>
              </div>
              <div className="mt-3 text-right font-mono text-[11px] text-ink-500">Mã tra cứu: LMR-N0241-V2</div>
            </div>
          </div>

          {/* Con dấu + ghi chú */}
          <div className="absolute -bottom-6 right-2 z-20">
            <Seal />
          </div>
          <div className="absolute -bottom-2 left-2 z-20 flex items-end gap-1">
            <svg width="46" height="60" viewBox="0 0 46 60" fill="none">
              <path d="M30 56c-6-10-10-22-6-34" stroke="#9F1239" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M24 22c0-4 1-7 2-10-3 2-6 4-10 5" stroke="#9F1239" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <HandNote rotate={-6} size={20} color="#9F1239">
              100% kiểm định
              <br />
              độc lập
            </HandNote>
          </div>
        </div>
      </div>
    </section>
  )
}
