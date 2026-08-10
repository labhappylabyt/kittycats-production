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
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (window.matchMedia('(pointer: coarse)').matches || reduced) return

    const container = containerRef.current
    const paw = pawRef.current
    if (!container || !paw) return

    let mx = -100
    let my = -100
    let px = -100
    let py = -100
    let initialized = false
    let raf = 0
    const sparkles: Sparkle[] = []
    let lastSpawn = 0
    let lastX = -100
    let lastY = -100
    let hoveringCard = false
    let isDown = false

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (!initialized) {
        px = mx
        py = my
        initialized = true
      }
      paw.style.opacity = '1'
      const now = performance.now()
      const dist = Math.hypot(mx - lastX, my - lastY)
      if (now - lastSpawn > 60 && dist > 6) {
        spawnSparkle(mx, my)
        lastSpawn = now
        lastX = mx
        lastY = my
      }
    }

    const onLeave = () => {
      paw.style.opacity = '0'
    }

    const onEnter = () => {
      paw.style.opacity = '1'
    }

    const spawnSparkle = (x: number, y: number) => {
      const el = document.createElement('div')
      el.className = 'paw-sparkle pointer-events-none'
      el.style.left = `${x + (Math.random() * 12 - 6)}px`
      el.style.top = `${y + (Math.random() * 12 - 6)}px`
      const colors = ['#ff9ecb', '#ffd166', '#bdecd0', '#c4d4ff', '#fff7c2']
      el.style.background = colors[Math.floor(Math.random() * colors.length)]
      el.style.setProperty('--rot', `${Math.random() * 360}deg`)
      container.appendChild(el)
      sparkles.push({ el, x, y, life: 1 })
    }

    const onDown = () => {
      isDown = true
      updateCursor()
    }
    const onUp = () => {
      isDown = false
      updateCursor()
    }

    const updateCursor = () => {
      if (isDown) {
        paw.style.transform = 'translate(-50%, -50%) scale(0.7)'
        paw.style.filter = 'drop-shadow(0 0 6px rgba(255, 158, 203, 0.8))'
      } else if (hoveringCard) {
        paw.style.transform = 'translate(-50%, -50%) scale(1.8)'
        paw.style.filter = 'drop-shadow(0 0 10px rgba(255, 158, 203, 0.9))'
      } else {
        paw.style.transform = 'translate(-50%, -50%) scale(1)'
        paw.style.filter = 'drop-shadow(0 0 4px rgba(255, 158, 203, 0.5))'
      }
    }

    // Detect hover on interactive elements (cards, buttons, links)
    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a, button, [role="button"]')) {
        hoveringCard = true
        updateCursor()
      }
    }
    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a, button, [role="button"]')) {
        hoveringCard = false
        updateCursor()
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown, { passive: true })
    window.addEventListener('mouseup', onUp, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mouseout', onOut, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave, { passive: true })
    document.documentElement.addEventListener('mouseenter', onEnter, { passive: true })

    const render = () => {
      if (initialized) {
        px += (mx - px) * 0.35
        py += (my - py) * 0.35
        paw.style.left = `${px}px`
        paw.style.top = `${py}px`
      }

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
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout', onOut)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      sparkles.forEach((s) => s.el.remove())
    }
  }, [])

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        ref={pawRef}
        className="paw-cursor"
        style={{ transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }}
        aria-hidden="true"
      />
    </div>
  )
}
