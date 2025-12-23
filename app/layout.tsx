import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { TawkChat } from "@/components/tawk-chat"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Valor - Premium Gaming Software",
  description: "Undetected. Unstoppable. Premium gaming enhancement software for elite players.",
  keywords: ["gaming software", "cheats", "hacks", "undetected", "premium"],
  generator: "v0.app",
  icons: {
    icon: "https://i.postimg.cc/rsCspgyJ/image-removebg-preview.png",
    shortcut: "https://i.postimg.cc/rsCspgyJ/image-removebg-preview.png",
    apple: "https://i.postimg.cc/rsCspgyJ/image-removebg-preview.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
        <TawkChat />
      </body>
    </html>
  )
}

