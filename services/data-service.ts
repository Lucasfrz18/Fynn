import { createClientComponentClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import type { User, FinancialSummary, Transaction, RecurringPayment, FinancialProject, UserPreferences } from "@/types"

// Service de données amélioré avec meilleure gestion des erreurs
export const dataService = {
  // Récupérer les préférences utilisateur
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      ()

      // Récupérer les préférences utilisateur
      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle()

      if (error) {
        console.error("Erreur lors de la récupération des préférences:", error)
        // Retourner des préférences par défaut en cas d'erreur
        return {
          theme: "light",
          notificationsEnabled: true,
        }
      }

      // Si aucune préférence n'existe, retourner des préférences par défaut
      if (!data) {
        // Retourner des préférences par défaut
        return {
          theme: "light",
          notificationsEnabled: true,
        }
      }

      // Transformer les données de la base de données au format attendu
      return {
        theme: data.theme || "light",
        notificationsEnabled: data.notifications_enabled !== undefined ? data.notifications_enabled : true,
      }
    } catch (error) {
      console.error("Exception lors de la récupération des préférences:", error)
      // Retourner des préférences par défaut en cas d'erreur
      return {
        theme: "light",
        notificationsEnabled: true,
      }
    }
  },

  // Mettre à jour les préférences utilisateur
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      ()

      // Vérifier si les préférences existent
      const { data: existingPrefs, error: checkError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

      if (checkError) {
        console.error("Erreur lors de la vérification des préférences:", checkError)
        // Retourner les préférences fournies ou des valeurs par défaut
        return {
          theme: preferences.theme || "light",
          notificationsEnabled:
            preferences.notificationsEnabled !== undefined ? preferences.notificationsEnabled : true,
        }
      }

      // Si les préférences n'existent pas, essayer de les créer
      if (!existingPrefs) {
        try {
          const { error: insertError } = await supabase.from("user_preferences").insert({
            user_id: userId,
            theme: preferences.theme || "light",
            notifications_enabled:
              preferences.notificationsEnabled !== undefined ? preferences.notificationsEnabled : true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Erreur lors de la création des préférences:", insertError)
            // Si l'insertion échoue, retourner simplement les préférences fournies
            return {
              theme: preferences.theme || "light",
              notificationsEnabled:
                preferences.notificationsEnabled !== undefined ? preferences.notificationsEnabled : true,
            }
          }
        } catch (error) {
          console.error("Exception lors de la création des préférences:", error)
          // Retourner les préférences fournies
          return {
            theme: preferences.theme || "light",
            notificationsEnabled:
              preferences.notificationsEnabled !== undefined ? preferences.notificationsEnabled : true,
          }
        }
      } else {
        // Mettre à jour les préférences existantes
        try {
          const { error } = await supabase
            .from("user_preferences")
            .update({
              theme: preferences.theme,
              notifications_enabled: preferences.notificationsEnabled,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)

          if (error) {
            console.error("Erreur de mise à jour des préférences:", error)
            // Si la mise à jour échoue, retourner les préférences combinées
            return {
              theme: preferences.theme || existingPrefs.theme || "light",
              notificationsEnabled:
                preferences.notificationsEnabled !== undefined
                  ? preferences.notificationsEnabled
                  : existingPrefs.notifications_enabled !== undefined
                    ? existingPrefs.notifications_enabled
                    : true,
            }
          }
        } catch (error) {
          console.error("Exception lors de la mise à jour des préférences:", error)
          // Retourner les préférences combinées
          return {
            theme: preferences.theme || existingPrefs.theme || "light",
            notificationsEnabled:
              preferences.notificationsEnabled !== undefined
                ? preferences.notificationsEnabled
                : existingPrefs.notifications_enabled !== undefined
                  ? existingPrefs.notifications_enabled
                  : true,
          }
        }
      }

      // Retourner les préférences mises à jour
      return {
        theme: preferences.theme || (existingPrefs ? existingPrefs.theme : "light") || "light",
        notificationsEnabled:
          preferences.notificationsEnabled !== undefined
            ? preferences.notificationsEnabled
            : existingPrefs && existingPrefs.notifications_enabled !== undefined
              ? existingPrefs.notifications_enabled
              : true,
      }
    } catch (error) {
      console.error("Exception lors de la mise à jour des préférences:", error)
      // Retourner les préférences fournies ou des valeurs par défaut
      return {
        theme: preferences.theme || "light",
        notificationsEnabled: preferences.notificationsEnabled !== undefined ? preferences.notificationsEnabled : true,
      }
    }
  },

  // Mettre à jour le profil utilisateur
  async updateUserProfile(userId: string, userData: Partial<User>) {
    try {
      ()

      // Pour les mises à jour non sensibles, utiliser le client normal
      const { error } = await supabase
        .from("profiles")
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("Erreur de mise à jour du profil:", error)
        throw new Error(`Erreur lors de la mise à jour du profil: ${error.message}`)
      }

      return userData
    } catch (error) {
      console.error("Exception lors de la mise à jour du profil:", error)
      throw error
    }
  },

  // Mettre à jour le résumé financier
  async updateFinancialSummary(userId: string, summaryData: Partial<FinancialSummary>) {
    try {
      ()

      // Vérifier si le résumé financier existe
      const { data: existingSummary, error: checkError } = await supabase
        .from("financial_summaries")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (checkError) {
        console.error("Erreur lors de la vérification du résumé financier:", checkError)
        throw new Error(`Erreur lors de la vérification du résumé financier: ${checkError.message}`)
      }

      // Si le résumé n'existe pas, retourner simplement les données fournies
      if (!existingSummary) {
        console.warn("Le résumé financier n'existe pas pour l'utilisateur:", userId)
        return summaryData
      }

      // Mettre à jour le résumé financier
      const { error } = await supabase
        .from("financial_summaries")
        .update({
          current_balance: summaryData.currentBalance,
          health_status: summaryData.healthStatus,
          monthly_income: summaryData.monthlyIncome,
          monthly_expenses: summaryData.monthlyExpenses,
          recurring_payments: summaryData.recurringPayments,
          daily_budget_remaining: summaryData.dailyBudgetRemaining,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) {
        console.error("Erreur de mise à jour du résumé financier:", error)
        throw new Error(`Erreur lors de la mise à jour du résumé financier: ${error.message}`)
      }

      return summaryData
    } catch (error) {
      console.error("Exception lors de la mise à jour du résumé financier:", error)
      throw error
    }
  },

  // Ajouter une transaction
  async addTransaction(userId: string, transaction: Omit<Transaction, "id">) {
    try {
      ()
      const id = uuidv4()

      const { error } = await supabase.from("transactions").insert({
        id,
        user_id: userId,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        category: transaction.category,
        is_recurring: transaction.isRecurring,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Erreur d'ajout de transaction:", error)
        throw new Error(`Erreur lors de l'ajout de la transaction: ${error.message}`)
      }

      return {
        id,
        ...transaction,
      }
    } catch (error) {
      console.error("Exception lors de l'ajout de la transaction:", error)
      throw error
    }
  },

  // Supprimer une transaction
  async deleteTransaction(userId: string, transactionId: string) {
    try {
      ()

      const { error } = await supabase.from("transactions").delete().eq("id", transactionId).eq("user_id", userId)

      if (error) {
        console.error("Erreur de suppression de transaction:", error)
        throw new Error(`Erreur lors de la suppression de la transaction: ${error.message}`)
      }
    } catch (error) {
      console.error("Exception lors de la suppression de la transaction:", error)
      throw error
    }
  },

  // Ajouter un prélèvement récurrent
  async addRecurringPayment(userId: string, payment: Omit<RecurringPayment, "id">) {
    try {
      ()
      const id = uuidv4()

      const { error } = await supabase.from("recurring_payments").insert({
        id,
        user_id: userId,
        name: payment.name,
        amount: payment.amount,
        date: payment.date,
        category: payment.category,
        is_active: payment.isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Erreur d'ajout de prélèvement récurrent:", error)
        throw new Error(`Erreur lors de l'ajout du prélèvement récurrent: ${error.message}`)
      }

      return {
        id,
        ...payment,
      }
    } catch (error) {
      console.error("Exception lors de l'ajout du prélèvement récurrent:", error)
      throw error
    }
  },

  // Mettre à jour un prélèvement récurrent
  async updateRecurringPayment(userId: string, paymentId: string, payment: Partial<RecurringPayment>) {
    try {
      ()

      const { error } = await supabase
        .from("recurring_payments")
        .update({
          name: payment.name,
          amount: payment.amount,
          date: payment.date,
          category: payment.category,
          is_active: payment.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId)
        .eq("user_id", userId)

      if (error) {
        console.error("Erreur de mise à jour de prélèvement récurrent:", error)
        throw new Error(`Erreur lors de la mise à jour du prélèvement récurrent: ${error.message}`)
      }

      return {
        id: paymentId,
        ...payment,
      } as RecurringPayment
    } catch (error) {
      console.error("Exception lors de la mise à jour du prélèvement récurrent:", error)
      throw error
    }
  },

  // Supprimer un prélèvement récurrent
  async deleteRecurringPayment(userId: string, paymentId: string) {
    try {
      ()

      const { error } = await supabase.from("recurring_payments").delete().eq("id", paymentId).eq("user_id", userId)

      if (error) {
        console.error("Erreur de suppression de prélèvement récurrent:", error)
        throw new Error(`Erreur lors de la suppression du prélèvement récurrent: ${error.message}`)
      }
    } catch (error) {
      console.error("Exception lors de la suppression du prélèvement récurrent:", error)
      throw error
    }
  },

  // Ajouter un projet financier
  async addFinancialProject(userId: string, project: Omit<FinancialProject, "id">) {
    try {
      ()
      const id = uuidv4()

      const { error } = await supabase.from("financial_projects").insert({
        id,
        user_id: userId,
        name: project.name,
        target_amount: project.targetAmount,
        current_amount: project.currentAmount,
        target_date: project.targetDate,
        category: project.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Erreur d'ajout de projet financier:", error)
        throw new Error(`Erreur lors de l'ajout du projet financier: ${error.message}`)
      }

      return {
        id,
        ...project,
      }
    } catch (error) {
      console.error("Exception lors de l'ajout du projet financier:", error)
      throw error
    }
  },

  // Mettre à jour un projet financier
  async updateFinancialProject(userId: string, projectId: string, project: Partial<FinancialProject>) {
    try {
      ()

      const { error } = await supabase
        .from("financial_projects")
        .update({
          name: project.name,
          target_amount: project.targetAmount,
          current_amount: project.currentAmount,
          target_date: project.targetDate,
          category: project.category,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .eq("user_id", userId)

      if (error) {
        console.error("Erreur de mise à jour de projet financier:", error)
        throw new Error(`Erreur lors de la mise à jour du projet financier: ${error.message}`)
      }

      return {
        id: projectId,
        ...project,
      } as FinancialProject
    } catch (error) {
      console.error("Exception lors de la mise à jour du projet financier:", error)
      throw error
    }
  },

  // Supprimer un projet financier
  async deleteFinancialProject(userId: string, projectId: string) {
    try {
      ()

      const { error } = await supabase.from("financial_projects").delete().eq("id", projectId).eq("user_id", userId)

      if (error) {
        console.error("Erreur de suppression de projet financier:", error)
        throw new Error(`Erreur lors de la suppression du projet financier: ${error.message}`)
      }
    } catch (error) {
      console.error("Exception lors de la suppression du projet financier:", error)
      throw error
    }
  },

  // Upload d'une image de profil
  async uploadProfileImage(userId: string, file: File) {
    try {
      ()
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `profiles/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) {
        console.error("Erreur d'upload d'image:", uploadError)
        throw new Error(`Erreur lors de l'upload de l'image: ${uploadError.message}`)
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)

      // Mettre à jour le profil avec la nouvelle URL d'avatar
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("Erreur de mise à jour d'avatar:", updateError)
        throw new Error(`Erreur lors de la mise à jour de l'avatar: ${updateError.message}`)
      }

      return urlData.publicUrl
    } catch (error) {
      console.error("Exception lors de l'upload de l'image de profil:", error)
      throw error
    }
  },
}
