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

function SectionIntro({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return <div className="mb-7 flex w-full max-w-6xl items-end justify-between gap-5 text-left">
    <div><p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[.24em] text-accent">{eyebrow}</p><h2 className="font-pixel text-2xl tracking-tight text-foreground sm:text-3xl">{title}</h2><p className="mt-2 max-w-xl text-sm text-muted-foreground">{detail}</p></div>
    <span className="hidden rounded-full border border-border bg-white/[.03] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:block">01 / 04</span>
  </div>
}

export default function HomePage() {
  return <SmoothScroll><AmbientCanvas /><PawCursor /><SoundToggle />
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 pb-28 pt-8 sm:px-10 lg:px-16">
      <header className="mb-20 flex items-center justify-between border-b border-border pb-5"><a href="#top" className="font-pixel text-sm tracking-tight text-foreground">kittycats<span className="text-primary">.cc</span></a><nav className="hidden items-center gap-6 font-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground sm:flex"><a href="#deck" className="transition-colors hover:text-accent">Links</a><a href="#work" className="transition-colors hover:text-accent">Work</a><a href="#radio" className="transition-colors hover:text-accent">Radio</a></nav><span className="font-mono text-[10px] uppercase tracking-widest text-accent">Lab / 2026</span></header>
      <section id="top" className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]" aria-label="Profile"><div className="text-left"><p className="mb-5 font-mono text-xs uppercase tracking-[.28em] text-accent">Independent maker · NZST / GMT+12</p><h1 className="max-w-3xl font-pixel text-4xl leading-[1.12] tracking-tight text-foreground sm:text-6xl lg:text-7xl">Small internet<br /><span className="text-primary">experiments,</span><br />built with care.</h1><p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground">{profile.bio} A living index of links, projects, and tiny interactive things.</p><div className="mt-8 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest"><span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-2 text-accent">● Available for interesting work</span><span className="rounded-full border border-border px-3 py-2 text-muted-foreground">Based in NZ</span></div></div><ProfileCard /></section>
      <section className="mt-28" aria-label="Pixel Pet Builder"><SectionIntro eyebrow="Interactive / 001" title="Build a little companion." detail="A tiny retro console for your very own pixel pet." /><div className="rounded-3xl border border-border bg-white/[.03] p-5 shadow-2xl shadow-black/20 sm:p-8"><HeroPet /></div></section>
      <section id="deck" className="mt-28" aria-label="Lab Deck"><SectionIntro eyebrow="Directory / 002" title="The Lab Deck" detail="Find me across the web. Drag, hover, or let it drift." /><LabDeck /></section>
      <section id="work" className="mt-28" aria-label="Projects"><SectionIntro eyebrow="Selected work / 003" title="Things in progress." detail="A few places where ideas become real, shipped software." /><ProjectsGrid /></section>
      <section id="radio" className="mt-28" aria-label="Music"><SectionIntro eyebrow="Ambient / 004" title="Now playing." detail="A small loop for focused making." /><AudioPlayer /></section>
      <section className="mt-20 flex flex-col items-start border-t border-border pt-8" aria-label="Contact"><p className="font-mono text-[10px] uppercase tracking-[.24em] text-accent">Say hello</p><h2 className="mt-3 font-pixel text-2xl">Have a good idea?</h2><div className="mt-5"><ContactChip email={profile.email} /></div></section>
    </main>
  </SmoothScroll>
}
