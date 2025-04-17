import Dexie, { type Table } from "dexie"
import type { User, FinancialSummary, Transaction, RecurringPayment, FinancialProject, UserPreferences } from "@/types"
import { v4 as uuidv4 } from "uuid"

// Définir la classe de la base de données
export class FynnDatabase extends Dexie {
  // Définir les tables
  users!: Table<User, string>
  financialSummaries!: Table<FinancialSummary, string>
  transactions!: Table<Transaction, string>
  recurringPayments!: Table<RecurringPayment, string>
  financialProjects!: Table<FinancialProject, string>
  userPreferences!: Table<UserPreferences, string>

  constructor() {
    super("fynnDatabase")

    // Définir le schéma de la base de données
    this.version(2).stores({
      users: "id, name, email",
      financialSummaries: "id, userId, currentBalance, healthStatus, monthlyIncome, monthlyExpenses",
      transactions: "id, userId, amount, date, description, category",
      recurringPayments: "id, userId, name, amount, date, category, isActive",
      financialProjects: "id, userId, name, targetAmount, currentAmount, targetDate, category",
      userPreferences: "id, userId, theme, notificationsEnabled",
    })
  }
}

// Créer une instance de la base de données
export const db = new FynnDatabase()

// Fonction pour initialiser la base de données avec des données par défaut
export async function initializeDatabase(userId: string) {
  try {
    console.log("Initialisation de la base de données pour l'utilisateur:", userId)

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.users.get(userId)

    if (!existingUser) {
      console.log("Création d'un nouvel utilisateur")
      // Créer un utilisateur par défaut
      await db.users.put({
        id: userId,
        name: "Lucas",
        email: "user@example.com",
      })
    }

    // Vérifier si le résumé financier existe déjà
    const existingSummary = await db.financialSummaries.where({ userId }).first()

    if (!existingSummary) {
      console.log("Création d'un nouveau résumé financier")
      // Créer un résumé financier par défaut
      await db.financialSummaries.put({
        id: uuidv4(),
        userId: userId,
        currentBalance: 2570.8,
        healthStatus: "good",
        monthlyIncome: 3200,
        monthlyExpenses: 1850,
        recurringPayments: 780,
        dailyBudgetRemaining: 42.5,
      })
    }

    // Vérifier si les préférences utilisateur existent déjà
    const existingPreferences = await db.userPreferences.where({ userId }).first()

    if (!existingPreferences) {
      console.log("Création de nouvelles préférences utilisateur")
      // Créer des préférences utilisateur par défaut
      await db.userPreferences.put({
        id: uuidv4(),
        userId: userId,
        theme: "light",
        notificationsEnabled: true,
      })
    }

    return true
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données:", error)
    return false
  }
}

// Fonction pour réinitialiser la base de données
export async function resetDatabase() {
  try {
    console.log("Réinitialisation de la base de données")
    await db.delete()
    window.location.reload()
    return true
  } catch (error) {
    console.error("Erreur lors de la réinitialisation de la base de données:", error)
    return false
  }
}

// Fonction pour sauvegarder les données dans le localStorage comme solution de secours
export function saveToLocalStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    console.log(`Données sauvegardées dans localStorage: ${key}`)
    return true
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde dans localStorage: ${key}`, error)
    return false
  }
}

// Fonction pour récupérer les données du localStorage
export function getFromLocalStorage(key: string, defaultValue: any = null) {
  try {
    const data = localStorage.getItem(key)
    if (data) {
      return JSON.parse(data)
    }
    return defaultValue
  } catch (error) {
    console.error(`Erreur lors de la récupération depuis localStorage: ${key}`, error)
    return defaultValue
  }
}
