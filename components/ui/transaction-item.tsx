"use client"

import type React from "react"
import { useState } from "react"
import type { Transaction } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { RefreshCw, Trash2, Edit, Save, X } from "lucide-react"
import { useApp } from "@/context/app-context"
import { categoriesInfo } from "@/data/mock-data"

interface TransactionItemProps {
  transaction: Transaction
  showActions?: boolean
}

export function TransactionItem({ transaction, showActions = false }: TransactionItemProps) {
  const { deleteTransaction, updateTransaction } = useApp()
  const { category, amount, description, date, isRecurring, transactionType } = transaction

  const [isEditing, setIsEditing] = useState(false)
  const [editDescription, setEditDescription] = useState(description)
  const [editAmount, setEditAmount] = useState(Math.abs(amount).toString())
  const [editDate, setEditDate] = useState(new Date(date).toISOString().split("T")[0])
  const [editCategory, setEditCategory] = useState(category)
  const [editIsRecurring, setEditIsRecurring] = useState(isRecurring || false)
  const [editTransactionType, setEditTransactionType] = useState(transactionType || "obligatoire")
  const [editIsIncome, setEditIsIncome] = useState(amount > 0)

  const formattedDate = format(new Date(date), "dd MMM HH:mm", { locale: fr })
  const isIncome = amount > 0

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) {
      deleteTransaction(transaction.id)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()

    const amountValue = Number.parseFloat(editAmount)
    if (isNaN(amountValue) || amountValue <= 0) return

    updateTransaction(transaction.id, {
      description: editDescription,
      amount: editIsIncome ? amountValue : -amountValue,
      date: new Date(editDate).toISOString(),
      category: editCategory,
      isRecurring: editIsRecurring,
      transactionType: editTransactionType,
    })

    setIsEditing(false)
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(false)
    // Reset form values
    setEditDescription(description)
    setEditAmount(Math.abs(amount).toString())
    setEditDate(new Date(date).toISOString().split("T")[0])
    setEditCategory(category)
    setEditIsRecurring(isRecurring || false)
    setEditTransactionType(transactionType || "obligatoire")
    setEditIsIncome(amount > 0)
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border bg-card p-4 my-3">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`rounded-lg border p-2 text-center ${!editIsIncome ? "border-primary bg-primary/10 text-primary" : ""}`}
                onClick={() => setEditIsIncome(false)}
              >
                Dépense
              </button>
              <button
                type="button"
                className={`rounded-lg border p-2 text-center ${editIsIncome ? "border-primary bg-primary/10 text-primary" : ""}`}
                onClick={() => setEditIsIncome(true)}
              >
                Revenu
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Montant (€)</label>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
              step="0.01"
              min="0"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Date</label>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {!editIsIncome && (
            <div>
              <label className="mb-1 block text-sm font-medium">Type de dépense</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className={`flex flex-col items-center rounded-lg border p-2 ${
                    editTransactionType === "obligatoire" ? "border-primary bg-primary/10 text-primary" : ""
                  }`}
                  onClick={() => setEditTransactionType("obligatoire")}
                >
                  <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
                    <span className="text-white text-xs">O</span>
                  </div>
                  <span className="text-xs">Obligatoire</span>
                </button>
                <button
                  type="button"
                  className={`flex flex-col items-center rounded-lg border p-2 ${
                    editTransactionType === "loisir" ? "border-primary bg-primary/10 text-primary" : ""
                  }`}
                  onClick={() => setEditTransactionType("loisir")}
                >
                  <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500">
                    <span className="text-white text-xs">L</span>
                  </div>
                  <span className="text-xs">Loisir</span>
                </button>
                <button
                  type="button"
                  className={`flex flex-col items-center rounded-lg border p-2 ${
                    editTransactionType === "epargne" ? "border-primary bg-primary/10 text-primary" : ""
                  }`}
                  onClick={() => setEditTransactionType("epargne")}
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
                .filter(([key]) => (editIsIncome ? key === "income" : key !== "income"))
                .slice(0, 8) // Limiter à 8 catégories principales
                .map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    className={`flex flex-col items-center rounded-lg border p-1 ${
                      editCategory === key ? "border-primary bg-primary/10 text-primary" : ""
                    }`}
                    onClick={() => setEditCategory(key as any)}
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
              id={`recurring-${transaction.id}`}
              checked={editIsRecurring}
              onChange={(e) => setEditIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor={`recurring-${transaction.id}`} className="ml-2 text-sm">
              Prélèvement récurrent
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex w-1/2 items-center justify-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium"
            >
              <X className="h-4 w-4" /> Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex w-1/2 items-center justify-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Save className="h-4 w-4" /> Enregistrer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center space-x-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${isIncome ? "bg-success/10" : "bg-danger/10"}`}
        >
          <span className={`text-sm font-medium ${isIncome ? "text-success" : "text-danger"}`}>
            {isIncome ? "+" : "-"}
          </span>
        </div>
        <div>
          <p className="font-medium">{description}</p>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
      </div>
      <div className="flex items-center">
        {isRecurring && <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />}
        <span className={`font-medium ${isIncome ? "text-success" : "text-danger"}`}>
          {isIncome ? "+" : "-"}
          {Math.abs(amount).toFixed(2)} €
        </span>

        {showActions && (
          <div className="ml-2 flex">
            <button
              onClick={handleEdit}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
