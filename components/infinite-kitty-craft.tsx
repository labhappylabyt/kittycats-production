'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { playChime, playClick, playPop, resumeAudio } from './sfx'
import { isMuted } from './sound-toggle'

type Rarity = 'Common' | 'Rare' | 'Cosmic' | 'Mythic'
type Item = { id: string; name: string; emoji: string; color: string; description?: string; kind: 'base' | 'crafted' }
type Recipe = { inputs: [string, string]; output: Item; rarity: Rarity; description: string }
type Discovery = Item & { rarity: Rarity; recipe: [string, string]; discoveredAt: number; order: number; nickname?: string }
type Save = { version: 1; inventory: string[]; discoveries: Discovery[]; favorites: string[]; names: Record<string, string>; muted: boolean }

const SAVE_KEY = 'kittycraft_save_v1'
const PALETTE = { pink: '#ff9ebd', mint: '#a3f3d1', yellow: '#ffd166', ink: '#1b1929' }
const BASE: Item[] = [
  { id: 'orange-tabby', name: 'Orange Tabby', emoji: '🐈', color: PALETTE.pink, kind: 'base', description: 'A sunny little starter with excellent zoomies.' },
  { id: 'wizard-cap', name: 'Wizard Cap', emoji: '🧙', color: PALETTE.mint, kind: 'base', description: 'A hat with a pocket dimension for snacks.' },
  { id: 'mint', name: 'Mint', emoji: '🌿', color: PALETTE.mint, kind: 'base', description: 'Fresh enough to make the whiskers tingle.' },
  { id: 'moon', name: 'Moon', emoji: '🌙', color: PALETTE.yellow, kind: 'base', description: 'A sleepy satellite with a soft glow.' },
  { id: 'storm', name: 'Storm', emoji: '☁', color: PALETTE.mint, kind: 'base', description: 'A tiny thundercloud, mostly harmless.' },
  { id: 'candy', name: 'Candy', emoji: '●', color: PALETTE.pink, kind: 'base', description: 'Sweet, sticky, and suspiciously sparkly.' },
  { id: 'glitch', name: 'Glitch', emoji: '▦', color: PALETTE.pink, kind: 'base', description: 'A little error that learned to purr.' },
  { id: 'static', name: 'Static', emoji: '✦', color: PALETTE.yellow, kind: 'base', description: 'Electric fuzz from a mysterious channel.' },
  { id: 'star', name: 'Star', emoji: '✦', color: PALETTE.yellow, kind: 'base', description: 'A pocket-sized wish with good timing.' },
  { id: 'fish-treat', name: 'Fish Treat', emoji: '≈', color: PALETTE.mint, kind: 'base', description: 'The fastest route to a kitty friendship.' },
]

