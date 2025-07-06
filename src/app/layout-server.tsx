import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sala Ana',
  description: 'Sistema de gerenciamento escolar Sala Ana',
  manifest: '/manifest.json',
  themeColor: '#1976d2',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sala Ana',
  },
  icons: {
    icon: [
      { url: '/sala-da-ana-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/sala-da-ana-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/sala-da-ana-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export default function RootLayoutServer({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sala Ana" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/sala-da-ana-192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
} 