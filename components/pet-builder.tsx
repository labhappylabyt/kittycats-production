'use client'

import { useCallback, useRef, useState } from 'react'
import {
  FUR_COLORS,
  PixelPet,
  type Accessory,
  type Expression,
  type FurColor,
} from './pixel-pet'
import { playAdopt, playClick, playMeow, resumeAudio } from './sfx'

const ACCESSORIES: { id: Accessory; label: string; emoji: string }[] = [
  { id: 'bowtie', label: 'Bowtie', emoji: '🎀' },
  { id: 'partyHat', label: 'Party Hat', emoji: '🎉' },
  { id: 'wizardCap', label: 'Wizard Cap', emoji: '🧙' },
  { id: 'glasses', label: 'Glasses', emoji: '🤓' },
  { id: 'heartAura', label: 'Heart Aura', emoji: '💖' },
  { id: 'fishTreat', label: 'Fish Treat', emoji: '🐟' },
  { id: 'catnipBall', label: 'Catnip Ball', emoji: '🌿' },
]

const EXPRESSIONS: { id: Expression; label: string }[] = [
  { id: 'happy', label: 'Happy' },
  { id: 'sleepy', label: 'Sleepy' },
  { id: 'wink', label: 'Wink' },
  { id: 'surprised', label: 'Surprised' },
]

const CONFETTI_COLORS = [
  '#ff9ecb',
  '#ffd166',
  '#bdecd0',
  '#c4d4ff',
  '#ffb877',
  '#d7c9ff',
]

