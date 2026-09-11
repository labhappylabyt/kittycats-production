import type { Metadata, Viewport } from 'next'
import { Fredoka, Silkscreen } from 'next/font/google'
import { CinematicShell } from '@/components/cinematic-shell'
import './globals.css'

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  weight: ['400', '500', '600', '700'],
})

const silkscreen = Silkscreen({
  subsets: ['latin'],
  variable: '--font-pixel',
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://kittycats.cc'),
  title: 'kittycats.cc — Pixel Pet Builder & Lab Deck',
  description: 'Build your own pixel kitty, adopt it as a PNG, and explore my links across the web — GitHub, Discord, Roblox, NameMC, and more.',
  generator: 'Bolt',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'kittycats.cc — Pixel Pet Builder & Lab Deck',
    description: 'Build your own pixel kitty, adopt it as a PNG, and explore my links across the web.',
    url: 'https://kittycats.cc',
    siteName: 'kittycats.cc',
    type: 'website',
    images: [{ url: '/placeholder.jpg', width: 1200, height: 630, alt: 'kittycats.cc Pixel Pet Builder' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'kittycats.cc — Pixel Pet Builder & Lab Deck',
    description: 'Build your own pixel kitty, adopt it as a PNG, and explore my links across the web.',
    images: ['/placeholder.jpg'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#08090e',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${fredoka.variable} ${silkscreen.variable}`}>
      <body className="relative min-h-screen antialiased">
        <CinematicShell>{children}</CinematicShell>
        <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-4">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-white/35">
            © 2026 kittycats.cc · all signals received
          </span>
        </footer>
      </body>
    </html>
  )
}
