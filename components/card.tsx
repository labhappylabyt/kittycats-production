'use client'

import { useRef } from 'react'
import type { Social } from './socials'
import { playClick, playMeow, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

const CARD_W = 256
const CARD_H = 360

export function Card({ social, index }: { social: Social; index: number }) {
  const cardRef = useRef<HTMLAnchorElement | null>(null)
  const innerRef = useRef<HTMLSpanElement | null>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = cardRef.current
    const inner = innerRef.current
    if (!el || !inner) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / (rect.width / 2)
    const dy = (e.clientY - cy) / (rect.height / 2)
    const rotY = dx * 12
    const rotX = -dy * 12
    inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`
  }

  const onLeave = () => {
    const inner = innerRef.current
    if (!inner) return
    inner.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)'
  }

  const onHover = () => {
    if (!isMuted()) {
      resumeAudio()
      playMeow()
    }
  }

  const onClick = () => {
    if (!isMuted()) {
      resumeAudio()
      playClick()
    }
  }

  const { Icon } = social

  return (
    <div
      className="flex-shrink-0 snap-center"
      style={{ width: CARD_W, height: CARD_H, marginRight: 24 }}
    >
      <a
        ref={cardRef}
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        aria-label={`${social.name} — ${social.handle}`}
        className="group block h-full w-full [perspective:1000px]"
        onMouseMove={onMove}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onClick={onClick}
      >
        <span
          ref={innerRef}
          className="card-float relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border-4 p-6 transition-transform duration-200 ease-out group-hover:-translate-y-2"
          style={{
            background: social.color,
            color: social.ink,
            borderColor: social.ink,
            boxShadow: '6px 6px 0 0 var(--ink)',
            animationDelay: `${(index % 6) * 0.4}s`,
            transformStyle: 'preserve-3d',
            ['--card-glow' as string]: `${social.color}cc`,
          }}
        >
          <span className="flex items-center justify-between" style={{ transform: 'translateZ(40px)' }}>
            <span className="text-[13px] font-semibold uppercase tracking-[0.15em]">
              {social.name}
            </span>
            <span
              className="h-3 w-3 rounded-[3px] border-2"
              style={{ borderColor: social.ink, background: social.ink }}
            />
          </span>

          <Icon className="mx-auto h-16 w-16 pointer-events-none" style={{ transform: 'translateZ(30px)' }} />

          <span className="flex items-end justify-between" style={{ transform: 'translateZ(40px)' }}>
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
}
