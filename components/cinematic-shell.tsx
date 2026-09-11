'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { AmbientCanvas } from './ambient-canvas'
import { PawCursor } from './paw-cursor'
import { SmoothScroll } from './smooth-scroll'

function KineticLoader() {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const duration = reducedMotion ? 420 : 1550
    const startedAt = performance.now()
    let frame = 0
    let exitTimer = 0

    const update = (now: number) => {
      const elapsed = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      setProgress(Math.min(100, Math.round(eased * 100)))

      if (elapsed < 1) {
        frame = requestAnimationFrame(update)
      } else {
        exitTimer = window.setTimeout(() => setVisible(false), reducedMotion ? 80 : 380)
      }
    }

    frame = requestAnimationFrame(update)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(exitTimer)
    }
  }, [reducedMotion])

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          className="cinematic-loader fixed inset-0 z-[10000] flex min-h-screen items-center justify-center overflow-hidden bg-[#08090e] px-6 text-[#f5f2ff]"
          initial={{ opacity: 1 }}
          exit={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.18 : 0.9, ease: [0.76, 0, 0.24, 1] }}
          aria-label="Loading kittycats.cc"
          role="status"
        >
          <div className="loader-orb loader-orb-one" aria-hidden="true" />
          <div className="loader-orb loader-orb-two" aria-hidden="true" />
          <motion.div
            className="relative z-10 flex w-full max-w-3xl flex-col gap-7"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.24em] text-white/50">
              <span>Kittycats.cc</span>
              <span>Est. 2026</span>
            </div>
            <div className="overflow-hidden">
              <div className="font-display text-[clamp(4.5rem,17vw,11rem)] leading-[0.68] tracking-[-0.09em] text-white">
                K C
              </div>
            </div>
            <div className="flex items-end gap-5">
              <span className="font-mono text-4xl tabular-nums tracking-[-0.08em] text-[#d8ff6a] sm:text-5xl">
                {String(progress).padStart(3, '0')}
              </span>
              <div className="mb-2 h-px flex-1 overflow-hidden bg-white/15">
                <motion.div
                  className="h-full bg-[#d8ff6a]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                />
              </div>
              <span className="mb-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/50">Loading</span>
            </div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

export function CinematicShell({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <AmbientCanvas />
      <PawCursor />
      <KineticLoader />
      {children}
    </SmoothScroll>
  )
}
