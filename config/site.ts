/**
 * Single source of truth for kittycats.cc.
 *
 * Everything a content edit touches lives here — components read from this
 * file and never hardcode copy, URLs, or palette choices. Values marked
 * EDIT ME are placeholders that were not verifiable from the repo and want
 * a human pass.
 */

/* ------------------------------------------------------------------ types */

export type IconKey = 'github' | 'discord' | 'roblox' | 'namemc' | 'mail'

export type Link = {
  name: string
  handle: string
  href: string
  icon: IconKey
  /** solid pastel face — ink text always sits on top of it */
  color: string
  /** status badge text shown on hover */
  status?: string | null
  /** preview metadata shown in the hover drawer */
  meta?: string | null
}

export type Project = {
  title: string
  blurb: string
  href: string
  /** short status tag rendered as a sticker chip */
  status: string
  /** pastel face — ink text sits on top */
  color: string
  tags: string[]
  /** true = render as the wide featured card */
  featured?: boolean
}

export type Repo = {
  name: string
  description: string | null
  language: string | null
  stars: number
  href: string
}

export type Track = {
  title: string
  artist: string
  /**
   * Chiptune melody as [frequencyHz, durationSeconds] pairs, played by the
   * shared oscillator engine. Leave `src` empty to use this. Set `src` to an
   * audio file path to play a real track instead — the analyser taps either.
   */
  melody: Array<[number, number]>
  /** optional real audio file, e.g. '/music/track.mp3' */
  src?: string
}

/* --------------------------------------------------------------- identity */

export const site = {
  domain: 'kittycats.cc',
  url: 'https://kittycats.cc',
  title: 'kittycats.cc — labhappylab',
  description:
    'Projects, links, and whatever is playing right now. Home of the pixel pet builder.',
} as const

export const profile = {
  name: 'labhappylab',
  handle: '@labhappylabyt',
  /** EDIT ME — placeholder bio, replace with your own line */
  bio: 'Building Minecraft tooling and small web things. Usually mid-refactor.',
  /** Drop a file at public/avatar.png; the card falls back to a monogram. */
  avatar: '/avatar.png',
  /** EDIT ME if you'd rather not show a timezone */
  location: 'GMT-5',
  email: 'lab@kittycats.cc',
} as const

/* ------------------------------------------------------------------ links */

export const links: Link[] = [
  {
    name: 'GitHub',
    handle: '@labhappylabyt',
    href: 'https://github.com/labhappylabyt',
    icon: 'github',
    color: '#d7c9ff', // lavender
    status: 'Active',
    meta: 'Repos, mods, and web toys',
  },
  {
    name: 'Discord',
    handle: '@labhappylabreal',
    href: 'https://discord.com/users/717979161502810153',
    icon: 'discord',
    color: '#c4d4ff', // soft periwinkle
    status: null, // filled live from presence
    meta: 'DMs open',
  },
  {
    name: 'Roblox',
    handle: '@labhappylab',
    href: 'https://www.roblox.com/users/1532627925/profile',
    icon: 'roblox',
    color: '#ffd0d0', // pastel coral
    status: null,
    meta: 'Profile',
  },
  {
    name: 'NameMC',
    handle: 'Natiele',
    href: 'https://namemc.com/profile/Natiele.1',
    icon: 'namemc',
    color: '#bdecd0', // mint green
    status: null,
    meta: 'Java + Bedrock',
  },
  {
    name: 'Email',
    handle: 'lab@kittycats.cc',
    href: 'mailto:lab@kittycats.cc',
    icon: 'mail',
    color: '#ffd7b0', // peach
    status: null,
    meta: null,
  },
]

/* --------------------------------------------------------------- projects */

export const projects: Project[] = [
  {
    title: 'mochiontop.cc',
    blurb:
      'A Minecraft client mod for 1.21.11 and the distribution stack behind it: Discord OAuth, per-user licenses bound to a hardware ID, and a signed, obfuscated build pipeline.',
    href: 'https://mochiontop.cc/',
    status: 'Live',
    color: '#c4d4ff',
    tags: ['Cloudflare Workers', 'Neon Postgres', 'Discord OAuth', 'Fabric'],
    featured: true,
  },
]

