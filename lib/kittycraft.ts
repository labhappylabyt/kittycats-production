// Game data + synthesis engine for Infinite Kitty Craft.
// Deterministic: the same pair of ids always produces the same result.

export type Rarity = 'Common' | 'Rare' | 'Cosmic' | 'Mythic'
export type Tier = 1 | 2

export type Item = {
  id: string
  name: string
  emoji: string
  color: string
  description: string
  tier: Tier
}

export type Recipe = {
  inputs: [string, string]
  output: string
  rarity: Rarity
  tier: Tier
  flavor: string
}

export type Discovery = {
  id: string
  name: string
  nickname?: string
  recipe: [string, string]
  rarity: Rarity
  tier: Tier
  discoveredAt: number
  order: number
}

export type WildEntry = { name: string; emoji: string; color: string; description: string }

export type Save = {
  version: 1
  inventory: string[]
  discoveries: Discovery[]
  favorites: string[]
  names: Record<string, string>
  wild?: Record<string, WildEntry>
}

export const SAVE_KEY = 'kittycraft_save_v1'

export const PALETTE = {
  pink: '#ff9ebd',
  mint: '#a3f3d1',
  yellow: '#ffd166',
  ink: '#1b1929',
} as const

// 10 starters: literal + abstract, so pairings feel imaginative.
export const STARTERS: Item[] = [
  { id: 'orange-tabby', name: 'Orange Tabby', emoji: '🐈', color: PALETTE.pink, tier: 1, description: 'A sunny starter with excellent zoomies.' },
  { id: 'wizard-cap', name: 'Wizard Cap', emoji: '🎩', color: PALETTE.mint, tier: 1, description: 'A hat with a pocket dimension for snacks.' },
  { id: 'mint', name: 'Mint', emoji: '🌿', color: PALETTE.mint, tier: 1, description: 'Fresh enough to make whiskers tingle.' },
  { id: 'moon', name: 'Moon', emoji: '🌙', color: PALETTE.yellow, tier: 1, description: 'A sleepy satellite with a soft glow.' },
  { id: 'storm', name: 'Storm', emoji: '⛈', color: PALETTE.mint, tier: 1, description: 'A tiny thundercloud, mostly harmless.' },
  { id: 'candy', name: 'Candy', emoji: '🍬', color: PALETTE.pink, tier: 1, description: 'Sweet, sticky, suspiciously sparkly.' },
  { id: 'glitch', name: 'Glitch', emoji: '🩹', color: PALETTE.pink, tier: 1, description: 'A little error that learned to purr.' },
  { id: 'static', name: 'Static', emoji: '⚡', color: PALETTE.yellow, tier: 1, description: 'Electric fuzz from a mysterious channel.' },
  { id: 'star', name: 'Star', emoji: '✨', color: PALETTE.yellow, tier: 1, description: 'A pocket-sized wish with good timing.' },
  { id: 'fish-treat', name: 'Fish Treat', emoji: '🐟', color: PALETTE.mint, tier: 1, description: 'The fastest route to kitty friendship.' },
]

const crafted = (id: string, name: string, emoji: string, color: string, tier: Tier, description: string): Item =>
  ({ id, name, emoji, color, tier, description })

