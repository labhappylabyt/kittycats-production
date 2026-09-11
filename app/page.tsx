import { ContactChip } from '@/components/contact-chip'
import { HeroPet } from '@/components/hero-pet'
import { LabDeck } from '@/components/lab-deck'
import { SoundToggle } from '@/components/sound-toggle'

export default function HomePage() {
  return (
    <>
      <SoundToggle />
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col overflow-hidden px-4 pb-24 pt-4 sm:px-7 lg:px-10">
        <nav className="glass-panel flex items-center justify-between rounded-full px-4 py-3 sm:px-5" aria-label="Primary navigation">
          <a href="#top" className="group flex items-center gap-3" aria-label="kittycats.cc home">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-[#d8ff6a]/50 bg-[#d8ff6a] font-mono text-[0.65rem] font-bold text-[#0b0c10] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">KC</span>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-white/80">Kittycats.cc</span>
          </a>
          <div className="hidden items-center gap-6 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/50 sm:flex">
            <a className="hover:text-[#d8ff6a]" href="#build">Build</a>
            <a className="hover:text-[#d8ff6a]" href="#signals">Signals</a>
            <a className="hover:text-[#d8ff6a]" href="#contact">Contact</a>
          </div>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[#d8ff6a]">Online / 24</span>
        </nav>

        <section id="top" className="relative grid flex-1 items-center gap-8 pb-12 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-24">
          <div className="pointer-events-none absolute -left-12 top-5 hidden font-mono text-[0.58rem] tracking-[0.22em] text-white/25 lg:block [writing-mode:vertical-rl]">PERSONAL PET RESEARCH DEPARTMENT</div>
          <div className="relative z-10 flex flex-col items-start">
            <div className="mb-7 flex items-center gap-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-[#d8ff6a]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#d8ff6a] shadow-[0_0_16px_#d8ff6a]" />
              A small world of cats, code, &amp; curious things
            </div>
            <h1 className="font-display max-w-4xl text-[clamp(4.9rem,11.8vw,11rem)] leading-[0.72] tracking-[-0.085em] text-white">
              kitty<span className="block pl-[0.17em] italic text-white/85">cats.</span>
            </h1>
            <p className="mt-10 max-w-md text-pretty text-base leading-7 text-white/60 sm:text-lg">
              A living pixel-pet lab where tiny companions become collectible signals. Build one, dress it up, and take it with you.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="#build" className="magnetic-button inline-flex items-center gap-4 rounded-full bg-[#d8ff6a] px-5 py-3 font-mono text-[0.65rem] font-bold uppercase tracking-[0.17em] text-[#090a0e]">
                Enter the lab <span aria-hidden="true" className="text-base leading-none">↘</span>
              </a>
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.17em] text-white/35">Scroll to explore</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute inset-x-[12%] -inset-y-8 rounded-full bg-[#7c5cff]/20 blur-[90px]" aria-hidden="true" />
            <div className="relative border border-white/10 bg-white/[0.025] p-2 backdrop-blur-sm sm:p-3">
              <div className="absolute left-5 top-5 z-10 font-mono text-[0.56rem] uppercase tracking-[0.19em] text-white/40">Specimen / 01</div>
              <div className="absolute bottom-5 right-5 z-10 hidden font-mono text-[0.56rem] uppercase tracking-[0.19em] text-white/35 sm:block">Touch responsive</div>
              <HeroPet />
            </div>
          </div>
        </section>

        <section id="signals" className="relative mt-4 border-t border-white/10 py-16 sm:py-24" aria-label="Lab Deck">
          <div className="mb-8 flex flex-col justify-between gap-5 px-2 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Signal Archive / 02</p>
              <h2 className="font-display mt-3 text-5xl tracking-[-0.07em] text-white sm:text-7xl">lab deck</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/50 md:text-right">Select a channel to find the rest of the experiment across the web.</p>
          </div>
          <LabDeck />
        </section>

        <section id="contact" className="relative mb-6 grid gap-8 border-t border-white/10 py-16 sm:grid-cols-[1fr_auto] sm:items-end sm:py-24" aria-label="Contact">
          <div>
            <p className="eyebrow">Direct Line / 03</p>
            <h2 className="font-display mt-3 max-w-xl text-5xl leading-[0.86] tracking-[-0.07em] text-white sm:text-7xl">leave a little signal.</h2>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/40">Copy address · start a conversation</span>
            <ContactChip email="contact@kittycats.cc" />
          </div>
        </section>
      </main>
    </>
  )
}
