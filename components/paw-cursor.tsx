'use client'

import { useEffect, useRef } from 'react'

type Sparkle = {
  el: HTMLDivElement
  x: number
  y: number
  life: number
}

export function PawCursor() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const pawRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return // skip on touch
    const container = containerRef.current
    const paw = pawRef.current
    if (!container || !paw) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let px = mx
    let py = my
    let raf = 0
    const sparkles: Sparkle[] = []
    let lastSpawn = 0
    let lastX = mx
    let lastY = my

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      const now = performance.now()
      const dist = Math.hypot(mx - lastX, my - lastY)
      if (now - lastSpawn > 60 && dist > 6) {
        spawnSparkle(mx, my)
        lastSpawn = now
        lastX = mx
        lastY = my
      }
    }

    const spawnSparkle = (x: number, y: number) => {
      const el = document.createElement('div')
      el.className = 'paw-sparkle'
      el.style.left = `${x + (Math.random() * 12 - 6)}px`
      el.style.top = `${y + (Math.random() * 12 - 6)}px`
      const colors = ['#ff9ecb', '#ffd166', '#bdecd0', '#c4d4ff', '#fff7c2']
      el.style.background = colors[Math.floor(Math.random() * colors.length)]
      el.style.setProperty('--rot', `${Math.random() * 360}deg`)
      container.appendChild(el)
      sparkles.push({ el, x, y, life: 1 })
    }

    const onDown = () => {
      paw.style.transform = 'translate(-50%, -50%) scale(0.82)'
    }
    const onUp = () => {
      paw.style.transform = 'translate(-50%, -50%) scale(1)'
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)

    const render = () => {
      // ease paw toward cursor
      px += (mx - px) * 0.22
      py += (my - py) * 0.22
      paw.style.left = `${px}px`
      paw.style.top = `${py}px`

      // fade sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i]
        s.life -= 0.04
        if (s.life <= 0) {
          s.el.remove()
          sparkles.splice(i, 1)
        } else {
          s.el.style.opacity = String(s.life)
          s.el.style.transform = `translate(-50%,-50%) rotate(var(--rot)) scale(${s.life})`
        }
      }
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      sparkles.forEach((s) => s.el.remove())
    }
  }, [])

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        ref={pawRef}
        className="paw-cursor"
        style={{ transform: 'translate(-50%, -50%) scale(1)' }}
        aria-hidden="true"
      />
    </div>
  )
}