// Tier 1 + tier 2 results, hand-authored. Flavor is playful and warm — no fake stats.
export const CRAFTED: Item[] = [
  // Tier 1
  crafted('cosmo-whiskers', 'Cosmo Whiskers', '🐱', PALETTE.mint, 1, 'A brave explorer who naps between galaxies.'),
  crafted('nightprowl', 'Nightprowl', '🐈‍⬛', PALETTE.yellow, 1, 'Quiet paws for very important midnight missions.'),
  crafted('thunderpaws', 'Thunderpaws', '🐱', PALETTE.mint, 1, 'A rumble-powered kitty with a big heart.'),
  crafted('sugar-rush', 'Sugar Rush', '🐱', PALETTE.pink, 1, 'Runs on sprinkles and impossible optimism.'),
  crafted('pixel-pouncer', 'Pixel Pouncer', '🐱', PALETTE.pink, 1, 'Jumps between frames when nobody is looking.'),
  crafted('spark-whisker', 'Spark Whisker', '🐈', PALETTE.yellow, 1, 'Purrs in a very satisfying electric key.'),
  crafted('star-pouncer', 'Star Pouncer', '🐱', PALETTE.yellow, 1, 'Always lands on the brightest wish.'),
  crafted('sushi-paws', 'Sushi Paws', '🐱', PALETTE.mint, 1, 'A tiny chef with excellent fish manners.'),
  crafted('moon-magician', 'Moon Magician', '🐱', PALETTE.mint, 1, 'Makes sleepy spells before bedtime.'),
  crafted('moss-mage', 'Moss Mage', '🐈', PALETTE.mint, 1, 'Knows every secret shortcut through the garden.'),
  crafted('crumb-mage', 'Crumb Mage', '🐱', PALETTE.yellow, 1, 'Summons snacks for the whole coven.'),
  crafted('debug-wizard', 'Debug Wizard', '🐈', PALETTE.pink, 1, 'Fixes bugs with a single majestic blink.'),
  crafted('voltage-wizard', 'Voltage Wizard', '🐱', PALETTE.yellow, 1, 'Channels lightning into gentle high-fives.'),
  crafted('nova-neko', 'Nova Neko', '🐈', PALETTE.yellow, 1, 'A constellation in a very good hat.'),
  crafted('moon-sprout', 'Moon Sprout', '🐱', PALETTE.mint, 1, 'Grows sleepy leaves under silver skies.'),
  crafted('rainroot', 'Rainroot', '🐈', PALETTE.mint, 1, 'A rain-fed kitty who always finds the puddle.'),
  crafted('gumdrop-garden', 'Gumdrop Garden', '🐱', PALETTE.pink, 1, 'Sweet leaves, soft paws, zero thorns.'),
  crafted('neon-whisker', 'Neon Whisker', '🐈', PALETTE.pink, 1, 'Glows politely at the edge of the screen.'),
  crafted('eclipse-cat', 'Eclipse', '🐱', PALETTE.mint, 1, 'A quiet shadow with impeccable timing.'),
  crafted('jelly-jumper', 'Jelly Jumper', '🐈', PALETTE.pink, 1, 'Bounces between sweet little realities.'),
  // Tier 2 — crafted results go back into the lab
  crafted('storm-superstar', 'Storm Superstar', '🐈', PALETTE.yellow, 2, 'Takes a bow after every thunderclap.'),
  crafted('midnight-radio', 'Midnight Radio', '🐈', PALETTE.yellow, 2, 'Broadcasts secret pawsteps after dark.'),
  crafted('moonlit-taffy', 'Moonlit Taffy', '🐱', PALETTE.pink, 2, 'Stretches a moonlit adventure forever.'),
  crafted('aurora-prism', 'Aurora Prism', '🐱', PALETTE.mint, 2, 'Refracts one purr into a sky of colors.'),
  crafted('gravity-kitten', 'Gravity Kitten', '🐈', PALETTE.mint, 2, 'Sits wherever gravity feels like sitting today.'),
  crafted('sugar-comet', 'Sugar Comet', '🐱', PALETTE.pink, 2, 'Leaves a fizzing trail of candy dust.'),
  crafted('oracle-whisker', 'Oracle Whisker', '🐈', PALETTE.yellow, 2, 'Twice as wise, twice as floofy.'),
]

export const ALL_ITEMS: Item[] = [...STARTERS, ...CRAFTED]