export function PetBuilder() {
  const [fur, setFur] = useState<FurColor>(FUR_COLORS[0])
  const [expression, setExpression] = useState<Expression>('happy')
  const [accessories, setAccessories] = useState<Set<Accessory>>(new Set())
  const stageRef = useRef<HTMLDivElement | null>(null)
  const confettiLayerRef = useRef<HTMLDivElement | null>(null)
  const confettiParticlesRef = useRef<
    Map<number, { el: HTMLElement; x: number; y: number; vx: number; vy: number; rot: number }>
  >(new Map())
  const confettiIdRef = useRef(0)
  const confettiRafRef = useRef<number | null>(null)

  const sfx = useCallback(() => {
    resumeAudio()
    playMeow()
  }, [])

  const pickFur = (f: FurColor) => {
    setFur(f)
    sfx()
  }
  const pickExpression = (e: Expression) => {
    setExpression(e)
    playClick()
  }
  const toggleAccessory = (a: Accessory) => {
    setAccessories((prev) => {
      const next = new Set(prev)
      if (next.has(a)) next.delete(a)
      else next.add(a)
      return next
    })
    sfx()
  }

  const spawnConfetti = () => {
    const stage = stageRef.current
    const layer = confettiLayerRef.current
    if (!stage || !layer) return

    const rect = stage.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2

    for (let i = 0; i < 48; i++) {
      const angle = (Math.PI * 2 * i) / 48 + Math.random() * 0.3
      const speed = 2 + Math.random() * 4
      const id = confettiIdRef.current++
      const el = document.createElement('div')
      el.style.position = 'absolute'
      el.style.left = `${cx}px`
      el.style.top = `${cy}px`
      el.style.pointerEvents = 'none'
      const isHeart = i % 3 === 0
      if (isHeart) {
        el.textContent = '♥'
        el.style.fontSize = '18px'
        el.style.color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      } else {
        el.style.width = '8px'
        el.style.height = '8px'
        el.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      }
      layer.appendChild(el)
      confettiParticlesRef.current.set(id, {
        el,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        rot: Math.random() * 360,
      })
    }

    if (confettiRafRef.current === null) {
      const tick = () => {
        const particles = confettiParticlesRef.current
        if (particles.size === 0) {
          confettiRafRef.current = null
          return
        }
        particles.forEach((p, id) => {
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.18
          p.rot += 8
          p.el.style.transform = `translate(${p.x - parseFloat(p.el.style.left)}px, ${p.y - parseFloat(p.el.style.top)}px) rotate(${p.rot}deg)`
          if (p.y > 600 || p.y < -200) {
            p.el.remove()
            particles.delete(id)
          }
        })
        confettiRafRef.current = requestAnimationFrame(tick)
      }
      confettiRafRef.current = requestAnimationFrame(tick)
    }
  }

  const adopt = () => {
    playAdopt()
    spawnConfetti()

    const stage = stageRef.current
    if (!stage) return
    const svg = stage.querySelector('svg')
    if (!svg) return

    const clonedSvg = svg.cloneNode(true) as SVGSVGElement
    clonedSvg.setAttribute('width', String(svg.viewBox.baseVal.width))
    clonedSvg.setAttribute('height', String(svg.viewBox.baseVal.height))

    const svgString = new XMLSerializer().serializeToString(clonedSvg)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) return
        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = 'my-adopted-kitty.png'
        a.click()
        URL.revokeObjectURL(downloadUrl)
      }, 'image/png')
      URL.revokeObjectURL(url)
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6">
      {/* Live preview stage */}
      <div
        ref={stageRef}
        className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64"
      >
        <div
          ref={confettiLayerRef}
          className="pointer-events-none absolute inset-0 overflow-visible"
        />
        <div className="animate-pet-bounce">
          <PixelPet
            fur={fur}
            expression={expression}
            accessories={accessories}
            className="h-44 w-44 drop-shadow-[4px_4px_0_0_#2f2a44] sm:h-52 sm:w-52"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="grid w-full gap-4 sm:grid-cols-3">
        <ControlPanel title="Fur Color">
          <div className="flex flex-wrap justify-center gap-2">
            {FUR_COLORS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => pickFur(f)}
                aria-pressed={fur.id === f.id}
                className={`flex items-center gap-2 rounded-xl border-2 px-2.5 py-1.5 text-xs font-bold transition-transform duration-150 hover:-translate-y-0.5 ${
                  fur.id === f.id
                    ? 'border-foreground bg-card shadow-[2px_2px_0_0_var(--ink)]'
                    : 'border-transparent'
                }`}
              >
                <span
                  className="h-4 w-4 rounded border border-foreground/40"
                  style={{ background: f.body }}
                />
                {f.label}
              </button>
            ))}
          </div>
        </ControlPanel>

        <ControlPanel title="Expression">
          <div className="flex flex-wrap justify-center gap-2">
            {EXPRESSIONS.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => pickExpression(e.id)}
                aria-pressed={expression === e.id}
                className={`rounded-xl border-2 px-3 py-1.5 text-xs font-bold transition-transform duration-150 hover:-translate-y-0.5 ${
                  expression === e.id
                    ? 'border-foreground bg-card shadow-[2px_2px_0_0_var(--ink)]'
                    : 'border-transparent'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </ControlPanel>

        <ControlPanel title="Accessories">
          <div className="flex flex-wrap justify-center gap-2">
            {ACCESSORIES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAccessory(a.id)}
                aria-pressed={accessories.has(a.id)}
                className={`flex items-center gap-1 rounded-xl border-2 px-2.5 py-1.5 text-xs font-bold transition-transform duration-150 hover:-translate-y-0.5 ${
                  accessories.has(a.id)
                    ? 'border-foreground bg-card shadow-[2px_2px_0_0_var(--ink)]'
                    : 'border-transparent'
                }`}
              >
                <span aria-hidden="true">{a.emoji}</span>
                {a.label}
              </button>
            ))}
          </div>
        </ControlPanel>
      </div>

      {/* Adopt button */}
      <button
        type="button"
        onClick={adopt}
        className="group relative inline-flex items-center gap-2 rounded-2xl border-4 bg-accent px-8 py-3 text-base font-bold text-foreground shadow-[5px_5px_0_0_var(--ink)] transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_0_var(--ink)] active:translate-x-0 active:translate-y-0 active:shadow-[3px_3px_0_0_var(--ink)]"
        style={{ borderColor: 'var(--ink)' }}
      >
        <span className="transition-transform duration-200 group-hover:scale-110">
          Adopt Pet
        </span>
        <span aria-hidden="true">🐾</span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            boxShadow:
              '0 0 24px 4px rgba(255, 196, 225, 0.7), 0 0 48px 8px rgba(255, 196, 225, 0.4)',
          }}
        />
      </button>
    </div>
  )
}

function ControlPanel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border-2 border-foreground/15 bg-card/60 p-3">
      <h3 className="mb-2 text-center text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}
