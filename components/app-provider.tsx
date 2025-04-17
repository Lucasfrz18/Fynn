"use client"

import type React from "react"

import { AppProvider as AppContextProvider } from "@/context/app-context"

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Toujours fournir le contexte d'application, même si l'utilisateur n'est pas connecté
  return <AppContextProvider>{children}</AppContextProvider>
}
