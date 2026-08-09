'use client'

import { useEffect, useRef, useState } from 'react'
import { playClick, playMeow, resumeAudio } from './sfx'

let globalMuted = true
const listeners = new Set<(muted: boolean) => void>()

export function isMuted() {
  return globalMuted
}

export function setMuted(muted: boolean) {
  globalMuted = muted
  if (!muted) resumeAudio()
  listeners.forEach((fn) => fn(muted))
}

export function SoundToggle() {
  const [muted, setMutedState] = useState(globalMuted)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const listener = (m: boolean) => setMutedState(m)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const toggle = () => {
    const next = !muted
    setMuted(next)
    if (!next) {
      resumeAudio()
      playMeow()
    } else {
      playClick()
    }
    btnRef.current?.blur()
  }

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={toggle}
      aria-pressed={! muted}
      aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
      className="fixed top-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-2xl border-4 bg-card text-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
      style={{ borderColor: 'var(--ink)' }}
    >
      {muted ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M3.63 3.63a1 1 0 0 0-1.41 1.41L7.29 9.7H4a1 1 0 0 0-1 1v2.6a1 1 0 0 0 1 1h3.29L12 19.5v-6.21l4.18 4.18-1.59 1.59a1 1 0 0 0 1.41 1.41l1.59-1.59 3.18 3.18a1 1 0 0 0 1.41-1.41L3.63 3.63Z" />
          <path d="M19 12a7 7 0 0 0-2.06-4.95 1 1 0 1 0-1.41 1.42A5 5 0 0 1 17 12a5 5 0 0 1-.47 2.1l1.5 1.5A7 7 0 0 0 19 12Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M4 9.7h3.29L12 4.5v15l-4.71-5.2H4a1 1 0 0 1-1-1v-2.6a1 1 0 0 1 1-1Z" />
          <path d="M16 8.09a1 1 0 1 0-1.41 1.42A5 5 0 0 1 16 12a5 5 0 0 0 1.41 2.91 1 1 0 0 0 1.41-1.42A7 7 0 0 0 16 8.09Z" />
          <path d="M19 5.27a1 1 0 1 0-1.41 1.42A9 9 0 0 1 19 12a9 9 0 0 1-1.41 5.31 1 1 0 0 0 1.41 1.42A11 11 0 0 0 19 12a11 11 0 0 0 0-6.73Z" />
        </svg>
      )}
    </button>
  )
}
