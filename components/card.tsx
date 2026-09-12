'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import type { Social } from './socials'
import { playHoverHum, playPop, playTick, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

const CARD_W = 256
const CARD_H = 360

export function Card({ social, index }: { social: Social; index: number }) {
  const cardRef = useRef<HTMLAnchorElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const drawerRef = useRef<HTMLDivElement | null>(null)

  const onMove = (event: React.MouseEvent) => {
    const element = cardRef.current
    const inner = innerRef.current
    if (!element || !inner) return
    const rect = element.getBoundingClientRect()
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    gsap.to(inner, { rotateX: -dy * 10, rotateY: dx * 10, z: 12, duration: 0.16, ease: 'power2.out', transformPerspective: 1100 })
  }

  const onLeave = () => {
    if (innerRef.current) gsap.to(innerRef.current, { rotateX: 0, rotateY: 0, z: 0, duration: 0.5, ease: 'power3.out' })
    if (drawerRef.current) gsap.to(drawerRef.current, { opacity: 0, y: 10, duration: 0.2, ease: 'power2.out' })
  }

  const onEnter = () => {
    if (!isMuted()) {
      resumeAudio()
      playTick()
      playHoverHum()
    }
    if (drawerRef.current) gsap.to(drawerRef.current, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' })
  }

  const { Icon } = social

  return (
    <div className="flex-shrink-0 snap-center" style={{ width: CARD_W, height: CARD_H, marginRight: 24 }}>
      <a
        ref={cardRef}
        href={social.href}
        target="_blank"
        rel="noopener noreferrer"
        draggable={false}
        aria-label={`${social.name} — ${social.handle}`}
        className="group block h-full w-full [perspective:1100px]"
        onMouseMove={onMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onClick={() => { if (!isMuted()) { resumeAudio(); playPop() } }}
      >
        <div
          ref={innerRef}
          className="card-float relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[18px] border border-white/14 bg-[#222629] p-6 transition-[border-color,box-shadow,transform] duration-500 ease-out group-hover:-translate-y-2"
          style={{
            borderColor: `${social.color}70`,
            boxShadow: `6px 6px 0 rgba(0,0,0,.2), inset 0 1px rgba(255,255,255,0.08)`,
            animationDelay: `${(index % 6) * 0.42}s`,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'linear-gradient(to bottom, black, transparent 70%)' }} />
          <div className="relative flex items-center justify-between" style={{ transform: 'translateZ(42px)' }}>
            <span className="ui-label text-white/75">{social.name}</span>
            {social.status && <span className="flex items-center gap-1.5 ui-label text-white/55"><span className="h-1.5 w-1.5 rounded-full" style={{ background: social.color }} />{social.status}</span>}
          </div>

          <div className="relative flex flex-col items-center gap-4" style={{ transform: 'translateZ(30px)' }}>
            <span className="grid h-20 w-20 place-items-center rounded-[22px] border border-white/10 bg-[#191b1d]" style={{ color: social.color }}>
              <Icon className="h-9 w-9 pointer-events-none" />
            </span>
            <span className="ui-label text-white/35">Door {String((index % 5) + 1).padStart(2, '0')}</span>
          </div>

          <div className="relative flex items-end justify-between" style={{ transform: 'translateZ(42px)' }}>
            <span className="flex flex-col gap-1">
              <span className="text-lg font-semibold tracking-tight text-white">{social.handle}</span>
              <span className="ui-label text-white/45">Open door</span>
            </span>
            <span aria-hidden="true" className="translate-x-1 text-xl text-white/40 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[#d8ff6a]">↗</span>
          </div>

          {social.meta && (
            <div ref={drawerRef} className="pointer-events-none absolute inset-x-4 bottom-4 rounded-[12px] border border-white/12 bg-[#191b1d]/95 p-3 text-left opacity-0" style={{ transform: 'translateY(10px)' }}>
              <span className="ui-label block text-white/35">A little peek</span>
              <span className="mt-1 block text-xs font-medium text-white/80">{social.meta}</span>
            </div>
          )}
        </div>
      </a>
    </div>
  )
}
