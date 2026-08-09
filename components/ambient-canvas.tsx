'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  alphaSpeed: number
}

const COLORS = [
  '#ffc4e1',
  '#bdecd0',
  '#c4d4ff',
  '#ffd7b0',
  '#d7c9ff',
  '#fff7c2',
]

export function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let particles: Particle[] = []
    let glows: Array<{ x: number; y: number; r: number; color: string; phase: number }> = []
    let w = 0
    let h = 0
    let dpr = 1

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(Math.floor((w * h) / 18000), 60)
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.1 - Math.random() * 0.2,
        size: 2 + Math.floor(Math.random() * 3),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.15 + Math.random() * 0.25,
        alphaSpeed: 0.002 + Math.random() * 0.004,
      }))

      glows = [
        { x: w * 0.2, y: h * 0.3, r: 200, color: '#ffc4e1', phase: 0 },
        { x: w * 0.8, y: h * 0.7, r: 250, color: '#c4d4ff', phase: Math.PI },
        { x: w * 0.5, y: h * 0.5, r: 180, color: '#bdecd0', phase: Math.PI / 2 },
      ]
    }

    resize()
    window.addEventListener('resize', resize)

    let time = 0
    const render = () => {
      ctx.clearRect(0, 0, w, h)

      time += reduced ? 0 : 0.016

      glows.forEach((g) => {
        const pulse = reduced ? 0.3 : 0.25 + Math.sin(time * 0.5 + g.phase) * 0.1
        const grad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r)
        const hex = g.color
        grad.addColorStop(0, `${hex}${Math.round(pulse * 255).toString(16).padStart(2, '0')}`)
        grad.addColorStop(1, `${hex}00`)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      })

      particles.forEach((p) => {
        if (!reduced) {
          p.x += p.vx
          p.y += p.vy
          p.alpha += Math.sin(time * p.alphaSpeed * 60) * 0.003
        }

        if (p.y < -10) {
          p.y = h + 10
          p.x = Math.random() * w
        }
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10

        const a = Math.max(0.05, Math.min(0.4, p.alpha))
        ctx.globalAlpha = a
        ctx.fillStyle = p.color
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
      })

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  )
}
