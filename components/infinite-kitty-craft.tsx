'use client'

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getRecipe,
  itemById,
  PALETTE,
  pairKey,
  resolveOutput,
  SAVE_KEY,
  STARTERS,
  type Discovery,
  type Item,
  type Save,
} from '@/lib/kittycraft'
import {
  playClick,
  playDiscoverFirst,
  playDiscoverRepeat,
  playMerge,
  playMythic,
  playPickup,
  resumeAudio,
} from './sfx'
import { isMuted, SoundToggle } from './sound-toggle'
import { computeHints } from '@/lib/kittycraft'

const SPRING = { type: 'spring', stiffness: 420, damping: 30, mass: 1 } as const
const SPRING_SOFT = { type: 'spring', stiffness: 260, damping: 26 } as const
const SPRING_SNAP = { type: 'spring', stiffness: 520, damping: 24 } as const

type Phase = 'idle' | 'merging' | 'reveal'

const sfx = (fn: () => void) => {
  if (isMuted()) return
  resumeAudio()
  fn()
}

export function InfiniteKittyCraft() {
  const [inventory, setInventory] = useState<string[]>(() => STARTERS.map((entry) => entry.id))
  const [discoveries, setDiscoveries] = useState<Discovery[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [wild, setWild] = useState<Record<string, import('@/lib/kittycraft').WildEntry>>({})
  const [selected, setSelected] = useState<string[]>([])
  const [codexOpen, setCodexOpen] = useState(false)
  const [reveal, setReveal] = useState<Discovery | null>(null)
  const [isNewDiscovery, setIsNewDiscovery] = useState(false)
  const [nickname, setNickname] = useState('')
  const [dragging, setDragging] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [copied, setCopied] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const revealCardRef = useRef<HTMLDivElement | null>(null)
  const labCenterRef = useRef<{ x: number; y: number } | null>(null)
  const cardSizeRef = useRef({ w: 460, h: 540 })

  const labRef = useRef<HTMLElement | null>(null)
  const labRectRef = useRef<DOMRect | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reducedMotion = useReducedMotion()
  const [canDrag, setCanDrag] = useState(false)

  // Drag-and-drop is a progressive enhancement for pointer devices;
  // tap-to-select is the primary interaction everywhere.
  useEffect(() => {
    setCanDrag(window.matchMedia('(pointer: fine)').matches)
  }, [])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null') as Save | null
      if (saved?.version === 1) {
        setInventory(saved.inventory)
        setDiscoveries(saved.discoveries ?? [])
        setFavorites(saved.favorites ?? [])
        setNames(saved.names ?? {})
        setWild(saved.wild ?? {})
      }
    } catch { /* starter state */ }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ version: 1, inventory, discoveries, favorites, names, wild } satisfies Save),
      )
    } catch { /* storage unavailable */ }
  }, [inventory, discoveries, favorites, names, wild, loaded])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('combo') ?? ''
    const combo = (raw.includes('+') ? raw.split('+') : raw.trim().split(/\s+/))
      .map((part) => part.trim())
      .filter(Boolean)
    if (combo.length === 2) setSelected(combo)
  }, [])

  const discoveredIds = useMemo(() => new Set(discoveries.map((entry) => entry.id)), [discoveries])
  const inventorySet = useMemo(() => new Set(inventory), [inventory])
  const hints = useMemo(() => computeHints(inventorySet, discoveredIds), [inventorySet, discoveredIds])

  const itemFor = useCallback((id: string): Item => {
    const wildEntry = wild[id]
    if (wildEntry) {
      return { id, ...wildEntry, tier: 1 }
    }
    return itemById(id)
  }, [wild])

  const choose = (id: string) => {
    if (selected.includes(id) || selected.length >= 2) return
    setSelected((items) => [...items, id])
    sfx(playPickup)
  }

  const removeFromSlot = (index: number) => {
    if (phase !== 'idle') return
    setSelected((items) => items.filter((_, at) => at !== index))
    sfx(playClick)
  }

  const pointerAt = (info: PanInfo) => ({ x: info.point.x, y: info.point.y })

  const onItemDragStart = (id: string) => {
    setDragging(id)
    labRectRef.current = labRef.current?.getBoundingClientRect() ?? null
    sfx(playPickup)
  }

  const onItemDrag = (info: PanInfo) => {
    const rect = labRectRef.current
    if (!rect) return
    const point = pointerAt(info)
    const inside = point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
    const target = inside ? (selected.length === 0 ? 1 : selected.length === 1 ? 2 : 0) : 0
    setDropTarget(target)
  }

  const onItemDragEnd = (id: string, info: PanInfo) => {
    setDragging(null)
    setDropTarget(0)
    const rect = labRectRef.current
    if (!rect) return
    const point = pointerAt(info)
    const inside = point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
    if (inside && selected.length < 2) {
      setSelected((items) => (items.includes(id) || items.length >= 2 ? items : [...items, id]))
      sfx(playPickup)
    }
  }

  const discover = () => {
    if (selected.length !== 2 || phase !== 'idle') return
    captureLab()
    const recipe = getRecipe(selected[0], selected[1])
    const output = resolveOutput(recipe)
    const existing = discoveries.find((entry) => entry.id === output.id)
    const firstTime = !existing

    setPhase('merging')
    sfx(playMerge)

    window.setTimeout(() => {
      const order = firstTime ? discoveries.length + 1 : existing.order
      const result: Discovery = {
        id: output.id,
        name: output.name,
        nickname: names[output.id],
        recipe: [recipe.inputs[0], recipe.inputs[1]],
        rarity: recipe.rarity,
        tier: output.tier,
        discoveredAt: existing?.discoveredAt ?? Date.now(),
        order,
      }
      setIsNewDiscovery(firstTime)
      if (firstTime) {
        setDiscoveries((items) => [...items, result])
        setInventory((items) => (items.includes(output.id) ? items : [...items, output.id]))
        if (!itemById(output.id)) {
          setWild((entries) => ({
            ...entries,
            [output.id]: { name: output.name, emoji: output.emoji, color: output.color, description: output.description },
          }))
        }
      }
      setReveal(result)
      setNickname(names[output.id] ?? '')
      setSelected([])
      setPhase('reveal')

      sfx(() => {
        if (recipe.rarity === 'Mythic') playMythic()
        else if (firstTime) playDiscoverFirst()
        else playDiscoverRepeat()
      })
    }, reducedMotion ? 60 : 240)
  }

  const closeReveal = () => {
    setReveal(null)
    setPhase('idle')
  }

  const setCustomName = (value: string) => {
    setNickname(value)
    if (reveal) {
      setNames((all) => ({ ...all, [reveal.id]: value }))
      setDiscoveries((all) => all.map((entry) => (entry.id === reveal.id ? { ...entry, nickname: value } : entry)))
    }
  }

  const exportPng = () => {
    if (!reveal) return
    const canvas = canvasRef.current ?? document.createElement('canvas')
    canvasRef.current = canvas
    canvas.width = 640
    canvas.height = 640
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = PALETTE.ink
    ctx.fillRect(0, 0, 640, 640)
    const visual = itemFor(reveal.id)
    ctx.fillStyle = visual.color
    ctx.fillRect(0, 0, 640, 10)
    ctx.fillRect(0, 630, 640, 10)
    ctx.font = '190px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(visual.emoji, 320, 360)
    ctx.font = '700 38px sans-serif'
    ctx.fillStyle = '#fff8fb'
    ctx.fillText(nickname || reveal.name, 320, 480)
    ctx.font = '600 22px sans-serif'
    ctx.fillStyle = visual.color
    ctx.fillText(`${reveal.rarity} · Discovery #${reveal.order}`, 320, 525)
    ctx.font = '500 18px sans-serif'
    ctx.fillStyle = 'rgba(255,248,251,.55)'
    ctx.fillText(reveal.recipe.map((id) => itemFor(id).name).join('  +  '), 320, 565)
    const link = document.createElement('a')
    link.download = `${(nickname || reveal.name).toLowerCase().replace(/\s+/g, '-')}-adoption-card.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const copyRecipe = async () => {
    if (!reveal) return
    const url = `${window.location.origin}/?combo=${encodeURIComponent(reveal.recipe[0])}+${encodeURIComponent(reveal.recipe[1])}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard unavailable */ }
  }

  const toggleFavorite = (id: string) =>
    setFavorites((items) => (items.includes(id) ? items.filter((entry) => entry !== id) : [...items, id]))

  const resetSave = () => {
    localStorage.removeItem(SAVE_KEY)
    window.location.reload()
  }

  const canCombine = selected.length === 2

  // Spatial continuity: capture the lab's center the moment a synthesis (or a
  // codex/recent open) happens, so the reveal card can expand out of the lab
  // itself and fly back into it on close. Computed at render time so the very
  // first painted frame already carries the offset.
  const captureLab = useCallback(() => {
    const lab = labRef.current?.getBoundingClientRect()
    if (lab) labCenterRef.current = { x: lab.left + lab.width / 2, y: lab.top + lab.height / 2 }
  }, [])

  const revealOrigin = useMemo(() => {
    if (!reveal || typeof window === 'undefined' || !labCenterRef.current) return null
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = Math.min(Math.max(48, vh * 0.14), 128)
    const cardCx = vw / 2
    const cardCy = 16 + margin + cardSizeRef.current.h / 2
    return { dx: labCenterRef.current.x - cardCx, dy: labCenterRef.current.y - cardCy }
  }, [reveal])

  // Keep the cached card size fresh so later reveals anchor precisely.
  useEffect(() => {
    const el = revealCardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    cardSizeRef.current = { w: rect.width, h: rect.height }
  }, [reveal])
  const sendToLab = (id: string) => {
    setSelected((items) => (items.includes(id) || items.length >= 2 ? items : [...items, id]))
    setCodexOpen(false)
    sfx(playPickup)
  }

  return (
    <main className="craft-shell">
      <header className="craft-nav">
        <a href="/" className="craft-logo">
          <span className="brand-mark">KC</span>
          <span>Infinite Kitty Craft</span>
        </a>
        <nav>
          <a href="/labs">Kitty Lab</a>
          <motion.button type="button" onClick={() => setCodexOpen(true)} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} transition={SPRING_SOFT}>
            Codex <b>{discoveries.length}</b>
          </motion.button>
          <SoundToggle inline />
        </nav>
      </header>

      <section className="craft-hero">
        <div>
          <p className="section-kicker"><span className="status-dot" />A tiny alchemy playground</p>
          <h1 className="display-title">infinite<br /><span className="hero-pill"><span>kitty craft.</span></span></h1>
          <p>Mix anything with anything. Tier up from ingredients to companions, then send your discoveries back into the lab.</p>
        </div>
        <div className="craft-sticker">∞<small>every combo<br />makes a kitty</small></div>
      </section>

      <section className="craft-layout">
        <aside className="surface-quiet">
          <div className="craft-panel-title"><span>Inventory</span><small>{inventory.length} finds</small></div>
          <div className="inventory-list">
            {inventory.map((id) => {
              const entry = itemFor(id)
              const isSelected = selected.includes(id)
              return (
                <motion.button
                  key={id}
                  type="button"
                  drag={canDrag}
                  dragSnapToOrigin
                  dragElastic={0.12}
                  dragMomentum={false}
                  onDragStart={() => onItemDragStart(id)}
                  onDrag={(event, info) => onItemDrag(info)}
                  onDragEnd={(event, info) => onItemDragEnd(id, info)}
                  whileHover={phase === 'idle' && !isSelected ? { y: -3, scale: 1.02 } : undefined}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING_SOFT}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => choose(id)}
                  className={`inventory-item ${isSelected ? 'is-selected' : ''} ${dragging === id ? 'is-dragging' : ''}`}
                >
                  <span className="inventory-emoji" style={{ background: entry.color }}>{entry.emoji}</span>
                  <b>{entry.name}</b>
                  <small className={`inventory-tier ${entry.tier === 2 ? 'rare' : ''}`}>{entry.tier === 2 ? 'Tier 2' : 'Tier 1'}</small>
                </motion.button>
              )
            })}
          </div>
          <p className="lab-hint">Tap two ingredients, or drag them into the lab.</p>
        </aside>

        <motion.section
          ref={labRef}
          className={`craft-lab ${canCombine ? 'can-combine' : ''}`}
          animate={canCombine ? { y: -3 } : { y: 0 }}
          transition={SPRING_SOFT}
        >
          <div className="lab-glow" aria-hidden="true" />
          <div className="lab-heading">Synthesis Lab<small>tap two ingredients or drag them in</small></div>
          <div className="lab-slots">
            {[0, 1].map((index) => {
              const id = selected[index]
              const entry = id ? itemFor(id) : null
              return (
                <motion.button
                  key={index}
                  type="button"
                  className={`lab-slot ${dropTarget === index + 1 ? 'inviting' : ''}`}
                  onClick={() => entry && removeFromSlot(index)}
                  animate={dropTarget === index + 1 ? { scale: 1.05 } : { scale: 1 }}
                  whileHover={entry ? { scale: 1.04 } : undefined}
                  whileTap={entry ? { scale: 0.97 } : undefined}
                  transition={SPRING_SNAP}
                  aria-label={entry ? `Remove ${entry.name} from slot ${index + 1}` : `Empty slot ${index + 1}`}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {entry ? (
                      <motion.span
                        key={id}
                        style={{ background: entry.color }}
                        initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.4, opacity: 0, rotate: 8 }}
                        transition={SPRING}
                      >
                        {entry.emoji}
                      </motion.span>
                    ) : (
                      <motion.span key="plus" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>+</motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })}
            <div className="plus-sign">→</div>
            <div className="lab-result">
              <AnimatePresence mode="popLayout" initial={false}>
                {phase === 'idle' ? (
                  <motion.span key="idle" style={{ background: 'rgba(255,248,251,.08)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.4 }}>?</motion.span>
                ) : phase === 'merging' ? (
                  <motion.span key="merge" style={{ background: PALETTE.yellow }} initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 1, rotate: 360 }} exit={{ scale: 0.3, opacity: 0 }} transition={{ duration: 0.24, ease: 'easeOut' }} />
                ) : (
                  <motion.span key="done" style={{ background: reveal ? itemFor(reveal.id).color : PALETTE.mint }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING}>{reveal ? itemFor(reveal.id).emoji : ''}</motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          <motion.button
            type="button"
            className="combine-button"
            disabled={!canCombine || phase !== 'idle'}
            onClick={discover}
            whileHover={canCombine && phase === 'idle' ? { y: -3 } : undefined}
            whileTap={canCombine && phase === 'idle' ? { scale: 0.97 } : undefined}
            transition={SPRING_SOFT}
          >
            {phase === 'merging' ? 'Synthesizing…' : 'Combine magic ✦'}
          </motion.button>
          <p className="lab-hint">Every pairing makes something — a new friend or a new ingredient.</p>
        </motion.section>
      </section>

      <section className="surface-quiet recent-row">
        <div className="craft-panel-title"><span>Fresh from the lab</span><small>{discoveries.length} discovered / ∞</small></div>
        <div className="recent-cards">
          <AnimatePresence initial={false}>
            {discoveries.slice(-5).reverse().map((entry) => (
              <motion.button
                key={`${entry.id}-${entry.discoveredAt}`}
                layout
                type="button"
                className="discovery-mini"
                onClick={() => { captureLab(); setReveal(entry); setIsNewDiscovery(false); setNickname(names[entry.id] ?? ''); setPhase('reveal') }}
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -8 }}
                transition={SPRING_SOFT}
                whileHover={{ y: -3, rotate: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <span style={{ background: itemFor(entry.id).color }}>{itemFor(entry.id).emoji}</span>
                <b>{names[entry.id] || entry.name}</b>
                <small>{entry.rarity}</small>
              </motion.button>
            ))}
          </AnimatePresence>
          {discoveries.length === 0 && <p className="empty-copy">Your first discovery is waiting.</p>}
        </div>
      </section>

      <AnimatePresence>
        {codexOpen && (
          <motion.div
            key="codex-backdrop"
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCodexOpen(false)}
          />
        )}
        {codexOpen && (
          <motion.aside
            key="codex-drawer"
            className="codex-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={SPRING_SOFT}
            role="dialog"
            aria-label="Discovery codex"
          >
              <button className="drawer-close" onClick={() => setCodexOpen(false)} aria-label="Close codex">×</button>
              <div className="codex-scroll">
                <p className="section-kicker">The little book of kitties</p>
                <h2 className="display-title">codex</h2>
                <div className="codex-count">{discoveries.length} <span>/ ∞ discovered</span></div>

                <div className="favorite-shelf">
                  <b>Favorite shelf</b>
                  <div>
                    {favorites.length ? favorites.map((id) => {
                      const entry = itemFor(id)
                      return (
                        <motion.button
                          key={id}
                          layout
                          type="button"
                          onClick={() => sendToLab(id)}
                          whileHover={{ y: -3, rotate: -4 }}
                          whileTap={{ scale: 0.94 }}
                          transition={SPRING_SNAP}
                          aria-label={`Send ${entry.name} to the lab`}
                        >
                          {entry.emoji}
                        </motion.button>
                      )
                    }) : <small>Pin a discovery with the star button.</small>}
                  </div>
                </div>

                <div className="codex-list">
                  {discoveries.map((entry) => (
                    <motion.article
                      key={`${entry.id}-${entry.discoveredAt}`}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={SPRING_SOFT}
                    >
                      <button type="button" className="codex-spawn" onClick={() => sendToLab(entry.id)} aria-label={`Send ${names[entry.id] || entry.name} to the lab`}>
                        <span style={{ background: itemFor(entry.id).color }}>{itemFor(entry.id).emoji}</span>
                      </button>
                      <div>
                        <b>Discovery #{entry.order}: {names[entry.id] || entry.name}</b>
                        <small className={`rarity-${entry.rarity.toLowerCase()}`}>{entry.rarity}</small>
                        <p>{itemFor(entry.id).description}</p>
                        <p>{entry.recipe.map((id) => itemFor(id).name).join(' + ')}</p>
                      </div>
                      <button type="button" className="favorite-button" onClick={() => toggleFavorite(entry.id)} aria-label={favorites.includes(entry.id) ? 'Unpin favorite' : 'Pin favorite'}>
                        {favorites.includes(entry.id) ? '★' : '☆'}
                      </button>
                    </motion.article>
                  ))}

                  {hints.map((hint, index) => (
                    <div className="codex-locked" key={`hint-${index}-${hint.output}`}>
                      <span>?</span>
                      <div>
                        <b>{itemFor(hint.inputs[0]).name} + {itemFor(hint.inputs[1]).name}</b>
                        <p>A locked silhouette — combine these two to reveal it.</p>
                      </div>
                    </div>
                  ))}

                  {discoveries.length === 0 && hints.length === 0 && (
                    <div className="codex-locked"><span>?</span><div><b>Undiscovered companions</b><p>Combine ingredients to reveal silhouettes.</p></div></div>
                  )}
                </div>
                <button type="button" className="reset-save" onClick={resetSave}>Reset save data</button>
              </div>
            </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reveal && (
          <motion.div
            className="reveal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeReveal}
          >
            <motion.div
              ref={revealCardRef}
              className="reveal-card"
              onClick={(event) => event.stopPropagation()}
              initial={revealOrigin ? { x: revealOrigin.dx, y: revealOrigin.dy, scale: 0.15, opacity: 0 } : { opacity: 0 }}
              animate={revealOrigin ? { x: 0, y: 0, scale: 1, opacity: 1 } : { opacity: 0 }}
              exit={{ x: revealOrigin?.dx ?? 0, y: revealOrigin?.dy ?? 0, scale: 0.15, opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 27 } }}
              transition={{ type: 'spring', stiffness: 320, damping: 27 }}
              role="dialog"
              aria-label="Discovery card"
            >
              <button className="drawer-close" onClick={closeReveal} aria-label="Close discovery card">×</button>
              <p className="section-kicker">{isNewDiscovery ? `New discovery #${reveal.order}` : `Discovery #${reveal.order}`}</p>
              <div className={`reveal-emoji ${isNewDiscovery ? 'once-bounce' : ''}`} style={{ background: itemFor(reveal.id).color }}>{itemFor(reveal.id).emoji}</div>
              <p className="rarity-label">{reveal.rarity}{reveal.tier === 2 ? ' · Tier 2' : ''} Kitty</p>
              <h2 className="display-title">{names[reveal.id] || reveal.name}</h2>
              <p className="recipe-line">{reveal.recipe.map((id) => itemFor(id).name).join('  +  ')}</p>
              {isNewDiscovery && <p className="recipe-line">{itemFor(reveal.id).description}</p>}
              <input
                aria-label="Name the kitty"
                value={nickname}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="Name the kitty"
              />
              <div className="reveal-actions">
                <button type="button" onClick={exportPng}>Download Adoption Card (PNG)</button>
                <button type="button" className="reveal-action-secondary" onClick={copyRecipe}>{copied ? 'Copied ✓' : 'Copy shareable recipe link'}</button>
              </div>
              {copied && <p className="copied-note">Anyone who opens that link meets the same kitty.</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
