'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { playAdopt, playClick, playChime, playPop, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

type Rarity = 'Common' | 'Rare' | 'Cosmic' | 'Mythic'
type Element = { id: string; name: string; emoji: string; color: string }
type Discovery = { id: string; name: string; emoji: string; color: string; rarity: Rarity; recipe: [string, string]; nickname?: string; discoveredAt: number }
type Save = { version: 1; inventory: string[]; discoveries: Discovery[]; favorites: string[]; muted: boolean }

const SAVE_KEY = 'kittycraft_save_v1'
const ELEMENTS: Element[] = [
  { id: 'orange-tabby', name: 'Orange Tabby', emoji: '🐈', color: '#ff9ebd' },
  { id: 'wizard-cap', name: 'Wizard Cap', emoji: '🧙', color: '#c4b5fd' },
  { id: 'mint', name: 'Mint', emoji: '🌿', color: '#a3f3d1' },
  { id: 'moon', name: 'Moon', emoji: '🌙', color: '#ffe17d' },
  { id: 'star', name: 'Star', emoji: '⭐', color: '#ffe17d' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', color: '#ff9ebd' },
  { id: 'fish-treat', name: 'Fish Treat', emoji: '🐟', color: '#a3f3d1' },
  { id: 'bowtie', name: 'Bowtie', emoji: '🎀', color: '#ff9ebd' },
  { id: 'bubble', name: 'Bubble', emoji: '🫧', color: '#c4b5fd' },
  { id: 'toast', name: 'Toast', emoji: '🍞', color: '#ffe17d' },
]
const POOLS = [
  ['Comet', '🌠', '#c4b5fd'], ['Bubblegum', '🫧', '#ff9ebd'], ['Sprout', '🌱', '#a3f3d1'], ['Moonbeam', '🌙', '#ffe17d'],
  ['Pixel', '🐾', '#c4b5fd'], ['Jellybean', '🍬', '#ff9ebd'], ['Cloud', '☁️', '#a3f3d1'], ['Stardust', '✨', '#ffe17d'],
]
const RARITIES: Rarity[] = ['Common', 'Common', 'Rare', 'Rare', 'Cosmic', 'Mythic']
const RECIPES: Record<string, [string, string, string, string, Rarity]> = {
  'orange-tabby|wizard-cap': ['space-cosmic-cat', 'Cosmo Whiskers', '🐱', '#c4b5fd', 'Cosmic'],
  'mint|orange-tabby': ['garden-cat', 'Sprout Paws', '🐈', '#a3f3d1', 'Rare'],
  'moon|orange-tabby': ['moon-cat', 'Luna Loaf', '🐈', '#ffe17d', 'Rare'],
  'orange-tabby|star': ['star-cat', 'Star Pouncer', '🐱', '#ffe17d', 'Cosmic'],
  'bowtie|orange-tabby': ['party-cat', 'Fancy Beans', '🐈', '#ff9ebd', 'Common'],
  'fish-treat|orange-tabby': ['sushi-cat', 'Sushi Paws', '🐱', '#a3f3d1', 'Rare'],
  'bubble|orange-tabby': ['bubble-cat', 'Bloop', '🐈', '#c4b5fd', 'Common'],
  'rainbow|orange-tabby': ['rainbow-cat', 'Prism Paws', '🐱', '#ff9ebd', 'Cosmic'],
  'mint|wizard-cap': ['forest-witch', 'Moss Mage', '🐈', '#a3f3d1', 'Cosmic'],
  'moon|wizard-cap': ['night-witch', 'Moon Magician', '🐱', '#c4b5fd', 'Mythic'],
  'star|wizard-cap': ['star-wizard', 'Nova Neko', '🐈', '#ffe17d', 'Mythic'],
  'bowtie|wizard-cap': ['fancy-wizard', 'Tuxedo Mage', '🐱', '#ff9ebd', 'Rare'],
  'fish-treat|wizard-cap': ['spellfish', 'Fin Wizard', '🐈', '#a3f3d1', 'Rare'],
  'bubble|wizard-cap': ['bubble-witch', 'Bubbly Mage', '🐱', '#c4b5fd', 'Cosmic'],
  'rainbow|wizard-cap': ['rainbow-wizard', 'Prism Merlin', '🐈', '#ff9ebd', 'Mythic'],
  'mint|moon': ['night-garden', 'Moon Sprout', '🐱', '#a3f3d1', 'Rare'],
  'mint|star': ['star-sprout', 'Wish Leaf', '🐈', '#ffe17d', 'Cosmic'],
  'moon|star': ['eclipse-cat', 'Eclipse', '🐱', '#c4b5fd', 'Mythic'],
  'bowtie|mint': ['garden-party', 'Tea Time', '🐈', '#ff9ebd', 'Common'],
  'bowtie|moon': ['moon-bow', 'Moon Ribbon', '🐱', '#ffe17d', 'Rare'],
  'bowtie|star': ['star-bow', 'Wish Wrapper', '🐈', '#ff9ebd', 'Cosmic'],
  'fish-treat|mint': ['pond-cat', 'Puddle Paws', '🐈', '#a3f3d1', 'Common'],
  'fish-treat|moon': ['moonfish-cat', 'Tidepool', '🐱', '#c4b5fd', 'Rare'],
  'fish-treat|star': ['comet-fish', 'Comet Koi', '🐈', '#ffe17d', 'Cosmic'],
  'bubble|mint': ['soap-cat', 'Soapy', '🐱', '#a3f3d1', 'Common'],
  'bubble|moon': ['moon-bubble', 'Orbit Bubbles', '🐈', '#c4b5fd', 'Rare'],
  'bubble|star': ['star-bubble', 'Wish Bubble', '🐱', '#ffe17d', 'Cosmic'],
  'rainbow|mint': ['rainbow-garden', 'Color Sprout', '🐈', '#ff9ebd', 'Rare'],
  'rainbow|moon': ['rainbow-moon', 'Aurora Paws', '🐱', '#c4b5fd', 'Cosmic'],
  'rainbow|star': ['rainbow-star', 'Supernova', '🐈', '#ffe17d', 'Mythic'],
  'toast|orange-tabby': ['breakfast-cat', 'Toast Toes', '🐈', '#ffe17d', 'Common'],
  'toast|wizard-cap': ['toast-wizard', 'Crumb Mage', '🐱', '#ffe17d', 'Rare'],
}

const elementById = (id: string): Element => ELEMENTS.find((element) => element.id === id) ?? { id, name: id, emoji: '🐾', color: '#c4b5fd' }
const recipeKey = (a: string, b: string) => [a, b].sort().join('|')
const hash = (value: string) => [...value].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 7)

