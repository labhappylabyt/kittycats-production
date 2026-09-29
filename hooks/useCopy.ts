'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Clipboard write with a fallback for browsers that refuse the async API,
 * and a `copied` flag that resets itself. Reports success honestly — a
 * failed copy never flips the flag.
 */
export function useCopy(resetAfter = 1600) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const copy = useCallback(
    async (text: string) => {
      let ok = true
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        try {
          const ta = document.createElement('textarea')
          ta.value = text
          ta.style.position = 'fixed'
          ta.style.opacity = '0'
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
        } catch {
          ok = false
        }
      }
      if (!ok) return

      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), resetAfter)
    },
    [resetAfter],
  )

  return { copied, copy }
}
