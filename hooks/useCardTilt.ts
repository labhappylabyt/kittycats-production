'use client'

import { useCallback, useRef } from 'react'
import type { MouseEvent } from 'react'
import gsap from 'gsap'

type TiltOptions = {
  /** degrees of rotation at the card's edge */
  max?: number
  /** how far the face lifts toward the viewer while hovered */
  lift?: number
  onEnter?: () => void
  onLeave?: () => void
}

let reducedMotion: MediaQueryList | null = null

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  reducedMotion ??= window.matchMedia('(prefers-reduced-motion: reduce)')
  return reducedMotion.matches
}

/**
 * Cursor-tracked 3D tilt with a spring return, shared by every card face.
 *
 * Writes `--sheen-x` / `--sheen-y` (percentages across the card box) as it
 * goes, so a glare layer can follow the cursor without a second listener.
 *
 * Returns callback refs rather than RefObjects: a callback typed on
 * HTMLElement attaches to an <a>, <span>, or <div> without a cast.
 */
export function useCardTilt<T extends HTMLElement = HTMLDivElement>({
  max = 12,
  lift = 8,
  onEnter,
  onLeave,
}: TiltOptions = {}) {
  const card = useRef<T | null>(null)
  const face = useRef<HTMLElement | null>(null)

  const cardRef = useCallback((node: T | null) => {
    card.current = node
  }, [])

  const faceRef = useCallback((node: HTMLElement | null) => {
    face.current = node
  }, [])

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = card.current
      const inner = face.current
      if (!el || !inner || prefersReducedMotion()) return

      const rect = el.getBoundingClientRect()
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)

      inner.style.setProperty('--sheen-x', `${(dx + 1) * 50}%`)
      inner.style.setProperty('--sheen-y', `${(dy + 1) * 50}%`)

      gsap.to(inner, {
        rotateX: -dy * max,
        rotateY: dx * max,
        z: lift,
        duration: 0.15,
        ease: 'power2.out',
        transformPerspective: 1000,
      })
    },
    [max, lift],
  )

  const onMouseEnter = useCallback(() => {
    onEnter?.()
  }, [onEnter])

  const onMouseLeave = useCallback(() => {
    const inner = face.current
    if (inner) {
      gsap.to(inner, {
        rotateX: 0,
        rotateY: 0,
        z: 0,
        duration: 0.4,
        ease: 'power3.out',
      })
    }
    onLeave?.()
  }, [onLeave])

  return { cardRef, faceRef, tilt: { onMouseMove, onMouseEnter, onMouseLeave } }
}