/** Repos are pulled live from the GitHub API. */
export const github = {
  username: 'labhappylabyt',
  profileUrl: 'https://github.com/labhappylabyt',
  /** how long a fetched repo list stays fresh, in seconds */
  revalidate: 3600,
  /** repos with these names are hidden from the grid */
  hidden: [] as string[],
} as const

/**
 * Used when the GitHub API is unreachable or rate-limited, so the grid never
 * renders empty. Verified against the API on 2026-09-30.
 */
export const fallbackRepos: Repo[] = [
  { name: 'kittycats-production', description: 'This site.', language: 'TypeScript', stars: 0, href: 'https://github.com/labhappylabyt/kittycats-production' },
  { name: 'kittycats-beta', description: 'I tried vibecoding it sucked', language: 'TypeScript', stars: 0, href: 'https://github.com/labhappylabyt/kittycats-beta' },
  { name: 'chromatic-dispatch', description: null, language: 'CSS', stars: 0, href: 'https://github.com/labhappylabyt/chromatic-dispatch' },
  { name: 'arduino-hid-pranks', description: null, language: 'C++', stars: 0, href: 'https://github.com/labhappylabyt/arduino-hid-pranks' },
  { name: 'gridguard-rl', description: null, language: 'Python', stars: 0, href: 'https://github.com/labhappylabyt/gridguard-rl' },
]

/* ------------------------------------------------------------------ audio */

export const tracks: Track[] = [
  {
    title: 'Pixel Dreams',
    artist: 'kittycats',
    melody: [
      [523, 0.15], [659, 0.15], [784, 0.15], [1047, 0.2],
      [784, 0.15], [659, 0.15], [523, 0.2],
      [587, 0.15], [698, 0.15], [880, 0.15], [1175, 0.2],
      [880, 0.15], [698, 0.15], [587, 0.3],
    ],
  },
  {
    title: 'Lo-Fi Catnap',
    artist: 'kittycats',
    melody: [
      [330, 0.25], [392, 0.25], [440, 0.25], [523, 0.5],
      [440, 0.25], [392, 0.25], [330, 0.5],
      [349, 0.25], [415, 0.25], [466, 0.25], [554, 0.5],
      [466, 0.25], [415, 0.25], [349, 0.5],
    ],
  },
  {
    title: '8-Bit Adventure',
    artist: 'kittycats',
    melody: [
      [440, 0.1], [523, 0.1], [659, 0.1], [784, 0.1],
      [880, 0.1], [784, 0.1], [659, 0.1], [523, 0.1],
      [587, 0.1], [698, 0.1], [880, 0.1], [1047, 0.1],
      [1175, 0.15], [1047, 0.15], [880, 0.15], [698, 0.2],
    ],
  },
]

/* --------------------------------------------------------------- presence */

export type PresenceStatus = 'online' | 'idle' | 'dnd' | 'offline'

export const presence = {
  /** the Discord account to read presence for */
  discordId: '717979161502810153',
  socket: 'wss://api.lanyard.rest/socket',
  rest: 'https://api.lanyard.rest/v1/users',
  /**
   * Shown when the socket never connects, or when Lanyard reports the user
   * offline. Deterministic on purpose — a "connecting…" state that never
   * resolves reads as broken.
   */
  offline: {
    status: 'offline',
    activity: null,
    spotify: null,
  },
} as const

/* ---------------------------------------------------------------- palette */

/**
 * The pastel faces. Every one of these is light enough that ink (#2f2a44)
 * text sits on it — never put a pastel on a pastel, and never put --foreground
 * on one.
 */
export const pastels = {
  lavender: '#d7c9ff',
  periwinkle: '#c4d4ff',
  coral: '#ffd0d0',
  mint: '#bdecd0',
  pink: '#ffc4e1',
  peach: '#ffd7b0',
} as const
