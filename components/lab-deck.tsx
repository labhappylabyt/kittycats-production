'use client'

import { socials } from './socials'
import { Card } from './card'

// 2 copies pre-mounted for seamless CSS marquee loop.
// Desktop: CSS marquee animation. Mobile: scroll-snap container.
const COPIES = 2
const DECK = Array.from({ length: COPIES }, () => socials).flat()

export function LabDeck() {
  return (
    <section
      className="relative w-full overflow-hidden py-16"
      aria-label="Social links deck"
    >
      {/* Edge gradient fades — desktop only */}
      <div
        className="pointer-events-none absolute left-0 top-1/2 z-10 h-full w-32 -translate-y-1/2"
        style={{
          background: 'linear-gradient(to right, var(--background), transparent)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-1/2 z-10 h-full w-32 -translate-y-1/2"
        style={{
          background: 'linear-gradient(to left, var(--background), transparent)',
        }}
        aria-hidden="true"
      />

      {/* Desktop: CSS marquee */}
      <div className="hidden sm:flex" style={{ height: 360 + 64 }}>
        <div className="flex h-full items-center">
          <div
            className="flex w-max"
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              animation: 'marquee 35s linear infinite',
            }}
          >
            {DECK.map((social, i) => (
              <Card key={i} social={social} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: scroll-snap horizontal swipe */}
      <div
        className="flex gap-6 overflow-x-auto px-6 pb-4 sm:hidden"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {socials.map((social, i) => (
          <Card key={i} social={social} index={i} />
        ))}
      </div>
    </section>
  )
}