function makeFallback(a: string, b: string): Discovery {
  const seed = hash(recipeKey(a, b))
  const [name, emoji, color] = POOLS[seed % POOLS.length]
  const rarity = RARITIES[seed % RARITIES.length]
  return { id: `wild-${seed.toString(36)}`, name: `${name} Kitty`, emoji, color, rarity, recipe: [a, b], discoveredAt: Date.now() }
}

function createDiscovery(a: string, b: string): Discovery {
  const key = recipeKey(a, b)
  const recipe = RECIPES[key]
  if (recipe) return { id: recipe[0], name: recipe[1], emoji: recipe[2], color: recipe[3], rarity: recipe[4], recipe: [a, b], discoveredAt: Date.now() }
  return makeFallback(a, b)
}

export function InfiniteKittyCraft() {
  const [inventory, setInventory] = useState<string[]>(ELEMENTS.slice(0, 4).map((element) => element.id))
  const [discoveries, setDiscoveries] = useState<Discovery[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [codexOpen, setCodexOpen] = useState(false)
  const [reveal, setReveal] = useState<Discovery | null>(null)
  const [nickname, setNickname] = useState('')
  const [dragging, setDragging] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null') as Save | null
      if (saved?.version === 1) { setInventory(saved.inventory); setDiscoveries(saved.discoveries) }
    } catch { /* use starter save */ }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (loaded) localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, inventory, discoveries, favorites: [], muted: isMuted() } satisfies Save))
  }, [inventory, discoveries, loaded])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const combo = params.get('combo')?.split('+').filter(Boolean)
    if (combo?.length === 2) setSelected(combo)
  }, [])

  const selectedElements = useMemo(() => selected.map(elementById), [selected])
  const discover = () => {
    if (selected.length !== 2) return
    const result = createDiscovery(selected[0], selected[1])
    if (!discoveries.some((item) => item.id === result.id && item.recipe.join('|') === result.recipe.join('|'))) setDiscoveries((items) => [...items, result])
    if (!inventory.includes(result.id)) setInventory((items) => [...items, result.id])
    setReveal(result)
    setSelected([])
    if (!isMuted()) { resumeAudio(); result.rarity === 'Mythic' ? playChime() : playPop() }
  }

  const choose = (id: string) => {
    if (selected.length >= 2) return
    setSelected((items) => [...items, id])
    if (!isMuted()) { resumeAudio(); playClick() }
  }
  const drop = (id: string) => { setDragging(null); choose(id) }
  const exportPng = () => {
    const canvas = canvasRef.current ?? document.createElement('canvas')
    canvas.width = 640; canvas.height = 640
    const ctx = canvas.getContext('2d'); if (!ctx || !reveal) return
    ctx.fillStyle = '#1e1b2e'; ctx.fillRect(0, 0, 640, 640)
    ctx.font = '180px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(reveal.emoji, 320, 350)
    ctx.font = 'bold 36px sans-serif'; ctx.fillStyle = '#fff8fb'; ctx.fillText(nickname || reveal.name, 320, 470)
    ctx.font = '22px sans-serif'; ctx.fillStyle = reveal.color; ctx.fillText(`${reveal.rarity} discovery`, 320, 515)
    const a = document.createElement('a'); a.download = `${reveal.id}.png`; a.href = canvas.toDataURL('image/png'); a.click()
  }
  const copyRecipe = async () => {
    if (!reveal) return
    const url = `${window.location.origin}/?combo=${encodeURIComponent(reveal.recipe[0])}+${encodeURIComponent(reveal.recipe[1])}`
    try { await navigator.clipboard.writeText(url) } catch { /* clipboard unavailable */ }
  }

  return (
    <main className="craft-shell">
      <header className="craft-nav"><a href="/" className="craft-logo"><span className="brand-mark">KC</span><span>Infinite Kitty Craft</span></a><nav><a href="/labs">Kitty Lab</a><button type="button" onClick={() => setCodexOpen(true)}>Codex <b>{discoveries.length}</b></button></nav></header>
      <section className="craft-hero"><div><p className="section-kicker"><span className="status-dot" />A tiny alchemy playground</p><h1 className="display-title">infinite<br /><span>kitty craft.</span></h1><p>Mix two little things. Discover one brand-new companion. There are no wrong combinations here.</p></div><div className="craft-sticker">∞<small>every combo<br />makes a kitty</small></div></section>
      <section className="craft-layout">
        <aside className="inventory-panel"><div className="craft-panel-title"><span>Inventory</span><small>{inventory.length} finds</small></div><div className="inventory-list">{inventory.map((id) => { const item = elementById(id); return <button key={id} type="button" draggable onDragStart={() => setDragging(id)} onDragEnd={() => setDragging(null)} onClick={() => choose(id)} className={`inventory-item ${selected.includes(id) ? 'is-selected' : ''} ${dragging === id ? 'is-dragging' : ''}`}><span className="inventory-emoji" style={{ background: item.color }}>{item.emoji}</span><span>{item.name}</span></button> })}</div></aside>
        <section className={`synthesis-zone ${selected.length === 2 ? 'can-combine' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={() => dragging && drop(dragging)}>
          <div className="zone-label">Synthesis lab <span>drop or tap two</span></div><div className="drop-slots"><div className={`drop-slot ${selected[0] ? 'filled' : ''}`}>{selected[0] ? <span>{elementById(selected[0]).emoji}</span> : '+'}</div><div className="plus-sign">+</div><div className={`drop-slot ${selected[1] ? 'filled' : ''}`}>{selected[1] ? <span>{elementById(selected[1]).emoji}</span> : '+'}</div></div><button type="button" className="combine-button" disabled={selected.length !== 2} onClick={discover}>Combine magic <span>✦</span></button><p className="hint">Every pairing makes something new.</p>
        </section>
      </section>
      <section className="recent-row"><div className="craft-panel-title"><span>Fresh from the lab</span><small>{discoveries.length} discovered / ∞</small></div><div className="recent-cards">{discoveries.slice(-5).reverse().map((item) => <button type="button" key={`${item.id}-${item.discoveredAt}`} className="discovery-mini" onClick={() => setReveal(item)}><span style={{ background: item.color }}>{item.emoji}</span><b>{item.nickname || item.name}</b><small>{item.rarity}</small></button>)}{discoveries.length === 0 && <p className="empty-copy">Your first discovery is waiting.</p>}</div></section>
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      {codexOpen && <div className="drawer-backdrop" onClick={() => setCodexOpen(false)}><aside className="codex-drawer" onClick={(event) => event.stopPropagation()}><button className="drawer-close" onClick={() => setCodexOpen(false)}>×</button><p className="section-kicker">The little book of kitties</p><h2 className="display-title">codex</h2><div className="codex-count">{discoveries.length} <span>/ ∞ discovered</span></div><div className="codex-list">{discoveries.map((item) => <article key={`${item.id}-${item.discoveredAt}`}><span style={{ background: item.color }}>{item.emoji}</span><div><b>{item.nickname || item.name}</b><small className={`rarity-${item.rarity.toLowerCase()}`}>{item.rarity}</small><p>{item.recipe.map((id) => elementById(id).name).join(' + ')}</p></div></article>)}</div></aside></div>}
      {reveal && <div className="reveal-backdrop"><div className={`reveal-card rarity-card-${reveal.rarity.toLowerCase()}`}><div className="confetti-pixels" aria-hidden="true">✦　✧　♥　✦　✧</div><button className="drawer-close" onClick={() => setReveal(null)}>×</button><p className="section-kicker">New discovery</p><div className="reveal-emoji" style={{ background: reveal.color }}>{reveal.emoji}</div><p className="rarity-label">{reveal.rarity} kitty</p><h2 className="display-title">{reveal.name}</h2><p className="recipe-line">{elementById(reveal.recipe[0]).name} + {elementById(reveal.recipe[1]).name}</p><input aria-label="Name the kitty" value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="Name the kitty" /><div className="reveal-actions"><button type="button" onClick={exportPng}>Download PNG</button><button type="button" onClick={copyRecipe}>Copy shareable recipe link</button></div></div></div>}
    </main>
  )
}
