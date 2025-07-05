'use client'

import "./globals.css";
import { Providers } from './providers'
import Header from "./components/Header";
import { usePathname } from "next/navigation";
import dynamic from 'next/dynamic'

const AddToHomeScreen = dynamic(() => import('./components/AddToHomeScreen'), { ssr: false })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          {pathname !== '/login' && <Header />}
          {children}
          <AddToHomeScreen />
        </Providers>
      </body>
    </html>
  );
}
