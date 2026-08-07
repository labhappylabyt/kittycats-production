'use client'

import { useEffect, useRef } from 'react'
import { socials, type Social } from './socials'

// 4 duplicated sets for completely seamless wrapping
const DECK: Social[] = [...socials, ...socials, ...socials, ...socials]

const CARD_W = 256
const CARD_H = 352
const GAP = 24
const ITEM_W = CARD_W + GAP
const SINGLE_SET_W = socials.length * ITEM_W

export function CardDeck() {
  const offsetRef = useRef(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startOffsetRef = useRef(0)

  useEffect(() => {
    let rafId: number

    const tick = () => {
      if (!isDraggingRef.current) {
        offsetRef.current += 0.2 // slower gentle continuous drift
      }

      // Keep offset in [0, SINGLE_SET_W)
      offsetRef.current =
        ((offsetRef.current % SINGLE_SET_W) + SINGLE_SET_W) % SINGLE_SET_W

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    // Override page vertical scroll on wheel event
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      offsetRef.current += delta * 1.5
    }

    window.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('wheel', onWheel)
    }
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true
    startXRef.current = e.clientX
    startOffsetRef.current = offsetRef.current
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return
    const dx = startXRef.current - e.clientX
    offsetRef.current = startOffsetRef.current + dx
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
  }

  return (
    <div
      className="relative w-full overflow-hidden py-6 cursor-grab active:cursor-grabbing select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div
        ref={trackRef}
        className="flex items-center py-4"
        style={{
          width: 'max-content',
          willChange: 'transform',
        }}
      >
        {DECK.map((social, i) => {
          const { Icon } = social
          const wave = i % 2 === 0 ? 'translate-y-3' : '-translate-y-3'
          return (
            <div
              key={i}
              className={`flex-shrink-0 ${wave} animate-float`}
              style={{ 
                width: CARD_W, 
                height: CARD_H, 
                marginRight: GAP,
                animationDelay: `${i * 0.1}s` 
              }}
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
  )
}
