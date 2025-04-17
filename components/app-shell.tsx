"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Home, BarChart3, Calendar, CreditCard, Lightbulb, User, LogOut } from "lucide-react"
import { NavLink } from "@/components/ui/nav-link"
import { useAuth } from "@/context/auth-context"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user: authUser, loading: authLoading, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Ce useEffect garantit que le composant est monté côté client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Afficher un état de chargement jusqu'à ce que le composant soit monté côté client
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté ou si nous sommes sur une page d'authentification, afficher uniquement le contenu sans la navigation
  const authPages = ["/login", "/register", "/forgot-password", "/reset-password"]
  if (!authUser || (pathname && authPages.includes(pathname))) {
    return <>{children}</>
  }

  // Si nous sommes en train de charger l'authentification, afficher un spinner
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-lg items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logos/logo-entier-purple.svg" alt="Fynn" width={80} height={30} className="dark:hidden" />
            <Image src="/logos/logo-entier-white.svg" alt="Fynn" width={80} height={30} className="hidden dark:block" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/profile" className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary/10">
                {authUser?.avatar ? (
                  <Image
                    src={authUser.avatar || "/placeholder.svg"}
                    alt={authUser.name || "Utilisateur"}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary">
                    <span className="text-xs font-bold">{authUser?.name ? authUser.name.charAt(0) : "U"}</span>
                  </div>
                )}
              </div>
            </Link>
            <button
              onClick={() => signOut()}
              className="hidden md:flex items-center gap-1 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container max-w-screen-lg pb-20 pt-4">{children}</div>
      </main>

      {/* Menu de navigation mobile et desktop */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-screen-lg">
          <div className="flex h-16 items-center justify-between">
            <NavLink href="/" icon={Home} label="" />
            <NavLink href="/transactions" icon={CreditCard} label="" />
            <NavLink href="/recurring" icon={Calendar} label="" />
            <NavLink href="/stats" icon={BarChart3} label="" />
            <NavLink href="/projects" icon={Lightbulb} label="" />
            <NavLink href="/profile" icon={User} label="" />
          </div>
        </div>
      </nav>
    </div>
  )
}
