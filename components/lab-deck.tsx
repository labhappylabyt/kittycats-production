'use client'

import { CassettePlayer } from './cassette-player'
import { Card } from './card'
import { socials } from './socials'

export function LabDeck() {
  return (
    <section className="w-full py-8" aria-label="Social links deck">
      <div className="hidden w-full overflow-visible sm:block">
        <div className="lab-deck-track flex w-max items-center gap-6 px-4">
          {[...socials, ...socials].map((social, index) => (
            <Card key={`${social.name}-${index}`} social={social} index={index} />
          ))}
          <div className="h-[360px] w-64 shrink-0" aria-hidden="true">
            <CassettePlayer />
          </div>
        </div>
      </div>

      <div
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-5 sm:hidden"
        aria-label="Swipe through links"
      >
        {socials.map((social, index) => (
          <Card key={social.name} social={social} index={index} />
        ))}
        <div className="h-[360px] w-64 shrink-0 snap-center" aria-label="Favorite song player">
          <CassettePlayer />
        </div>
      </div>
    </section>
  )
}
