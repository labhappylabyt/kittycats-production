'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useCardTilt } from '@/hooks/useCardTilt'
import type { Social } from './socials'
import { playPop, playTick, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

const CARD_W = 256
const CARD_H = 360

export function Card({ social, index }: { social: Social; index: number }) {
  const drawerRef = useRef<HTMLDivElement | null>(null)

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

  const onLeave = () => {
    if (drawerRef.current) {
      gsap.to(drawerRef.current, {
        opacity: 0,
        y: 8,
        duration: 0.2,
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

  const { cardRef, faceRef, tilt } = useCardTilt<HTMLAnchorElement>({
    onEnter,
    onLeave,
  })

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
        {...tilt}
        onClick={onClick}
      >
        <span
          ref={faceRef}
          className="card-float relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border-4 p-6 transition-transform duration-200 ease-out group-hover:-translate-y-2"
          style={{
            background: social.color,
            color: social.ink,
            borderColor: social.ink,
            boxShadow: '6px 6px 0 0 var(--shadow)',
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
              className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl border-2 p-2.5 text-left opacity-0"
              style={{
                background: social.ink,
                color: social.color,
                borderColor: social.color,
                transform: 'translateY(8px)',
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
