import { socials, type Social } from './socials'

// 2 copies pre-mounted in one continuous flex row. CSS @keyframes marquee
// translates from 0% to -50% (exactly one copy width), then loops seamlessly.
// No JS event listeners — vertical page scrolling is never trapped.
const COPIES = 2
const DECK: Social[] = Array.from({ length: COPIES }, () => socials).flat()

const CARD_W = 256
const CARD_H = 360
const GAP = 24

export function CardDeck() {
  return (
    <div
      className="relative w-full overflow-hidden py-16"
      style={{ height: CARD_H + 128 }}
    >
      <div className="flex h-full items-center">
        <div
          className="flex w-max"
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            animation: 'marquee 35s linear infinite',
          }}
        >
          {DECK.map((social, i) => {
            const { Icon } = social
            return (
              <div
                key={i}
                className="flex-shrink-0"
                style={{ width: CARD_W, height: CARD_H, marginRight: GAP }}
              >
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  aria-label={`${social.name} — ${social.handle}`}
                  className="group block h-full w-full"
                >
                  <span
                    className="card-float card-glow relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border-4 p-6 transition-transform duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1"
                    style={{
                      background: social.color,
                      color: social.ink,
                      borderColor: social.ink,
                      boxShadow: '6px 6px 0 0 var(--ink)',
                      animationDelay: `${(i % socials.length) * 0.4}s`,
                      ['--card-glow' as string]: `${social.color}cc`,
                    }}
                  >
                    <span className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold uppercase tracking-[0.15em]">
                        {social.name}
                      </span>
                      <span
                        className="h-3 w-3 rounded-[3px] border-2"
                        style={{
                          borderColor: social.ink,
                          background: social.ink,
                        }}
                      />
                    </span>

                    <Icon className="mx-auto h-16 w-16 pointer-events-none" />

                    <span className="flex items-end justify-between">
                      <span className="flex flex-col">
                        <span className="text-base font-bold leading-tight">
                          {social.handle}
                        </span>
                        <span className="text-xs font-medium opacity-70">
                          Tap to open
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="translate-x-1 text-lg font-bold opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        →
                      </span>
                    </span>
                  </span>
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
