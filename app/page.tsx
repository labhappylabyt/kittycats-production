import { profile } from '@/config/site'
import { AmbientCanvas } from '@/components/ambient-canvas'
import { AudioPlayer } from '@/components/audio-player'
import { ContactChip } from '@/components/contact-chip'
import { HeroPet } from '@/components/hero-pet'
import { LabDeck } from '@/components/lab-deck'
import { PawCursor } from '@/components/paw-cursor'
import { ProfileCard } from '@/components/profile-card'
import { ProjectsGrid } from '@/components/projects-grid'
import { SmoothScroll } from '@/components/smooth-scroll'
import { SoundToggle } from '@/components/sound-toggle'

export default function HomePage() {
  return (
    <SmoothScroll>
      <AmbientCanvas />
      <PawCursor />
      <SoundToggle />
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center overflow-hidden px-6 py-16 text-center">
        {/* Identity */}
        <section className="flex w-full flex-col items-center" aria-label="Profile">
          <ProfileCard />
        </section>

        {/* Hero: Pixel Pet mascot */}
        <section
          className="mt-20 flex w-full max-w-4xl flex-col items-center gap-4"
          aria-label="Pixel Pet Builder"
        >
          <header className="flex flex-col items-center gap-2">
            <h2 className="font-pixel text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Pixel Pet Builder
            </h2>
            <p className="text-pretty text-base font-medium text-muted-foreground sm:text-lg">
              Build your own kitty, then adopt it!
            </p>
          </header>

          <HeroPet />
        </section>

        {/* Lab Deck: horizontal scrolling social cards */}
        <section
          className="mt-12 flex w-full flex-col items-center"
          aria-label="Lab Deck"
        >
          <h2 className="mb-2 font-pixel text-xl tracking-tight text-foreground sm:text-2xl">
            Lab Deck
          </h2>
          <p className="mb-4 text-pretty text-base font-medium text-muted-foreground">
            Find me across the web — scroll to drift through the links.
          </p>
          <LabDeck />
        </section>

        {/* Projects */}
        <section
          className="mt-16 flex w-full flex-col items-center gap-5"
          aria-label="Projects"
        >
          <h2 className="font-pixel text-xl tracking-tight text-foreground sm:text-2xl">
            Projects
          </h2>
          <ProjectsGrid />
        </section>

        {/* Music */}
        <section
          className="mt-16 flex w-full flex-col items-center gap-5"
          aria-label="Music"
        >
          <h2 className="font-pixel text-xl tracking-tight text-foreground sm:text-2xl">
            Chiptune Radio
          </h2>
          <AudioPlayer />
        </section>

        {/* Contact */}
        <section
          className="mt-8 flex w-full max-w-3xl flex-col items-center gap-5"
          aria-label="Contact"
        >
          <h2 className="font-pixel text-xl tracking-tight text-foreground sm:text-2xl">
            Find Me
          </h2>
          <ContactChip email={profile.email} />
        </section>
      </main>
    </SmoothScroll>
  )
}
