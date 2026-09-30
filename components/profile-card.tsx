'use client'

import { useState } from 'react'
import type { PresenceStatus } from '@/config/site'
import { github, profile } from '@/config/site'
import { useCardTilt } from '@/hooks/useCardTilt'
import { useCopy } from '@/hooks/useCopy'
import { usePresence } from '@/hooks/usePresence'
import { playClick, playTick, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

const STATUS: Record<PresenceStatus, { label: string; dot: string }> = {
  online: { label: 'Online', dot: '#8ef0a8' },
  idle: { label: 'Idle', dot: '#ffd166' },
  dnd: { label: 'Do not disturb', dot: '#ff9a9a' },
  offline: { label: 'Offline', dot: '#8b7fb8' },
}

export function ProfileCard({ status: override }: { status?: PresenceStatus } = {}) {
  const { copied, copy } = useCopy()
  const presence = usePresence()
  const [avatarBroken, setAvatarBroken] = useState(false)
  // `status` stays overridable so the card can be rendered in isolation;
  // live presence is the default.
  const status = override ?? presence.status
  const avatarSrc = presence.avatarUrl ?? profile.avatar
  const { cardRef, faceRef, tilt } = useCardTilt<HTMLDivElement>({
    max: 8,
    lift: 16,
    onEnter: () => {
      if (!isMuted()) {
        resumeAudio()
        playTick()
      }
    },
  })

  const state = STATUS[status]

  return (
    <div className="w-full max-w-lg [perspective:1000px]">
      <div ref={cardRef} {...tilt}>
        <div
          ref={faceRef}
          className="group relative overflow-hidden rounded-3xl border bg-white/[.035] p-7 text-left shadow-2xl shadow-black/20 sm:p-8"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--edge)',
            boxShadow: '0 18px 60px rgba(0,0,0,.22)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Cursor-tracked sheen. A plain radial gradient — no blur. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(circle at var(--sheen-x, 50%) var(--sheen-y, 0%), rgba(255,255,255,0.12), transparent 55%)',
            }}
          />

          <div
            className="relative flex items-center gap-5"
            style={{ transform: 'translateZ(36px)' }}
          >
            <div className="relative h-[84px] w-[84px] shrink-0">
              {/* Cat ears sit behind the halo, so the ring reads as a headband. */}
              <svg
                viewBox="0 0 84 28"
                className="absolute -top-[16px] left-0 h-7 w-[84px]"
                aria-hidden="true"
              >
                <path
                  d="M15 26 L21 3 L39 18 Z"
                  fill="var(--pastel-pink)"
                  stroke="var(--ink)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <path
                  d="M69 26 L63 3 L45 18 Z"
                  fill="var(--pastel-pink)"
                  stroke="var(--ink)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>

              <span
                aria-hidden="true"
                className="ring-spin absolute inset-0 rounded-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, var(--pastel-pink), var(--pastel-lavender), var(--pastel-mint), var(--pastel-peach), var(--pastel-pink))',
                }}
              />

              <span
                className="absolute inset-[4px] overflow-hidden rounded-full"
                style={{ background: 'var(--surface-2)' }}
              >
                {avatarBroken ? (
                  <span
                    className="flex h-full w-full items-center justify-center font-pixel text-2xl"
                    style={{ background: 'var(--pastel-lavender)', color: 'var(--ink)' }}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt=""
                    onError={() => setAvatarBroken(true)}
                    className="h-full w-full object-cover"
                  />
                )}
              </span>

              <span
                className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full border-[3px]"
                style={{ background: state.dot, borderColor: 'var(--surface)' }}
                role="img"
                aria-label={state.label}
              />
            </div>

            <div className="min-w-0">
              <h1 className="font-pixel text-xl leading-tight text-foreground sm:text-2xl">
                {profile.name}
              </h1>
              <p className="mt-1.5 text-[13px] font-semibold text-muted-foreground">
                {profile.handle} · {profile.location}
              </p>
            </div>
          </div>

          <p
            className="relative mt-6 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground"
            style={{ transform: 'translateZ(28px)' }}
          >
            {profile.bio}
          </p>

          {/* Live presence. Renders nothing when there is nothing to report —
              an empty "no activity" row is worse than no row. */}
          <div
            className="relative mt-5 flex items-center gap-3"
            style={{ transform: 'translateZ(24px)' }}
          >
            <span
              className="inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ borderColor: 'var(--edge)', color: 'var(--muted-foreground)' }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: state.dot }}
                aria-hidden="true"
              />
              {state.label}
            </span>

            {presence.spotify && (
              <div
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border-2 p-1.5 pr-3"
                style={{ borderColor: 'var(--edge)', background: 'var(--surface-2)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={presence.spotify.albumArt}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-bold text-foreground">
                    {presence.spotify.song}
                  </div>
                  <div className="truncate text-[11px] font-medium text-muted-foreground">
                    {presence.spotify.artist}
                  </div>
                  <div
                    className="mt-1 h-1 w-full overflow-hidden rounded-full"
                    style={{ background: 'var(--edge)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${presence.spotifyProgress * 100}%`,
                        background: 'var(--pastel-mint)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {!presence.spotify && presence.activity && (
              <div
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border-2 p-1.5 pr-3"
                style={{ borderColor: 'var(--edge)', background: 'var(--surface-2)' }}
              >
                {presence.activity.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={presence.activity.image}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <span
                    className="h-8 w-8 shrink-0 rounded-lg"
                    style={{ background: 'var(--pastel-lavender)' }}
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-bold text-foreground">
                    {presence.activity.name}
                  </div>
                  {(presence.activity.details ?? presence.activity.state) && (
                    <div className="truncate text-[11px] font-medium text-muted-foreground">
                      {presence.activity.details ?? presence.activity.state}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div
            className="relative mt-7 flex flex-wrap items-center gap-3"
            style={{ transform: 'translateZ(28px)' }}
          >
            <button
              type="button"
              onClick={() => {
                if (!isMuted()) {
                  resumeAudio()
                  playClick()
                }
                void copy(profile.email)
              }}
              aria-label={`Copy email address ${profile.email}`}
              className="inline-flex items-center gap-2.5 rounded-2xl border-4 px-4 py-2.5 text-sm font-bold transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
              style={{
                background: copied ? 'var(--pastel-mint)' : 'var(--pastel-peach)',
                color: 'var(--ink)',
                borderColor: 'var(--ink)',
                boxShadow: '4px 4px 0 0 var(--shadow)',
              }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M2 5.5A2.5 2.5 0 0 1 4.5 3h15A2.5 2.5 0 0 1 22 5.5v.4l-10 5.6L2 5.9v-.4Zm0 2.6 10 5.6 10-5.6V18.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5V8.1Z" />
              </svg>
              {profile.email}
              <span
                aria-live="polite"
                className="ml-0.5 text-xs font-bold uppercase tracking-wider opacity-70"
              >
                {copied ? 'Copied' : 'Copy'}
              </span>
            </button>

            <a
              href={github.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border-4 px-4 py-2.5 text-sm font-bold text-foreground transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5"
              style={{
                background: 'var(--surface-2)',
                borderColor: 'var(--edge)',
                boxShadow: '4px 4px 0 0 var(--shadow)',
              }}
            >
              GitHub
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
