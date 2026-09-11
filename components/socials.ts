import type { ComponentType, SVGProps } from 'react'
import { BoxIcon, DiscordIcon, GitHubIcon, MailIcon, MusicIcon, RobloxIcon } from './brand-icons'

export type Social = {
  name: string
  handle: string
  href: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Accent color used in the dark signal-card glow. */
  color: string
  /** Foreground color reserved for card text and icon treatment. */
  ink: string
  status?: string | null
  meta?: string | null
}

const INK = '#f5f2ff'

export const socials: Social[] = [
  { name: 'GitHub', handle: '@labhappylabyt', href: 'https://github.com/labhappylabyt', Icon: GitHubIcon, color: '#a78bfa', ink: INK, status: 'Active', meta: '3 repos · 12 stars' },
  { name: 'Discord', handle: '@labhappylabyt', href: 'https://discord.com/users/717979161502810153', Icon: DiscordIcon, color: '#7c9cff', ink: INK, status: 'Online', meta: 'DMs open · GMT-5' },
  { name: 'Roblox', handle: '@labhappylab', href: 'https://www.roblox.com/users/1532627925/profile', Icon: RobloxIcon, color: '#ff8f7a', ink: INK, status: 'Playing', meta: 'Level 42 · 1.2k friends' },
  { name: 'NameMC', handle: 'Natiele', href: 'https://namemc.com/profile/Natiele.1', Icon: BoxIcon, color: '#52d6b5', ink: INK, status: 'AFK', meta: 'Java + Bedrock · Skin updated 2d ago' },
  { name: 'Fav Song', handle: 'now playing', href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', Icon: MusicIcon, color: '#ef83c7', ink: INK, status: null, meta: null },
  { name: 'Email', handle: 'lab@kittycats.cc', href: 'mailto:lab@kittycats.cc', Icon: MailIcon, color: '#d8ff6a', ink: INK, status: null, meta: null },
]
