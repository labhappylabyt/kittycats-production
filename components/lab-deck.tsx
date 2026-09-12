'use client'

import { CassettePlayer } from './cassette-player'
import { Card } from './card'
import { socials } from './socials'

const LINK_SOCIALS = socials.filter((social) => social.name !== 'Fav Song')

export function LabDeck() {
  return (
    <section className="w-full py-8" aria-label="Social links marquee">
      <div className="marquee-window">
        <div className="marquee-track">
          {[...LINK_SOCIALS, ...LINK_SOCIALS].map((social, index) => (
            <Card key={`${social.name}-${index}`} social={social} index={index} />
          ))}
        </div>
      </div>
      <div className="mt-5 ml-auto max-w-[280px] rounded-[20px] border-2 border-white/10 bg-[#29243b] p-3 shadow-[4px_5px_0_rgba(0,0,0,.18)]">
        <CassettePlayer />
      </div>
    </section>
  )
}
