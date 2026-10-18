import type { ComponentType, SVGProps } from 'react'
import { links } from '@/config/site'
import type { IconKey } from '@/config/site'
import {
  BoxIcon,
  DiscordIcon,
  GitHubIcon,
  MailIcon,
  RobloxIcon,
} from './brand-icons'

export type Social = {
  name: string
  handle: string
  href: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** pastel accent — the icon colour and the hover glow */
  color: string
  /** status badge text shown on the card (null = no badge) */
  status?: string | null
  /** preview metadata shown in the hover drawer */
  meta?: string | null
}

const ICONS: Record<IconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  github: GitHubIcon,
  discord: DiscordIcon,
  roblox: RobloxIcon,
  namemc: BoxIcon,
  mail: MailIcon,
}

/**
 * The deck renders whatever config/site.ts lists — edit a link there, not
 * here. This file only supplies the icon components the config can't hold.
 */
export const socials: Social[] = links.map((link) => ({
  name: link.name,
  handle: link.handle,
  href: link.href,
  Icon: ICONS[link.icon],
  color: link.color,
  status: link.status,
  meta: link.meta,
}))
