"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { signUp } from "@/lib/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react"
import { toast } from "react-hot-toast"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)
  const router = useRouter()

  // Vérifier si Supabase est correctement configuré
  useEffect(() => {
    const checkSupabaseConfig = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Variables d'environnement Supabase manquantes")
        setSupabaseConfigured(false)
        setMessage("Configuration Supabase incomplète. Veuillez vérifier les variables d'environnement.")
        setIsError(true)
      } else {
        setSupabaseConfigured(true)
      }
    }

    checkSupabaseConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setIsError(false)

    if (!supabaseConfigured) {
      setMessage("Configuration Supabase incomplète. Impossible de s'inscrire pour le moment.")
      setIsError(true)
      setIsLoading(false)
      return
    }

    try {
      // Appeler la fonction signUp avec les paramètres corrects
      const result = await signUp(email, password, name)

      if (result.success) {
        setMessage("Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.")
        setIsError(false)

        // Afficher un toast de succès
        toast.success("Inscription réussie ! Redirection vers la page de connexion...")

        // Rediriger vers la page de connexion après 2 secondes
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setMessage(result.error || "Erreur lors de l'inscription")
        setIsError(true)
        toast.error(result.error || "Erreur lors de l'inscription")
      }
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error)
      setMessage(error.message || "Une erreur est survenue")
      setIsError(true)
      toast.error(error.message || "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  // Mode de démonstration pour l'environnement de prévisualisation
  const handleDemoMode = () => {
    toast.success("Mode démo activé ! Redirection vers la page d'accueil...")
    setTimeout(() => {
      router.push("/")
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex justify-center">
        <Image src="/logos/logo-entier-purple.svg" alt="Fynn" width={120} height={45} className="dark:hidden" />
        <Image src="/logos/logo-entier-white.svg" alt="Fynn" width={120} height={45} className="hidden dark:block" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="mt-2 text-muted-foreground">Rejoignez Fynn pour gérer vos finances</p>
        </div>

        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${isError ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-100" : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-100"}`}
          >
            <div className="flex items-center gap-2">
              {isError && <AlertCircle className="h-4 w-4" />}
              <span>{message}</span>
            </div>
          </div>
        )}

        {!supabaseConfigured && (
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
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nom
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border bg-background pl-10 pr-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                placeholder="Votre nom"
                required
              />
            </div>
          </div>

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
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Mot de passe
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
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Le mot de passe doit contenir au moins 6 caractères</p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !supabaseConfigured}
            className="w-full rounded-lg bg-primary py-2 font-medium text-primary-foreground disabled:opacity-70"
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>

        <div className="text-center text-sm">
          <p>
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
