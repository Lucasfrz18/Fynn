import type { FinancialHealthStatus, FinancialSummary, RecurringPayment, Transaction, FinancialProject } from "../types"

export const currentUser = {
  id: "1",
  name: "Lucas",
  email: "lucas@example.com",
  avatar: "/placeholder.svg?height=50&width=50",
}

export const financialSummary: FinancialSummary = {
  currentBalance: 2570.8,
  healthStatus: "good" as FinancialHealthStatus,
  monthlyIncome: 3200,
  monthlyExpenses: 1850,
  recurringPayments: 780,
  dailyBudgetRemaining: 42.5,
}

export const recentTransactions: Transaction[] = [
  {
    id: "1",
    amount: -45.8,
    date: "2025-03-29T14:30:00",
    description: "Carrefour",
    category: "food",
  },
  {
    id: "2",
    amount: -12.5,
    date: "2025-03-29T11:20:00",
    description: "Uber",
    category: "transportation",
  },
  {
    id: "3",
    amount: -29.99,
    date: "2025-03-28T19:45:00",
    description: "Netflix",
    category: "entertainment",
    isRecurring: true,
  },
  {
    id: "4",
    amount: 1200,
    date: "2025-03-27T09:00:00",
    description: "Salaire",
    category: "income",
  },
  {
    id: "5",
    amount: -85.2,
    date: "2025-03-26T13:15:00",
    description: "EDF",
    category: "utilities",
    isRecurring: true,
  },
]

export const recurringPayments: RecurringPayment[] = [
  {
    id: "1",
    name: "Loyer",
    amount: 650,
    date: 5,
    category: "housing",
    isActive: true,
  },
  {
    id: "2",
    name: "Netflix",
    amount: 29.99,
    date: 15,
    category: "entertainment",
    isActive: true,
  },
  {
    id: "3",
    name: "Spotify",
    amount: 9.99,
    date: 20,
    category: "entertainment",
    isActive: true,
  },
  {
    id: "4",
    name: "Forfait Mobile",
    amount: 19.99,
    date: 22,
    category: "utilities",
    isActive: true,
  },
  {
    id: "5",
    name: "Assurance Habitation",
    amount: 25.5,
    date: 28,
    category: "insurance",
    isActive: true,
  },
  {
    id: "6",
    name: "EDF",
    amount: 85.2,
    date: 1,
    category: "utilities",
    isActive: true,
  },
]

export const monthlyData = [
  { month: "Jan", income: 2800, expenses: 2100 },
  { month: "Fév", income: 3000, expenses: 2200 },
  { month: "Mar", income: 3200, expenses: 1850 },
  { month: "Avr", income: 3200, expenses: 2000 },
  { month: "Mai", income: 3400, expenses: 2100 },
  { month: "Juin", income: 3200, expenses: 2400 },
]

export const categoryData = [
  { category: "Logement", amount: 650, percentage: 35 },
  { category: "Alimentation", amount: 350, percentage: 19 },
  { category: "Transport", amount: 250, percentage: 14 },
  { category: "Loisirs", amount: 200, percentage: 11 },
  { category: "Factures", amount: 180, percentage: 10 },
  { category: "Autres", amount: 220, percentage: 12 },
]

export const financialProjects: FinancialProject[] = [
  {
    id: "1",
    name: "Voyage Japon",
    targetAmount: 3000,
    currentAmount: 1200,
    targetDate: "2025-07-15",
    category: "entertainment",
  },
  {
    id: "2",
    name: "Macbook Pro",
    targetAmount: 2000,
    currentAmount: 800,
    targetDate: "2025-05-01",
    category: "personal",
  },
]

export const categoriesInfo = {
  housing: {
    label: "Logement",
    color: "bg-blue-500",
    icon: "Home",
  },
  transportation: {
    label: "Transport",
    color: "bg-green-500",
    icon: "Car",
  },
  food: {
    label: "Alimentation",
    color: "bg-yellow-500",
    icon: "Utensils",
  },
  utilities: {
    label: "Factures",
    color: "bg-red-500",
    icon: "FileText",
  },
  insurance: {
    label: "Assurance",
    color: "bg-purple-500",
    icon: "Shield",
  },
  healthcare: {
    label: "Santé",
    color: "bg-teal-500",
    icon: "Heart",
  },
  savings: {
    label: "Épargne",
    color: "bg-indigo-500",
    icon: "PiggyBank",
  },
  debt: {
    label: "Dette",
    color: "bg-orange-500",
    icon: "CreditCard",
  },
  entertainment: {
    label: "Loisirs",
    color: "bg-pink-500",
    icon: "Film",
  },
  personal: {
    label: "Personnel",
    color: "bg-cyan-500",
    icon: "User",
  },
  education: {
    label: "Éducation",
    color: "bg-lime-500",
    icon: "BookOpen",
  },
  income: {
    label: "Revenus",
    color: "bg-emerald-500",
    icon: "TrendingUp",
  },
  other: {
    label: "Autre",
    color: "bg-gray-500",
    icon: "MoreHorizontal",
  },
}
