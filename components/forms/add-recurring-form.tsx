"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import { categoriesInfo } from "@/data/mock-data"
import type { TransactionCategory } from "@/types"
import { X } from "lucide-react"

interface AddRecurringFormProps {
  onClose: () => void
}

export function AddRecurringForm({ onClose }: AddRecurringFormProps) {
  const { addRecurringPayment } = useApp()
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("1")
  const [category, setCategory] = useState<TransactionCategory>("other")
  const [paymentType, setPaymentType] = useState<"obligatoire" | "loisir" | "epargne">("obligatoire")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !amount || !date) return

    const amountValue = Number.parseFloat(amount)
    const dateValue = Number.parseInt(date)

    if (isNaN(amountValue) || amountValue <= 0) return
    if (isNaN(dateValue) || dateValue < 1 || dateValue > 31) return

    // Déterminer la catégorie en fonction du type de paiement
    let finalCategory = category
    if (paymentType === "obligatoire") {
      // Catégories obligatoires: logement, transport, alimentation, factures, assurance, santé, dette
      if (!["housing", "transportation", "food", "utilities", "insurance", "healthcare", "debt"].includes(category)) {
        finalCategory = "utilities" // Par défaut si la catégorie ne correspond pas
      }
    } else if (paymentType === "loisir") {
      // Catégories loisirs: loisirs, personnel
      if (!["entertainment", "personal"].includes(category)) {
        finalCategory = "entertainment" // Par défaut si la catégorie ne correspond pas
      }
    } else if (paymentType === "epargne") {
      // Catégories épargne: épargne, éducation
      if (!["savings", "education"].includes(category)) {
        finalCategory = "savings" // Par défaut si la catégorie ne correspond pas
      }
    }

    addRecurringPayment({
      name,
      amount: amountValue,
      date: dateValue,
      category: finalCategory,
      isActive: true,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ajouter un prélèvement</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nom du service
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Netflix, Spotify, etc."
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="mb-1 block text-sm font-medium">
              Montant (€)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium">
              Jour du mois
            </label>
            <input
              type="number"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="1-31"
              min="1"
              max="31"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Type de dépense</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className={`flex flex-col items-center rounded-lg border p-2 ${
                  paymentType === "obligatoire" ? "border-primary bg-primary/10 text-primary" : ""
                }`}
                onClick={() => setPaymentType("obligatoire")}
              >
                <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
                  <span className="text-white text-xs">O</span>
                </div>
                <span className="text-xs">Obligatoire</span>
              </button>
              <button
                type="button"
                className={`flex flex-col items-center rounded-lg border p-2 ${
                  paymentType === "loisir" ? "border-primary bg-primary/10 text-primary" : ""
                }`}
                onClick={() => setPaymentType("loisir")}
              >
                <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500">
                  <span className="text-white text-xs">L</span>
                </div>
                <span className="text-xs">Loisir</span>
              </button>
              <button
                type="button"
                className={`flex flex-col items-center rounded-lg border p-2 ${
                  paymentType === "epargne" ? "border-primary bg-primary/10 text-primary" : ""
                }`}
                onClick={() => setPaymentType("epargne")}
              >
                <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                  <span className="text-white text-xs">E</span>
                </div>
                <span className="text-xs">Épargne</span>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Catégorie</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(categoriesInfo)
                .filter(([key]) => key !== "income")
                .slice(0, 8) // Limiter à 8 catégories principales
                .map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    className={`flex flex-col items-center rounded-lg border p-1 ${
                      category === key ? "border-primary bg-primary/10 text-primary" : ""
                    }`}
                    onClick={() => setCategory(key as TransactionCategory)}
                  >
                    <div className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full ${info.color}`}>
                      <span className="text-white text-xs">{info.label.charAt(0)}</span>
                    </div>
                    <span className="text-[10px]">{info.label}</span>
                  </button>
                ))}
            </div>
          </div>

          <button type="submit" className="w-full rounded-lg bg-primary py-2 font-medium text-primary-foreground">
            Ajouter
          </button>
        </form>
      </div>
    </div>
  )
}
