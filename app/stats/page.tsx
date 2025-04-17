"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowRight, BarChart3, HelpCircle, PieChart } from "lucide-react"
import { useApp } from "@/context/app-context"
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export default function StatsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [timeFrame, setTimeFrame] = useState("month")
  const [showRuleInfo, setShowRuleInfo] = useState(false)
  const { transactions, calculateStats } = useApp()

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Recalculer les statistiques au chargement de la page, mais une seule fois
  useEffect(() => {
    // Only calculate stats once when the page loads
    if (transactions.length > 0) {
      calculateStats()
    }
  }, []) // Empty dependency array to run only once

  // Afficher un état de chargement
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Données pour le graphique en camembert
  const COLORS = ["#4635B1", "#6C63FF", "#8F8AFF", "#A79AFF", "#C0B6FF", "#D8D2FF"]
  const RULE_COLORS = ["#4635B1", "#AEEA94", "#6C63FF"]

  // Calculer les données pour la règle 50/30/20
  const calculateRuleData = () => {
    // Catégories obligatoires: logement, transport, alimentation, factures, assurance, santé, dette
    const obligatoryCategories = ["housing", "transportation", "food", "utilities", "insurance", "healthcare", "debt"]

    // Catégories loisirs: loisirs, personnel
    const leisureCategories = ["entertainment", "personal"]

    // Catégories épargne: épargne, éducation
    const savingsCategories = ["savings", "education"]

    let obligatoryAmount = 0
    let leisureAmount = 0
    let savingsAmount = 0
    let otherAmount = 0

    // Calculer les montants par catégorie
    transactions.forEach((transaction) => {
      if (transaction.amount < 0) {
        // Uniquement les dépenses
        const amount = Math.abs(transaction.amount)

        if (obligatoryCategories.includes(transaction.category)) {
          obligatoryAmount += amount
        } else if (leisureCategories.includes(transaction.category)) {
          leisureAmount += amount
        } else if (savingsCategories.includes(transaction.category)) {
          savingsAmount += amount
        } else {
          otherAmount += amount
        }
      }
    })

    const totalAmount = obligatoryAmount + leisureAmount + savingsAmount + otherAmount

    // Calculer les pourcentages
    const obligatoryPercentage = totalAmount > 0 ? Math.round((obligatoryAmount / totalAmount) * 100) : 0
    const leisurePercentage = totalAmount > 0 ? Math.round((leisureAmount / totalAmount) * 100) : 0
    const savingsPercentage = totalAmount > 0 ? Math.round((savingsAmount / totalAmount) * 100) : 0

    return [
      { name: "Obligatoire", value: obligatoryPercentage, amount: obligatoryAmount, target: 50 },
      { name: "Loisirs", value: leisurePercentage, amount: leisureAmount, target: 30 },
      { name: "Épargne", value: savingsPercentage, amount: savingsAmount, target: 20 },
    ]
  }

  // Calculer les données pour le graphique de répartition des dépenses
  const calculateCategoryData = () => {
    const categoryAmounts: Record<string, number> = {}

    // Calculer les montants par catégorie
    transactions.forEach((transaction) => {
      if (transaction.amount < 0) {
        // Uniquement les dépenses
        const amount = Math.abs(transaction.amount)
        const category = transaction.category

        if (categoryAmounts[category]) {
          categoryAmounts[category] += amount
        } else {
          categoryAmounts[category] = amount
        }
      }
    })

    // Convertir en tableau pour le graphique
    const categoryData = Object.entries(categoryAmounts).map(([category, amount]) => ({
      name: category,
      value: amount,
    }))

    return categoryData.sort((a, b) => b.value - a.value).slice(0, 6) // Top 6 catégories
  }

  // Calculer les données pour le graphique d'évolution des revenus et dépenses
  const calculateMonthlyData = () => {
    const monthlyData: Record<string, { month: string; income: number; expenses: number }> = {}
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]

    // Initialiser les données mensuelles
    months.forEach((month, index) => {
      monthlyData[month] = { month, income: 0, expenses: 0 }
    })

    // Calculer les montants par mois
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const month = months[date.getMonth()]

      if (transaction.amount > 0) {
        monthlyData[month].income += transaction.amount
      } else {
        monthlyData[month].expenses += Math.abs(transaction.amount)
      }
    })

    // Convertir en tableau pour le graphique
    return Object.values(monthlyData)
  }

  const ruleData = calculateRuleData()
  const categoryData = calculateCategoryData()
  const monthlyData = calculateMonthlyData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Statistiques</h1>
        <select
          className="rounded-lg border bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
        >
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      {/* Graphique d'évolution des revenus et dépenses */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Évolution revenus/dépenses</h2>
          <button className="flex items-center gap-1 text-xs font-medium text-primary">
            Voir détails <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="mt-4 h-64">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}€`}
                />
                <Tooltip
                  formatter={(value) => [`${value} €`, ""]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                  }}
                />
                <Legend />
                <Bar name="Revenus" dataKey="income" fill="#4635B1" radius={[4, 4, 0, 0]} />
                <Bar name="Dépenses" dataKey="expenses" fill="#B771E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center flex flex-col items-center justify-center h-full">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Répartition des dépenses */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Répartition des dépenses</h2>
          <button className="flex items-center gap-1 text-xs font-medium text-primary">
            Voir détails <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="mt-4 h-64">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value.toFixed(2)} €`, ""]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem",
                    padding: "0.5rem",
                  }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center flex flex-col items-center justify-center h-full">
              <PieChart className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Règle 50/30/20 */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">Règle 50/30/20</h2>
            <button
              onClick={() => setShowRuleInfo(!showRuleInfo)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
          <div className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Recommandation</div>
        </div>

        {showRuleInfo && (
          <div className="mt-2 rounded-lg bg-muted p-3 text-sm">
            <p>
              La règle 50/30/20 est une méthode de gestion budgétaire qui recommande de répartir vos revenus comme suit
              :
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <span className="font-medium">50%</span> pour les besoins essentiels (logement, nourriture, factures...)
              </li>
              <li>
                <span className="font-medium">30%</span> pour les loisirs et envies
              </li>
              <li>
                <span className="font-medium">20%</span> pour l'épargne et les investissements
              </li>
            </ul>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {ruleData.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: RULE_COLORS[index % RULE_COLORS.length] }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.amount.toFixed(2)} €</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{item.value}%</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${item.value >= item.target ? "bg-success" : "bg-warning"}`}
                  style={{ width: `${(item.value / item.target) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {item.value >= item.target
                  ? `Vous êtes dans l'objectif (${item.target}%)`
                  : `Objectif: ${item.target}%`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
