import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/layout/navigation"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { PWAProvider } from "@/components/pwa/pwa-provider"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Sherdor Mebel - Mebel boshqaruv tizimi",
  description: "Sherdor Mebel uchun zamonaviy mebel boshqaruv web-ilovasi",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#0891b2",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sherdor Mebel",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Sherdor Mebel",
    title: "Sherdor Mebel - Mebel boshqaruv tizimi",
    description: "Zamonaviy mebel boshqaruv web-ilovasi",
  },
  icons: {
    shortcut: "/icons/icon-192x192.png",
    apple: [{ url: "/icons/icon-192x192.png" }, { url: "/icons/icon-512x512.png", sizes: "512x512" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uz" className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sherdor Mebel" />
      </head>
      <body className="font-sans">
        <PWAProvider>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <Navigation />
            <main className="container mx-auto px-4 py-8 max-w-7xl">{children}</main>
            <InstallPrompt />
          </div>
        </PWAProvider>
      </body>
    </html>
  )
}
