import { forwardRef, type CSSProperties } from 'react'

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

export type Expression = 'happy' | 'sleepy' | 'wink' | 'surprised'

export type Accessory =
  | 'bowtie'
  | 'partyHat'
  | 'wizardCap'
  | 'glasses'
  | 'heartAura'
  | 'fishTreat'
  | 'catnipBall'

const INK = '#2f2a44'

// 16 wide × 18 tall. Rows 0-1 reserved for hats. Cat occupies rows 2-17.
// Center column = x 8. Every row is exactly 16 chars.
const GRID = [
  '................', // 0  hat padding
  '................', // 1  hat padding
  '...##......##...', // 2  ear tips
  '..####....####..', // 3  ear outer
  '..####....####..', // 4  ears
  '..############..', // 5  head top
  '..############..', // 6  head
  '..############..', // 7  eye row
  '..############..', // 8  nose row
  '..############..', // 9  mouth row
  '..############..', // 10 chin/neck
  '.##############.', // 11 shoulders
  '.##############.', // 12 body
  '.##############.', // 13 body
  '.##############.', // 14 body
  '.##############.', // 15 lower body
  '..####....####..', // 16 front paws
  '..####....####..', // 17 paws bottom
]

const CELL = 12
const W = 16
const H = 18

function isBody(x: number, y: number) {
  return GRID[y]?.[x] === '#'
}

function isBelly(x: number, y: number) {
  return isBody(x, y) && y >= 11 && y <= 15 && x >= 5 && x <= 10
}

const CALICO_PATCHES: Array<[number, number]> = [
  [3, 5],
  [4, 5],
  [11, 5],
  [12, 5],
  [2, 12],
  [3, 12],
  [12, 13],
  [13, 13],
]

// Whiskers extending outward from cheeks at rows 8 and 10.
const WHISKERS: Array<[number, number]> = [
  [0, 8],
  [1, 8],
  [0, 10],
  [1, 10],
  [14, 8],
  [15, 8],
  [14, 10],
  [15, 10],
]

// Curled tail peeks out on the right side, behind the body.
const TAIL: Array<[number, number]> = [
  [14, 12],
  [15, 11],
  [15, 10],
  [15, 9],
  [14, 8],
]

