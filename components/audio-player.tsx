'use client'

import { useEffect, useRef, useState } from 'react'

// A royalty-free lo-fi ambient pad generated with the Web Audio API,
// used as a silent fallback when /music/bg-pixel.mp3 is unavailable.
function startSynthPad(ctx: AudioContext) {
  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 700
  filter.connect(master)

  const notes = [196, 261.63, 329.63] // G3, C4, E4 — a soft C major pad
  const oscs = notes.map((freq, i) => {
    const osc = ctx.createOscillator()
    osc.type = i === 0 ? 'sine' : 'triangle'
    osc.frequency.value = freq
    const g = ctx.createGain()
    g.gain.value = 0.18
    osc.connect(g)
    g.connect(filter)
    osc.start()
    return osc
  })

  // gentle tremolo
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.12
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 0.05
  lfo.connect(lfoGain)
  lfoGain.connect(master.gain)
  lfo.start()

  return {
    master,
    stop: () => {
      oscs.forEach((o) => {
        try {
          o.stop()
        } catch {
          /* noop */
        }
      })
      try {
        lfo.stop()
      } catch {
        /* noop */
      }
    },
  }
}

export function AudioPlayer() {
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const synthRef = useRef<{ master: GainNode; stop: () => void } | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const useSynthRef = useRef(false)

  useEffect(() => {
    const audio = new Audio('/music/bg-pixel.mp3')
    audio.loop = true
    audio.volume = 0.5
    audio.preload = 'auto'
    audioRef.current = audio

    audio
      .addEventListener('canplaythrough', () => setReady(true), { once: true })

    audio.addEventListener('error', () => {
      // file unavailable — fall back to the synthesized pad
      useSynthRef.current = true
      setReady(true)
    })

    // If after a short window the file hasn't loaded, assume it's missing.
    const t = setTimeout(() => {
      if (!ready && !useSynthRef.current) {
        useSynthRef.current = true
        setReady(true)
      }
    }, 1500)

    return () => {
      clearTimeout(t)
      audio.pause()
      audio.src = ''
      synthRef.current?.stop()
      ctxRef.current?.close().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = async () => {
    if (useSynthRef.current) {
      if (!ctxRef.current) {
        try {
          ctxRef.current = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext)()
          synthRef.current = startSynthPad(ctxRef.current)
        } catch {
          return
        }
      }
      const ctx = ctxRef.current
      if (!ctx || !synthRef.current) return
      if (playing) {
        synthRef.current.master.gain.cancelScheduledValues(ctx.currentTime)
        synthRef.current.master.gain.linearRampToValueAtTime(
          0,
          ctx.currentTime + 0.4,
        )
        setPlaying(false)
      } else {
        if (ctx.state === 'suspended') {
          try {
            await ctx.resume()
          } catch {
            /* noop */
          }
        }
        synthRef.current.master.gain.cancelScheduledValues(ctx.currentTime)
        synthRef.current.master.gain.linearRampToValueAtTime(
          0.5,
          ctx.currentTime + 0.4,
        )
        setPlaying(true)
      }
      return
    }

    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      try {
        await audio.play()
        setPlaying(true)
      } catch {
        // autoplay blocked or play failed — switch to synth fallback
        useSynthRef.current = true
        try {
          ctxRef.current = new (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext)()
          synthRef.current = startSynthPad(ctxRef.current)
          if (ctxRef.current.state === 'suspended') {
            await ctxRef.current.resume()
          }
          synthRef.current.master.gain.linearRampToValueAtTime(
            0.5,
            ctxRef.current.currentTime + 0.4,
          )
          setPlaying(true)
        } catch {
          /* noop */
        }
      }
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready}
      aria-label={playing ? 'Pause music' : 'Play music'}
      className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-2xl border-4 bg-card text-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 disabled:opacity-40"
      style={{ borderColor: 'var(--ink)' }}
    >
      {playing ? (
        <span className="flex items-end gap-[3px]">
          <span className="h-3 w-[3px] animate-[eq_0.7s_ease-in-out_infinite] rounded-full bg-foreground" />
          <span className="h-4 w-[3px] animate-[eq_0.7s_ease-in-out_infinite_0.2s] rounded-full bg-foreground" />
          <span className="h-2.5 w-[3px] animate-[eq_0.7s_ease-in-out_infinite_0.4s] rounded-full bg-foreground" />
        </span>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      )}
    </button>
  )
}