const item = (id: string, name: string, emoji: string, color: string, description: string): Item => ({ id, name, emoji, color, description, kind: 'crafted' })
const R: Recipe[] = [
  { inputs: ['orange-tabby', 'wizard-cap'], output: item('space-cosmic-cat', 'Cosmo Whiskers', '🐱', PALETTE.mint, 'A brave explorer who naps between galaxies.'), rarity: 'Cosmic', description: 'A wizard hat points a tabby toward the stars.' },
  { inputs: ['orange-tabby', 'moon'], output: item('nightprowl', 'Nightprowl', '🐈', PALETTE.yellow, 'Quiet paws for very important midnight missions.'), rarity: 'Rare', description: 'The moon teaches a sunny kitty to roam at night.' },
  { inputs: ['orange-tabby', 'storm'], output: item('thunderpaws', 'Thunderpaws', '🐈', PALETTE.mint, 'A rumble-powered kitty with a big heart.'), rarity: 'Rare', description: 'A storm gives those paws a little extra bounce.' },
  { inputs: ['orange-tabby', 'candy'], output: item('sugar-rush', 'Sugar Rush', '🐱', PALETTE.pink, 'Runs on sprinkles and impossible optimism.'), rarity: 'Common', description: 'A tabby discovers the zoomies in candy form.' },
  { inputs: ['orange-tabby', 'glitch'], output: item('pixel-pouncer', 'Pixel Pouncer', '🐱', PALETTE.pink, 'Jumps between frames when nobody is looking.'), rarity: 'Cosmic', description: 'A glitch teaches a tabby to bend the screen.' },
  { inputs: ['orange-tabby', 'static'], output: item('spark-whisker', 'Spark Whisker', '🐈', PALETTE.yellow, 'Purrs in a very satisfying electric key.'), rarity: 'Rare', description: 'Static turns a whisker into a tiny antenna.' },
  { inputs: ['orange-tabby', 'star'], output: item('star-pouncer', 'Star Pouncer', '🐱', PALETTE.yellow, 'Always lands on the brightest wish.'), rarity: 'Cosmic', description: 'A star gives a tabby a heroic landing.' },
  { inputs: ['orange-tabby', 'fish-treat'], output: item('sushi-paws', 'Sushi Paws', '🐱', PALETTE.mint, 'A tiny chef with excellent fish manners.'), rarity: 'Rare', description: 'A fish treat inspires culinary greatness.' },
  { inputs: ['wizard-cap', 'moon'], output: item('moon-magician', 'Moon Magician', '🐱', PALETTE.mint, 'Makes sleepy spells before bedtime.'), rarity: 'Mythic', description: 'A cap and a moon open the softest spellbook.' },
  { inputs: ['wizard-cap', 'storm'], output: item('moss-mage', 'Moss Mage', '🐈', PALETTE.mint, 'Knows every secret shortcut through the garden.'), rarity: 'Cosmic', description: 'A storm waters a wizard cap into something wild.' },
  { inputs: ['wizard-cap', 'candy'], output: item('crumb-mage', 'Crumb Mage', '🐱', PALETTE.yellow, 'Summons snacks for the whole coven.'), rarity: 'Rare', description: 'Candy magic leaves a wizard covered in crumbs.' },
  { inputs: ['wizard-cap', 'glitch'], output: item('debug-wizard', 'Debug Wizard', '🐈', PALETTE.pink, 'Fixes bugs with a single majestic blink.'), rarity: 'Cosmic', description: 'A glitch upgrades the cap with impossible syntax.' },
  { inputs: ['wizard-cap', 'static'], output: item('voltage-wizard', 'Voltage Wizard', '🐱', PALETTE.yellow, 'Channels lightning into gentle high-fives.'), rarity: 'Mythic', description: 'Static fills the cap with a bright new charge.' },
  { inputs: ['wizard-cap', 'star'], output: item('nova-neko', 'Nova Neko', '🐈', PALETTE.yellow, 'A constellation in a very good hat.'), rarity: 'Mythic', description: 'A star crowns the wizard with cosmic confidence.' },
  { inputs: ['mint', 'moon'], output: item('moon-sprout', 'Moon Sprout', '🐱', PALETTE.mint, 'Grows sleepy leaves under silver skies.'), rarity: 'Rare', description: 'Mint and moon make a garden for night owls.' },
  { inputs: ['mint', 'storm'], output: item('rainroot', 'Rainroot', '🐈', PALETTE.mint, 'A rain-fed kitty who always finds the puddle.'), rarity: 'Common', description: 'A storm gives mint a very determined root system.' },
  { inputs: ['mint', 'candy'], output: item('gumdrop-garden', 'Gumdrop Garden', '🐱', PALETTE.pink, 'Sweet leaves, soft paws, no thorns.'), rarity: 'Common', description: 'Candy makes the garden wonderfully chewable.' },
  { inputs: ['mint', 'glitch'], output: item('neon-whisker', 'Neon Whisker', '🐈', PALETTE.pink, 'Glows politely at the edge of the screen.'), rarity: 'Cosmic', description: 'A glitch adds a bright new channel to the mint.' },
  { inputs: ['mint', 'static'], output: item('buzzbloom', 'Buzzbloom', '🐱', PALETTE.yellow, 'A flower that hums when it is happy.'), rarity: 'Rare', description: 'Static gives the mint a very lively bloom.' },
  { inputs: ['mint', 'star'], output: item('wish-leaf', 'Wish Leaf', '🐈', PALETTE.yellow, 'Turns tiny hopes into tiny adventures.'), rarity: 'Cosmic', description: 'Mint grows a star-shaped leaf.' },
  { inputs: ['moon', 'storm'], output: item('eclipse-cat', 'Eclipse', '🐱', PALETTE.mint, 'A quiet shadow with impeccable timing.'), rarity: 'Mythic', description: 'Storm and moon briefly cover the whole sky.' },
  { inputs: ['moon', 'candy'], output: item('moon-sugar', 'Moon Sugar', '🐈', PALETTE.pink, 'Sweet dreams, shaped like a crescent.'), rarity: 'Rare', description: 'Candy makes the moon taste like bedtime.' },
  { inputs: ['moon', 'glitch'], output: item('orbit-error', 'Orbit Error', '🐱', PALETTE.pink, 'Loops around the same thought in a cute way.'), rarity: 'Cosmic', description: 'A glitch sends moonlight into a playful loop.' },
  { inputs: ['moon', 'static'], output: item('lunar-signal', 'Lunar Signal', '🐈', PALETTE.yellow, 'Broadcasts purrs to the far side.'), rarity: 'Rare', description: 'Static finds a friend hiding on the moon.' },
  { inputs: ['storm', 'static'], output: item('thunder-signal', 'Thunder Signal', '🐱', PALETTE.yellow, 'The forecast is 100% chance of sparkle.'), rarity: 'Cosmic', description: 'A storm and static tune into the same frequency.' },
  { inputs: ['storm', 'candy'], output: item('sugar-storm', 'Sugar Storm', '🐈', PALETTE.pink, 'Rains sprinkles with zero warning.'), rarity: 'Rare', description: 'Candy makes the storm a lot more delicious.' },
  { inputs: ['storm', 'glitch'], output: item('weather-bug', 'Weather Bug', '🐱', PALETTE.mint, 'Forecasts tiny chaos with great accuracy.'), rarity: 'Cosmic', description: 'A glitch makes the storm impossible to predict.' },
  { inputs: ['candy', 'glitch'], output: item('jelly-jumper', 'Jelly Jumper', '🐈', PALETTE.pink, 'Bounces between sweet little realities.'), rarity: 'Rare', description: 'Candy and glitch make a delightfully wobbly kitty.' },
  { inputs: ['candy', 'static'], output: item('fizz-fuzz', 'Fizz Fuzz', '🐱', PALETTE.yellow, 'Pops, crackles, and asks for another treat.'), rarity: 'Common', description: 'Static gives candy a fizzy personality.' },
  { inputs: ['candy', 'star'], output: item('wish-wrapper', 'Wish Wrapper', '🐈', PALETTE.pink, 'Keeps every good wish folded safely inside.'), rarity: 'Cosmic', description: 'A star gets wrapped in the sweetest promise.' },
  { inputs: ['glitch', 'static'], output: item('signal-kitty', 'Signal Kitty', '🐱', PALETTE.yellow, 'Always knows when the next update is coming.'), rarity: 'Cosmic', description: 'Two kinds of noise become one clear purr.' },
  { inputs: ['glitch', 'star'], output: item('supernova-bug', 'Supernova Bug', '🐈', PALETTE.pink, 'Makes the whole codex sparkle.'), rarity: 'Mythic', description: 'A star gives a glitch a spectacular ending.' },
  { inputs: ['static', 'star'], output: item('radio-star', 'Radio Star', '🐱', PALETTE.yellow, 'Plays the hit single in every dimension.'), rarity: 'Rare', description: 'Static tunes the star to a catchy frequency.' },
  { inputs: ['fish-treat', 'moon'], output: item('tidepool', 'Tidepool', '🐈', PALETTE.mint, 'A lunar swimmer with excellent manners.'), rarity: 'Rare', description: 'The moon pulls a fish treat into the tide.' },
  { inputs: ['fish-treat', 'storm'], output: item('rainy-koi', 'Rainy Koi', '🐱', PALETTE.mint, 'Swims through clouds and leaves no puddle behind.'), rarity: 'Common', description: 'A storm turns a fish treat into a sky swimmer.' },
  { inputs: ['fish-treat', 'candy'], output: item('gummy-guppy', 'Gummy Guppy', '🐈', PALETTE.pink, 'Wiggles with a very sweet tail.'), rarity: 'Common', description: 'Candy gives the fish a soft, chewy disguise.' },
  { inputs: ['fish-treat', 'star'], output: item('comet-koi', 'Comet Koi', '🐱', PALETTE.yellow, 'Leaves a sparkling wake wherever it swims.'), rarity: 'Cosmic', description: 'A star gives a fish a comet trail.' },
  { inputs: ['nightprowl', 'static'], output: item('midnight-radio', 'Midnight Radio', '🐈', PALETTE.yellow, 'Broadcasts secret pawsteps after dark.'), rarity: 'Cosmic', description: 'Nightprowl finds a late-night signal.' },
  { inputs: ['nightprowl', 'candy'], output: item('midnight-taffy', 'Midnight Taffy', '🐱', PALETTE.pink, 'Stretches a moonlit adventure forever.'), rarity: 'Rare', description: 'Nightprowl gets delightfully stuck in candy.' },
  { inputs: ['thunderpaws', 'star'], output: item('storm-superstar', 'Storm Superstar', '🐈', PALETTE.yellow, 'Takes a bow after every thunderclap.'), rarity: 'Mythic', description: 'Thunderpaws catches a star and becomes legendary.' },
]
const recipeKey = (a: string, b: string) => [a, b].sort().join('|')
const RECIPE_MAP = new Map(R.map((recipe) => [recipeKey(recipe.inputs[0], recipe.inputs[1]), recipe]))
const hash = (value: string) => [...value].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 17)
const NAME_A = ['Neon', 'Velvet', 'Pocket', 'Moonlit', 'Turbo', 'Mellow', 'Cosmic', 'Jelly', 'Static', 'Lucky']
const NAME_B = ['Whisker', 'Pouncer', 'Sprout', 'Comet', 'Bean', 'Paws', 'Noodle', 'Mittens', 'Biscuit', 'Blink']
const RARITIES: Rarity[] = ['Common', 'Common', 'Common', 'Rare', 'Rare', 'Cosmic', 'Mythic']
const baseById = (id: string) => BASE.find((entry) => entry.id === id)
const humanize = (id: string) => id.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
const fallback = (a: string, b: string): Recipe => { const seed = hash(recipeKey(a, b)); const rarity = RARITIES[seed % RARITIES.length]; const color = [PALETTE.pink, PALETTE.mint, PALETTE.yellow][seed % 3]; const output = item(`wild-${seed.toString(36)}`, `${NAME_A[seed % NAME_A.length]} ${NAME_B[(seed >>> 3) % NAME_B.length]}`, seed % 2 ? '🐱' : '🐈', color, `A one-of-a-kind friend made from ${humanize(a)} and ${humanize(b)}.`); return { inputs: [a, b], output, rarity, description: `A surprise synthesis where ${humanize(a).toLowerCase()} meets ${humanize(b).toLowerCase()}.` } }
const getRecipe = (a: string, b: string) => RECIPE_MAP.get(recipeKey(a, b)) ?? fallback(a, b)

