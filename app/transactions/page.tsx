"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Plus, Filter, ArrowUpDown, Search } from "lucide-react"
import { useApp } from "@/context/app-context"
import { TransactionItem } from "@/components/ui/transaction-item"
import { AddTransactionForm } from "@/components/forms/add-transaction-form"

export default function TransactionsPage() {
  const { user, loading } = useAuth()
  const { transactions } = useApp()
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

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

  // Filtrer et trier les transactions
  const filteredTransactions = transactions
    .filter((transaction) => transaction.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })

  // Inverser l'ordre de tri
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Transactions</h1>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher une transaction..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border bg-background px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2">
          <Filter className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Bouton de tri */}
      <div className="flex justify-end">
        <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground" onClick={toggleSortOrder}>
          <ArrowUpDown className="h-3 w-3" />
          Trier par date ({sortOrder === "desc" ? "récent → ancien" : "ancien → récent"})
        </button>
      </div>

      {/* Liste des transactions */}
      <div className="rounded-xl border bg-card p-4">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-1 divide-y">
            {filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} showActions={true} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="mb-2 text-muted-foreground">
              {searchTerm ? "Aucune transaction trouvée" : "Aucune transaction"}
            </p>
            <button
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" /> Ajouter
            </button>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout de transaction */}
      {showAddForm && <AddTransactionForm onClose={() => setShowAddForm(false)} />}
    </div>
  )
}
