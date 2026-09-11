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
          className="card-float relative flex h-full w-full flex-col justify-between overflow-hidden border border-white/10 p-6 transition-[border-color,box-shadow,transform] duration-500 ease-out group-hover:-translate-y-2"
          style={{
            background: `radial-gradient(circle at 16% 8%, ${social.color}75, transparent 34%), linear-gradient(145deg, rgba(27,29,42,0.95), rgba(10,11,17,0.96))`,
            borderColor: `${social.color}60`,
            boxShadow: `0 22px 55px ${social.color}18, inset 0 1px rgba(255,255,255,0.08)`,
            animationDelay: `${(index % 6) * 0.42}s`,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'linear-gradient(to bottom, black, transparent 70%)' }} />
          <div className="relative flex items-center justify-between" style={{ transform: 'translateZ(42px)' }}>
            <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-white/75">{social.name}</span>
            {social.status && <span className="flex items-center gap-1.5 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-white/55"><span className="h-1.5 w-1.5 rounded-full" style={{ background: social.color, boxShadow: `0 0 10px ${social.color}` }} />{social.status}</span>}
          </div>

          <div className="relative flex flex-col items-center gap-4" style={{ transform: 'translateZ(30px)' }}>
            <span className="grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-black/15" style={{ color: social.color, boxShadow: `0 0 30px ${social.color}25` }}>
              <Icon className="h-9 w-9 pointer-events-none" />
            </span>
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/35">Channel {String((index % 5) + 1).padStart(2, '0')}</span>
          </div>

          <div className="relative flex items-end justify-between" style={{ transform: 'translateZ(42px)' }}>
            <span className="flex flex-col gap-1">
              <span className="text-lg font-semibold tracking-tight text-white">{social.handle}</span>
              <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-white/45">Open signal</span>
            </span>
            <span aria-hidden="true" className="translate-x-1 text-xl text-white/40 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[#d8ff6a]">↗</span>
          </div>

          {social.meta && (
            <div ref={drawerRef} className="pointer-events-none absolute inset-x-4 bottom-4 border border-white/12 bg-[#0b0c12]/85 p-3 text-left opacity-0 backdrop-blur-xl" style={{ transform: 'translateY(10px)' }}>
              <span className="block font-mono text-[0.5rem] uppercase tracking-[0.16em] text-white/35">Live readout</span>
              <span className="mt-1 block text-xs font-medium text-white/80">{social.meta}</span>
            </div>
          )}
        </div>
      </a>
    </div>
  )
}
