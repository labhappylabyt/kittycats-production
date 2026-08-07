'use client'

import { useEffect, useRef, useState } from 'react'
import { socials, type Social } from './socials'

// 3 copies pre-mounted in one continuous flex row. CSS @keyframes drives
// the base drift from 0% to -33.333% (exactly one copy), then loops.
// A separate wrapper handles drag/wheel offset so it never conflicts with
// the animation transform. Pure CSS = no React re-render lag.
const COPIES = 3
const DECK: Social[] = Array.from({ length: COPIES }, () => socials).flat()

const CARD_W = 256
const CARD_H = 360
const GAP = 24

export function CardDeck() {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [paused, setPaused] = useState(false)
  const dragRef = useRef({ dragging: false, startX: 0, startOffset: 0, offset: 0 })

  // Apply drag/wheel offset to wrapper and decay it back to 0 via rAF.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const ds = dragRef.current
      if (!ds.dragging && Math.abs(ds.offset) > 0.1) {
        ds.offset *= 0.92
      }
      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `translate3d(${ds.offset.toFixed(1)}px, 0, 0)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      dragRef.current.offset += delta * 0.6
    }

    const onPointerDown = (e: PointerEvent) => {
      const ds = dragRef.current
      ds.dragging = true
      ds.startX = e.clientX
      ds.startOffset = ds.offset
      setPaused(true)
      wrapper.setPointerCapture?.(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      const ds = dragRef.current
      if (!ds.dragging) return
      ds.offset = ds.startOffset + (e.clientX - ds.startX)
    }
    const onPointerUp = (e: PointerEvent) => {
      dragRef.current.dragging = false
      setPaused(false)
      wrapper.releasePointerCapture?.(e.pointerId)
    }

    wrapper.addEventListener('wheel', onWheel, { passive: false })
    wrapper.addEventListener('pointerdown', onPointerDown)
    wrapper.addEventListener('pointermove', onPointerMove)
    wrapper.addEventListener('pointerup', onPointerUp)
    wrapper.addEventListener('pointerleave', onPointerUp)

    return () => {
      wrapper.removeEventListener('wheel', onWheel)
      wrapper.removeEventListener('pointerdown', onPointerDown)
      wrapper.removeEventListener('pointermove', onPointerMove)
      wrapper.removeEventListener('pointerup', onPointerUp)
      wrapper.removeEventListener('pointerleave', onPointerUp)
    }
  }, [])

  return (
    <div
      className="relative w-full overflow-hidden py-16"
      style={{ height: CARD_H + 128 }}
    >
      {/* Wrapper: handles drag/wheel offset (separate from animation) */}
      <div
        ref={wrapperRef}
        className="absolute inset-0"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          transform: 'translate3d(0,0,0)',
        }}
      >
        {/* Track: runs the CSS marquee animation */}
        <div
          className="absolute left-0 top-1/2 flex items-center"
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            width: 'max-content',
            transform: 'translate3d(0, -50%, 0)',
            animation: 'marquee-scroll 50s linear infinite',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {DECK.map((social, i) => {
            const { Icon } = social
            return (
              <div
                key={i}
                className="flex-shrink-0"
                style={{ width: CARD_W, height: CARD_H, marginRight: GAP }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
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
                    className="card-float relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border-4 p-6 transition-transform duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1"
                    style={{
                      background: social.color,
                      color: social.ink,
                      borderColor: social.ink,
                      boxShadow: '6px 6px 0 0 var(--ink)',
                      animationDelay: `${(i % socials.length) * 0.4}s`,
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
