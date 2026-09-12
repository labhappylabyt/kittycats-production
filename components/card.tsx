'use client'

import { useRef } from 'react'
import type { Social } from './socials'
import { playHoverHum, playPop, playTick, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

export function Card({ social }: { social: Social; index: number }) {
  const innerRef = useRef<HTMLDivElement | null>(null)
  const { Icon } = social

  const onEnter = () => {
    const inner = innerRef.current
    if (inner) {
      inner.style.willChange = 'transform'
      inner.style.transform = 'translate3d(0,-6px,0) rotate(-1deg)'
    }
    if (!isMuted()) { resumeAudio(); playTick(); playHoverHum() }
  }

  const onLeave = () => {
    const inner = innerRef.current
    if (inner) { inner.style.transform = ''; inner.style.willChange = 'auto' }
  }

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      aria-label={`${social.name} — ${social.handle}`}
      className="marquee-card group"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={() => { if (!isMuted()) { resumeAudio(); playPop() } }}
    >
      <div ref={innerRef} className="marquee-card-inner" style={{ borderColor: `${social.color}85` }}>
        <span className="marquee-icon" style={{ color: social.color }}><Icon className="h-5 w-5 pointer-events-none" /></span>
        <span className="min-w-0">
          <span className="block truncate text-[0.82rem] font-bold tracking-[-0.02em] text-white">{social.handle}</span>
          <span className="ui-label text-white/45">{social.name}</span>
        </span>
        {social.status && <span className="marquee-status" style={{ color: social.color }}>{social.status}</span>}
      </div>
    </a>
  )
}
