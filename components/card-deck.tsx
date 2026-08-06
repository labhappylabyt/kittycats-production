'use client'

import { useEffect, useRef, useState } from 'react'
import { socials, type Social } from './socials'

// Duplicated array for seamless loop: [original, original]
// CSS marquee will translate from 0% to -50% (half the total width)
const DECK: Social[] = [...socials, ...socials]

const CARD_W = 256 // w-64
const CARD_H = 352 // h-88
const GAP = 24

export function CardDeck() {
  const [paused, setPaused] = useState(false)

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: CARD_H + 64 }}
    >
      {/* Track: runs the CSS marquee animation */}
      <div
        className="absolute inset-0 flex items-center"
        style={{
          willChange: 'transform',
          animation: 'marquee-scroll 30s linear infinite',
          animationPlayState: paused ? 'paused' : 'running',
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {DECK.map((social, i) => {
          const { Icon } = social
          const wave = i % 2 === 0 ? 'translate-y-4' : '-translate-y-4'
          return (
            <div
              key={i}
              className={`flex-shrink-0 ${wave}`}
              style={{ width: CARD_W, height: CARD_H, marginRight: GAP }}
            >
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${social.name} — ${social.handle}`}
                className="group block h-full w-full"
              >
                <span
                  className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border-4 p-5 transition-transform duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1"
                  style={{
                    background: social.color,
                    color: social.ink,
                    borderColor: social.ink,
                    boxShadow: '6px 6px 0 0 var(--ink)',
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

                  <Icon className="mx-auto h-16 w-16" />

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
  )
}