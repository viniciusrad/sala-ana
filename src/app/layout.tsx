'use client'

import { Inter, Bangers } from "next/font/google";
import "./globals.css";
import { Providers } from './providers'
import Header from "./components/Header";
import { usePathname } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bangers",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${bangers.variable}`}>
        <Providers>
          {pathname !== '/login' && <Header />}
          {children}
        </Providers>
      </body>
    </html>
  );
}
