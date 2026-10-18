'use client'

import { Card } from './card'
import { socials } from './socials'

export function LabDeck() {
  return <div className="lab-deck w-full overflow-hidden py-2" aria-label="Social links deck">
    <div className="lab-deck-track flex w-max gap-4 px-2 sm:gap-5">
      {[...socials, ...socials].map((social, index) => <Card key={`${social.name}-${index}`} social={social} index={index} />)}
    </div>
  </div>
}
