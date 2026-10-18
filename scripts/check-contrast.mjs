#!/usr/bin/env node
/**
 * WCAG AA check on the declared token pairs.
 *
 * This exists because the site shipped its primary CTA as `text-foreground` on
 * `bg-accent` — #edf1f4 on #8ff0d0, 1.19:1, invisible. The tokens were all
 * correct; the pairing was wrong. Nothing in the build catches that, so this
 * does. Run with `npm run check:contrast`.
 *
 * Tokens are read from app/globals.css, so it fails when the palette drifts —
 * not when this file goes stale.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'app', 'globals.css'),
  'utf8',
)

/** Every `--token: #hex;` inside the `:root { … }` block. */
function readTokens(source) {
  const root = source.match(/:root\s*\{([\s\S]*?)\n\}/)
  if (!root) throw new Error('no `:root` block in globals.css')
  const tokens = {}
  for (const [, name, value] of root[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{3,8})\s*;/gi)) {
    tokens[name] = value.toLowerCase()
  }
  return tokens
}

/** '#abc' | '#aabbcc' -> [r, g, b] 0-255. Alpha-carrying hex is rejected. */
function rgb(hex) {
  const h = hex.slice(1)
  const full = h.length <= 4 ? [...h].map((c) => c + c).join('') : h
  if (full.length !== 6) throw new Error(`not an opaque colour: ${hex}`)
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
}

/** WCAG 2.x relative luminance. */
function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function contrast(a, b) {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// [foreground, background, minimum, why]
const PAIRS = [
  ['--foreground', '--background', 4.5, 'body copy on the page'],
  ['--foreground', '--surface', 4.5, 'body copy on a panel'],
  ['--foreground', '--surface-2', 4.5, 'body copy on a well'],
  ['--foreground', '--card', 4.5, 'body copy on a card'],
  ['--muted-foreground', '--background', 4.5, 'secondary copy on the page'],
  ['--muted-foreground', '--surface', 4.5, 'secondary copy on a panel'],
  ['--muted-foreground', '--surface-2', 4.5, 'secondary copy on a well'],
  ['--accent', '--background', 4.5, 'eyebrows and the live dot'],
  ['--primary', '--background', 4.5, 'brand accent in prose'],
  // The P0. Text on a filled control uses the *-foreground token, never
  // --foreground — this pair is what makes that rule load-bearing.
  ['--accent-foreground', '--accent', 4.5, 'text on the Adopt button'],
  ['--primary-foreground', '--primary', 4.5, 'text on a primary fill'],
  // Ink on pastel faces.
  ['--ink', '--pastel-lavender', 4.5, 'ink on lavender'],
  ['--ink', '--pastel-periwinkle', 4.5, 'ink on periwinkle'],
  ['--ink', '--pastel-coral', 4.5, 'ink on coral'],
  ['--ink', '--pastel-mint', 4.5, 'ink on mint'],
  ['--ink', '--pastel-pink', 4.5, 'ink on pink'],
  ['--ink', '--pastel-peach', 4.5, 'ink on peach'],
]

const tokens = readTokens(css)
let failed = 0

for (const [fg, bg, min, why] of PAIRS) {
  if (!tokens[fg] || !tokens[bg]) {
    console.error(`MISSING  ${fg} on ${bg} — token not found in globals.css`)
    failed++
    continue
  }
  const ratio = contrast(tokens[fg], tokens[bg])
  const ok = ratio >= min
  if (!ok) failed++
  console.log(
    `${ok ? 'ok  ' : 'FAIL'}  ${ratio.toFixed(2).padStart(6)}:1  (min ${min})  ${fg} on ${bg}  — ${why}`,
  )
}

// Guard the trap itself: --foreground must never be usable on --accent.
const trap = contrast(tokens['--foreground'], tokens['--accent'])
if (trap >= 4.5) {
  console.error(
    `FAIL  --foreground on --accent now passes (${trap.toFixed(2)}:1). The two tokens have` +
      ` collapsed — check that --accent is still a pastel face and not a dark one.`,
  )
  failed++
}

console.log(
  failed
    ? `\n${failed} contrast pair(s) below AA.`
    : `\nAll ${PAIRS.length} pairs pass AA; --foreground/--accent trap intact (${trap.toFixed(2)}:1).`,
)
process.exit(failed ? 1 : 0)
