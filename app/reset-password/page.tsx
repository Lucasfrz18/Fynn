"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Lock } from "lucide-react"
import { createClientComponentClient } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const { updatePassword, loading } = useAuth()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isValidHash, setIsValidHash] = useState(false)

  useEffect(() => {
    // Vérifier si l'URL contient un hash de réinitialisation valide
    const checkHash = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Erreur lors de la vérification de la session:", error)
          setIsValidHash(false)
          return
        }

        // Si nous avons une session et que l'URL contient un hash, c'est valide
        const hasHash = window.location.hash || window.location.search.includes("type=recovery")
        setIsValidHash(!!data.session)
      } catch (error) {
        console.error("Exception lors de la vérification du hash:", error)
        setIsValidHash(false)
      }
    }

    checkHash()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    try {
      await updatePassword(password)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la réinitialisation du mot de passe")
    }
  }

  if (!isValidHash) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mb-8 flex justify-center">
          <Image src="/logos/logo-entier-purple.svg" alt="Fynn" width={120} height={45} className="dark:hidden" />
          <Image src="/logos/logo-entier-white.svg" alt="Fynn" width={120} height={45} className="hidden dark:block" />
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Lien invalide</h1>
            <p className="mt-2 text-muted-foreground">Le lien de réinitialisation est invalide ou a expiré.</p>
          </div>

          <div className="flex justify-center">
            <Link
              href="/forgot-password"
              className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
            >
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex justify-center">
        <Image src="/logos/logo-entier-purple.svg" alt="Fynn" width={120} height={45} className="dark:hidden" />
        <Image src="/logos/logo-entier-white.svg" alt="Fynn" width={120} height={45} className="hidden dark:block" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Réinitialiser le mot de passe</h1>
          <p className="mt-2 text-muted-foreground">Créez un nouveau mot de passe pour votre compte</p>
        </div>

        {error && <div className="rounded-lg bg-danger/10 p-3 text-center text-sm text-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border bg-background pl-10 pr-10 py-2 outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border bg-background pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2 font-medium text-primary-foreground disabled:opacity-70"
          >
            {loading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  )
}
