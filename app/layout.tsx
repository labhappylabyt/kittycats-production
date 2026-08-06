import type { Metadata, Viewport } from 'next'
import { Fredoka } from 'next/font/google'
import './globals.css'

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'kittycats',
  description: 'The links of kittycats — GitHub, Discord, Roblox, NameMC, and more.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fdfbf7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`light bg-background ${fredoka.variable}`}>
      <body className="relative antialiased font-sans">
        {children}
        <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            © 2026 kittycats.cc. All rights reserved.
          </span>
        </footer>
      </body>
    </html>
  )
}
