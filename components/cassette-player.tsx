'use client'

import { usePlayer } from '@/hooks/usePlayer'
import { playClick, playPop, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

function blip(sound: () => void) {
  if (isMuted()) return
  resumeAudio()
  sound()
}

/**
 * The deck's cassette is a second face on the same transport as the full
 * player — same AudioContext, same track, same play state. It used to own a
 * context of its own, which meant two melodies playing over each other.
 */
export function CassettePlayer() {
  const player = usePlayer()

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-2xl border-4 p-6"
      style={{
        background: 'var(--pastel-pink)',
        color: 'var(--ink)',
        borderColor: 'var(--ink)',
        boxShadow: '6px 6px 0 0 var(--shadow)',
      }}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-[13px] font-semibold uppercase tracking-[0.15em]">Fav Song</span>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Cassette</span>
      </div>

      {/* Cassette body */}
      <div
        className="relative my-2 flex w-full flex-col items-center rounded-xl border-2 p-4"
        style={{ borderColor: 'var(--ink)', background: 'rgba(255,255,255,0.3)' }}
      >
        <div className="flex w-full items-center justify-between px-6">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full border-4 ${player.playing ? 'reel-spin' : ''}`}
            style={{ borderColor: 'var(--ink)' }}
          >
            <div className="h-5 w-5 rounded-full border-2" style={{ borderColor: 'var(--ink)' }} />
            <div className="absolute h-0.5 w-10" style={{ background: 'var(--ink)' }} />
          </div>
          <div className="mx-2 h-1 flex-1 rounded-full" style={{ background: 'var(--ink)' }} />
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full border-4 ${player.playing ? 'reel-spin' : ''}`}
            style={{ borderColor: 'var(--ink)' }}
          >
            <div className="h-5 w-5 rounded-full border-2" style={{ borderColor: 'var(--ink)' }} />
            <div className="absolute h-0.5 w-10" style={{ background: 'var(--ink)' }} />
          </div>
        </div>

        <div className="mt-3 text-center">
          <div className="text-sm font-bold leading-tight">{player.track.title}</div>
          <div className="text-xs font-medium opacity-70">by {player.track.artist}</div>
        </div>

        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: 'rgba(0,0,0,0.15)' }}
        >
          <div
            className="h-full rounded-full transition-[width] duration-75"
            style={{ width: `${player.progress * 100}%`, background: 'var(--ink)' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex w-full items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => {
            blip(playClick)
            player.prev()
          }}
          aria-label="Previous track"
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          style={{ borderColor: 'var(--ink)', background: 'rgba(255,255,255,0.3)' }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            blip(playPop)
            player.toggle()
          }}
          aria-label={player.playing ? 'Pause' : 'Play'}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          style={{ borderColor: 'var(--ink)', background: 'rgba(255,255,255,0.4)' }}
        >
          {player.playing ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            blip(playClick)
            player.next()
          }}
          aria-label="Next track"
          className="flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          style={{ borderColor: 'var(--ink)', background: 'rgba(255,255,255,0.3)' }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2V6z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
