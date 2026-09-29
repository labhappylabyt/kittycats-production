import type { Metadata, Viewport } from 'next'
import { Fredoka, Silkscreen } from 'next/font/google'
import { site } from '@/config/site'
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
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
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
  openGraph: {
    title: site.title,
    description: site.description,
    url: site.url,
    siteName: site.domain,
    type: 'website',
    images: [{ url: '/placeholder.jpg', width: 1200, height: 630, alt: site.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description,
    images: ['/placeholder.jpg'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#16132b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-background ${fredoka.variable} ${silkscreen.variable}`}>
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
