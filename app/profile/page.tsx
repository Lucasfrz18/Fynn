"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  UserIcon,
  Mail,
  Lock,
  Bell,
  Palette,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Upload,
  X,
  Save,
  Edit,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronRight,
} from "lucide-react"
import { useTheme } from "@/theme"
import { useApp } from "@/context/app-context"
import { resetDatabase } from "@/lib/db"
import Image from "next/image"
import { ProfilePhotoModal } from "@/components/profile-photo-modal"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

// Composants pour les différentes sections de paramètres
const PersonalInfoSection = ({ user, updateUser }: { user: any; updateUser: any }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(user?.name || "")
  const [editEmail, setEditEmail] = useState(user?.email || "")
  const [isSaving, setIsSaving] = useState(false)

  // Mettre à jour les états d'édition lorsque l'utilisateur change
  useEffect(() => {
    if (user) {
      setEditName(user.name || "")
      setEditEmail(user.email || "")
    }
  }, [user])

  const saveChanges = async () => {
    try {
      setIsSaving(true)
      console.log("Enregistrement des informations personnelles:", { name: editName, email: editEmail })

      await updateUser({
        name: editName,
        email: editEmail,
      })

      // Attendre un peu pour que les mises à jour soient appliquées
      setTimeout(() => {
        setIsEditing(false)
        setIsSaving(false)
      }, 500)
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des informations personnelles:", error)
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Informations personnelles</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="edit-name" className="mb-1 block text-sm font-medium">
              Nom
            </label>
            <input
              type="text"
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="edit-email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex w-1/2 items-center justify-center gap-1 rounded-full border px-4 py-2 text-sm font-medium"
              disabled={isSaving}
            >
              <X className="h-4 w-4" /> Annuler
            </button>
            <button
              onClick={saveChanges}
              className="flex w-1/2 items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              disabled={isSaving}
            >
              {isSaving ? (
                "Enregistrement..."
              ) : (
                <>
                  <Save className="h-4 w-4" /> Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">{user?.name || "Non défini"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || "Non défini"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SecuritySection = () => {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Sécurité et mot de passe</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mot de passe</p>
              <p className="font-medium">••••••••</p>
            </div>
          </div>
          <button className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Modifier</button>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Question de sécurité</p>
              <p className="font-medium">Non configurée</p>
            </div>
          </div>
          <button className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Configurer</button>
        </div>
      </div>
    </div>
  )
}

const NotificationsSection = () => {
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Notifications</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Notifications push</p>
              <p className="text-sm text-muted-foreground">Recevoir des alertes sur votre appareil</p>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={pushNotifications}
              onChange={() => setPushNotifications(!pushNotifications)}
            />
            <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary/20"></div>
          </label>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Notifications par email</p>
              <p className="text-sm text-muted-foreground">Recevoir des alertes par email</p>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
            />
            <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary/20"></div>
          </label>
        </div>
      </div>
    </div>
  )
}

const HelpSection = () => {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Aide et support</h2>
      <div className="space-y-3">
        <div className="rounded-lg border p-3">
          <h3 className="font-medium">Centre d'aide</h3>
          <p className="text-sm text-muted-foreground">Consultez notre documentation et nos guides</p>
          <button className="mt-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Accéder</button>
        </div>
        <div className="rounded-lg border p-3">
          <h3 className="font-medium">Contacter le support</h3>
          <p className="text-sm text-muted-foreground">Besoin d'aide ? Contactez notre équipe</p>
          <button className="mt-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Contacter
          </button>
        </div>
        <div className="rounded-lg border p-3">
          <h3 className="font-medium">FAQ</h3>
          <p className="text-sm text-muted-foreground">Questions fréquemment posées</p>
          <button className="mt-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Consulter
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { updateUser, financialSummary, updateFinancialSummary } = useApp()
  const [notifications, setNotifications] = useState(true)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false)

  // États pour l'édition du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState(user?.name || "")
  const [editEmail, setEditEmail] = useState(user?.email || "")
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatar || null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // États pour l'édition des finances
  const [isEditingFinances, setIsEditingFinances] = useState(false)
  const [editIncome, setEditIncome] = useState(financialSummary?.monthlyIncome?.toString() || "0")
  const [editExpenses, setEditExpenses] = useState(financialSummary?.monthlyExpenses?.toString() || "0")
  const [editBalance, setEditBalance] = useState(financialSummary?.currentBalance?.toString() || "0")
  const [isSavingFinances, setIsSavingFinances] = useState(false)

  // État pour la section active
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Mettre à jour les états d'édition lorsque l'utilisateur change
  useEffect(() => {
    if (user) {
      console.log("User updated in profile page:", user)
      setEditName(user.name || "")
      setEditEmail(user.email || "")
      setProfileImage(user.avatar || null)
    }
  }, [user])

  // Mettre à jour les états d'édition lorsque le résumé financier change
  useEffect(() => {
    if (financialSummary) {
      setEditIncome(financialSummary.monthlyIncome?.toString() || "0")
      setEditExpenses(financialSummary.monthlyExpenses?.toString() || "0")
      setEditBalance(financialSummary.currentBalance?.toString() || "0")
    }
  }, [financialSummary])

  // Afficher un état de chargement
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const handleReset = async () => {
    await resetDatabase()
    signOut()
    router.push("/login")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Améliorer la fonction saveProfileChanges pour s'assurer que les modifications sont correctement enregistrées
  const saveProfileChanges = async () => {
    try {
      setIsSavingProfile(true)
      console.log("Enregistrement des modifications du profil:", {
        name: editName,
        email: editEmail,
        avatar: profileImage,
      })

      // Mettre à jour l'utilisateur
      await updateUser({
        name: editName,
        email: editEmail,
        avatar: profileImage || undefined,
      })

      // Attendre un peu pour que les mises à jour soient appliquées
      setTimeout(() => {
        setIsEditingProfile(false)
        setIsSavingProfile(false)
      }, 500)
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des modifications du profil:", error)
      setIsSavingProfile(false)
    }
  }

  // Améliorer la fonction saveFinanceChanges pour s'assurer que les modifications sont correctement enregistrées
  const saveFinanceChanges = async () => {
    try {
      setIsSavingFinances(true)
      console.log("Enregistrement des modifications financières:", {
        income: editIncome,
        expenses: editExpenses,
        balance: editBalance,
      })

      const income = Number.parseFloat(editIncome)
      const expenses = Number.parseFloat(editExpenses)
      const balance = Number.parseFloat(editBalance)

      if (!isNaN(income) && !isNaN(expenses) && !isNaN(balance)) {
        await updateFinancialSummary({
          monthlyIncome: income,
          monthlyExpenses: expenses,
          currentBalance: balance,
          dailyBudgetRemaining: (income - expenses) / 30,
        })
      }

      // Attendre un peu pour que les mises à jour soient appliquées
      setTimeout(() => {
        setIsEditingFinances(false)
        setIsSavingFinances(false)
      }, 500)
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des modifications financières:", error)
      setIsSavingFinances(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Profil</h1>
      </div>

      {/* Informations utilisateur */}
      <div className="flex flex-col items-center rounded-xl border bg-card p-6 text-center">
        <div className="relative">
          <div
            className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary"
            onClick={() => setShowProfilePhotoModal(true)}
          >
            {user.avatar ? (
              <Image
                src={user.avatar || "/placeholder.svg"}
                alt="Profile"
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-10 w-10" />
            )}
          </div>
          <button
            onClick={() => setShowProfilePhotoModal(true)}
            className="absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Upload className="h-3 w-3" />
          </button>
        </div>

        {isEditingProfile ? (
          <div className="mt-4 w-full space-y-3">
            <div>
              <label htmlFor="edit-name" className="mb-1 block text-left text-sm font-medium">
                Nom
              </label>
              <input
                type="text"
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="edit-email" className="mb-1 block text-left text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="edit-email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex w-1/2 items-center justify-center gap-1 rounded-full border px-4 py-2 text-sm font-medium"
                disabled={isSavingProfile}
              >
                <X className="h-4 w-4" /> Annuler
              </button>
              <button
                onClick={saveProfileChanges}
                className="flex w-1/2 items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  "Enregistrement..."
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="mt-4 text-xl font-semibold">{user?.name || "Utilisateur"}</h2>
            <p className="text-sm text-muted-foreground">{user.email || "Email non défini"}</p>
            <button
              className="mt-4 flex items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={() => setIsEditingProfile(true)}
            >
              <Edit className="h-4 w-4" /> Modifier le profil
            </button>
          </>
        )}
      </div>

      {/* Finances */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-medium">Finances</h2>
          {!isEditingFinances && (
            <button
              onClick={() => setIsEditingFinances(true)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>

        {isEditingFinances ? (
          <div className="space-y-3 p-4">
            <div>
              <label htmlFor="edit-balance" className="mb-1 block text-sm font-medium">
                Solde actuel (€)
              </label>
              <input
                type="number"
                id="edit-balance"
                value={editBalance}
                onChange={(e) => setEditBalance(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="edit-income" className="mb-1 block text-sm font-medium">
                Revenus mensuels (€)
              </label>
              <input
                type="number"
                id="edit-income"
                value={editIncome}
                onChange={(e) => setEditIncome(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="edit-expenses" className="mb-1 block text-sm font-medium">
                Dépenses mensuelles (€)
              </label>
              <input
                type="number"
                id="edit-expenses"
                value={editExpenses}
                onChange={(e) => setEditExpenses(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                step="0.01"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingFinances(false)}
                className="flex w-1/2 items-center justify-center gap-1 rounded-full border px-4 py-2 text-sm font-medium"
                disabled={isSavingFinances}
              >
                <X className="h-4 w-4" /> Annuler
              </button>
              <button
                onClick={saveFinanceChanges}
                className="flex w-1/2 items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                disabled={isSavingFinances}
              >
                {isSavingFinances ? (
                  "Enregistrement..."
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-1">
            <div className="flex w-full items-center justify-between rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Wallet className="h-4 w-4" />
                </div>
                <span>Solde actuel</span>
              </div>
              <span className="font-medium">{financialSummary?.currentBalance?.toFixed(2) || "0.00"} €</span>
            </div>
            <div className="flex w-full items-center justify-between rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span>Revenus mensuels</span>
              </div>
              <span className="font-medium">{financialSummary?.monthlyIncome?.toFixed(2) || "0.00"} €</span>
            </div>
            <div className="flex w-full items-center justify-between rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-danger">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <span>Dépenses mensuelles</span>
              </div>
              <span className="font-medium">{financialSummary?.monthlyExpenses?.toFixed(2) || "0.00"} €</span>
            </div>
            <div className="flex w-full items-center justify-between rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Wallet className="h-4 w-4" />
                </div>
                <span>Budget quotidien</span>
              </div>
              <span className="font-medium">{financialSummary?.dailyBudgetRemaining?.toFixed(2) || "0.00"} €</span>
            </div>
          </div>
        )}
      </div>

      {/* Paramètres */}
      <div className="rounded-xl border bg-card">
        <div className="p-4">
          <h2 className="font-medium">Paramètres</h2>
        </div>
        <div className="space-y-1 p-1">
          <button
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
            onClick={() => setActiveSection(activeSection === "personal" ? null : "personal")}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserIcon className="h-4 w-4" />
              </div>
              <span>Informations personnelles</span>
            </div>
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform ${activeSection === "personal" ? "rotate-90" : ""}`}
            />
          </button>

          {activeSection === "personal" && <PersonalInfoSection user={user} updateUser={updateUser} />}

          <button
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
            onClick={() => setActiveSection(activeSection === "security" ? null : "security")}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lock className="h-4 w-4" />
              </div>
              <span>Sécurité et mot de passe</span>
            </div>
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform ${activeSection === "security" ? "rotate-90" : ""}`}
            />
          </button>

          {activeSection === "security" && <SecuritySection />}

          <div className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-muted">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <span>Notifications</span>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
              <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-primary/20"></div>
            </label>
          </div>
          <div className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-muted">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Palette className="h-4 w-4" />
              </div>
              <span>Thème</span>
            </div>
            <button onClick={toggleTheme} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
          <button
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
            onClick={() => setActiveSection(activeSection === "help" ? null : "help")}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HelpCircle className="h-4 w-4" />
              </div>
              <span>Aide et support</span>
            </div>
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform ${activeSection === "help" ? "rotate-90" : ""}`}
            />
          </button>

          {activeSection === "help" && <HelpSection />}
        </div>
      </div>

      {/* Bouton de déconnexion */}
      <button
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500 bg-red-100 p-3 text-red-500"
        onClick={handleReset}
      >
        <LogOut className="h-4 w-4" />
        <span>Déconnexion</span>
      </button>

      {showProfilePhotoModal && <ProfilePhotoModal onClose={() => setShowProfilePhotoModal(false)} />}
    </div>
  )
}
