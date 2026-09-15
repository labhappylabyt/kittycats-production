import { ContactChip } from '@/components/contact-chip'
import { HeroPet } from '@/components/hero-pet'
import { LabDeck } from '@/components/lab-deck'
import { SoundToggle } from '@/components/sound-toggle'

export default function HomePage() {
  return (
    <>
      <SoundToggle />
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col overflow-hidden px-4 pb-24 pt-4 sm:px-7 lg:px-10">
        <nav className="topbar flex items-center justify-between px-1 py-3 sm:px-2" aria-label="Primary navigation">
          <a href="#top" className="group flex items-center gap-3" aria-label="kittycats.cc home">
            <span className="brand-mark grid h-10 w-10 place-items-center rounded-[15px] font-pixel text-[0.56rem] text-[#1b1929] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">KC</span>
            <span className="ui-label text-white/85">kittycats.cc</span>
          </a>
          <div className="hidden items-center gap-7 sm:flex">
            <a className="nav-link" href="#build">Builder</a>
            <a className="nav-link" href="#signals">Friends</a>
            <a className="nav-link" href="#contact">Say hello</a>
          </div>
          <span className="ui-label text-white/70">made for fun</span>
        </nav>

        <section id="top" className="relative grid flex-1 items-center gap-10 pb-16 pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:pt-24">
          <div className="relative z-10 flex flex-col items-start">
            <div className="section-kicker mb-7"><span className="status-dot" />A tiny corner of the internet</div>
            <h1 className="display-title max-w-3xl text-[clamp(4.5rem,10vw,9rem)] leading-[0.9] tracking-[-0.045em] text-[#fff8fb]">
              make a<br /><span className="hero-pill"><span>kitty.</span></span>
            </h1>
            <p className="mt-10 max-w-md text-pretty text-base leading-7 text-white/85 sm:text-lg">
              Pick a color, add a little personality, and send your new pixel pal out into the world.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="#build" className="magnetic-button inline-flex items-center gap-4 rounded-[16px] bg-[#ffd166] px-5 py-3.5 font-semibold text-[0.72rem] tracking-[-0.01em] text-[#1b1929]">
                Make my kitty <span aria-hidden="true" className="text-base leading-none">↘</span>
              </a>
              <span className="ui-label text-white/70">tiny, cute, yours</span>
            </div>
          </div>

          <div id="build" className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="pet-frame relative p-2 sm:p-3">
              <div className="absolute left-5 top-5 z-10 section-kicker text-white/85">Your new friend</div>
              <div className="absolute bottom-5 right-5 z-10 hidden ui-label text-white/70 sm:block">click to say hi</div>
              <HeroPet />
            </div>
          </div>
        </section>

        <section id="signals" className="relative mt-4 border-t border-white/10 py-16 sm:py-24" aria-label="Friends and links">
          <div className="mb-8 flex flex-col justify-between gap-5 px-2 md:flex-row md:items-end">
            <div>
              <p className="section-kicker">Come hang out</p>
              <h2 className="display-title mt-3 text-5xl tracking-[-0.04em] text-[#fff8fb] sm:text-7xl">say hello</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/80 md:text-right">A few friendly places where the kitty is out and about.</p>
          </div>
          <LabDeck />
        </section>

        <section id="contact" className="relative mb-6 grid gap-8 border-t border-white/10 py-16 sm:grid-cols-[1fr_auto] sm:items-end sm:py-24" aria-label="Contact">
          <div>
            <p className="section-kicker">One more thing</p>
            <h2 className="display-title mt-3 max-w-xl text-5xl leading-[0.95] tracking-[-0.04em] text-[#fff8fb] sm:text-7xl">drop a note.</h2>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">              <span className="ui-label text-white/70">or just say hi</span>
            <ContactChip email="contact@kittycats.cc" />
          </div>
        </section>
      </main>
    </>
  )
}
