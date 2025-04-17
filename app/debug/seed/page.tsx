"use client"

import { supabase } from '@/lib/supabase'
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { createClientComponentClient } from "@/lib/supabase"

export default function SeedPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const seedData = async () => {
    if (!user) {
      setError("Vous devez être connecté pour initialiser les données")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
     
      const userId = user.id
      const results: any = {}

      // 1. Créer des transactions
      const transactions = [
        {
          user_id: userId,
          amount: -45.8,
          date: new Date("2025-03-29T14:30:00").toISOString(),
          description: "Carrefour",
          category: "food",
          is_recurring: false,
        },
        {
          user_id: userId,
          amount: -12.5,
          date: new Date("2025-03-29T11:20:00").toISOString(),
          description: "Uber",
          category: "transportation",
          is_recurring: false,
        },
        {
          user_id: userId,
          amount: -29.99,
          date: new Date("2025-03-28T19:45:00").toISOString(),
          description: "Netflix",
          category: "entertainment",
          is_recurring: true,
        },
        {
          user_id: userId,
          amount: 1200,
          date: new Date("2025-03-27T09:00:00").toISOString(),
          description: "Salaire",
          category: "income",
          is_recurring: false,
        },
        {
          user_id: userId,
          amount: -85.2,
          date: new Date("2025-03-26T13:15:00").toISOString(),
          description: "EDF",
          category: "utilities",
          is_recurring: true,
        },
      ]

      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .insert(transactions)
        .select()

      results.transactions = {
        success: !transactionsError,
        count: transactionsData?.length || 0,
        error: transactionsError?.message,
      }

      // 2. Créer des prélèvements récurrents
      const recurringPayments = [
        {
          user_id: userId,
          name: "Loyer",
          amount: 650,
          date: 5,
          category: "housing",
          is_active: true,
        },
        {
          user_id: userId,
          name: "Netflix",
          amount: 29.99,
          date: 15,
          category: "entertainment",
          is_active: true,
        },
        {
          user_id: userId,
          name: "Spotify",
          amount: 9.99,
          date: 20,
          category: "entertainment",
          is_active: true,
        },
        {
          user_id: userId,
          name: "Forfait Mobile",
          amount: 19.99,
          date: 22,
          category: "utilities",
          is_active: true,
        },
        {
          user_id: userId,
          name: "Assurance Habitation",
          amount: 25.5,
          date: 28,
          category: "insurance",
          is_active: true,
        },
      ]

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("recurring_payments")
        .insert(recurringPayments)
        .select()

      results.recurringPayments = {
        success: !paymentsError,
        count: paymentsData?.length || 0,
        error: paymentsError?.message,
      }

      // 3. Créer des projets financiers
      const financialProjects = [
        {
          user_id: userId,
          name: "Voyage Japon",
          target_amount: 3000,
          current_amount: 1200,
          target_date: new Date("2025-07-15").toISOString(),
          category: "entertainment",
        },
        {
          user_id: userId,
          name: "Macbook Pro",
          target_amount: 2000,
          current_amount: 800,
          target_date: new Date("2025-05-01").toISOString(),
          category: "personal",
        },
      ]

      const { data: projectsData, error: projectsError } = await supabase
        .from("financial_projects")
        .insert(financialProjects)
        .select()

      results.financialProjects = {
        success: !projectsError,
        count: projectsData?.length || 0,
        error: projectsError?.message,
      }

      // 4. Mettre à jour le résumé financier
      const { data: summaryData, error: summaryError } = await supabase
        .from("financial_summaries")
        .update({
          current_balance: 2570.8,
          health_status: "good",
          monthly_income: 3200,
          monthly_expenses: 1850,
          recurring_payments: 780,
          daily_budget_remaining: 42.5,
        })
        .eq("user_id", userId)
        .select()

      results.financialSummary = {
        success: !summaryError,
        updated: !!summaryData?.length,
        error: summaryError?.message,
      }

      setResult(results)
    } catch (err) {
      console.error("Erreur lors de l'initialisation des données:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Initialisation des données de test</h1>

      <div className="space-y-4">
        <p className="text-muted-foreground">
          Cette page vous permet d'initialiser des données de test pour votre compte. Cela créera des transactions, des
          prélèvements récurrents et des projets financiers.
        </p>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-lg font-semibold mb-4">Données à initialiser</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>5 transactions (4 dépenses, 1 revenu)</li>
            <li>5 prélèvements récurrents</li>
            <li>2 projets financiers</li>
            <li>Mise à jour du résumé financier</li>
          </ul>
        </div>

        {error && (
          <div className="rounded-lg bg-danger/10 p-4 text-danger">
            <h3 className="font-semibold">Erreur</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-2">Résultats</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${result.transactions.success ? "bg-success" : "bg-danger"}`}
                ></div>
                <span>Transactions: {result.transactions.count} créées</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${result.recurringPayments.success ? "bg-success" : "bg-danger"}`}
                ></div>
                <span>Prélèvements récurrents: {result.recurringPayments.count} créés</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${result.financialProjects.success ? "bg-success" : "bg-danger"}`}
                ></div>
                <span>Projets financiers: {result.financialProjects.count} créés</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${result.financialSummary.success ? "bg-success" : "bg-danger"}`}
                ></div>
                <span>Résumé financier: {result.financialSummary.updated ? "Mis à jour" : "Non mis à jour"}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={seedData}
          disabled={loading || !user}
          className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
        >
          {loading ? "Initialisation en cours..." : "Initialiser les données"}
        </button>
      </div>
    </div>
  )
}
