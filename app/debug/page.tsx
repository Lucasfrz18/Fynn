"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useApp } from "@/context/app-context"
import { checkSupabaseConnection, checkAuthState, checkRLSPermissions } from "@/lib/debug-tools"

export default function DebugPage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const { user, financialSummary, transactions, recurringPayments, financialProjects, isLoading } = useApp()

  const [supabaseStatus, setSupabaseStatus] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [rlsStatus, setRlsStatus] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(false)

  const runTests = async () => {
    setIsChecking(true)

    // Vérifier la connexion à Supabase
    const connectionStatus = await checkSupabaseConnection()
    setSupabaseStatus(connectionStatus)

    // Vérifier l'état de l'authentification
    const authStateStatus = await checkAuthState()
    setAuthStatus(authStateStatus)

    // Vérifier les permissions RLS si l'utilisateur est authentifié
    if (authStateStatus.authenticated && authStateStatus.user) {
      const rlsPermissionsStatus = await checkRLSPermissions(authStateStatus.user.id)
      setRlsStatus(rlsPermissionsStatus)
    }

    setIsChecking(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Page de débogage</h1>

      <div className="space-y-4">
        <button
          onClick={runTests}
          disabled={isChecking}
          className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
        >
          {isChecking ? "Vérification en cours..." : "Exécuter les tests"}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* État de l'authentification */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">État de l'authentification</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Chargement Auth:</span> {authLoading ? "Oui" : "Non"}
              </p>
              <p>
                <span className="font-medium">Utilisateur Auth:</span> {authUser ? "Connecté" : "Non connecté"}
              </p>
              {authUser && (
                <>
                  <p>
                    <span className="font-medium">ID:</span> {authUser.id}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {authUser.email}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* État de l'application */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">État de l'application</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Chargement App:</span> {isLoading ? "Oui" : "Non"}
              </p>
              <p>
                <span className="font-medium">Utilisateur App:</span> {user ? user.name : "Non chargé"}
              </p>
              <p>
                <span className="font-medium">Transactions:</span> {transactions.length}
              </p>
              <p>
                <span className="font-medium">Prélèvements récurrents:</span> {recurringPayments.length}
              </p>
              <p>
                <span className="font-medium">Projets financiers:</span> {financialProjects.length}
              </p>
            </div>
          </div>

          {/* Statut de connexion Supabase */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Connexion Supabase</h2>
            {supabaseStatus ? (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Connecté:</span>{" "}
                  <span className={supabaseStatus.connected ? "text-green-500" : "text-red-500"}>
                    {supabaseStatus.connected ? "Oui" : "Non"}
                  </span>
                </p>
                {!supabaseStatus.connected && (
                  <p>
                    <span className="font-medium">Erreur:</span> {supabaseStatus.error}
                  </p>
                )}
              </div>
            ) : (
              <p>Chargement...</p>
            )}
          </div>

          {/* Statut d'authentification détaillé */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Authentification détaillée</h2>
            {authStatus ? (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Authentifié:</span>{" "}
                  <span className={authStatus.authenticated ? "text-green-500" : "text-red-500"}>
                    {authStatus.authenticated ? "Oui" : "Non"}
                  </span>
                </p>
                {!authStatus.authenticated && authStatus.error && (
                  <p>
                    <span className="font-medium">Erreur:</span> {authStatus.error}
                  </p>
                )}
              </div>
            ) : (
              <p>Chargement...</p>
            )}
          </div>

          {/* Statut des permissions RLS */}
          <div className="border rounded-lg p-4 col-span-1 md:col-span-2">
            <h2 className="text-lg font-semibold mb-2">Permissions RLS</h2>
            {rlsStatus ? (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Accès au profil:</span>{" "}
                  <span className={rlsStatus.profileAccess ? "text-green-500" : "text-red-500"}>
                    {rlsStatus.profileAccess ? "Oui" : "Non"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Accès aux transactions:</span>{" "}
                  <span className={rlsStatus.transactionsAccess ? "text-green-500" : "text-red-500"}>
                    {rlsStatus.transactionsAccess ? "Oui" : "Non"}
                  </span>
                </p>
                {rlsStatus.transactionsAccess && (
                  <p>
                    <span className="font-medium">Nombre de transactions:</span> {rlsStatus.transactionsCount}
                  </p>
                )}
                {rlsStatus.error && (
                  <p>
                    <span className="font-medium">Erreur:</span> {rlsStatus.error}
                  </p>
                )}
              </div>
            ) : (
              <p>Chargement ou non authentifié...</p>
            )}
          </div>
        </div>
      </div>

      {/* Données brutes pour le débogage */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Données brutes</h2>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Supabase Status</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
            {JSON.stringify(supabaseStatus, null, 2)}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Auth Status</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">RLS Status</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
            {JSON.stringify(rlsStatus, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
