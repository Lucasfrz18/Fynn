"use client"

import Image from "next/image"
import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function ErrorPage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex justify-center">
        <Image src="/logos/logo-entier-purple.svg" alt="Fynn" width={120} height={45} className="dark:hidden" />
        <Image src="/logos/logo-entier-white.svg" alt="Fynn" width={120} height={45} className="hidden dark:block" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-16 w-16 text-danger" />
          <h1 className="mt-4 text-2xl font-bold">Erreur de configuration</h1>
          <p className="mt-2 text-muted-foreground">
            L'application n'a pas pu se connecter à Supabase. Veuillez vérifier que les variables d'environnement sont
            correctement définies.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="font-medium">Variables d'environnement requises :</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 font-medium hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" /> Rafraîchir
          </button>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}
