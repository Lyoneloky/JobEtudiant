import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TerraBio — Plantes médicinales du Cameroun',
  description: 'TerraBio vous aide à identifier les plantes médicinales locales du Cameroun, comprendre leurs usages et les utiliser en toute sécurité.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body style={{ fontFamily: '"Inter", Arial, sans-serif', background: '#F8FAF5' }}>
        {children}
      </body>
    </html>
  )
}
