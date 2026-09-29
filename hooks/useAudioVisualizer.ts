'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'
import { getAnalyser } from '@/components/audio-engine'

const BAR_COLORS = [
  'var(--pastel-pink)',
  'var(--pastel-lavender)',
  'var(--pastel-mint)',
  'var(--pastel-peach)',
]

/**
 * Draws the live spectrum from the engine's AnalyserNode onto a canvas.
 *
 * When nothing is playing it falls back to a slow idle wave rather than an
 * empty box — a flat panel reads as broken, and the visualizer is the one
 * element on the page whose whole job is to look alive.
 */
export function useAudioVisualizer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  active: boolean,
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const g = canvas.getContext('2d')
    if (!g) return

    const analyser = getAnalyser()
    const bins = analyser ? analyser.frequencyBinCount : 0
    const data = bins ? new Uint8Array(bins) : null

    // Cached so the draw loop never forces a layout read.
    let w = 0
    let h = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    let raf = 0
    let phase = 0

    const draw = () => {
      // Read the live flag each frame so the hook never needs to re-subscribe.
      const live = active && analyser && data
      g.clearRect(0, 0, w, h)

      if (live) {
        analyser.getByteFrequencyData(data)
        // ponytail: linear bins; switch to log spacing if the bass looks cramped
        const barW = w / data.length
        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 255
          const bh = Math.max(2, v * h)
          g.fillStyle = BAR_COLORS[i % BAR_COLORS.length]
          g.fillRect(i * barW, h - bh, Math.max(1, barW - 1.5), bh)
        }
      } else {
        phase += 0.035
        const barW = 5
        const count = Math.max(1, Math.floor(w / barW))
        g.fillStyle = 'rgba(139, 127, 184, 0.45)'
        for (let i = 0; i < count; i++) {
          const v = (Math.sin(phase + i * 0.32) + 1) / 2
          const bh = 2 + v * h * 0.2
          g.fillRect(i * barW, h - bh, barW - 2, bh)
        }
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [canvasRef, active])
}
