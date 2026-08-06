import Link from 'next/link'
import { AudioPlayer } from '@/components/audio-player'
import { CardDeck } from '@/components/card-deck'
import { ContactChip } from '@/components/contact-chip'
import { PawCursor } from '@/components/paw-cursor'

export default function LabPage() {
  return (
    <main className="relative flex h-screen max-h-screen min-h-screen flex-col justify-between overflow-hidden px-6 py-6 sm:py-10">
      <PawCursor />
      {/* back button */}
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-xl border-2 bg-card px-4 py-2 text-sm font-bold text-foreground shadow-[3px_3px_0_0_var(--ink)] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0"
          style={{ borderColor: 'var(--ink)' }}
        >
          <span aria-hidden="true">←</span> Back to Home
        </Link>
      </div>

      {/* header */}
      <header className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Lab Deck
        </h1>
        <p className="text-pretty text-base font-medium text-foreground/80 sm:text-lg">
          Find me across the web — scroll to drift through the links.
        </p>
      </header>

      {/* card deck */}
      <div className="mt-12 flex flex-1 items-center">
        <CardDeck />
      </div>

      {/* contact chip */}
      <div className="mt-10 flex justify-center">
        <ContactChip email="contact@kittycats.cc" />
      </div>

      <AudioPlayer />
    </main>
  )
}
