# Design system — kittycats.cc

Derived from the shipped code, not from intentions. Every value below is in
`app/globals.css` or the component that consumes it; if this file and the code
disagree, the code is right.

## The world: dark ink

Solid faces, hard 4px outlines, hard offset shadows, **zero blur, ever**. The
ground is deep indigo and the outline inverts to pale lavender on dark panels —
a `#2f2a44` line on a `#1f1a3a` panel carries no edge. Pastel faces keep their
ink outline and ink text, so they read as stickers lit against the dark.

Two rules fall out of that, and breaking either is what makes it look generic:

1. **Shadows are `--shadow` (#0b0918), never `--ink`.** `--ink` (#2f2a44) is
   *lighter* than the ground, so an ink shadow reads as a glow.
2. **Borders on dark surfaces are `--edge` (#4a3f7a), never `--ink`.** Ink
   borders on a dark panel vanish.

Ink borders are correct only on pastel faces.

## Colour tokens

| Token | Value | Use |
|---|---|---|
| `--ground` | `#16132b` | page background |
| `--surface` | `#1f1a3a` | cards, panels |
| `--surface-2` | `#262047` | nested wells, inputs, secondary buttons |
| `--edge` | `#4a3f7a` | borders on dark surfaces |
| `--ink` | `#2f2a44` | borders + text **on pastel faces only** |
| `--shadow` | `#0b0918` | all hard offset shadows |
| `--glow` | `#ffc4e1` | ambient halo |
| `--foreground` | `#f3f0ff` | body text |
| `--muted-foreground` | `#a99ecf` | secondary text |

Pastel faces — `--pastel-lavender #d7c9ff`, `--pastel-periwinkle #c4d4ff`,
`--pastel-coral #ffd0d0`, `--pastel-mint #bdecd0`, `--pastel-pink #ffc4e1`,
`--pastel-peach #ffd7b0`. Always ink-on-pastel, never the reverse.

Background is a 20px radial dot grid (`#2e2752`) over the ground.

## Typography

Two faces, no third. Fredoka (`--font-sans`) for everything readable;
Silkscreen (`--font-pixel`) for headings, names, and labels — never for body
copy, it is unreadable in paragraphs.

| Role | Classes |
|---|---|
| Hero heading | `font-pixel text-2xl sm:text-3xl md:text-4xl` |
| Section heading | `font-pixel text-xl sm:text-2xl` |
| Card title | `font-pixel text-sm`–`text-xl` |
| Body | `text-[15px] leading-relaxed` |
| Meta / secondary | `text-[13px]` |
| Chip label | `text-[11px] font-bold uppercase tracking-[0.12em]` |
| Tag | `text-[11px] font-bold` |

Body copy caps at `max-w-[52ch]`–`[62ch]`. Prose uses `text-pretty`.

## Spacing and radius

Sections stack at `mt-16` (`mt-12` for the Lab Deck, `mt-20` after the card),
each `flex flex-col items-center gap-5`. Content widths: `max-w-lg` for the
profile card, `max-w-4xl` for grids, `max-w-3xl` for contact.

Card padding `p-6 sm:p-7` (featured), `p-7 sm:p-8` (profile). Grid gap `gap-5`.

Radius derives from `--radius: 1rem`: `rounded-2xl` for buttons and repo cards,
`rounded-3xl` for the profile card and featured project.

## Depth

The only depth device is a hard offset shadow — no blur, no soft shadow, no
translucency.

- Profile card + featured project: `6px 6px 0 0 var(--shadow)`
- Buttons + repo cards: `4px 4px 0 0 var(--shadow)`

Inside the profile card, children lift toward the viewer with `translateZ`
(36px header, 28px bio/actions, 24px presence row) under
`transform-style: preserve-3d` and a 1000px perspective on the parent.

## Micro-interactions

- **Press response** is a translate, not a scale: `hover:-translate-x-0.5
  hover:-translate-y-0.5`, `duration-150`, returning to `0` on `:active`.
  Buttons never shrink.
- **Hover sfx** — `playTick()` on card enter, `playClick()` on button press,
  both gated on `isMuted()`. Effects ride the sfx bus, so they never move the
  visualizer.
- **Card tilt** — max 8°, 16px lift, gsap `power3.out`, spring reset on leave.
- **Sheen** — cursor-tracked radial gradient, `rgba(255,255,255,0.12)` to
  transparent at 55%, opacity 0→100 on hover. A gradient, not a blur.
- **Ambient loops** — `reel-spin` (9s halo, 1.4s reels), `cat-breathe` (3.5s),
  `card-float` (3.5s), marquee 12s linear. Ambient motion is slow enough to read
  as breathing, not as a loading spinner.

## Accessibility floor

- `*:focus-visible` → `3px solid var(--accent)` with `2px` offset.
- `prefers-reduced-motion: reduce` kills `blink`, `cat-breathe`, `pet-bounce`,
  `card-float`, `ring-spin`; the marquee slows rather than freezing.
- The native cursor is hidden only under `@media (pointer: fine)`.
- Status is never colour-only — every dot carries `aria-label`.
- Range inputs stay native (`accent-color`) so keyboard and screen-reader
  behaviour is free.
