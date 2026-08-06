import type { ComponentType, SVGProps } from 'react'
import {
  BoxIcon,
  DiscordIcon,
  GitHubIcon,
  MailIcon,
  MusicIcon,
  RobloxIcon,
} from './brand-icons'

export type Social = {
  name: string
  handle: string
  href: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** solid pastel fill used as the card face */
  color: string
  /** dark ink used for the outline, icon, and text */
  ink: string
}

const INK = '#2f2a44'

export const socials: Social[] = [
  {
    name: 'GitHub',
    handle: '@labhappylabyt',
    href: 'https://github.com/labhappylabyt',
    Icon: GitHubIcon,
    color: '#d7c9ff', // lavender
    ink: INK,
  },
  {
    name: 'Discord',
    handle: '@labhappylabyt',
    href: 'https://discord.com/users/717979161502810153',
    Icon: DiscordIcon,
    color: '#c4d4ff', // soft periwinkle
    ink: INK,
  },
  {
    name: 'Roblox',
    handle: '@labhappylab',
    href: 'https://www.roblox.com/users/1532627925/profile',
    Icon: RobloxIcon,
    color: '#ffd0d0', // pastel coral
    ink: INK,
  },
  {
    name: 'NameMC',
    handle: 'Natiele',
    href: 'https://namemc.com/profile/Natiele.1',
    Icon: BoxIcon,
    color: '#bdecd0', // mint green
    ink: INK,
  },
  {
    name: 'Fav Song',
    handle: 'now playing',
    href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    Icon: MusicIcon,
    color: '#ffc4e1', // pink
    ink: INK,
  },
  {
    name: 'Email',
    handle: 'lab@kittycats.cc',
    href: 'mailto:lab@kittycats.cc',
    Icon: MailIcon,
    color: '#ffd7b0', // peach
    ink: INK,
  },
]
