import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Navigation } from "@/components/layout/navigation"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { PWAProvider } from "@/components/pwa/pwa-provider"

export const metadata: Metadata = {
  title: "Sherdor Mebel - Mebel boshqaruv tizimi",
  description: "Sherdor Mebel uchun zamonaviy mebel boshqaruv web-ilovasi",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#1f2937",
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
    <html lang="uz">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sherdor Mebel" />
      </head>
      <body>
        <PWAProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-6">{children}</main>
            <InstallPrompt />
          </div>
        </PWAProvider>
      </body>
    </html>
  )
}
