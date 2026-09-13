'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import {
  FUR_COLORS,
  PixelPet,
  type Accessory,
  type Expression,
  type FurColor,
} from './pixel-pet'
import { playAdopt, playClick, playMeow, playPurr, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

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

const PURR_COLORS = [
  '#ff9ecb',
  '#ffd166',
  '#bdecd0',
  '#c4d4ff',
  '#d7c9ff',
]

type PetState = 'idle' | 'tracking' | 'clicked'

export function HeroPet() {
  const [fur, setFur] = useState<FurColor>(FUR_COLORS[0])
  const [expression, setExpression] = useState<Expression>('happy')
  const [accessories, setAccessories] = useState<Set<Accessory>>(new Set())
  const [toast, setToast] = useState(false)
  const [adopted, setAdopted] = useState(false)

  const stageRef = useRef<HTMLDivElement | null>(null)
  const petWrapRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const confettiLayerRef = useRef<HTMLDivElement | null>(null)
  const purrLayerRef = useRef<HTMLDivElement | null>(null)
  const prevAccessoriesRef = useRef<Set<Accessory>>(new Set())
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef<PetState>('idle')

  // GSAP idle breathing: gentle y-axis float
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const wrap = petWrapRef.current
    if (!wrap) return

    const breathe = gsap.to(wrap, {
      y: -4,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    return () => {
      breathe.kill()
    }
  }, [])

  // Tail wag: continuous rotation oscillation on the #pet-tail group
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const svg = svgRef.current
    if (!svg) return
    const tail = svg.querySelector('#pet-tail') as SVGGElement | null
    if (!tail) return

    const wag = gsap.to(tail, {
      rotation: 8,
      transformOrigin: 'left center',
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    return () => {
      wag.kill()
    }
  }, [])

  // Blink loop: every 3-5 seconds, briefly switch to sleepy then back
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let blinkTimeout: ReturnType<typeof setTimeout>
    let restoreTimeout: ReturnType<typeof setTimeout>

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 2000
      blinkTimeout = setTimeout(() => {
        setExpression((prev) => (prev === 'happy' ? 'sleepy' : prev))
        restoreTimeout = setTimeout(() => {
          setExpression((prev) => (prev === 'sleepy' ? 'happy' : prev))
          scheduleBlink()
        }, 200)
      }, delay)
    }
    scheduleBlink()

    return () => {
      clearTimeout(blinkTimeout)
      clearTimeout(restoreTimeout)
    }
  }, [])

  // Cursor tracking: eyes subtly follow the mouse across the viewport
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const svg = svgRef.current
    if (!svg) return
    const eyes = svg.querySelector('#pet-eyes') as SVGGElement | null
    if (!eyes) return

    const onMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      const maxShift = 2
      const tx = Math.max(-maxShift, Math.min(maxShift, dx * maxShift))
      const ty = Math.max(-maxShift, Math.min(maxShift, dy * maxShift))
      gsap.to(eyes, {
        x: tx,
        y: ty,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Spring physics on accessory changes: squash-and-stretch scale from 0 to 1
  useEffect(() => {
    const prev = prevAccessoriesRef.current
    const current = accessories

    const added: Accessory[] = []
    current.forEach((a) => {
      if (!prev.has(a)) added.push(a)
    })

    added.forEach((a) => {
      const svg = svgRef.current
      if (!svg) return
      const el = svg.querySelector(`[data-accessory="${a}"]`) as SVGElement | null
      if (!el) return
      gsap.fromTo(
        el,
        { scale: 0, opacity: 0, transformOrigin: 'center center' },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(1.7)',
        },
      )
    })

    prevAccessoriesRef.current = new Set(current)
  }, [accessories])

  // Purr particle burst: small hearts/sparks emanating from the cat
  const spawnPurr = useCallback(() => {
    const layer = purrLayerRef.current
    if (!layer) return

    const rect = layer.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2

    for (let i = 0; i < 12; i++) {
      const el = document.createElement('div')
      el.style.position = 'absolute'
      el.style.left = `${cx}px`
      el.style.top = `${cy}px`
      el.style.pointerEvents = 'none'
      el.style.fontSize = '14px'
      el.style.color = PURR_COLORS[i % PURR_COLORS.length]
      el.textContent = i % 2 === 0 ? '♥' : '✦'
      layer.appendChild(el)

      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5
      const dist = 30 + Math.random() * 40

      gsap.to(el, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 20,
        opacity: 0,
        scale: 0.3,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => el.remove(),
      })
    }
  }, [])

  // Click reaction: soft bounce + purr sound + purr particles
  const handlePetClick = useCallback(() => {
    const wrap = petWrapRef.current
    if (!wrap) return

    stateRef.current = 'clicked'

    // Squash-and-stretch bounce
    gsap.timeline()
      .to(wrap, { scaleY: 0.88, scaleX: 1.12, duration: 0.12, ease: 'power2.out' })
      .to(wrap, { scaleY: 1.06, scaleX: 0.94, duration: 0.15, ease: 'power2.out' })
      .to(wrap, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' })

    if (!isMuted()) {
      resumeAudio()
      playPurr()
    }
    spawnPurr()

    // Return to idle after the bounce
    setTimeout(() => {
      stateRef.current = 'idle'
    }, 600)
  }, [spawnPurr])

  const playSound = () => {
    if (!isMuted()) {
      resumeAudio()
      playMeow()
    }
  }

  const pickFur = (f: FurColor) => {
    setFur(f)
    playSound()
  }
  const pickExpression = (e: Expression) => {
    setExpression(e)
    if (!isMuted()) {
      resumeAudio()
      playClick()
    }
  }
  const toggleAccessory = (a: Accessory) => {
    setAccessories((prev) => {
      const next = new Set(prev)
      if (next.has(a)) next.delete(a)
      else next.add(a)
      return next
    })
    playSound()
  }

  const spawnConfetti = () => {
    const layer = confettiLayerRef.current
    if (!layer) return

    const rect = layer.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const particles: Array<{ el: HTMLElement; x: number; y: number; vx: number; vy: number; rot: number }> = []

    for (let i = 0; i < 48; i++) {
      const angle = (Math.PI * 2 * i) / 48 + Math.random() * 0.3
      const speed = 2 + Math.random() * 4
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
      particles.push({
        el,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        rot: Math.random() * 360,
      })
    }

    let raf = 0
    const tick = () => {
      let alive = false
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.18
        p.rot += 8
        p.el.style.transform = `translate(${p.x - parseFloat(p.el.style.left)}px, ${p.y - parseFloat(p.el.style.top)}px) rotate(${p.rot}deg)`
        if (p.y < 600 && p.y > -200) {
          alive = true
        } else {
          p.el.remove()
        }
      })
      if (alive) {
        raf = requestAnimationFrame(tick)
      } else {
        cancelAnimationFrame(raf)
      }
    }
    raf = requestAnimationFrame(tick)
  }

  const adopt = () => {
    if (!isMuted()) {
      resumeAudio()
      playAdopt()
    }
    spawnConfetti()
    setAdopted(true)

    setToast(true)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(false), 2500)

    const stage = stageRef.current
    if (!stage) return
    const svg = stage.querySelector('svg')
    if (!svg) return

    const clonedSvg = svg.cloneNode(true) as SVGSVGElement
    const vbWidth = svg.viewBox.baseVal.width
    const vbHeight = svg.viewBox.baseVal.height
    const scale = 4
    clonedSvg.setAttribute('width', String(vbWidth * scale))
    clonedSvg.setAttribute('height', String(vbHeight * scale))

    const svgString = new XMLSerializer().serializeToString(clonedSvg)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = vbWidth * scale
      canvas.height = vbHeight * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (!blob) return
        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = 'my-kittycats-pet.png'
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
        className="relative flex h-64 w-64 items-center justify-center overflow-hidden rounded-[34px] border border-white/14 bg-[#171a1c] p-4 shadow-[inset_0_0_50px_rgba(255,255,255,0.04),8px_8px_0_rgba(0,0,0,0.18)] sm:h-80 sm:w-80"
      >
        <div className="pointer-events-none absolute inset-4 rounded-[26px] border border-white/6" aria-hidden="true" />
        <div className="pointer-events-none absolute h-[86%] w-[86%] rounded-[28px] border border-[#d9f27c]/12" aria-hidden="true" />
        <div
          ref={confettiLayerRef}
          className="pointer-events-none absolute inset-0 overflow-visible"
        />
        <div
          ref={purrLayerRef}
          className="pointer-events-none absolute inset-0 overflow-visible"
        />
        <div ref={petWrapRef} className="pet-idle">
          <PixelPet
            ref={svgRef}
            fur={fur}
            expression={expression}
            accessories={accessories}
            className="relative z-10 h-48 w-48 sm:h-60 sm:w-60 [image-rendering:pixelated]"
            onPetClick={handlePetClick}
          />
        </div>
      </div>

      {/* Toast notification */}
      <div
        className={`pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-[12px] border border-[#d9f27c]/50 bg-[#24282a] px-5 py-3 ui-label text-[#d9f27c] shadow-[5px_5px_0_rgba(0,0,0,.22)] transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}
        role="status"
        aria-live="polite"
      >
        Pet Adopted!
      </div>

      {adopted && (
        <div className="adoption-card" role="dialog" aria-label="Kitty adopted">
          <div className="adoption-card-heading"><span className="status-dot" />Your kitty is ready</div>
          <p className="adoption-card-copy">Send this tiny pal into the world.</p>
          <div className="adoption-actions">
            <button type="button" className="adoption-action adoption-action-primary" onClick={adopt}>Download card</button>
            <button type="button" className="adoption-action" onClick={async () => {
              const url = `${window.location.origin}/?kitty=${encodeURIComponent(fur.id)}&mood=${encodeURIComponent(expression)}`
              try { await navigator.clipboard.writeText(url); setToast(true) } catch { /* clipboard unavailable */ }
            }}>Copy share URL</button>
            <button type="button" className="adoption-action" onClick={adopt}>Export PNG</button>
          </div>
          <button type="button" className="adoption-close" onClick={() => setAdopted(false)}>Maybe later</button>
        </div>
      )}

      {/* Controls */}
      <div className="grid w-full gap-3 sm:grid-cols-3">
        <ControlPanel title="Fur Color">
          <div className="flex flex-wrap justify-center gap-2">
            {FUR_COLORS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => pickFur(f)}
                aria-pressed={fur.id === f.id}
                className={`fur-swatch flex flex-col items-center gap-1 rounded-[14px] border-2 px-2 py-2 text-[0.62rem] font-semibold transition-transform duration-150 hover:-translate-y-0.5 ${
                  fur.id === f.id
                    ? 'selected border-[#ffe17d] bg-[#ffe17d]/14 text-white shadow-[0_3px_0_#bba64e]'
                    : 'border-white/10 text-white/55 hover:border-[#ff9ebd]/70 hover:text-white'
                }`}
              >
                <span
                  className="h-7 w-7 rounded-[10px] border-2 border-white/35"
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
                className={`rounded-[14px] border-2 px-3 py-2 text-xs font-semibold transition-transform duration-200 hover:-translate-y-1 active:translate-y-0.5 ${
                  expression === e.id
                    ? 'border-[#a3f3d1] bg-[#a3f3d1]/14 text-white shadow-[0_3px_0_#5aa889]'
                    : 'border-white/10 text-white/55 hover:border-[#c4b5fd]/70 hover:text-white'
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
                className={`flex items-center gap-1 rounded-[14px] border-2 px-2.5 py-2 text-xs font-semibold transition-transform duration-200 hover:-translate-y-1 active:translate-y-0.5 ${
                  accessories.has(a.id)
                    ? 'border-[#c4b5fd] bg-[#c4b5fd]/14 text-white shadow-[0_3px_0_#8975c5]'
                    : 'border-white/10 text-white/55 hover:border-[#ff9ebd]/70 hover:text-white'
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
        className="group relative inline-flex items-center gap-3 rounded-[14px] border border-[#d9f27c]/70 bg-[#d9f27c] px-7 py-3 font-semibold text-[0.68rem] tracking-[0.08em] text-[#08090e] shadow-[4px_4px_0_#879e42] transition-all duration-300 hover:-translate-y-1 hover:shadow-[7px_7px_0_#879e42] active:translate-y-0 active:shadow-[2px_2px_0_#879e42]"
      >
        <span className="transition-transform duration-200 group-hover:scale-110">
          Adopt Pet
        </span>
        <span aria-hidden="true">+</span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            boxShadow:
              '0 0 0 1px rgba(217,242,124,0.35)',
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
    <div className="control-panel rounded-[20px] border-2 border-white/12 bg-[#29243b] p-3 shadow-[4px_5px_0_rgba(11,8,20,.18)]">
      <h3 className="mb-3 text-center ui-label text-white/40">
        {title}
      </h3>
      {children}
    </div>
  )
}
