'use client'

import { Card } from './card'
import { socials } from './socials'

export function LabDeck() {
  return <div className="relative w-screen max-w-[1440px] overflow-hidden py-2" aria-label="Social links deck">
    <div className="lab-deck-track flex w-max gap-4 px-2 sm:gap-5">
      {[...socials, ...socials].map((social, index) => <Card key={`${social.name}-${index}`} social={social} index={index} />)}
    </div>
    <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0b0c10] to-transparent" />
    <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0b0c10] to-transparent" />
  </div>
}
