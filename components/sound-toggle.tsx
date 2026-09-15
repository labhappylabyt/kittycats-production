'use client'

import { useEffect, useRef, useState } from 'react'
import { playClick, playMeow, resumeAudio } from './sfx'

const MUTE_KEY = 'kittycraft_mute_v1'
let globalMuted = true
let hydrated = false
const listeners = new Set<(muted: boolean) => void>()

export function isMuted() { return globalMuted }

export function setMuted(muted: boolean) {
  globalMuted = muted
  try { localStorage.setItem(MUTE_KEY, '1') } catch { /* storage unavailable */ }
  if (!muted) resumeAudio()
  listeners.forEach((listener) => listener(muted))
}

export function SoundToggle({ inline = false }: { inline?: boolean }) {
  const [muted, setMutedState] = useState(globalMuted)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!hydrated && typeof window !== 'undefined') {
      hydrated = true
      try { globalMuted = localStorage.getItem(MUTE_KEY) === '1' } catch { /* storage unavailable */ }
    }
    const listener = (value: boolean) => setMutedState(value)
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])

  const toggle = () => {
    const next = !muted
    globalMuted = next
    try { localStorage.setItem(MUTE_KEY, next ? '1' : '0') } catch { /* storage unavailable */ }
    setMutedState(next)
    if (!next) { resumeAudio(); playMeow() } else { playClick() }
    buttonRef.current?.blur()
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}      className={`group flex h-11 items-center gap-2 overflow-hidden rounded-[12px] border border-white/15 bg-[#1b1929] px-3 text-white/85 shadow-[4px_4px_0_rgba(0,0,0,.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ffd166]/60 hover:text-[#ffd166] ${inline ? '' : 'fixed right-4 top-20 z-50 sm:right-7 sm:top-20'}`}>
      <span className={`h-1.5 w-1.5 rounded-full transition-colors ${muted ? 'bg-white/60' : 'bg-[#ffd166]'}`} />
      <span aria-hidden="true" className="text-[0.95rem] leading-none">{'\u266A'}</span>
      <span className="ui-label">{muted ? 'Sound off' : 'Sound on'}</span>
    </button>
  )
}
