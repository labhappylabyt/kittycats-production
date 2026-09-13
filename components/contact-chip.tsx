'use client'

import { useEffect, useRef, useState } from 'react'
import { playClick, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

export function ContactChip({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const copy = async () => {
    if (!isMuted()) { resumeAudio(); playClick() }
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = email
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      } catch { /* clipboard unavailable */ }
    }
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="relative">
      <button type="button" onClick={copy} className="group inline-flex items-center gap-3 rounded-[14px] border border-white/15 bg-[#1b1929] px-4 py-3 text-sm text-white shadow-[4px_4px_0_rgba(0,0,0,.2)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ffd166]/60 hover:bg-[#ffd166] hover:text-[#1b1929] active:translate-y-0 active:shadow-[2px_2px_0_rgba(0,0,0,.2)]" aria-label={`Copy email ${email}`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M2 5.5A2.5 2.5 0 0 1 4.5 3h15A2.5 2.5 0 0 1 22 5.5v.4l-10 5.6L2 5.9v-.4Zm0 2.6 10 5.6 10-5.6V18.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5V8.1Z" /></svg>
        <span className="text-[0.7rem] tracking-wide">{email}</span>
        <span aria-hidden="true" className="ui-label opacity-45 transition-opacity group-hover:opacity-70">{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <div className={`pointer-events-none absolute -top-9 right-0 whitespace-nowrap rounded-[8px] border border-[#ffd166]/30 bg-[#1b1929] px-3 py-1.5 ui-label text-[#ffd166] shadow-[3px_3px_0_rgba(0,0,0,.18)] transition-all duration-200 ${copied ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}>Copied</div>
    </div>
  )
}
