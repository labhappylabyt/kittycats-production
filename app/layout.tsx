import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fredoka, Silkscreen } from 'next/font/google'
import { CinematicShell } from '@/components/cinematic-shell'
import './globals.css'

const ui = DM_Sans({ subsets: ['latin'], variable: '--font-ui', weight: ['400', '500', '600', '700'] })
const display = Fredoka({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700'] })
const pixel = Silkscreen({ subsets: ['latin'], variable: '--font-pixel', weight: ['400', '700'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://kittycats.cc'),
  title: 'kittycats.cc — Make a tiny companion',
  description: 'Make a pixel kitty, give them a little personality, and send your new companion out into the world.',
  generator: 'Next.js',
  icons: { icon: [{ url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' }, { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' }, { url: '/icon.svg', type: 'image/svg+xml' }], apple: '/apple-icon.png' },
  openGraph: { title: 'kittycats.cc — Make a tiny companion', description: 'Make a pixel kitty and send your new companion out into the world.', url: 'https://kittycats.cc', siteName: 'kittycats.cc', type: 'website', images: [{ url: '/placeholder.jpg', width: 1200, height: 630, alt: 'kittycats.cc pixel pet builder' }] },
  twitter: { card: 'summary_large_image', title: 'kittycats.cc — Make a tiny companion', description: 'Make a pixel kitty and send them out into the world.', images: ['/placeholder.jpg'] },
}

export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#1e1b2e' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${ui.variable} ${display.variable} ${pixel.variable}`}>
      <body className="relative min-h-screen antialiased">
        <CinematicShell>{children}</CinematicShell>
        <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pb-4">
          <span className="ui-label text-white/35">© 2026 kittycats.cc · made with care</span>
        </footer>
      </body>
    </html>
  )
}
