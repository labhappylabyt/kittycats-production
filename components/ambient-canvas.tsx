'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  phase: number
}

const GLOW_COLORS = ['#725cff', '#d8ff6a', '#4ee0c4']

export function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let width = 0
    let height = 0
    let particles: Particle[] = []
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      pointer.x = pointer.targetX = width * 0.52
      pointer.y = pointer.targetY = height * 0.34

      const count = Math.min(72, Math.max(28, Math.floor((width * height) / 22000)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.12,
        radius: Math.random() * 1.6 + 0.35,
        alpha: Math.random() * 0.42 + 0.08,
        phase: Math.random() * Math.PI * 2,
      }))
    }

    const onMove = (event: MouseEvent) => {
      pointer.targetX = event.clientX
      pointer.targetY = event.clientY
      if (reduced) render(0)
    }

    const drawGlow = (x: number, y: number, radius: number, color: string, alpha: number) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`)
      gradient.addColorStop(0.48, `${color}${Math.round(alpha * 0.22 * 255).toString(16).padStart(2, '0')}`)
      gradient.addColorStop(1, `${color}00`)
      context.fillStyle = gradient
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }

    const render = (time: number) => {
      context.clearRect(0, 0, width, height)
      pointer.x += (pointer.targetX - pointer.x) * 0.045
      pointer.y += (pointer.targetY - pointer.y) * 0.045

      context.globalCompositeOperation = 'screen'
      drawGlow(width * 0.11 + Math.sin(time * 0.00015) * 55, height * 0.16, Math.max(width, height) * 0.36, GLOW_COLORS[0], 0.12)
      drawGlow(width * 0.83, height * 0.68 + Math.cos(time * 0.00012) * 38, Math.max(width, height) * 0.32, GLOW_COLORS[2], 0.08)
      drawGlow(pointer.x, pointer.y, Math.max(width, height) * 0.2, GLOW_COLORS[1], 0.105)

      particles.forEach((particle) => {
        if (!reduced) {
          particle.x += particle.vx
          particle.y += particle.vy
        }
        if (particle.x < -8) particle.x = width + 8
        if (particle.x > width + 8) particle.x = -8
        if (particle.y < -8) particle.y = height + 8
        if (particle.y > height + 8) particle.y = -8

        const light = 0.55 + Math.sin(time * 0.001 + particle.phase) * 0.35
        context.globalAlpha = particle.alpha * light
        context.fillStyle = '#f4f1ff'
        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      })

      context.globalAlpha = 1
      context.globalCompositeOperation = 'source-over'
      if (!reduced) frame = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove, { passive: true })
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-90" aria-hidden="true" />
}
