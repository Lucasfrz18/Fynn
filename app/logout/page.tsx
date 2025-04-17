"use client"

import { useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const { signOut, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut()
        // La redirection est gérée dans le contexte d'authentification
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error)
        router.push("/login")
      }
    }

    performLogout()
  }, [signOut, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Déconnexion en cours...</h1>
        <div className="mt-4 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    </div>
  )
}
