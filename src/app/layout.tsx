'use client'

import "./globals.css";
import { Providers } from './providers'
import Header from "./components/Header";
import PWAInstaller from "../components/PWAInstaller";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import IOSInstallPrompt from "../components/IOSInstallPrompt";
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
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sala Ana" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-touch-fullscreen" content="yes" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/sala-da-ana-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/sala-da-ana-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/sala-da-ana-192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/sala-da-ana-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/sala-da-ana-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/sala-da-ana-512.png" />
        
        {/* Splash screen para iPhone */}
        <link rel="apple-touch-startup-image" href="/sala-da-ana-192.png" />
      </head>
      <body>
        <Providers>
          <PWAInstaller />
          <PWAInstallPrompt />
          <IOSInstallPrompt />
          {pathname !== '/login' && <Header />}
          {children}
        </Providers>
      </body>
    </html>
  );
}
