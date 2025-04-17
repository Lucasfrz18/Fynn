import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { AppProvider } from "@/components/app-provider"
import { ThemeProvider } from "@/theme"
import { AppShell } from "@/components/app-shell"
import { ToastProvider } from "@/components/toast-provider"

export const metadata: Metadata = {
  title: "Fynn - Gestion des finances personnelles",
  description: "Application mobile pour la gestion des finances personnelles",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <AppProvider>
              <ToastProvider />
              <AppShell>{children}</AppShell>
            </AppProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


import './globals.css'