import type { CSSProperties } from 'react'

export type FurColor = {
  id: string
  label: string
  body: string
  belly: string
}

export const FUR_COLORS: FurColor[] = [
  { id: 'pink', label: 'Pastel Pink', body: '#ffc4e1', belly: '#ffd9ec' },
  { id: 'orange', label: 'Orange Tabby', body: '#ffb877', belly: '#ffd6b0' },
  { id: 'black', label: 'Midnight', body: '#5b5470', belly: '#7a7290' },
  { id: 'calico', label: 'Calico', body: '#ffd0a8', belly: '#ffe8d4' },
  { id: 'mint', label: 'Mint', body: '#bdecd0', belly: '#d6f5e3' },
]

export type Expression = 'happy' | 'sleepy' | 'glasses' | 'wink'

export type Accessory =
  | 'bowtie'
  | 'partyHat'
  | 'wizardCap'
  | 'glasses'
  | 'heartAura'
  | 'fishTreat'
  | 'catnipBall'

const INK = '#2f2a44'

// Grid is 16 wide × 18 tall. Rows 0-1 reserved for hats (padding).
// Cat occupies rows 2-17. Center column = x 8.
//
// Legend: '#' = body, '.' = empty
const GRID = [
  '................', // 0  (hat padding)
  '................', // 1  (hat padding)
  '....##....##....', // 2  ear tips
  '...####..####...', // 3  ear outer
  '...####..####...', // 4  ears
  '..############..', // 5  head top
  '..############..', // 6  head
  '..############..', // 7  eye row
  '..############..', // 8  head
  '..####....####..', // 9  cheeks (whisker area)
  '..############..', // 10 chin/neck
  '.##############.', // 11 body widens
  '################', // 12 body
  '################', // 13 body
  '################', // 14 body
  '.##############.', // 15 body narrows
  '..#..######..#..', // 16 front paws
  '..##..####..##..', // 17 paws bottom
]

const CELL = 7
const W = 16
const H = 18

function isBody(x: number, y: number) {
  return GRID[y]?.[x] === '#'
}

// Belly/chest — lighter color in the center of the body.
function isBelly(x: number, y: number) {
  return isBody(x, y) && y >= 11 && y <= 15 && x >= 5 && x <= 10
}

// Calico patches.
const CALICO_PATCHES: Array<[number, number]> = [
  [4, 5],
  [5, 5],
  [4, 6],
  [11, 6],
  [11, 7],
  [12, 7],
  [4, 12],
  [3, 13],
  [12, 14],
]

// Whiskers — thin lines extending outward from cheeks (row 9).
const WHISKERS: Array<[number, number]> = [
  [0, 8],
  [1, 8],
  [2, 8],
  [0, 10],
  [1, 10],
  [13, 8],
  [14, 8],
  [15, 8],
  [14, 10],
  [15, 10],
]

// Curled tail — peeks out on the right side, behind body.
const TAIL: Array<[number, number]> = [
  [14, 13],
  [15, 13],
  [15, 14],
  [15, 15],
  [14, 15],
  [13, 15],
]

