'use client'

import { useEffect, useRef, useState } from 'react'
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer'
import { usePlayer } from '@/hooks/usePlayer'
import { playClick, playPop, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

function blip(sound: () => void) {
  if (isMuted()) return
  resumeAudio()
  sound()
}

export function AudioPlayer() {
  const player = usePlayer()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLSpanElement | null>(null)
  const [overflows, setOverflows] = useState(false)

  useAudioVisualizer(canvasRef, player.playing)

  // The marquee only earns its animation when the title actually overflows —
  // sliding a title that already fits reads as a bug.
  const title = player.track.title
  useEffect(() => {
    const box = boxRef.current
    const text = textRef.current
    if (!box || !text) return
    const check = () => setOverflows(text.scrollWidth > box.clientWidth)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(box)
    return () => observer.disconnect()
  }, [title])

  return (
    <div className="w-full max-w-2xl">
      <div
        className="relative overflow-hidden rounded-3xl border-4 p-6 sm:p-7"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--edge)',
          boxShadow: '6px 6px 0 0 var(--shadow)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="shrink-0 rounded-full border-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ borderColor: 'var(--edge)', color: 'var(--muted-foreground)' }}
          >
            {player.playing ? 'Now playing' : 'Paused'}
          </span>

          <div ref={boxRef} className="relative min-w-0 flex-1 overflow-hidden" aria-live="polite">
            {/* Layout probe: measured, never shown. */}
            <span
              ref={textRef}
              aria-hidden="true"
              className="invisible absolute whitespace-nowrap font-pixel text-sm"
            >
              {title}
            </span>

            {overflows ? (
              <div className="flex w-max animate-[marquee_12s_linear_infinite]">
                <span className="pr-10 font-pixel text-sm text-foreground">{title}</span>
                <span aria-hidden="true" className="pr-10 font-pixel text-sm text-foreground">
                  {title}
                </span>
              </div>
            ) : (
              <span className="block truncate font-pixel text-sm text-foreground">{title}</span>
            )}
          </div>

          <span className="hidden shrink-0 text-[11px] font-semibold text-muted-foreground sm:block">
            {player.track.artist}
          </span>
        </div>

        <div
          className="relative mt-5 h-28 overflow-hidden rounded-2xl border-2 sm:h-32"
          style={{ borderColor: 'var(--edge)', background: 'var(--ground)' }}
        >
          <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
        </div>

        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(player.progress * 1000)}
          onChange={(e) => player.seek(Number(e.target.value) / 1000)}
          aria-label="Track position"
          aria-valuetext={`${Math.round(player.progress * 100)}%`}
          className="mt-5 block w-full"
          style={{ accentColor: 'var(--pastel-pink)' }}
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                blip(playClick)
                player.prev()
              }}
              aria-label="Previous track"
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 text-foreground transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
              style={{ borderColor: 'var(--edge)', background: 'var(--surface-2)' }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
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
              style={{
                background: 'var(--pastel-pink)',
                color: 'var(--ink)',
                borderColor: 'var(--ink)',
                boxShadow: '4px 4px 0 0 var(--shadow)',
              }}
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
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 text-foreground transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
              style={{ borderColor: 'var(--edge)', background: 'var(--surface-2)' }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2V6z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-muted-foreground"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4 9.7h3.29L12 4.5v15l-4.71-5.2H4a1 1 0 0 1-1-1v-2.6a1 1 0 0 1 1-1Z" />
              <path d="M16 8.09a1 1 0 1 0-1.41 1.42A5 5 0 0 1 16 12a5 5 0 0 0 1.41 2.91 1 1 0 0 0 1.41-1.42A7 7 0 0 0 16 8.09Z" />
            </svg>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(player.volume * 100)}
              onChange={(e) => player.setVolume(Number(e.target.value) / 100)}
              aria-label="Volume"
              className="block w-28"
              style={{ accentColor: 'var(--pastel-lavender)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
