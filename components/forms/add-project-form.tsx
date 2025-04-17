"use client"

import type React from "react"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import { categoriesInfo } from "@/data/mock-data"
import type { TransactionCategory } from "@/types"
import { X } from "lucide-react"

interface AddProjectFormProps {
  onClose: () => void
}

export function AddProjectForm({ onClose }: AddProjectFormProps) {
  const { addFinancialProject } = useApp()
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [category, setCategory] = useState<TransactionCategory>("other")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !targetAmount || !targetDate) return

    const targetAmountValue = Number.parseFloat(targetAmount)
    const currentAmountValue = currentAmount ? Number.parseFloat(currentAmount) : 0

    if (isNaN(targetAmountValue) || targetAmountValue <= 0) return
    if (isNaN(currentAmountValue) || currentAmountValue < 0) return

    addFinancialProject({
      name,
      targetAmount: targetAmountValue,
      currentAmount: currentAmountValue,
      targetDate,
      category,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ajouter un projet</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              Nom du projet
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Voyage, Achat, etc."
              required
            />
          </div>

          <div>
            <label htmlFor="targetAmount" className="mb-1 block text-sm font-medium">
              Montant cible (€)
            </label>
            <input
              type="number"
              id="targetAmount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label htmlFor="currentAmount" className="mb-1 block text-sm font-medium">
              Montant déjà épargné (€)
            </label>
            <input
              type="number"
              id="currentAmount"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="targetDate" className="mb-1 block text-sm font-medium">
              Date cible
            </label>
            <input
              type="date"
              id="targetDate"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Catégorie</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(categoriesInfo)
                .filter(([key]) => key !== "income")
                .map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    className={`flex flex-col items-center rounded-lg border p-2 ${
                      category === key ? "border-primary bg-primary/10 text-primary" : ""
                    }`}
                    onClick={() => setCategory(key as TransactionCategory)}
                  >
                    <div className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full ${info.color}`}>
                      <span className="text-white text-xs">{info.label.charAt(0)}</span>
                    </div>
                    <span className="text-xs">{info.label}</span>
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