export const PixelPet = forwardRef<SVGSVGElement, {
  fur: FurColor
  expression: Expression
  accessories: Set<Accessory>
  className?: string
  style?: CSSProperties
  onPetClick?: () => void
}>(function PixelPet({
  fur,
  expression,
  accessories,
  className,
  style,
  onPetClick,
}, ref) {
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

  // Nose: two pixels centered on row 8.
  const nose: Array<[number, number]> = [
    [7, 8],
    [8, 8],
  ]

  // 'w' cat mouth on rows 9-10.
  const mouth: Array<[number, number]> = [
    [6, 9],
    [7, 10],
    [8, 10],
    [9, 9],
  ]

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W * CELL} ${H * CELL}`}
      className={className}
      role="img"
      aria-label="A pixel-art kitty pet — click to pet it"
      onClick={onPetClick}
      style={{
        shapeRendering: 'crispEdges',
        imageRendering: 'pixelated',
        cursor: 'pointer',
        ...style,
      }}
    >
      {/* Layer 1: Heart aura (behind everything) */}
      {accessories.has('heartAura') && <HeartAura />}

      {/* Layer 2: Tail (behind body, solid fur color) */}
      <g id="pet-tail">
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
      {/* Tail outline only on exposed (non-body-adjacent) edges */}
      {TAIL.map(([x, y], i) => {
        const touchesBody = isBody(x - 1, y) || isBody(x, y - 1) || isBody(x, y + 1)
        if (touchesBody) return null
        return (
          <rect
            key={`tail-o-${i}`}
            x={x * CELL}
            y={y * CELL}
            width={CELL}
            height={CELL}
            fill={INK}
          />
        )
      })}
      </g>

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
      {calico &&
        CALICO_PATCHES.map(([x, y]) => (
          <rect
            key={`c-${x}-${y}`}
            x={x * CELL}
            y={y * CELL}
            width={CELL}
            height={CELL}
            fill={INK}
            opacity={0.25}
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
      <rect x={3 * CELL} y={3 * CELL} width={CELL} height={CELL} fill="#ff9ecb" />
      <rect x={3 * CELL} y={4 * CELL} width={CELL} height={CELL} fill="#ff9ecb" />
      <rect x={12 * CELL} y={3 * CELL} width={CELL} height={CELL} fill="#ff9ecb" />
      <rect x={12 * CELL} y={4 * CELL} width={CELL} height={CELL} fill="#ff9ecb" />

      {/* Layer 5: Whiskers */}
      {WHISKERS.map(([x, y], i) => (
        <rect
          key={`w-${i}`}
          x={x * CELL}
          y={y * CELL}
          width={CELL}
          height={CELL}
          fill={INK}
        />
      ))}

      {/* Layer 6: Eyes — all positions snapped to whole cells */}
      <g id="pet-eyes" style={{ transition: 'transform 0.15s ease-out' }}>
      {expression === 'wink' ? (
        <>
          <rect x={4 * CELL} y={7 * CELL} width={2 * CELL} height={CELL} fill={INK} />
          <rect x={10 * CELL} y={7 * CELL} width={2 * CELL} height={CELL} fill={fur.body} />
          <rect x={10 * CELL} y={7 * CELL} width={2 * CELL} height={2} fill={INK} />
        </>
      ) : expression === 'sleepy' ? (
        <>
          <rect x={4 * CELL} y={7 * CELL} width={2 * CELL} height={CELL} fill={INK} />
          <rect x={10 * CELL} y={7 * CELL} width={2 * CELL} height={CELL} fill={INK} />
          <rect x={4 * CELL} y={7 * CELL} width={2 * CELL} height={CELL} fill={fur.body} />
          <rect x={10 * CELL} y={7 * CELL} width={2 * CELL} height={CELL} fill={fur.body} />
          <rect x={4 * CELL} y={7 * CELL + CELL - 2} width={2 * CELL} height={2} fill={INK} />
          <rect x={10 * CELL} y={7 * CELL + CELL - 2} width={2 * CELL} height={2} fill={INK} />
        </>
      ) : expression === 'surprised' ? (
        <>
          <rect x={4 * CELL} y={6 * CELL} width={2 * CELL} height={2 * CELL} fill={INK} />
          <rect x={10 * CELL} y={6 * CELL} width={2 * CELL} height={2 * CELL} fill={INK} />
          <rect x={5 * CELL} y={6 * CELL} width={CELL} height={CELL} fill="#fff" />
          <rect x={11 * CELL} y={6 * CELL} width={CELL} height={CELL} fill="#fff" />
        </>
      ) : (
        <>
          <rect x={4 * CELL} y={7 * CELL} width={2 * CELL} height={CELL} fill={INK} />
          <rect x={10 * CELL} y={7 * CELL} width={2 * CELL} height={CELL} fill={INK} />
        </>
      )}
      </g>

      {/* Nose */}
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

      {/* Mouth */}
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
})

// Glasses: aligned over eye row (row 7), lenses span the eyes.
function Glasses() {
  return (
    <g>
      <rect x={3 * CELL} y={6 * CELL} width={4 * CELL} height={3 * CELL} fill="none" stroke={INK} strokeWidth={2} />
      <rect x={3 * CELL} y={6 * CELL} width={4 * CELL} height={3 * CELL} fill="#b8e0ff" opacity={0.35} />
      <rect x={9 * CELL} y={6 * CELL} width={4 * CELL} height={3 * CELL} fill="none" stroke={INK} strokeWidth={2} />
      <rect x={9 * CELL} y={6 * CELL} width={4 * CELL} height={3 * CELL} fill="#b8e0ff" opacity={0.35} />
      <rect x={7 * CELL} y={7 * CELL} width={2 * CELL} height={CELL} fill={INK} />
    </g>
  )
}

// Bowtie: sits right below the chin (row 11), between the front paws.
function Bowtie() {
  return (
    <g>
      <rect x={5 * CELL} y={11 * CELL} width={2 * CELL} height={2 * CELL} fill="#ff6f91" />
      <rect x={9 * CELL} y={11 * CELL} width={2 * CELL} height={2 * CELL} fill="#ff6f91" />
      <rect x={7 * CELL} y={11 * CELL} width={2 * CELL} height={2 * CELL} fill="#ff6f91" />
      <rect x={7 * CELL} y={11 * CELL} width={2 * CELL} height={2 * CELL} fill={INK} opacity={0.35} />
    </g>
  )
}

// Party Hat: sits on top of the head between the ears (rows 0-4).
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

// Wizard Cap: sits on top of the head between the ears (rows 0-4).
function WizardCap() {
  return (
    <g>
      <polygon
        points={`${8 * CELL},${0} ${4 * CELL},${4 * CELL} ${12 * CELL},${4 * CELL}`}
        fill="#7b68c4"
        stroke={INK}
        strokeWidth={2}
      />
      <rect x={3 * CELL} y={4 * CELL} width={10 * CELL} height={CELL} fill={INK} />
      <rect x={7 * CELL} y={2 * CELL} width={2 * CELL} height={CELL} fill="#ffd700" />
    </g>
  )
}

// Fish Treat: a tiny pixel fish floating to the left of the cat.
function FishTreat() {
  return (
    <g transform={`translate(${0}, ${12 * CELL})`}>
      <rect x={0} y={CELL} width={3 * CELL} height={CELL} fill="#7ec8e3" />
      <rect x={CELL} y={0} width={CELL} height={CELL} fill="#7ec8e3" />
      <rect x={CELL} y={2 * CELL} width={CELL} height={CELL} fill="#7ec8e3" />
      <rect x={3 * CELL} y={0} width={CELL} height={CELL} fill="#7ec8e3" />
      <rect x={3 * CELL} y={2 * CELL} width={CELL} height={CELL} fill="#7ec8e3" />
      <rect x={0} y={CELL} width={CELL} height={CELL} fill={INK} opacity={0.8} />
    </g>
  )
}

// Catnip Ball: a little green ball with a leaf, floating to the right.
function CatnipBall() {
  return (
    <g transform={`translate(${12 * CELL}, ${12 * CELL})`}>
      <rect x={0} y={CELL} width={2 * CELL} height={2 * CELL} fill="#bdecd0" />
      <rect x={0} y={CELL} width={2 * CELL} height={2 * CELL} fill="none" stroke={INK} strokeWidth={1.5} />
      <rect x={CELL} y={0} width={CELL} height={CELL} fill="#7fc99a" />
    </g>
  )
}

// Heart Aura: rendered behind the cat, surrounding it with pixel hearts.
function HeartAura() {
  const hearts: Array<[number, number, string]> = [
    [0, 5, '#ff9ecb'],
    [14, 4, '#ffc4e1'],
    [0, 11, '#ffb6d5'],
    [14, 12, '#ff9ecb'],
    [7, 0, '#ffd0e6'],
    [8, 16, '#ff9ecb'],
  ]
  return (
    <g className="pet-soft">
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
