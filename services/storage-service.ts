import type { FinancialSummary, RecurringPayment, Transaction, FinancialProject, User } from "@/types"

// Clés de stockage
const STORAGE_KEYS = {
  USER: "fynn_user_data",
  FINANCIAL_SUMMARY: "fynn_financial_summary",
  TRANSACTIONS: "fynn_transactions",
  RECURRING_PAYMENTS: "fynn_recurring_payments",
  FINANCIAL_PROJECTS: "fynn_financial_projects",
  FIRST_USE: "fynn_first_use",
}

// Fonction générique pour sauvegarder des données
function saveData<T>(key: string, data: T): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

// Fonction générique pour récupérer des données
function getData<T>(key: string, defaultValue: T): T {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  }
  return defaultValue
}

// Fonctions spécifiques pour chaque type de données
export function saveUser(user: User): void {
  saveData(STORAGE_KEYS.USER, user)
}

export function getUser(defaultUser: User): User {
  return getData(STORAGE_KEYS.USER, defaultUser)
}

export function saveFinancialSummary(summary: FinancialSummary): void {
  saveData(STORAGE_KEYS.FINANCIAL_SUMMARY, summary)
}

export function getFinancialSummary(defaultSummary: FinancialSummary): FinancialSummary {
  return getData(STORAGE_KEYS.FINANCIAL_SUMMARY, defaultSummary)
}

export function saveTransactions(transactions: Transaction[]): void {
  saveData(STORAGE_KEYS.TRANSACTIONS, transactions)
}

export function getTransactions(defaultTransactions: Transaction[]): Transaction[] {
  return getData(STORAGE_KEYS.TRANSACTIONS, defaultTransactions)
}

export function saveRecurringPayments(payments: RecurringPayment[]): void {
  saveData(STORAGE_KEYS.RECURRING_PAYMENTS, payments)
}

export function getRecurringPayments(defaultPayments: RecurringPayment[]): RecurringPayment[] {
  return getData(STORAGE_KEYS.RECURRING_PAYMENTS, defaultPayments)
}

export function saveFinancialProjects(projects: FinancialProject[]): void {
  saveData(STORAGE_KEYS.FINANCIAL_PROJECTS, projects)
}

export function getFinancialProjects(defaultProjects: FinancialProject[]): FinancialProject[] {
  return getData(STORAGE_KEYS.FINANCIAL_PROJECTS, defaultProjects)
}

// Fonction pour réinitialiser toutes les données
export function resetAllData(): void {
  if (typeof window !== "undefined") {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }
}

// Fonction pour vérifier si c'est la première utilisation
export function isFirstUse(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.FIRST_USE) !== "false"
  }
  return true
}

// Fonction pour marquer comme non première utilisation
export function completeFirstUse(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.FIRST_USE, "false")
  }
}
