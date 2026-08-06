'use client'

import { useEffect, useRef, useState } from 'react'
import { playClick } from './sfx'

export function ContactChip({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const copy = async () => {
    playClick()
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      // fallback for older browsers
      try {
        const ta = document.createElement('textarea')
        ta.value = email
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      } catch {
        /* noop */
      }
    }
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={copy}
        className="group inline-flex items-center gap-2 rounded-2xl border-4 bg-card px-4 py-2 text-sm font-bold text-foreground shadow-[4px_4px_0_0_var(--ink)] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
        style={{ borderColor: 'var(--ink)' }}
        aria-label={`Copy email ${email}`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M2 5.5A2.5 2.5 0 0 1 4.5 3h15A2.5 2.5 0 0 1 22 5.5v.4l-10 5.6L2 5.9v-.4Zm0 2.6 10 5.6 10-5.6V18.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5V8.1Z" />
        </svg>
        <span>{email}</span>
        <span
          aria-hidden="true"
          className="ml-1 text-xs opacity-60 transition-opacity group-hover:opacity-100"
        >
          {copied ? 'Copied! 🐾' : 'click to copy'}
        </span>
      </button>
      {/* tooltip */}
      <div
        className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 bg-card px-2 py-1 text-xs font-bold shadow-[2px_2px_0_0_var(--ink)] transition-all duration-200 ${
          copied ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
        }`}
        style={{ borderColor: 'var(--ink)' }}
      >
        Copied! 🐾
      </div>
    </div>
  )
}