export const RECIPES: Recipe[] = [
  // Tier 1 (starter pairs)
  { inputs: ['orange-tabby', 'wizard-cap'], output: 'cosmo-whiskers', rarity: 'Cosmic', tier: 1, flavor: 'A wizard hat points a tabby toward the stars.' },
  { inputs: ['orange-tabby', 'moon'], output: 'nightprowl', rarity: 'Rare', tier: 1, flavor: 'The moon teaches a sunny kitty to roam at night.' },
  { inputs: ['orange-tabby', 'storm'], output: 'thunderpaws', rarity: 'Rare', tier: 1, flavor: 'A storm gives those paws a little extra bounce.' },
  { inputs: ['orange-tabby', 'candy'], output: 'sugar-rush', rarity: 'Common', tier: 1, flavor: 'A tabby discovers the zoomies in candy form.' },
  { inputs: ['orange-tabby', 'glitch'], output: 'pixel-pouncer', rarity: 'Cosmic', tier: 1, flavor: 'A glitch teaches a tabby to bend the screen.' },
  { inputs: ['orange-tabby', 'static'], output: 'spark-whisker', rarity: 'Rare', tier: 1, flavor: 'Static turns a whisker into a tiny antenna.' },
  { inputs: ['orange-tabby', 'star'], output: 'star-pouncer', rarity: 'Cosmic', tier: 1, flavor: 'A star gives a tabby a heroic landing.' },
  { inputs: ['orange-tabby', 'fish-treat'], output: 'sushi-paws', rarity: 'Rare', tier: 1, flavor: 'A fish treat inspires culinary greatness.' },
  { inputs: ['wizard-cap', 'moon'], output: 'moon-magician', rarity: 'Mythic', tier: 1, flavor: 'A cap and a moon open the softest spellbook.' },
  { inputs: ['wizard-cap', 'storm'], output: 'moss-mage', rarity: 'Cosmic', tier: 1, flavor: 'A storm waters a wizard cap into something wild.' },
  { inputs: ['wizard-cap', 'candy'], output: 'crumb-mage', rarity: 'Rare', tier: 1, flavor: 'Candy magic leaves a wizard covered in crumbs.' },
  { inputs: ['wizard-cap', 'glitch'], output: 'debug-wizard', rarity: 'Cosmic', tier: 1, flavor: 'A glitch upgrades the cap with impossible syntax.' },
  { inputs: ['wizard-cap', 'static'], output: 'voltage-wizard', rarity: 'Mythic', tier: 1, flavor: 'Static fills the cap with a bright new charge.' },
  { inputs: ['wizard-cap', 'star'], output: 'nova-neko', rarity: 'Mythic', tier: 1, flavor: 'A star crowns the wizard with cosmic confidence.' },
  { inputs: ['mint', 'moon'], output: 'moon-sprout', rarity: 'Rare', tier: 1, flavor: 'Mint and moon make a garden for night owls.' },
  { inputs: ['mint', 'storm'], output: 'rainroot', rarity: 'Common', tier: 1, flavor: 'A storm gives mint a very determined root system.' },
  { inputs: ['mint', 'candy'], output: 'gumdrop-garden', rarity: 'Common', tier: 1, flavor: 'Candy makes the garden wonderfully chewable.' },
  { inputs: ['mint', 'glitch'], output: 'neon-whisker', rarity: 'Cosmic', tier: 1, flavor: 'A glitch adds a bright new channel to the mint.' },
  { inputs: ['moon', 'storm'], output: 'eclipse-cat', rarity: 'Mythic', tier: 1, flavor: 'Storm and moon briefly cover the whole sky.' },
  { inputs: ['candy', 'glitch'], output: 'jelly-jumper', rarity: 'Rare', tier: 1, flavor: 'Candy and glitch make a delightfully wobbly kitty.' },
  // Tier 2 (crafted ingredients combine further — the "infinite" feel)
  { inputs: ['thunderpaws', 'star'], output: 'storm-superstar', rarity: 'Mythic', tier: 2, flavor: 'Thunderpaws catches a star and becomes legendary.' },
  { inputs: ['nightprowl', 'static'], output: 'midnight-radio', rarity: 'Cosmic', tier: 2, flavor: 'Nightprowl finds a late-night signal.' },
  { inputs: ['nightprowl', 'candy'], output: 'moonlit-taffy', rarity: 'Rare', tier: 2, flavor: 'Nightprowl gets delightfully stuck in candy.' },
  { inputs: ['neon-whisker', 'star'], output: 'aurora-prism', rarity: 'Cosmic', tier: 2, flavor: 'Neon whisker bends a starlight into a rainbow.' },
  { inputs: ['eclipse-cat', 'star'], output: 'gravity-kitten', rarity: 'Mythic', tier: 2, flavor: 'Eclipse bends the light, and the floor follows.' },
  { inputs: ['sugar-rush', 'star'], output: 'sugar-comet', rarity: 'Cosmic', tier: 2, flavor: 'Sugar rush meets a tailwind made of wishes.' },
  { inputs: ['debug-wizard', 'nova-neko'], output: 'oracle-whisker', rarity: 'Mythic', tier: 2, flavor: 'Two wise wizards become twice as floofy.' },
]

// ---------- deterministic synthesis ----------

export const recipeKey = (a: string, b: string): [string, string] => (a < b ? [a, b] : [b, a])
export const pairKey = (a: string, b: string) => recipeKey(a, b).join('|')

