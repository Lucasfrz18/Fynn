"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"

export default function CheckRLSPage() {
  const { user } = useAuth()
  const [policies, setPolicies] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkPolicies = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/check-rls")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la vérification des politiques")
      }

      const data = await response.json()
      setPolicies(data.policies)
    } catch (error: any) {
      console.error("Erreur lors de la vérification des politiques:", error)
      setError(error.message || "Erreur lors de la vérification des politiques")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkPolicies()
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Vérification des politiques RLS</h1>

      <div className="space-y-4">
        <button
          onClick={checkPolicies}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
        >
          {loading ? "Vérification en cours..." : "Vérifier les politiques"}
        </button>

        {error && (
          <div className="rounded-lg bg-danger/10 p-4 text-danger">
            <h3 className="font-semibold">Erreur</h3>
            <p>{error}</p>
          </div>
        )}

        {policies && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-2">Politiques RLS pour la table profiles</h3>
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(policies, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
