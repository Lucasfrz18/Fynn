"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import { categoriesInfo } from "@/data/mock-data"
import type { TransactionCategory } from "@/types"
import { X } from "lucide-react"

interface AddTransactionFormProps {
  onClose: () => void
}

export function AddTransactionForm({ onClose }: AddTransactionFormProps) {
  const { addTransaction } = useApp()
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<TransactionCategory>("other")
  const [isIncome, setIsIncome] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const [transactionType, setTransactionType] = useState<"obligatoire" | "loisir" | "epargne">("obligatoire")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description || !amount) return

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) return

    addTransaction({
      amount: isIncome ? amountValue : -amountValue,
      date: new Date().toISOString(),
      description,
      category,
      isRecurring,
      transactionType: isIncome ? undefined : transactionType,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{isIncome ? "Ajouter un revenu" : "Ajouter une dépense"}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`rounded-lg border p-2 text-center ${!isIncome ? "border-primary bg-primary/10 text-primary" : ""}`}
                onClick={() => setIsIncome(false)}
              >
                Dépense
              </button>
              <button
                type="button"
                className={`rounded-lg border p-2 text-center ${isIncome ? "border-primary bg-primary/10 text-primary" : ""}`}
                onClick={() => setIsIncome(true)}
              >
                Revenu
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Carrefour, Salaire, etc."
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

          {!isIncome && (
            <div>
              <label className="mb-1 block text-sm font-medium">Type de dépense</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`flex flex-col items-center rounded-lg border p-2 ${
                    transactionType === "obligatoire" ? "border-primary bg-primary/10 text-primary" : ""
                  }`}
                  onClick={() => setTransactionType("obligatoire")}
                >
                  <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
                    <span className="text-white text-xs">O</span>
                  </div>
                  <span className="text-xs">Obligatoire</span>
                </button>
                <button
                  type="button"
                  className={`flex flex-col items-center rounded-lg border p-2 ${
                    transactionType === "loisir" ? "border-primary bg-primary/10 text-primary" : ""
                  }`}
                  onClick={() => setTransactionType("loisir")}
                >
                  <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500">
                    <span className="text-white text-xs">L</span>
                  </div>
                  <span className="text-xs">Loisir</span>
                </button>
                <button
                  type="button"
                  className={`flex flex-col items-center rounded-lg border p-2 ${
                    transactionType === "epargne" ? "border-primary bg-primary/10 text-primary" : ""
                  }`}
                  onClick={() => setTransactionType("epargne")}
                >
                  <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                    <span className="text-white text-xs">E</span>
                  </div>
                  <span className="text-xs">Épargne</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">Catégorie</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(categoriesInfo)
                .filter(([key]) => (isIncome ? key === "income" : key !== "income"))
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="recurring" className="ml-2 text-sm">
              Prélèvement récurrent
            </label>
          </div>

          <button type="submit" className="w-full rounded-lg bg-primary py-2 font-medium text-primary-foreground">
            Ajouter
          </button>
        </form>
      </div>
    </div>
  )
}
