'use client'

import { useRef } from 'react'
import type { Social } from './socials'
import { playHoverHum, playPop, playTick, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

export function Card({ social, index }: { social: Social; index: number }) {
  const innerRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const { Icon } = social

  const onMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const anchor = event.currentTarget
    const inner = innerRef.current
    if (!inner) return
    const rect = anchor.getBoundingClientRect()
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      inner.style.willChange = 'transform'
      inner.style.transform = `perspective(900px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) translate3d(0,-4px,0)`
    })
  }

  const onLeave = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    const inner = innerRef.current
    if (inner) {
      inner.style.transform = ''
      inner.style.willChange = 'auto'
    }
  }

  const onEnter = () => {
    if (!isMuted()) { resumeAudio(); playTick(); playHoverHum() }
  }

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      aria-label={`${social.name} — ${social.handle}`}
      className={`social-card group ${index === 0 ? 'social-card-featured' : ''}`}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={() => { if (!isMuted()) { resumeAudio(); playPop() } }}
    >
      <div ref={innerRef} className="social-card-inner" style={{ borderColor: `${social.color}65` }}>
        <div className="social-card-top">
          <span className="ui-label text-white/75">{social.name}</span>
          {social.status && <span className="status-pill"><span className="status-pill-dot" style={{ background: social.color }} />{social.status}</span>}
        </div>

        <div className="social-card-icon" style={{ color: social.color }}>
          <Icon className="h-8 w-8 pointer-events-none" />
        </div>

        <div className="social-card-bottom">
          <span>
            <span className="block text-lg font-semibold tracking-[-0.02em] text-white">{social.handle}</span>
            <span className="ui-label text-white/40">Open door</span>
          </span>
          <span aria-hidden="true" className="social-card-arrow">↗</span>
        </div>

        {social.meta && <span className="social-card-meta">{social.meta}</span>}
      </div>
    </a>
  )
}
