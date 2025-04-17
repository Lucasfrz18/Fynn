"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useApp } from "@/context/app-context"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDate, addMonths, subMonths } from "date-fns"
import { fr } from "date-fns/locale"
import { ServiceLogo } from "@/components/ui/service-logo"
import { AddRecurringForm } from "@/components/forms/add-recurring-form"

export default function RecurringPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { recurringPayments } = useApp()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showAddForm, setShowAddForm] = useState(false)

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Afficher un état de chargement
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Calculer le total des prélèvements
  const totalRecurring = recurringPayments.reduce((total, payment) => total + payment.amount, 0)

  // Générer les jours du mois
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Fonction pour obtenir les prélèvements d'un jour spécifique
  const getPaymentsForDay = (day: number) => {
    return recurringPayments.filter((payment) => payment.date === day)
  }

  // Navigation entre les mois
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Prélèvements</h1>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Sommaire des prélèvements */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Total des prélèvements</h3>
          <span className="font-semibold text-red-500">-{totalRecurring.toFixed(2)} €</span>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {recurringPayments.length} prélèvement{recurringPayments.length !== 1 ? "s" : ""} ce mois-ci
        </div>
      </div>

      {/* Calendrier des prélèvements */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-medium">{format(currentMonth, "MMMM yyyy", { locale: fr })}</h3>
          <button onClick={nextMonth} className="p-1 rounded-full hover:bg-muted">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
            <div key={i} className="text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: new Date(monthStart).getDay() === 0 ? 6 : new Date(monthStart).getDay() - 1 }).map(
            (_, i) => (
              <div key={`empty-${i}`} className="h-14 p-1"></div>
            ),
          )}

          {days.map((day, i) => {
            const dayNumber = getDate(day)
            const payments = getPaymentsForDay(dayNumber)

            return (
              <div
                key={i}
                className={`h-14 p-1 rounded-lg border ${payments.length > 0 ? "border-primary/50 bg-primary/5" : ""}`}
              >
                <div className="text-xs font-medium mb-1">{dayNumber}</div>
                <div className="flex flex-wrap gap-1">
                  {payments.slice(0, 2).map((payment, j) => (
                    <div key={j} className="h-4 w-4">
                      <ServiceLogo serviceName={payment.name} category={payment.category} size={16} />
                    </div>
                  ))}
                  {payments.length > 2 && (
                    <div className="h-4 w-4 flex items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                      +{payments.length - 2}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Liste des prélèvements */}
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <h3 className="font-medium">Détail des prélèvements</h3>
        <div className="space-y-3">
          {recurringPayments.length > 0 ? (
            recurringPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <ServiceLogo serviceName={payment.name} category={payment.category} />
                  <div>
                    <p className="font-medium">{payment.name}</p>
                    <p className="text-xs text-muted-foreground">Le {payment.date} de chaque mois</p>
                  </div>
                </div>
                <span className="font-medium text-danger">-{payment.amount.toFixed(2)} €</span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <p className="mb-2 text-muted-foreground">Aucun prélèvement récurrent</p>
              <button
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4" /> Ajouter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire d'ajout de prélèvement */}
      {showAddForm && <AddRecurringForm onClose={() => setShowAddForm(false)} />}
    </div>
  )
}
