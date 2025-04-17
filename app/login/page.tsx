"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { signIn, loading, isDemoMode: isInDemoMode, enableDemoMode } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)

  // Vérifier si Supabase est correctement configuré
  useEffect(() => {
    const checkSupabaseConfig = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Variables d'environnement Supabase manquantes")
        setSupabaseConfigured(false)
      } else {
        setSupabaseConfigured(true)
      }
    }

    checkSupabaseConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await signIn(email, password)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la connexion")
    }
  }

  // Activer le mode démo
  const handleDemoMode = () => {
    enableDemoMode()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex justify-center">
        <Image src="/logos/logo-entier-purple.svg" alt="Fynn" width={120} height={45} className="dark:hidden" />
        <Image src="/logos/logo-entier-white.svg" alt="Fynn" width={120} height={45} className="hidden dark:block" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="mt-2 text-muted-foreground">Connectez-vous à votre compte Fynn</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-100 p-3 text-sm dark:bg-red-900/30">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {!supabaseConfigured && !isInDemoMode && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/30">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Mode prévisualisation</h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              La connexion à Supabase n'est pas disponible dans cet environnement. Utilisez le mode démo pour explorer
              l'application.
            </p>
            <button
              onClick={handleDemoMode}
              className="mt-3 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
            >
              Activer le mode démo
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border bg-background pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Mot de passe oublié?
              </Link>
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2 font-medium text-primary-foreground disabled:opacity-70"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="text-center text-sm">
          <p>
            Vous n'avez pas de compte ?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
