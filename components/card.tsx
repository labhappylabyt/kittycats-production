'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import type { Social } from './socials'
import { playPop, playTick, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

const CARD_W = 256
const CARD_H = 360

export function Card({ social, index }: { social: Social; index: number }) {
  const cardRef = useRef<HTMLAnchorElement | null>(null)
  const innerRef = useRef<HTMLSpanElement | null>(null)
  const drawerRef = useRef<HTMLDivElement | null>(null)

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
    gsap.to(inner, {
      rotateX: rotX,
      rotateY: rotY,
      z: 8,
      duration: 0.15,
      ease: 'power2.out',
      transformPerspective: 1000,
    })
  }

  const onLeave = () => {
    const inner = innerRef.current
    if (inner) {
      gsap.to(inner, {
        rotateX: 0,
        rotateY: 0,
        z: 0,
        duration: 0.4,
        ease: 'power3.out',
      })
    }
    if (drawerRef.current) {
      gsap.to(drawerRef.current, {
        opacity: 0,
        y: 8,
        duration: 0.2,
        ease: 'power2.out',
      })
    }
  }

  const onEnter = () => {
    if (!isMuted()) {
      resumeAudio()
      playTick()
    }
    if (drawerRef.current) {
      gsap.to(drawerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  const onClick = () => {
    if (!isMuted()) {
      resumeAudio()
      playPop()
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
        onMouseEnter={onEnter}
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
            {social.status && (
              <span
                className="flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ borderColor: social.ink }}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    social.status === 'Online' || social.status === 'Active'
                      ? 'bg-green-500'
                      : social.status === 'Playing'
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                  }`}
                />
                {social.status}
              </span>
            )}
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

          {/* Hover preview drawer */}
          {social.meta && (
            <div
              ref={drawerRef}
              className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl border-2 bg-white/80 p-2.5 text-left opacity-0"
              style={{
                borderColor: social.ink,
                transform: 'translateY(8px)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <span className="block text-[11px] font-bold uppercase tracking-wider opacity-60">
                Preview
              </span>
              <span className="block text-xs font-semibold leading-snug">
                {social.meta}
              </span>
            </div>
          )}
        </span>
      </a>
    </div>
  )
}
