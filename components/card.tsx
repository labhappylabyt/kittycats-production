'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useCardTilt } from '@/hooks/useCardTilt'
import type { Social } from './socials'
import { playPop, playTick, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

export function Card({ social, index }: { social: Social; index: number }) {
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const { cardRef, faceRef, tilt } = useCardTilt<HTMLAnchorElement>({
    onEnter: () => { if (!isMuted()) { resumeAudio(); playTick() }; if (drawerRef.current) gsap.to(drawerRef.current, { opacity: 1, y: 0, duration: .25 }) },
    onLeave: () => { if (drawerRef.current) gsap.to(drawerRef.current, { opacity: 0, y: 8, duration: .2 }) },
  })
  const { Icon } = social
  return <div className="w-[min(78vw,300px)] shrink-0 snap-center sm:w-[300px]">
    <a ref={cardRef} href={social.href} target="_blank" rel="noopener noreferrer" draggable={false} aria-label={`${social.name} — ${social.handle}`} className="group block [perspective:1000px]" {...tilt} onClick={() => { if (!isMuted()) { resumeAudio(); playPop() } }}>
      <span ref={faceRef} className="card-glow relative flex h-[260px] flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-transform duration-300 group-hover:-translate-y-2" style={{ background:'rgba(255,255,255,.035)', color:'var(--foreground)', borderColor:'var(--edge)', ['--card-glow' as string]: `${social.color}55`, animationDelay:`${(index % 5) * .3}s`, transformStyle:'preserve-3d' }}>
        <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground"><span>{social.name}</span>{social.status && <span className="text-accent">● {social.status}</span>}</span>
        <Icon className="mx-auto h-12 w-12 opacity-80" style={{ color: social.color, transform:'translateZ(30px)' }} />
        <span className="flex items-end justify-between"><span><span className="block text-sm font-semibold">{social.handle}</span><span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Open link ↗</span></span><span className="text-xl text-primary opacity-0 transition-opacity group-hover:opacity-100">↗</span></span>
        {social.meta && <span ref={drawerRef} className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg border bg-[#12151d]/95 p-2 text-xs opacity-0" style={{ borderColor:'var(--edge)', transform:'translateY(8px)' }}>{social.meta}</span>}
      </span>
    </a>
  </div>
}
