'use client'

import { useEffect, useRef, useState } from 'react'
import { playClick, playPop, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

type Track = {
  title: string
  artist: string
  /** Web Audio oscillator notes for the melody — [freq, duration] pairs */
  melody: Array<[number, number]>
}

const TRACKS: Track[] = [
  {
    title: 'Pixel Dreams',
    artist: 'kittycats',
    melody: [
      [523, 0.15], [659, 0.15], [784, 0.15], [1047, 0.2],
      [784, 0.15], [659, 0.15], [523, 0.2],
      [587, 0.15], [698, 0.15], [880, 0.15], [1175, 0.2],
      [880, 0.15], [698, 0.15], [587, 0.3],
    ],
  },
  {
    title: 'Lo-Fi Catnap',
    artist: 'kittycats',
    melody: [
      [330, 0.25], [392, 0.25], [440, 0.25], [523, 0.5],
      [440, 0.25], [392, 0.25], [330, 0.5],
      [349, 0.25], [415, 0.25], [466, 0.25], [554, 0.5],
      [466, 0.25], [415, 0.25], [349, 0.5],
    ],
  },
  {
    title: '8-Bit Adventure',
    artist: 'kittycats',
    melody: [
      [440, 0.1], [523, 0.1], [659, 0.1], [784, 0.1],
      [880, 0.1], [784, 0.1], [659, 0.1], [523, 0.1],
      [587, 0.1], [698, 0.1], [880, 0.1], [1047, 0.1],
      [1175, 0.15], [1047, 0.15], [880, 0.15], [698, 0.2],
    ],
  },
]

export function CassettePlayer() {
  const [trackIdx, setTrackIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const ctxRef = useRef<AudioContext | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stopFlagRef = useRef(false)
  const startTimeRef = useRef(0)
  const totalDurationRef = useRef(0)
  const progressRafRef = useRef(0)

  const track = TRACKS[trackIdx]

  useEffect(() => {
    return () => {
      stopFlagRef.current = true
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      cancelAnimationFrame(progressRafRef.current)
      ctxRef.current?.close().catch(() => {})
    }
  }, [])

  const ensureCtx = () => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)()
      } catch {
        return null
      }
    }
    return ctxRef.current
  }

  const playMelody = () => {
    const ctx = ensureCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    stopFlagRef.current = false
    startTimeRef.current = ctx.currentTime

    const melody = track.melody
    const total = melody.reduce((sum, [, d]) => sum + d, 0)
    totalDurationRef.current = total * 1000

    let elapsed = 0
    melody.forEach(([freq, dur]) => {
      const startAt = ctx.currentTime + elapsed
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, startAt)
      gain.gain.linearRampToValueAtTime(0.08, startAt + 0.01)
      gain.gain.linearRampToValueAtTime(0.06, startAt + dur * 0.7)
      gain.gain.linearRampToValueAtTime(0, startAt + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startAt)
      osc.stop(startAt + dur)
      elapsed += dur
    })

    // Loop
    timeoutRef.current = setTimeout(() => {
      if (!stopFlagRef.current) playMelody()
    }, total * 1000)
  }

  const stopMelody = () => {
    stopFlagRef.current = true
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const updateProgress = () => {
    if (!playing) return
    const elapsed = performance.now() - startTimeRef.current
    const total = totalDurationRef.current
    if (total > 0) {
      setProgress(((elapsed % total) / total) * 100)
    }
    progressRafRef.current = requestAnimationFrame(updateProgress)
  }

  const togglePlay = () => {
    if (!isMuted()) {
      resumeAudio()
      playPop()
    }
    if (playing) {
      stopMelody()
      setPlaying(false)
      cancelAnimationFrame(progressRafRef.current)
      setProgress(0)
    } else {
      setPlaying(true)
      playMelody()
      startTimeRef.current = performance.now()
      progressRafRef.current = requestAnimationFrame(updateProgress)
    }
  }

  const switchTrack = (dir: 1 | -1) => {
    if (!isMuted()) {
      resumeAudio()
      playClick()
    }
    stopMelody()
    cancelAnimationFrame(progressRafRef.current)
    setProgress(0)
    setTrackIdx((prev) => (prev + dir + TRACKS.length) % TRACKS.length)
    if (playing) {
      setTimeout(() => {
        playMelody()
        startTimeRef.current = performance.now()
        progressRafRef.current = requestAnimationFrame(updateProgress)
      }, 50)
    }
  }

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden border border-[#ef83c7]/40 p-6 shadow-[0_22px_55px_rgba(239,131,199,0.11)]"
      style={{
        background: 'radial-gradient(circle at 18% 8%, rgba(239,131,199,0.34), transparent 34%), linear-gradient(145deg, rgba(28,29,42,0.98), rgba(9,10,15,0.98))',
        color: '#f5f2ff',
      }}
    >
      <div className="flex w-full items-center justify-between">
        <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-white/75">
          Fav Song
        </span>
        <span className="font-mono text-[0.52rem] font-bold uppercase tracking-wider text-white/40">
          Cassette
        </span>
      </div>

      {/* Cassette body */}
      <div
        className="relative my-2 flex w-full flex-col items-center border border-white/12 bg-white/[0.04] p-4"
      >
        {/* Reels */}
        <div className="flex w-full items-center justify-between px-6">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#ef83c7]/70 ${playing ? 'reel-spin' : ''}`}
          >
            <div className="h-5 w-5 rounded-full border border-white/70" />
            <div className="absolute h-px w-10 rotate-0 bg-white/60" />
          </div>
          <div className="mx-2 h-px flex-1 bg-white/30" />
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#ef83c7]/70 ${playing ? 'reel-spin' : ''}`}
          >
            <div className="h-5 w-5 rounded-full border border-white/70" />
            <div className="absolute h-px w-10 bg-white/60" />
          </div>
        </div>

        {/* Track info */}
        <div className="mt-3 text-center">
          <div className="text-sm font-semibold leading-tight text-white">{track.title}</div>
          <div className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-white/45">by {track.artist}</div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-px w-full overflow-hidden bg-white/15">
          <div
            className="h-full bg-[#ef83c7] transition-[width] duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex w-full items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => switchTrack(-1)}
          aria-label="Previous track"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#ef83c7]/60 active:translate-y-0"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ef83c7]/70 bg-[#ef83c7] text-[#0b0c12] shadow-[0_0_25px_rgba(239,131,199,0.2)] transition-transform duration-150 hover:-translate-y-0.5 hover:scale-105 active:translate-y-0"
        >
          {playing ? (
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
          onClick={() => switchTrack(1)}
          aria-label="Next track"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#ef83c7]/60 active:translate-y-0"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2V6z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
