// Fonctions d'authentification simulées pour le mode démo
import { v4 as uuidv4 } from "uuid"
import { toast } from "react-hot-toast"

// Clés pour le stockage local
const DEMO_USER_KEY = "fynn_demo_user"
const DEMO_MODE_KEY = "fynn_demo_mode"

// Vérifier si le mode démo est activé
export const isDemoMode = () => {
  if (typeof window === "undefined") return false

  // Vérifier si nous sommes dans un environnement de prévisualisation
  const isPreviewEnv = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"

  // Vérifier si le mode démo est explicitement activé
  const demoModeEnabled = localStorage.getItem(DEMO_MODE_KEY) === "true"

  // Vérifier si les variables d'environnement Supabase sont manquantes
  const supabaseConfigMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return isPreviewEnv || demoModeEnabled || supabaseConfigMissing
}

// Activer explicitement le mode démo
export const enableDemoMode = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_MODE_KEY, "true")

    // Créer un utilisateur démo par défaut s'il n'existe pas déjà
    if (!localStorage.getItem(DEMO_USER_KEY)) {
      const demoUser = {
        id: uuidv4(),
        email: "demo@example.com",
        name: "Utilisateur Démo",
        avatar: null,
      }
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser))
    }

    toast.success("Mode démo activé")
    return true
  }
  return false
}

// Désactiver le mode démo
export const disableDemoMode = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEMO_MODE_KEY)
    toast.success("Mode démo désactivé")
    return true
  }
  return false
}

// Inscription simulée
export const mockSignUp = async (email: string, password: string, name: string) => {
  // Simuler un délai de réseau
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Créer un utilisateur simulé
  const mockUser = {
    id: uuidv4(),
    email,
    name: name || email.split("@")[0],
    avatar: null,
  }

  // Stocker l'utilisateur dans le localStorage pour la session de démo
  if (typeof window !== "undefined") {
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser))
    // Activer explicitement le mode démo
    localStorage.setItem(DEMO_MODE_KEY, "true")
  }

  return {
    success: true,
    data: {
      user: mockUser,
      session: {
        access_token: "demo_token",
        refresh_token: "demo_refresh_token",
        expires_at: Date.now() + 3600000, // 1 heure
      },
    },
  }
}

// Connexion simulée
export const mockSignIn = async (email: string, password: string) => {
  // Simuler un délai de réseau
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Récupérer l'utilisateur du localStorage ou créer un utilisateur par défaut
  let mockUser
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem(DEMO_USER_KEY)
    if (storedUser) {
      mockUser = JSON.parse(storedUser)
    } else {
      mockUser = {
        id: uuidv4(),
        email,
        name: email.split("@")[0],
        avatar: null,
      }
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser))
    }
    // Activer explicitement le mode démo
    localStorage.setItem(DEMO_MODE_KEY, "true")
  } else {
    mockUser = {
      id: uuidv4(),
      email,
      name: email.split("@")[0],
      avatar: null,
    }
  }

  return {
    success: true,
    data: {
      user: mockUser,
      session: {
        access_token: "demo_token",
        refresh_token: "demo_refresh_token",
        expires_at: Date.now() + 3600000, // 1 heure
      },
    },
  }
}

// Déconnexion simulée
export const mockSignOut = async () => {
  // Simuler un délai de réseau
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Supprimer l'utilisateur du localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEMO_USER_KEY)
    // Ne pas désactiver le mode démo automatiquement
  }

  return { success: true }
}

// Récupérer l'utilisateur démo actuel
export const getMockUser = () => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem(DEMO_USER_KEY)
    if (storedUser) {
      return JSON.parse(storedUser)
    }
  }
  return null
}

// Créer des données démo pour l'utilisateur
export const createMockUserData = (userId: string) => {
  return {
    profile: {
      id: userId,
      name: "Utilisateur Démo",
      email: "demo@example.com",
      avatar: null,
    },
    financialSummary: {
      id: uuidv4(),
      userId: userId,
      currentBalance: 2570.8,
      healthStatus: "good",
      monthlyIncome: 3200,
      monthlyExpenses: 1850,
      recurringPayments: 780,
      dailyBudgetRemaining: 42.5,
    },
    transactions: [
      {
        id: uuidv4(),
        userId: userId,
        amount: -45.8,
        date: new Date().toISOString(),
        description: "Carrefour",
        category: "food",
        isRecurring: false,
      },
      {
        id: uuidv4(),
        userId: userId,
        amount: 1200,
        date: new Date(Date.now() - 86400000).toISOString(), // Hier
        description: "Salaire",
        category: "income",
        isRecurring: false,
      },
    ],
    recurringPayments: [
      {
        id: uuidv4(),
        userId: userId,
        name: "Netflix",
        amount: 29.99,
        date: 15,
        category: "entertainment",
        isActive: true,
      },
      {
        id: uuidv4(),
        userId: userId,
        name: "Loyer",
        amount: 650,
        date: 5,
        category: "housing",
        isActive: true,
      },
    ],
    financialProjects: [
      {
        id: uuidv4(),
        userId: userId,
        name: "Voyage Japon",
        targetAmount: 3000,
        currentAmount: 1200,
        targetDate: new Date(Date.now() + 7776000000).toISOString(), // Dans 3 mois
        category: "entertainment",
      },
    ],
  }
}