export function PixelPet({
  fur,
  expression,
  accessories,
  className,
  style,
}: {
  fur: FurColor
  expression: Expression
  accessories: Set<Accessory>
  className?: string
  style?: CSSProperties
}) {
  const outline: Array<[number, number]> = []
  const fill: Array<[number, number]> = []
  const belly: Array<[number, number]> = []

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!isBody(x, y)) continue
      const edge =
        !isBody(x - 1, y) ||
        !isBody(x + 1, y) ||
        !isBody(x, y - 1) ||
        !isBody(x, y + 1)
      if (edge) outline.push([x, y])
      else if (isBelly(x, y)) belly.push([x, y])
      else fill.push([x, y])
    }
  }

  const calico = fur.id === 'calico'

  // Eyes: [x, y, w, h] — positioned on row 7
  let eyes: Array<[number, number, number, number]> = []
  if (expression === 'happy') {
    eyes = [
      [5, 7, 1, 1],
      [10, 7, 1, 1],
    ]
  } else if (expression === 'sleepy') {
    eyes = [
      [5, 7, 2, 1],
      [9, 7, 2, 1],
    ]
  } else if (expression === 'wink') {
    eyes = [
      [5, 7, 1, 1],
      [9, 7, 2, 1],
    ]
  } else if (expression === 'glasses') {
    eyes = [
      [5, 7, 1, 1],
      [10, 7, 1, 1],
    ]
  }

  // 'w' cat mouth — three pixels at row 9, center
  const mouth: Array<[number, number]> = [
    [6, 9],
    [8, 9],
    [10, 9],
  ]

  // Pink button nose — row 8, center
  const nose: Array<[number, number]> = [[7, 8], [8, 8]]

  return (
    <svg
      viewBox={`0 0 ${W * CELL} ${H * CELL}`}
      className={className}
      style={{ shapeRendering: 'crispEdges', ...style }}
      role="img"
      aria-label="A pixel-art kitty pet"
    >
      {/* Layer 1: Heart aura (behind everything) */}
      {accessories.has('heartAura') && <HeartAura />}

      {/* Layer 2: Tail (behind body) */}
      {TAIL.map(([x, y], i) => (
        <rect
          key={`tail-${i}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={fur.body}
        />
      ))}
      {TAIL.map(([x, y], i) => (
        <rect
          key={`tail-o-${i}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={INK}
          opacity={0.85}
        />
      ))}

      {/* Layer 3: Body fill */}
      {fill.map(([x, y]) => (
        <rect
          key={`f-${x}-${y}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={fur.body}
        />
      ))}
      {belly.map(([x, y]) => (
        <rect
          key={`b-${x}-${y}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={fur.belly}
        />
      ))}
      {/* Calico patches */}
      {calico &&
        CALICO_PATCHES.map(([x, y]) => (
          <rect
            key={`c-${x}-${y}`}
            x={x * CELL}
            y={y * CELL}
            width={CELL}
            height={CELL}
            fill={INK}
            opacity={0.3}
          />
        ))}
      {/* Body outline */}
      {outline.map(([x, y]) => (
        <rect
          key={`o-${x}-${y}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={INK}
        />
      ))}

      {/* Layer 4: Inner ear pink */}
      <rect x={4 * CELL} y={4 * CELL} width={CELL} height={CELL} fill="#ff9ecb" />
      <rect x={11 * CELL} y={4 * CELL} width={CELL} height={CELL} fill="#ff9ecb" />

      {/* Layer 5: Whiskers */}
      {WHISKERS.map(([x, y], i) => (
        <rect
          key={`w-${i}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={INK}
          opacity={0.6}
        />
      ))}

      {/* Layer 6: Face */}
      {eyes.map(([x, y, w, h], i) => (
        <rect
          key={`e-${i}`}
          x={x * CELL}
          y={y * CELL}
          width={w * CELL}
          height={h * CELL}
          fill={INK}
        />
      ))}
      {nose.map(([x, y]) => (
        <rect
          key={`n-${x}-${y}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill="#ff7aa8"
        />
      ))}
      {mouth.map(([x, y]) => (
        <rect
          key={`m-${x}-${y}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={INK}
        />
      ))}

      {/* Layer 7: Accessories */}
      {accessories.has('glasses') && <Glasses />}
      {accessories.has('bowtie') && <Bowtie />}
      {accessories.has('partyHat') && <PartyHat />}
      {accessories.has('wizardCap') && <WizardCap />}
      {accessories.has('fishTreat') && <FishTreat />}
      {accessories.has('catnipBall') && <CatnipBall />}
    </svg>
  )
}

// Glasses: aligned over eye row (row 7), lenses span the eyes.
function Glasses() {
  return (
    <g>
      <rect x={4 * CELL} y={7 * CELL - 1} width={3 * CELL} height={2 * CELL + 2} fill="none" stroke={INK} strokeWidth={2} />
      <rect x={4 * CELL} y={7 * CELL - 1} width={3 * CELL} height={CELL} fill="#b8e0ff" opacity={0.45} />
      <rect x={9 * CELL} y={7 * CELL - 1} width={3 * CELL} height={2 * CELL + 2} fill="none" stroke={INK} strokeWidth={2} />
      <rect x={9 * CELL} y={7 * CELL - 1} width={3 * CELL} height={CELL} fill="#b8e0ff" opacity={0.45} />
      <rect x={7 * CELL} y={7 * CELL} width={2 * CELL} height={CELL} fill={INK} />
    </g>
  )
}

// Bowtie: sits right below the chin (row 10), between the front paws.
function Bowtie() {
  return (
    <g>
      <rect x={5 * CELL} y={10 * CELL} width={2 * CELL} height={2 * CELL} fill="#ff6f91" />
      <rect x={9 * CELL} y={10 * CELL} width={2 * CELL} height={2 * CELL} fill="#ff6f91" />
      <rect x={7 * CELL} y={10 * CELL} width={2 * CELL} height={2 * CELL} fill="#ff6f91" />
      <rect x={7 * CELL} y={10 * CELL} width={2 * CELL} height={2 * CELL} fill={INK} opacity={0.35} />
    </g>
  )
}

// Party Hat: sits ON TOP of the head, between the ears (rows 0-4).
function PartyHat() {
  return (
    <g>
      <polygon
        points={`${8 * CELL},${0} ${5 * CELL},${4 * CELL} ${11 * CELL},${4 * CELL}`}
        fill="#ffd166"
        stroke={INK}
        strokeWidth={2}
      />
      <rect x={5 * CELL} y={3 * CELL} width={6 * CELL} height={CELL} fill="#ff6f91" />
      <rect x={5 * CELL} y={3 * CELL} width={6 * CELL} height={CELL} fill="none" stroke={INK} strokeWidth={1.5} />
      <rect x={7 * CELL} y={0} width={2 * CELL} height={CELL} fill="#fff" stroke={INK} strokeWidth={1} />
    </g>
  )
}

// Wizard Cap: sits ON TOP of the head, between the ears (rows 0-4).
function WizardCap() {
  return (
    <g>
      <polygon
        points={`${8 * CELL},${0} ${5 * CELL},${4 * CELL} ${11 * CELL},${4 * CELL}`}
        fill="#7b68c4"
        stroke={INK}
        strokeWidth={2}
      />
      <rect x={4 * CELL} y={4 * CELL} width={8 * CELL} height={CELL} fill={INK} />
      <rect x={7 * CELL} y={2 * CELL} width={CELL} height={CELL} fill="#ffd700" />
      <rect x={9 * CELL} y={1 * CELL} width={CELL} height={CELL} fill="#ffd700" />
    </g>
  )
}

// Fish Treat: a tiny pixel fish floating to the left of the cat.
function FishTreat() {
  return (
    <g transform={`translate(${0}, ${13 * CELL})`}>
      {/* Fish body */}
      <rect x={0} y={CELL} width={3 * CELL} height={CELL} fill="#7ec8e3" />
      <rect x={CELL} y={0} width={CELL} height={CELL} fill="#7ec8e3" />
      <rect x={CELL} y={2 * CELL} width={CELL} height={CELL} fill="#7ec8e3" />
      {/* Tail */}
      <rect x={3 * CELL} y={0} width={CELL} height={CELL} fill="#7ec8e3" />
      <rect x={3 * CELL} y={2 * CELL} width={CELL} height={CELL} fill="#7ec8e3" />
      {/* Eye */}
      <rect x={0} y={CELL} width={CELL} height={CELL} fill={INK} opacity={0.7} />
      {/* Outline */}
      <rect x={0} y={CELL} width={1} height={CELL} fill={INK} opacity={0.5} />
    </g>
  )
}

// Catnip Ball: a little green ball with a leaf, floating to the right.
function CatnipBall() {
  return (
    <g transform={`translate(${13 * CELL}, ${12 * CELL})`}>
      {/* Ball */}
      <rect x={0} y={CELL} width={2 * CELL} height={2 * CELL} fill="#bdecd0" />
      <rect x={0} y={CELL} width={2 * CELL} height={2 * CELL} fill="none" stroke={INK} strokeWidth={1.5} />
      {/* Leaf */}
      <rect x={CELL} y={0} width={CELL} height={CELL} fill="#7fc99a" />
      <rect x={CELL} y={0} width={CELL} height={CELL} fill="none" stroke={INK} strokeWidth={1} />
      {/* Sparkle */}
      <rect x={0} y={CELL} width={CELL} height={CELL} fill="#fff" opacity={0.4} />
    </g>
  )
}

// Heart Aura: rendered behind the cat, surrounding it with pixel hearts.
function HeartAura() {
  const hearts: Array<[number, number, string]> = [
    [0, 6, '#ff9ecb'],
    [14, 5, '#ffc4e1'],
    [-1, 11, '#ffb6d5'],
    [15, 12, '#ff9ecb'],
    [7, 0, '#ffd0e6'],
    [8, 16, '#ff9ecb'],
  ]
  return (
    <g className="animate-pulse">
      {hearts.map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x * CELL}, ${y * CELL})`}>
          <rect x={0} y={CELL} width={CELL} height={CELL} fill={c} />
          <rect x={CELL} y={0} width={CELL} height={CELL} fill={c} />
          <rect x={2 * CELL} y={CELL} width={CELL} height={CELL} fill={c} />
          <rect x={0} y={2 * CELL} width={3 * CELL} height={CELL} fill={c} />
          <rect x={CELL} y={3 * CELL} width={CELL} height={CELL} fill={c} />
        </g>
      ))}
    </g>
  )
}
