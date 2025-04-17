export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export type FinancialHealthStatus = "good" | "warning" | "danger"

export interface Transaction {
  id: string
  userId: string
  amount: number
  date: string
  description: string
  category: TransactionCategory
  isRecurring?: boolean
  transactionType?: "obligatoire" | "loisir" | "epargne"
}

export type TransactionCategory =
  | "housing"
  | "transportation"
  | "food"
  | "utilities"
  | "insurance"
  | "healthcare"
  | "savings"
  | "debt"
  | "entertainment"
  | "personal"
  | "education"
  | "income"
  | "other"

export interface RecurringPayment {
  id: string
  userId: string
  name: string
  amount: number
  date: number // Jour du mois
  category: TransactionCategory
  isActive: boolean
}

export interface FinancialProject {
  id: string
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: TransactionCategory
}

export interface FinancialSummary {
  id: string
  userId: string
  currentBalance: number
  healthStatus: FinancialHealthStatus
  monthlyIncome: number
  monthlyExpenses: number
  recurringPayments: number
  dailyBudgetRemaining: number
}

export interface UserPreferences {
  id: string
  userId: string
  theme: "light" | "dark"
  notificationsEnabled: boolean
}
