import { AudioPlayer } from '@/components/audio-player'
import { ContactChip } from '@/components/contact-chip'
import { PawCursor } from '@/components/paw-cursor'
import { PetBuilder } from '@/components/pet-builder'
import { socials } from '@/components/socials'

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center gap-12 overflow-hidden px-6 py-16 text-center">
      <PawCursor />

      <header className="flex flex-col items-center gap-2">
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Pixel Pet Builder 🐾
        </h1>
        <p className="text-pretty text-base font-medium text-muted-foreground sm:text-lg">
          Build your own kitty, then adopt it!
        </p>
      </header>

      <PetBuilder />

      {/* Find Me section */}
      <section className="mt-4 flex w-full max-w-3xl flex-col items-center gap-5">
        <h2 className="text-2xl font-bold tracking-tight">Find Me 🐾</h2>
        <ContactChip email="contact@kittycats.cc" />

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {socials
            .filter((s) => s.name !== 'Email')
            .map((s) => {
              const { Icon } = s
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border-4 px-4 py-3 text-left transition-transform duration-200 hover:-translate-x-1 hover:-translate-y-1"
                  style={{
                    background: s.color,
                    color: s.ink,
                    borderColor: s.ink,
                    boxShadow: '4px 4px 0 0 var(--ink)',
                  }}
                >
                  <Icon className="h-7 w-7 flex-shrink-0" />
                  <span className="flex flex-col">
                    <span className="text-sm font-bold leading-tight">
                      {s.name}
                    </span>
                    <span className="text-xs font-medium opacity-70">
                      {s.handle}
                    </span>
                  </span>
                </a>
              )
            })}
        </div>
      </section>

      <AudioPlayer />
    </main>
  )
}
