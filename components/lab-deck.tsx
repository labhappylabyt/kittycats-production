'use client'

import { CassettePlayer } from './cassette-player'
import { Card } from './card'
import { socials } from './socials'

const LINK_SOCIALS = socials.filter((social) => social.name !== 'Fav Song')

export function LabDeck() {
  return (
    <section className="w-full py-8" aria-label="Social links deck">
      <div className="social-grid">
        {LINK_SOCIALS.map((social, index) => (
          <Card key={social.name} social={social} index={index} />
        ))}
        <div className="bento-player" aria-label="Favorite song player">
          <CassettePlayer />
        </div>
      </div>
    </section>
  )
}
