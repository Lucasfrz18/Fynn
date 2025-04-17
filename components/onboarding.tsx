"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import Image from "next/image"
import { ArrowRight, ArrowLeft, Upload, User, X } from "lucide-react"
import type { TransactionCategory } from "@/types"
import { categoriesInfo } from "@/data/mock-data"

export function Onboarding() {
  const { user, updateUser, financialSummary, updateFinancialSummary, completeOnboarding, addRecurringPayment } =
    useApp()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [balance, setBalance] = useState("0")
  const [income, setIncome] = useState("0")
  const [expenses, setExpenses] = useState("0")
  const [profileImage, setProfileImage] = useState<string | null>(null)

  // État pour les prélèvements récurrents
  const [showAddRecurring, setShowAddRecurring] = useState(false)
  const [recurringName, setRecurringName] = useState("")
  const [recurringAmount, setRecurringAmount] = useState("")
  const [recurringDate, setRecurringDate] = useState("1")
  const [recurringCategory, setRecurringCategory] = useState<TransactionCategory>("housing")
  const [recurringPayments, setRecurringPayments] = useState<
    Array<{ name: string; amount: number; date: number; category: TransactionCategory }>
  >([])

  const handleNext = () => {
    if (step === 0 && name.trim()) {
      // Correction: Mise à jour de l'utilisateur avec l'image de profil
      updateUser({
        ...user,
        name,
        email,
        avatar: profileImage || undefined,
      })
      setStep(1)
    } else if (step === 1 && balance.trim()) {
      const balanceValue = Number.parseFloat(balance)
      if (!isNaN(balanceValue)) {
        setStep(2)
      }
    } else if (step === 2 && income.trim()) {
      const incomeValue = Number.parseFloat(income)
      if (!isNaN(incomeValue)) {
        setStep(3)
      }
    } else if (step === 3 && expenses.trim()) {
      const expensesValue = Number.parseFloat(expenses)
      if (!isNaN(expensesValue)) {
        setStep(4)
      }
    } else if (step === 4) {
      // Enregistrer tous les prélèvements récurrents
      recurringPayments.forEach((payment) => {
        addRecurringPayment({
          name: payment.name,
          amount: payment.amount,
          date: payment.date,
          category: payment.category,
          isActive: true,
        })
      })

      // Calculer le total des prélèvements
      const totalRecurring = recurringPayments.reduce((total, payment) => total + payment.amount, 0)

      // Mettre à jour le résumé financier
      updateFinancialSummary({
        currentBalance: Number.parseFloat(balance),
        healthStatus: "good",
        monthlyIncome: Number.parseFloat(income),
        monthlyExpenses: Number.parseFloat(expenses),
        recurringPayments: totalRecurring,
        dailyBudgetRemaining: (Number.parseFloat(income) - Number.parseFloat(expenses)) / 30,
      })

      // Assurons-nous que l'utilisateur est bien mis à jour avec l'image de profil
      updateUser({
        ...user,
        name,
        email,
        avatar: profileImage || undefined,
      })

      completeOnboarding()
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addRecurring = () => {
    if (!recurringName || !recurringAmount || !recurringDate) return

    const amount = Number.parseFloat(recurringAmount)
    const date = Number.parseInt(recurringDate)

    if (isNaN(amount) || amount <= 0) return
    if (isNaN(date) || date < 1 || date > 31) return

    setRecurringPayments([
      ...recurringPayments,
      {
        name: recurringName,
        amount,
        date,
        category: recurringCategory,
      },
    ])

    // Réinitialiser le formulaire
    setRecurringName("")
    setRecurringAmount("")
    setRecurringDate("1")
    setRecurringCategory("housing")
    setShowAddRecurring(false)
  }

  const removeRecurring = (index: number) => {
    setRecurringPayments(recurringPayments.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex justify-center">
        <Image src="/logos/logo-entier-purple.svg" alt="Fynn" width={120} height={45} className="dark:hidden" />
        <Image src="/logos/logo-entier-white.svg" alt="Fynn" width={120} height={45} className="hidden dark:block" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Bienvenue sur Fynn</h1>
          <p className="mt-2 text-muted-foreground">
            {step === 0 && "Commençons par faire connaissance"}
            {step === 1 && "Configurons votre compte"}
            {step === 2 && "Quels sont vos revenus mensuels ?"}
            {step === 3 && "Quelles sont vos dépenses mensuelles ?"}
            {step === 4 && "Ajoutez vos prélèvements récurrents"}
          </p>
        </div>

        <div className="space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                    {profileImage ? (
                      <Image
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12" />
                    )}
                  </div>
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      id="profile-image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">
                  Comment souhaitez-vous être appelé ?
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Votre prénom"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium">
                  Votre email (optionnel)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="votre@email.com"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <label htmlFor="balance" className="mb-1 block text-sm font-medium">
                Quel est votre solde actuel ? (€)
              </label>
              <input
                type="number"
                id="balance"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label htmlFor="income" className="mb-1 block text-sm font-medium">
                Quels sont vos revenus mensuels ? (€)
              </label>
              <input
                type="number"
                id="income"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <label htmlFor="expenses" className="mb-1 block text-sm font-medium">
                Quelles sont vos dépenses mensuelles ? (€)
              </label>
              <input
                type="number"
                id="expenses"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Prélèvements récurrents</h3>
                <button
                  onClick={() => setShowAddRecurring(true)}
                  className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
                >
                  Ajouter
                </button>
              </div>

              {recurringPayments.length > 0 ? (
                <div className="space-y-2">
                  {recurringPayments.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{payment.name}</p>
                        <p className="text-xs text-muted-foreground">Le {payment.date} de chaque mois</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-danger">-{payment.amount.toFixed(2)} €</span>
                        <button
                          onClick={() => removeRecurring(index)}
                          className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                  <p>Aucun prélèvement récurrent ajouté</p>
                  <p className="text-xs">Vous pourrez en ajouter plus tard</p>
                </div>
              )}

              {showAddRecurring && (
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Ajouter un prélèvement</h3>
                    <button onClick={() => setShowAddRecurring(false)} className="rounded-full p-1 hover:bg-muted">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <label htmlFor="recurring-name" className="mb-1 block text-xs font-medium">
                      Nom du service
                    </label>
                    <input
                      type="text"
                      id="recurring-name"
                      value={recurringName}
                      onChange={(e) => setRecurringName(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ex: Netflix, Loyer, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="recurring-amount" className="mb-1 block text-xs font-medium">
                      Montant (€)
                    </label>
                    <input
                      type="number"
                      id="recurring-amount"
                      value={recurringAmount}
                      onChange={(e) => setRecurringAmount(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label htmlFor="recurring-date" className="mb-1 block text-xs font-medium">
                      Jour du mois
                    </label>
                    <input
                      type="number"
                      id="recurring-date"
                      value={recurringDate}
                      onChange={(e) => setRecurringDate(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      placeholder="1-31"
                      min="1"
                      max="31"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">Catégorie</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(categoriesInfo)
                        .filter(([key]) => key !== "income")
                        .map(([key, info]) => (
                          <button
                            key={key}
                            type="button"
                            className={`flex flex-col items-center rounded-lg border p-2 ${
                              recurringCategory === key ? "border-primary bg-primary/10 text-primary" : ""
                            }`}
                            onClick={() => setRecurringCategory(key as TransactionCategory)}
                          >
                            <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full ${info.color}`}>
                              <span className="text-white text-xs">{info.label.charAt(0)}</span>
                            </div>
                            <span className="text-xs">{info.label}</span>
                          </button>
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={addRecurring}
                    className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground"
                  >
                    Ajouter
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            {step > 0 ? (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 rounded-lg border px-4 py-2 font-medium"
              >
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
            >
              {step < 4 ? "Continuer" : "Commencer"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-2 w-2 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
