# Design system — kittycats.cc

Derived from the shipped code, not from intentions. Every value below is in
`app/globals.css` or the component that consumes it; if this file and the code
disagree, the code is right.

## The world: dark ink

Solid faces, hard outlines, hard offset shadows, **zero blur, ever**. The
ground is near-black (`#0b0c10`) and pastel faces read as stickers lit against
it — the whole page is one dark room with a few bright objects in it.

Two rules fall out of that, and breaking either is what makes it look generic:

1. **Shadows are `--shadow` (#050609), never `--ink`.** `--ink` is now *the
   same value as* `--background` (#0b0c10), so an ink shadow on the ground
   renders as nothing at all.
2. **Borders on dark surfaces are `--edge` (white at 11%), never `--ink`.**
   Ink borders on a dark panel vanish for the same reason.

Ink borders are correct only on pastel faces.

## Colour tokens

All of these live in `:root` in `app/globals.css`.

| Token | Value | Use |
|---|---|---|
| `--background` | `#0b0c10` | page background |
| `--foreground` | `#edf1f4` | body text |
| `--card` / `--surface` | `#12151d` | panels, cards, the pet console |
| `--surface-2` | `#181c26` | nested wells, secondary buttons |
| `--edge` / `--border` | `rgba(255,255,255,.11)` | **every** border on a dark surface |
| `--input` | `rgba(255,255,255,.14)` | form borders |
| `--ink` | `#0b0c10` | borders + text **on pastel faces only** |
| `--shadow` | `#050609` | **every** hard offset shadow |
| `--muted` | `#181c26` | muted fills |
| `--muted-foreground` | `#8c96a8` | secondary text |
| `--primary` | `#b9a7ff` | brand accent in prose (`experiments,`, `.cc`) |
| `--accent` | `#8ff0d0` | eyebrows, live dot, the one loud CTA |
| `--accent-foreground` | `#0b0c10` | text **on** `--accent` |
| `--primary-foreground` | `#0b0c10` | text **on** `--primary` |
| `--ring` | `#b9a7ff` | focus ring token |

**Contrast rule, and it is the one that bites:** any text on `bg-accent` or
`bg-primary` is `text-accent-foreground` / `text-primary-foreground` — both
`#0b0c10` — **never** `text-foreground`. `#edf1f4` on `#8ff0d0` is 1.19:1 and
is invisible; `#0b0c10` on `#8ff0d0` is 14.47:1. This applies to the Adopt
button and the "Pet Adopted!" toast, the two places it has been got wrong.

## Pastels

`--pastel-lavender #b9a7ff`, `--pastel-periwinkle #a7c7ff`,
`--pastel-coral #ff9eaa`, `--pastel-mint #8ff0d0`, `--pastel-pink #f3a8d2`,
`--pastel-peach #ffc38c`. Always ink-on-pastel, never the reverse.

They are used as icon colours, status dots, and the play button. `--primary`
and `--accent` are the same lavender and mint by design — the pastels are the
palette, `--primary`/`--accent` are the two that earn a role.

**There is exactly one copy of this palette, and it is in `globals.css`.**
`config/site.ts` references the tokens (`'var(--pastel-mint)'`) rather than
repeating hex. A second copy is how the last palette refresh ended up
half-applied across eight files.

## Typography

Two faces, no third. Fredoka (`--font-sans`) for everything readable;
Silkscreen (`--font-pixel`) for headings, names, and labels — never for body
copy, it is unreadable in paragraphs. `--font-mono` is the system mono stack,
used for eyebrows, section numbers, and nav.

| Role | Classes |
|---|---|
| Hero heading | `font-pixel text-4xl sm:text-6xl lg:text-7xl leading-[1.12]` |
| Section heading | `font-pixel text-2xl sm:text-3xl` |
| Card title | `font-pixel text-sm`–`text-xl` |
| Eyebrow | `font-mono text-[11px] font-bold uppercase tracking-[.24em] text-accent` |
| Body | `text-[15px] leading-relaxed` |
| Meta / secondary | `text-[13px]` |
| Chip / tag | `text-[11px] font-bold` |

**11px is the floor.** Nothing renders smaller — `text-[10px]` and below is
below the legible floor at these tracking values.

Body copy caps at `max-w-[52ch]`–`[62ch]`.

## Spacing and radius

Sections stack at `mt-28` (contact at `mt-20`, hero header `mb-20`). The page
shell is `mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16`, and each section is
headed by `SectionIntro` — eyebrow, pixel title, one-line detail, and an
`NN / 04` counter that is `hidden` below `sm`.

Radius derives from the scale in `@theme inline`: `rounded-lg` 1rem,
`rounded-xl` 1.25rem, `rounded-2xl` 1.5rem, `rounded-3xl` 2rem. Buttons and
repo cards are `rounded-2xl`; the profile card, pet console, and audio player
are `rounded-3xl`.

## Depth

The only depth device is a hard offset shadow — no blur, no soft shadow, no
translucency.

- Profile card, featured project, pet console, audio player: `6px 6px 0 0 var(--shadow)`
- Buttons, contact chip: `4px 4px 0 0 var(--shadow)`
- Small chips, toasts, tooltips: `2px 2px 0 0 var(--shadow)`
- Repo cards: no shadow at rest

Inside the profile card, children lift toward the viewer with `translateZ`
(36px header, 28px bio/actions, 24px presence row) under
`transform-style: preserve-3d` and a 1000px perspective on the parent.

## Surfaces

Panels are flat fills, not glass: `background: rgba(255,255,255,.035)` over
the ground, or `var(--surface)` where a card needs to sit above it. The two
gradients in the system are deliberate:

- **Page background** — a lavender radial glow at `50% -10%` fading at 38%,
  over a `#0b0c10 → #0d1016` vertical wash. Set on `body`.
- **Featured project** — `linear-gradient(135deg, rgba(185,167,255,.16), rgba(255,255,255,.035))`.

Card hover glow is a `color-mix()` of the card's own accent, written to
`--card-glow` by `card.tsx` — not a hex concatenation, so `config/site.ts` can
hold `var(--pastel-*)` and still get a 33% tint.

`overflow-x: clip`, not `hidden`, on `html`/`body` — it contains the 3D-tilt
overhang without creating a scroll container, so `position: sticky` still
works. The deck marquee fades at both ends with a `mask-image` gradient rather
than two opaque overlays, so it needs no colour token and works over the page
gradient.

## Micro-interactions

- **Press response** is a translate, not a scale: `hover:-translate-x-0.5
  hover:-translate-y-0.5`, `duration-150`, returning to `0` on `:active`.
  Buttons never shrink.
- **Hover sfx** — `playTick()` on card enter, `playClick()` on press, both
  gated on `isMuted()`. Effects ride the sfx bus, so they never move the
  visualizer.
- **Card tilt** — gsap `power2.out` in, `power3.out` spring back at 0.4s.
  Profile card `max: 8, lift: 16`; deck cards take the hook defaults
  `max: 12, lift: 8`. Disabled entirely under reduced motion.
- **Sheen** — cursor-tracked radial gradient, `rgba(255,255,255,0.12)` to
  transparent at 55%, opacity 0→100 on hover. A gradient, not a blur. The
  tilt hook writes `--sheen-x` / `--sheen-y` so there is one listener.
- **Ambient loops** — deck marquee 34s linear (paused on hover/focus-within),
  `reel-spin` 1.4s, `ring-spin` 12s, `animate-pet-bounce` 2.8s ease-in-out.
  Ambient motion is slow enough to read as breathing, not as a loading spinner.
  The audio title only marquees when it actually overflows.

## Accessibility floor

- `*:focus-visible` → `2px solid var(--accent)`, `outline-offset: 3px`.
- `prefers-reduced-motion: reduce` stops the ambient loops (`lab-deck-track`,
  `reel-spin`, `ring-spin`, `animate-pet-bounce`) and makes the deck
  horizontally scrollable so nothing becomes unreachable — **transitions are
  left alone**, because a blanket `0.01ms` kill also removes the hover and
  press feedback that tells you a control is live.
- The native cursor is hidden only under `@media (pointer: fine)` **and** only
  once `PawCursor` has mounted a replacement and put `.paw-cursor-on` on
  `<html>`. No-JS and reduced-motion visitors keep a real pointer.
- Status is never colour-only — every dot carries `aria-label`.
- Range inputs stay native (`accent-color`) so keyboard and screen-reader
  behaviour is free.

## Editing rules

- **One palette.** Tokens in `globals.css`, references everywhere else.
- **Copy and links live in `config/site.ts`.** Components read from it and
  never hardcode text or URLs.
- **`var()` does not resolve in SVG presentation attributes.** `pixel-pet.tsx`
  keeps hex literals in `fill` / `stroke` for exactly this reason — that is
  the one place a literal colour is correct.
- **Cat fur is content, not tokens.** `FUR_COLORS` in `pixel-pet.tsx` is what
  the visitor picks from, so it is allowed its own colours.