export function InfiniteKittyCraft() {
  const [inventory, setInventory] = useState<string[]>(BASE.map((entry) => entry.id))
  const [discoveries, setDiscoveries] = useState<Discovery[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string[]>([])
  const [codexOpen, setCodexOpen] = useState(false)
  const [reveal, setReveal] = useState<Discovery | null>(null)
  const [nickname, setNickname] = useState('')
  const [dragging, setDragging] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null') as Save | null; if (saved?.version === 1) { setInventory(saved.inventory); setDiscoveries(saved.discoveries); setFavorites(saved.favorites ?? []); setNames(saved.names ?? {}) } } catch { /* starter state */ } setLoaded(true) }, [])
  useEffect(() => { if (loaded) localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, inventory, discoveries, favorites, names, muted: isMuted() } satisfies Save)) }, [inventory, discoveries, favorites, names, loaded])
  useEffect(() => { const params = new URLSearchParams(window.location.search); const raw = params.get('combo') ?? ''; const combo = (raw.includes('+') ? raw.split('+') : raw.trim().split(/\s+/)).filter(Boolean); if (combo.length === 2) setSelected(combo) }, [])

  const selectedItem = (id: string): Item => discoveries.find((entry) => entry.id === id) ?? baseById(id) ?? item(id, humanize(id), '🐾', PALETTE.mint, 'A newly discovered friend.')
  const discoveredIds = useMemo(() => new Set(discoveries.map((entry) => entry.id)), [discoveries])
  const choose = (id: string) => { if (selected.length >= 2) return; setSelected((items) => [...items, id]); if (!isMuted()) { resumeAudio(); playClick() } }
  const drop = (id: string) => { setDragging(null); choose(id) }
  const discover = () => {
    if (selected.length !== 2) return
    const recipe = getRecipe(selected[0], selected[1]); const existing = discoveries.find((entry) => entry.id === recipe.output.id && recipeKey(...entry.recipe) === recipeKey(...recipe.inputs)); const isNew = !existing
    const result: Discovery = { ...recipe.output, rarity: recipe.rarity, recipe: recipe.inputs, discoveredAt: Date.now(), order: discoveries.length + (isNew ? 1 : 0), nickname: names[recipe.output.id] }
    if (isNew) setDiscoveries((items) => [...items, result])
    if (!inventory.includes(result.id)) setInventory((items) => [...items, result.id])
    setReveal(result); setNickname(result.nickname ?? ''); setSelected([])
    if (!isMuted()) { resumeAudio(); isNew && recipe.rarity === 'Mythic' ? playChime() : playPop() }
  }
  const setCustomName = (value: string) => { setNickname(value); if (reveal) { setNames((all) => ({ ...all, [reveal.id]: value })); setDiscoveries((all) => all.map((entry) => entry.id === reveal.id ? { ...entry, nickname: value } : entry)) } }
  const exportPng = () => { const canvas = canvasRef.current ?? document.createElement('canvas'); canvas.width = 640; canvas.height = 640; const ctx = canvas.getContext('2d'); if (!ctx || !reveal) return; ctx.fillStyle = PALETTE.ink; ctx.fillRect(0, 0, 640, 640); ctx.font = '180px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(reveal.emoji, 320, 350); ctx.font = 'bold 36px sans-serif'; ctx.fillStyle = '#fff8fb'; ctx.fillText(nickname || reveal.name, 320, 470); ctx.font = '22px sans-serif'; ctx.fillStyle = reveal.color; ctx.fillText(`${reveal.rarity} discovery`, 320, 515); const link = document.createElement('a'); link.download = `${reveal.id}.png`; link.href = canvas.toDataURL('image/png'); link.click() }
  const copyRecipe = async () => { if (!reveal) return; const url = `${window.location.origin}/?combo=${encodeURIComponent(reveal.recipe[0])}+${encodeURIComponent(reveal.recipe[1])}`; try { await navigator.clipboard.writeText(url) } catch { /* unavailable */ } }
  const toggleFavorite = (id: string) => setFavorites((items) => items.includes(id) ? items.filter((entry) => entry !== id) : [...items, id])
  const resetSave = () => { localStorage.removeItem(SAVE_KEY); window.location.reload() }

  return <main className="craft-shell">
    <header className="craft-nav"><a href="/" className="craft-logo"><span className="brand-mark">KC</span><span>Infinite Kitty Craft</span></a><nav><a href="/labs">Kitty Lab</a><button type="button" onClick={() => setCodexOpen(true)}>Codex <b>{discoveries.length}</b></button></nav></header>
    <section className="craft-hero"><div><p className="section-kicker"><span className="status-dot" />A tiny alchemy playground</p><h1 className="display-title">infinite<br /><span>kitty craft.</span></h1><p>Mix anything with anything. Tier up from ingredients to companions, then send your discoveries back into the lab.</p></div><div className="craft-sticker">∞<small>every combo<br />makes a kitty</small></div></section>
    <section className="craft-layout"><aside className="inventory-panel"><div className="craft-panel-title"><span>Inventory</span><small>{inventory.length} finds</small></div><div className="inventory-list">{inventory.map((id) => { const entry = selectedItem(id); return <button key={id} type="button" draggable onDragStart={() => setDragging(id)} onDragEnd={() => setDragging(null)} onClick={() => choose(id)} className={`inventory-item ${selected.includes(id) ? 'is-selected' : ''} ${dragging === id ? 'is-dragging' : ''}`}><span className="inventory-emoji" style={{ background: entry.color }}>{entry.emoji}</span><span>{entry.name}</span>{entry.kind === 'crafted' && <small className="inventory-tier">Tiered</small>}</button> })}</div></aside>
      <section className={`synthesis-zone ${selected.length === 2 ? 'can-combine' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={() => dragging && drop(dragging)}><div className="zone-label">Synthesis lab <span>tap two ingredients or drag them here</span></div><div className="drop-slots"><button type="button" className={`drop-slot ${selected[0] ? 'filled' : ''}`} onClick={() => selected[0] && setSelected((items) => items.slice(1))}>{selected[0] ? <span>{selectedItem(selected[0]).emoji}</span> : '+'}</button><div className="plus-sign">+</div><button type="button" className={`drop-slot ${selected[1] ? 'filled' : ''}`} onClick={() => selected[1] && setSelected((items) => [items[0]])}>{selected[1] ? <span>{selectedItem(selected[1]).emoji}</span> : '+'}</button></div><button type="button" className="combine-button" disabled={selected.length !== 2} onClick={discover}>Combine magic <span>✦</span></button><p className="hint">Every pairing makes something new.</p></section></section>
    <section className="recent-row"><div className="craft-panel-title"><span>Fresh from the lab</span><small>{discoveries.length} discovered / ∞</small></div><div className="recent-cards">{discoveries.slice(-5).reverse().map((entry) => <button type="button" key={`${entry.id}-${entry.discoveredAt}`} className="discovery-mini" onClick={() => setReveal(entry)}><span style={{ background: entry.color }}>{entry.emoji}</span><b>{names[entry.id] || entry.name}</b><small>{entry.rarity}</small></button>)}{discoveries.length === 0 && <p className="empty-copy">Your first discovery is waiting.</p>}</div></section>
    <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    {codexOpen && <div className="drawer-backdrop" onClick={() => setCodexOpen(false)}><aside className="codex-drawer" onClick={(event) => event.stopPropagation()}><button className="drawer-close" onClick={() => setCodexOpen(false)}>×</button><p className="section-kicker">The little book of kitties</p><h2 className="display-title">codex</h2><div className="codex-count">{discoveries.length} <span>/ ∞ discovered</span></div><div className="favorite-shelf"><b>Favorite shelf</b><div>{favorites.length ? favorites.map((id) => { const entry = selectedItem(id); return <button type="button" key={id} onClick={() => { setSelected([id]); setCodexOpen(false) }}>{entry.emoji}</button> }) : <small>Pin a discovery below.</small>}</div></div><div className="codex-list">{discoveries.map((entry) => <article key={`${entry.id}-${entry.discoveredAt}`}><button type="button" className="codex-spawn" onClick={() => { setSelected([entry.id]); setCodexOpen(false) }}><span style={{ background: entry.color }}>{entry.emoji}</span></button><div><b>Discovery #{entry.order}: {names[entry.id] || entry.name}</b><small className={`rarity-${entry.rarity.toLowerCase()}`}>{entry.rarity}</small><p>{entry.description}</p><p>{entry.recipe.map((id) => selectedItem(id).name).join(' + ')} · {new Date(entry.discoveredAt).toLocaleDateString()}</p></div><button type="button" className="favorite-button" onClick={() => toggleFavorite(entry.id)} aria-label={favorites.includes(entry.id) ? 'Unpin favorite' : 'Pin favorite'}>{favorites.includes(entry.id) ? '★' : '☆'}</button></article>)}{discoveries.length < 8 && <div className="codex-locked"><span>?</span><div><b>Undiscovered companions</b><p>Combine unlocked ingredients to reveal more silhouettes.</p></div></div>}</div><button type="button" className="reset-save" onClick={resetSave}>Reset save data</button></aside></div>}
    {reveal && <div className="reveal-backdrop"><div className={`reveal-card rarity-card-${reveal.rarity.toLowerCase()}`}><div className="confetti-pixels" aria-hidden="true">✦　✧　♥　✦　✧</div><button className="drawer-close" onClick={() => setReveal(null)}>×</button><p className="section-kicker">New discovery #{reveal.order}</p><div className="reveal-emoji" style={{ background: reveal.color }}>{reveal.emoji}</div><p className="rarity-label">{reveal.rarity} kitty</p><h2 className="display-title">{names[reveal.id] || reveal.name}</h2><p className="recipe-line">{selectedItem(reveal.recipe[0]).name} + {selectedItem(reveal.recipe[1]).name}</p><input aria-label="Name the kitty" value={nickname} onChange={(event) => setCustomName(event.target.value)} placeholder="Name the kitty" /><div className="reveal-actions"><button type="button" onClick={exportPng}>Download PNG</button><button type="button" onClick={copyRecipe}>Copy shareable recipe link</button></div></div></div>}
  </main>
}
