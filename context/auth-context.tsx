"use client"
import { supabase } from "@/lib/supabase";
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/utils/supabase/client"
import { toast } from "react-hot-toast"
import { isDemoMode, getMockUser, mockSignOut, enableDemoMode } from "@/lib/mock-auth"

type User = {
  id: string
  email: string | null
  name?: string | null
  avatar?: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  isDemoMode: boolean
  enableDemoMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const router = useRouter()

  // Vérifier si nous sommes en mode démo
  useEffect(() => {
    const checkDemoMode = () => {
      const isDemo = isDemoMode()
      setDemoMode(isDemo)

      // Si nous sommes en mode démo, vérifier s'il y a un utilisateur démo
      if (isDemo) {
        const demoUser = getMockUser()
        if (demoUser) {
          setUser(demoUser)
        }
      }
    }

    checkDemoMode()
  }, [])

  // Charger l'utilisateur courant depuis Supabase
  useEffect(() => {
    // Si nous sommes en mode démo, ne pas essayer de charger l'utilisateur depuis Supabase
    if (demoMode) {
      setLoading(false)
      return
    }

    // Fonction pour récupérer l'utilisateur actuel
    const getUser = async () => {
      try {
        

        // Récupérer la session d'abord
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Erreur lors de la récupération de la session:", sessionError)
          setUser(null)
          setLoading(false)
          return
        }

        // Si pas de session, l'utilisateur n'est pas connecté
        if (!sessionData.session) {
          console.log("Aucune session trouvée, l'utilisateur n'est pas connecté")
          setUser(null)
          setLoading(false)
          return
        }

        // Si nous avons une session, récupérer les détails de l'utilisateur
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error("Erreur lors de la récupération de l'utilisateur:", userError)
          setUser(null)
          setLoading(false)
          return
        }

// CORRECT :
if (userData.user) {
  // Récupérer les informations supplémentaires du profil ET l'erreur potentielle
  const { data: profileData, error: profileLoadError } = await supabase // <--- Mets-le ici !
    .from("profiles")
    .select("name, avatar")
    .eq("id", userData.user.id)
    .maybeSingle(); // <-- Point-virgule optionnel mais propre

  // Gérer l'erreur (si ce n'est pas juste "0 lignes") ou le cas null
  if (profileLoadError && profileLoadError.code !== 'PGRST116') {
    console.error("Erreur chargement profil:", profileLoadError);
    // Peut-être définir un état d'erreur ici
  }

  // Mettre à jour l'utilisateur même si profileData est null
  setUser({
    id: userData.user.id,
    email: userData.user.email,
    name: profileData?.name || userData.user.user_metadata?.name || "Utilisateur", // Fallback ajouté
    avatar: profileData?.avatar,
  });

} else {
  setUser(null);
}
      } catch (error) {
        console.error("Exception lors de la récupération de l'utilisateur:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Appeler getUser au chargement du composant
    getUser()
  }, [demoMode])

  // Connexion avec Supabase ou en mode démo
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Si nous sommes en mode démo, utiliser la connexion simulée
      if (demoMode) {
        const mockUser = getMockUser() || {
          id: "demo-user-id",
          email: email,
          name: email.split("@")[0],
        }

        setUser(mockUser)
        toast.success("Connexion réussie (Mode démo)")
        router.push("/")
        return
      }

      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast.error(error.message || "Erreur lors de la connexion")
        throw new Error(error.message)
      }

      // Vérifier si le profil existe déjà
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle()

      // Si le profil n'existe pas, le créer
      if (!profileData && !profileError) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: data.user.id,
          name: data.user.user_metadata?.name || email.split("@")[0],
          email: email,
        })

        if (insertError) {
          console.error("Erreur lors de la création du profil:", insertError)
        }

        // Créer un résumé financier par défaut
        const { error: summaryError } = await supabase.from("financial_summaries").insert({
          user_id: data.user.id,
          current_balance: 0,
          health_status: "good",
          monthly_income: 0,
          monthly_expenses: 0,
          recurring_payments: 0,
          daily_budget_remaining: 0,
        })

        if (summaryError) {
          console.error("Erreur lors de la création du résumé financier:", summaryError)
        }

        // Créer des préférences utilisateur par défaut
        const { error: preferencesError } = await supabase.from("user_preferences").insert({
          user_id: data.user.id,
          theme: "light",
          notifications_enabled: true,
        })

        if (preferencesError) {
          console.error("Erreur lors de la création des préférences:", preferencesError)
        }
      }

      toast.success("Connexion réussie")
      router.push("/")
    } catch (error: any) {
      console.error("Exception lors de la connexion:", error)
      toast.error(error.message || "Une erreur est survenue lors de la connexion")
    } finally {
      setLoading(false)
    }
  }

  // Inscription avec Supabase ou en mode démo
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      // Si nous sommes en mode démo, utiliser l'inscription simulée
      if (demoMode) {
        const mockUser = {
          id: "demo-user-id",
          email: email,
          name: name || email.split("@")[0],
        }

        setUser(mockUser)
        toast.success("Inscription réussie (Mode démo)")
        router.push("/")
        return
      }

     
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (error) {
        toast.error(error.message || "Erreur lors de l'inscription")
        throw new Error(error.message)
      }

      if (!data.user) {
        toast.error("Erreur lors de la création du compte")
        throw new Error("Erreur lors de la création du compte")
      }

      // Créer un profil pour l'utilisateur
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name,
        email,
      })

      if (profileError) {
        console.error("Erreur lors de la création du profil:", profileError)
      }

      // Créer un résumé financier par défaut
      const { error: summaryError } = await supabase.from("financial_summaries").insert({
        user_id: data.user.id,
        current_balance: 0,
        health_status: "good",
        monthly_income: 0,
        monthly_expenses: 0,
        recurring_payments: 0,
        daily_budget_remaining: 0,
      })

      if (summaryError) {
        console.error("Erreur lors de la création du résumé financier:", summaryError)
      }

      // Créer des préférences utilisateur par défaut
      const { error: preferencesError } = await supabase.from("user_preferences").insert({
        user_id: data.user.id,
        theme: "light",
        notifications_enabled: true,
      })

      if (preferencesError) {
        console.error("Erreur lors de la création des préférences:", preferencesError)
      }

      toast.success("Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.")
      router.push("/login")
    } catch (error: any) {
      console.error("Exception lors de l'inscription:", error)
      toast.error(error.message || "Une erreur est survenue lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  // Déconnexion Supabase ou mode démo
  const signOut = async () => {
    try {
      // Si nous sommes en mode démo, utiliser la déconnexion simulée
      if (demoMode) {
        await mockSignOut()
        setUser(null)
        toast.success("Déconnexion réussie (Mode démo)")
        router.push("/login")
        return
      }

      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Erreur lors de la déconnexion:", error)
        toast.error(error.message || "Erreur lors de la déconnexion")
      } else {
        setUser(null)
        toast.success("Déconnexion réussie")
        router.push("/login")
      }
    } catch (error: any) {
      console.error("Exception lors de la déconnexion:", error)
      toast.error(error.message || "Une erreur est survenue lors de la déconnexion")
    }
  }

  // Réinitialisation de mot de passe (par email)
  const resetPassword = async (email: string) => {
    try {
      // En mode démo, simuler une réinitialisation réussie
      if (demoMode) {
        toast.success("Un email de réinitialisation a été envoyé à votre adresse email (Mode démo)")
        return
      }

    
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) {
        console.error("Erreur de réinitialisation de mot de passe:", error)
        toast.error(error.message || "Erreur lors de la réinitialisation du mot de passe")
        throw new Error(error.message)
      }
      toast.success("Un email de réinitialisation a été envoyé à votre adresse email")
    } catch (error: any) {
      console.error("Exception lors de la réinitialisation de mot de passe:", error)
      toast.error(error.message || "Une erreur est survenue lors de la réinitialisation du mot de passe")
      throw error
    }
  }

  // Mise à jour du mot de passe (nécessite que l'utilisateur soit connecté)
  const updatePassword = async (password: string) => {
    try {
      // En mode démo, simuler une mise à jour réussie
      if (demoMode) {
        toast.success("Mot de passe mis à jour avec succès (Mode démo)")
        router.push("/login")
        return
      }

      
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        console.error("Erreur de mise à jour de mot de passe:", error)
        toast.error(error.message || "Erreur lors de la mise à jour du mot de passe")
        throw new Error(error.message)
      }
      toast.success("Mot de passe mis à jour avec succès")
      router.push("/login")
    } catch (error: any) {
      console.error("Exception lors de la mise à jour de mot de passe:", error)
      toast.error(error.message || "Une erreur est survenue lors de la mise à jour du mot de passe")
      throw error
    }
  }

  // Activer explicitement le mode démo
  const handleEnableDemoMode = () => {
    const enabled = enableDemoMode()
    if (enabled) {
      setDemoMode(true)
      const demoUser = getMockUser()
      if (demoUser) {
        setUser(demoUser)
      }
      router.push("/")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        isDemoMode: demoMode,
        enableDemoMode: handleEnableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}
