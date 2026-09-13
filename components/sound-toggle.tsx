'use client'

import { useEffect, useRef, useState } from 'react'
import { playClick, playMeow, resumeAudio } from './sfx'

let globalMuted = true
const listeners = new Set<(muted: boolean) => void>()

export function isMuted() { return globalMuted }

export function setMuted(muted: boolean) {
  globalMuted = muted
  if (!muted) resumeAudio()
  listeners.forEach((listener) => listener(muted))
}

export function SoundToggle() {
  const [muted, setMutedState] = useState(globalMuted)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const listener = (value: boolean) => setMutedState(value)
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])

  const toggle = () => {
    const next = !muted
    setMuted(next)
    if (!next) { resumeAudio(); playMeow() } else { playClick() }
    buttonRef.current?.blur()
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
      className="group fixed right-4 top-20 z-50 flex h-11 items-center gap-2 overflow-hidden rounded-[12px] border border-white/15 bg-[#1b1929] px-3 text-white/70 shadow-[4px_4px_0_rgba(0,0,0,.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ffd166]/60 hover:text-[#ffd166] sm:right-7 sm:top-20"
    >
      <span className={`h-1.5 w-1.5 rounded-full transition-colors ${muted ? 'bg-white/25' : 'bg-[#ffd166]'}`} />
      {muted ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M4 9.7h3.29L12 4.5v15l-4.71-5.2H4a1 1 0 0 1-1-1v-2.6a1 1 0 0 1 1-1Zm13.2 2.3 2.5-2.5 1.4 1.4-2.5 2.5 2.5 2.5-1.4 1.4-2.5-2.5-2.5 2.5-1.4-1.4 2.5-2.5-2.5-2.5 1.4-1.4 2.5 2.5Z" /></svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M4 9.7h3.29L12 4.5v15l-4.71-5.2H4a1 1 0 0 1-1-1v-2.6a1 1 0 0 1 1-1Z" /><path d="M15.5 8.5a1 1 0 0 1 1.4 0 5 5 0 0 1 0 7 1 1 0 1 1-1.4-1.4 3 3 0 0 0 0-4.2 1 1 0 0 1 0-1.4Z" /></svg>
      )}
      <span className="ui-label">{muted ? 'Sound off' : 'Sound on'}</span>
    </button>
  )
}
