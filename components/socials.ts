import type { ComponentType, SVGProps } from 'react'
import { BoxIcon, DiscordIcon, GitHubIcon, MailIcon, MusicIcon, RobloxIcon } from './brand-icons'

export type Social = { name: string; handle: string; href: string; Icon: ComponentType<SVGProps<SVGSVGElement>>; color: string; ink: string; status?: string | null; meta?: string | null }

const INK = '#fff8fb'

export const socials: Social[] = [
  { name: 'GitHub', handle: '@labhappylabyt', href: 'https://github.com/labhappylabyt', Icon: GitHubIcon, color: '#a3f3d1', ink: INK, status: 'Active', meta: '3 repos · 12 stars' },
  { name: 'Discord', handle: '@labhappylabyt', href: 'https://discord.com/users/717979161502810153', Icon: DiscordIcon, color: '#a3f3d1', ink: INK, status: 'Online', meta: 'DMs open · GMT-5' },
  { name: 'Roblox', handle: '@labhappylab', href: 'https://www.roblox.com/users/1532627925/profile', Icon: RobloxIcon, color: '#ff9ebd', ink: INK, status: 'Playing', meta: '~300 friends' },
  { name: 'NameMC', handle: 'Natiele', href: 'https://namemc.com/profile/Natiele.1', Icon: BoxIcon, color: '#a3f3d1', ink: INK, status: 'AFK', meta: 'Java + Bedrock' },
  { name: 'Fav Song', handle: 'now playing', href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', Icon: MusicIcon, color: '#ff9ebd', ink: INK, status: null, meta: null },
  { name: 'Email', handle: 'lab@kittycats.cc', href: 'mailto:lab@kittycats.cc', Icon: MailIcon, color: '#ffd166', ink: INK, status: null, meta: null },
]