export function hash(value: string): number {
  let total = 17
  for (const ch of value) total = (Math.imul(total, 31) + ch.charCodeAt(0)) >>> 0
  return total
}

const RECIPE_MAP = new Map<string, Recipe>(RECIPES.map((recipe) => [pairKey(recipe.inputs[0], recipe.inputs[1]), recipe]))

const NAME_A = ['Neon', 'Velvet', 'Pocket', 'Moonlit', 'Turbo', 'Mellow', 'Cosmic', 'Jelly', 'Static', 'Lucky']
const NAME_B = ['Whisker', 'Pouncer', 'Sprout', 'Comet', 'Bean', 'Paws', 'Noodle', 'Mittens', 'Biscuit', 'Blink']
const EMOJI_POOL = ['🐱', '🐈', '🐾']
const RARITY_POOL: Rarity[] = ['Common', 'Common', 'Common', 'Rare', 'Rare', 'Cosmic', 'Mythic']

export const titleCase = (id: string) =>
  id.split('-').map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part)).join(' ')

export const itemById = (id: string): Item =>
  ALL_ITEMS.find((entry) => entry.id === id) ?? fallbackItem(id)

const fallbackItem = (id: string): Item => ({
  id,
  name: titleCase(id),
  emoji: '🐾',
  color: PALETTE.mint,
  tier: 1,
  description: 'A mysterious friend from somewhere unexpected.',
})

// Fallback result is deterministic per pair: same inputs, same kitty, forever.
export function fallbackRecipe(a: string, b: string): Recipe {
  const seed = hash(pairKey(a, b))
  const inputs = recipeKey(a, b)
  const name = `${NAME_A[seed % NAME_A.length]} ${NAME_B[(seed >>> 3) % NAME_B.length]}`
  const id = `wild-${seed.toString(36)}`
  return {
    inputs,
    output: id,
    rarity: RARITY_POOL[seed % RARITY_POOL.length],
    tier: 1,
    flavor: `A surprise synthesis where ${titleCase(inputs[0]).toLowerCase()} meets ${titleCase(inputs[1]).toLowerCase()}.`,
  }
}

// Preregister every fallback in the item table so names stay stable.
const FALLBACK_CACHE = new Map<string, Recipe>()
const ensureFallback = (a: string, b: string): Recipe => {
  const key = pairKey(a, b)
  let recipe = FALLBACK_CACHE.get(key)
  if (!recipe) {
    recipe = fallbackRecipe(a, b)
    FALLBACK_CACHE.set(key, recipe)
  }
  return recipe
}

export function getRecipe(a: string, b: string): Recipe {
  if (a === b) return ensureFallback(a, b)
  return RECIPE_MAP.get(pairKey(a, b)) ?? ensureFallback(a, b)
}

// Materialize the full item for a recipe output, including wild fallbacks.
export function resolveOutput(recipe: Recipe): Item {
  const known = ALL_ITEMS.find((entry) => entry.id === recipe.output)
  if (known) return known
  const [a, b] = recipe.inputs
  const seed = hash(pairKey(a, b))
  return {
    id: recipe.output,
    name: `${NAME_A[seed % NAME_A.length]} ${NAME_B[(seed >>> 3) % NAME_B.length]}`,
    emoji: EMOJI_POOL[seed % EMOJI_POOL.length],
    color: [PALETTE.pink, PALETTE.mint, PALETTE.yellow][seed % 3],
    tier: 1,
    description: 'A one-of-a-kind friend conjured by pure curiosity.',
  }
}

// ---------- codex hints ----------

// A hint is a pair whose ingredients the player owns, whose output is
// explicitly authored, and which has not been discovered yet. Outputs are
// never shown — just a locked silhouette inviting the experiment.
export function computeHints(owned: Set<string>, discoveredOutputs: Set<string>): Recipe[] {
  const hints: Recipe[] = []
  const seen = new Set<string>()
  for (const recipe of RECIPES) {
    const key = pairKey(recipe.inputs[0], recipe.inputs[1])
    if (seen.has(key)) continue
    if (discoveredOutputs.has(recipe.output)) continue
    if (!owned.has(recipe.inputs[0]) || !owned.has(recipe.inputs[1])) continue
    seen.add(key)
    hints.push(recipe)
  }
  return hints.slice(0, 6)
}
