"use client"

import { useAuth } from "@/context/auth-context"
import { useApp } from "@/context/app-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarIcon,
  Plus,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { TransactionItem } from "@/components/ui/transaction-item"
import { useTheme } from "@/theme"
import { ServiceLogo } from "@/components/ui/service-logo"

// Composant CardStat
function CardStat({
  title,
  value,
  icon: Icon,
  className = "",
}: { title: string; value: string; icon: any; className?: string }) {
  return (
    <div className={`rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-foreground/70" />
      </div>
      <p className="mt-2 text-xl md:text-2xl font-bold">{value}</p>
    </div>
  )
}

// Fonction pour générer un conseil personnalisé
function getPersonalizedTip(financialSummary: any) {
  if (!financialSummary) {
    return {
      text: "Bienvenue sur Fynn",
      icon: CheckCircle,
      color: "text-green-500",
    }
  }

  const { currentBalance, monthlyIncome, monthlyExpenses, dailyBudgetRemaining } = financialSummary
  const currentDay = new Date().getDate()
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const remainingDays = daysInMonth - currentDay

  // Calculer le budget restant pour le mois
  const monthlyBudget = monthlyIncome - monthlyExpenses
  const dailyIdealBudget = monthlyBudget / daysInMonth
  const budgetStatus = dailyBudgetRemaining / dailyIdealBudget

  if (budgetStatus < 0.5) {
    return {
      text: "Attention, votre budget quotidien est inférieur à la moitié de l'idéal. Essayez de réduire vos dépenses non essentielles.",
      icon: AlertCircle,
      color: "text-red-500",
    }
  } else if (budgetStatus < 0.8) {
    return {
      text: "Votre budget quotidien est un peu serré. Surveillez vos dépenses pour le reste du mois.",
      icon: Info,
      color: "text-yellow-500",
    }
  } else {
    return {
      text: "Bravo ! Vous gérez bien votre budget ce mois-ci. Continuez comme ça !",
      icon: CheckCircle,
      color: "text-green-500",
    }
  }
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const { financialSummary, transactions, recurringPayments } = useApp()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté, afficher un message
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mb-8">
          <Image src="/logos/logo-entier-purple.svg" alt="Fynn" width={120} height={45} className="dark:hidden" />
          <Image src="/logos/logo-entier-white.svg" alt="Fynn" width={120} height={45} className="hidden dark:block" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Bienvenue sur Fynn</h1>
        <p className="text-center mb-6">Veuillez vous connecter pour accéder à votre tableau de bord.</p>
        <Link href="/login" className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground">
          Se connecter
        </Link>
      </div>
    )
  }

  // Générer le conseil personnalisé
  const tip = getPersonalizedTip(financialSummary)
  const TipIcon = tip.icon

  // Récupérer les transactions récentes (max 5)
  const recentTransactions = transactions.slice(0, 5)

  // Récupérer les prélèvements à venir
  const today = new Date().getDate()
  const upcomingPayments = recurringPayments
    .filter((payment) => payment.date >= today)
    .sort((a, b) => a.date - b.date)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* En-tête avec salutation, solde et photo de profil */}
      <div className="rounded-xl gradient-primary p-4 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white/20">
                {user?.avatar ? (
                  <Image
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name || "Utilisateur"}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    unoptimized // Ajout pour éviter les problèmes de mise en cache
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-xl font-bold">{user?.name ? user.name.charAt(0) : "U"}</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-semibold">Bonjour, {user?.name || "Utilisateur"}</h1>
                <p className="text-xs md:text-sm opacity-90">
                  {new Date().toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-6">
          <p className="text-sm font-medium opacity-90">Solde actuel</p>
          <h2 className="text-2xl md:text-3xl font-bold">
            {financialSummary?.currentBalance?.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            }) || "0,00 €"}
          </h2>

          {/* Conseil personnalisé */}
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/10 p-2 text-sm">
            <TipIcon className={`h-4 w-4 ${tip.color}`} />
            <p>{tip.text}</p>
          </div>
        </div>
      </div>

      {/* Blocs statistiques */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <CardStat
          title="Revenus mensuels"
          value={`${financialSummary?.monthlyIncome?.toFixed(2) || "0.00"} €`}
          icon={TrendingUp}
          className="bg-[#4635B1]/10 dark:bg-[#4635B1]/20"
        />
        <CardStat
          title="Dépenses mensuelles"
          value={`${financialSummary?.monthlyExpenses?.toFixed(2) || "0.00"} €`}
          icon={TrendingDown}
          className="bg-[#B771E5]/10 dark:bg-[#B771E5]/20"
        />
        <CardStat
          title="Prélèvements"
          value={`${financialSummary?.recurringPayments?.toFixed(2) || "0.00"} €`}
          icon={CalendarIcon}
          className="bg-[#B771E5]/10 dark:bg-[#B771E5]/20"
        />
        <CardStat
          title="Budget quotidien"
          value={`${financialSummary?.dailyBudgetRemaining?.toFixed(2) || "0.00"} €`}
          icon={Wallet}
          className="bg-[#AEEA94]/20"
        />
      </div>

      {/* Prélèvements à venir */}
      {upcomingPayments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Prélèvements à venir</h2>
            <Link href="/recurring" className="text-xs font-medium text-primary">
              Voir tout
            </Link>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="space-y-3">
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ServiceLogo serviceName={payment.name} category={payment.category} size={40} />
                    <div>
                      <p className="font-medium">{payment.name}</p>
                      <p className="text-xs text-muted-foreground">Le {payment.date} de ce mois</p>
                    </div>
                  </div>
                  <span className="font-medium text-danger">-{payment.amount.toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactions récentes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Transactions récentes</h2>
          <Link href="/transactions" className="text-xs font-medium text-primary">
            Voir tout
          </Link>
        </div>
        <div className="rounded-xl border bg-card p-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => <TransactionItem key={transaction.id} transaction={transaction} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="mb-2 text-muted-foreground">Aucune transaction récente</p>
              <Link
                href="/transactions"
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Ajouter
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
