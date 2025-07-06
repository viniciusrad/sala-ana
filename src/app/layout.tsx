'use client'

import "./globals.css";
import { Providers } from './providers'
import Header from "./components/Header";
import PWAInstaller from "../components/PWAInstaller";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sala Ana" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/sala-da-ana-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/sala-da-ana-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/sala-da-ana-512.png" />
      </head>
      <body>
        <Providers>
          <PWAInstaller />
          <PWAInstallPrompt />
          {pathname !== '/login' && <Header />}
          {children}
        </Providers>
      </body>
    </html>
  );
}
