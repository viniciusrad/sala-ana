'use client'

import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Registry from './registry'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Registry>
          <Providers>
            {children}
          </Providers>
        </Registry>
      </body>
    </html>
  )
}
