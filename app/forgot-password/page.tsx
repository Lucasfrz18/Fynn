"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const { resetPassword, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await resetPassword(email)
      setSubmitted(true)
    } catch (error) {
      // Erreur gérée dans le contexte d'authentification
      console.error("Erreur lors de la réinitialisation du mot de passe:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex justify-center">
        <Image src="/logos/logo-entier-purple.svg" alt="Fynn" width={120} height={45} className="dark:hidden" />
        <Image src="/logos/logo-entier-white.svg" alt="Fynn" width={120} height={45} className="hidden dark:block" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
          <p className="mt-2 text-muted-foreground">
            {submitted
              ? "Vérifiez votre boîte de réception pour le lien de réinitialisation"
              : "Entrez votre email pour réinitialiser votre mot de passe"}
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-primary/10 p-4 text-center text-sm text-primary">
              Si votre email existe dans notre système, vous recevrez un lien de réinitialisation.
            </div>

            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-primary/10 p-3 text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à la connexion</span>
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2 font-medium text-primary-foreground disabled:opacity-70"
            >
              {loading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
