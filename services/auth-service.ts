import { createClientComponentClient } from "@/lib/supabase"

// Service d'authentification amélioré avec meilleure gestion des erreurs
export const authService = {
  // Vérifier si Supabase est correctement configuré
  checkSupabaseConfig() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Les variables d'environnement Supabase ne sont pas définies")
    }

    return true
  },

  // Inscription d'un nouvel utilisateur
  async signUp(email: string, password: string, name: string) {
    try {
      this.checkSupabaseConfig()
      ()

      // Créer un nouvel utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (authError) {
        console.error("Erreur d'authentification:", authError)
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error("Erreur lors de la création du compte")
      }

      // Créer les données utilisateur via l'API
      try {
        const response = await fetch("/api/create-user-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: authData.user.id,
            name: name,
            email: email,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("Erreur lors de la création des données utilisateur:", errorData)
          // Continuer malgré l'erreur, car l'utilisateur est déjà créé
        }
      } catch (error) {
        console.error("Exception lors de la création des données utilisateur:", error)
        // Continuer malgré l'erreur, car l'utilisateur est déjà créé
      }

      return authData
    } catch (error) {
      console.error("Exception lors de l'inscription:", error)
      throw error
    }
  },

  // Connexion d'un utilisateur existant
  async signIn(email: string, password: string) {
    try {
      this.checkSupabaseConfig()
      ()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Erreur de connexion:", error)

        // Messages d'erreur plus conviviaux
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email ou mot de passe incorrect")
        }

        throw new Error(error.message)
      }

      // Vérifier si le profil existe déjà
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle()

      // Si le profil n'existe pas, le créer via l'API
      if (!profileData) {
        try {
          const response = await fetch("/api/create-user-data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: data.user.id,
              name: data.user.user_metadata.name || email.split("@")[0],
              email: email,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error("Erreur lors de la création des données utilisateur:", errorData)
            // Continuer malgré l'erreur, car l'utilisateur est déjà connecté
          }
        } catch (error) {
          console.error("Exception lors de la création des données utilisateur:", error)
          // Continuer malgré l'erreur, car l'utilisateur est déjà connecté
        }
      }

      return data
    } catch (error) {
      console.error("Exception lors de la connexion:", error)
      throw error
    }
  },

  // Déconnexion
  async signOut() {
    try {
      this.checkSupabaseConfig()
      ()

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Erreur de déconnexion:", error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Exception lors de la déconnexion:", error)
      throw error
    }
  },

  // Récupérer la session actuelle
  async getSession() {
    try {
      this.checkSupabaseConfig()
      ()

      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Erreur de récupération de session:", error)
        throw new Error(error.message)
      }

      return data.session
    } catch (error) {
      console.error("Exception lors de la récupération de session:", error)
      throw error
    }
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser() {
    try {
      this.checkSupabaseConfig()
      ()

      const { data, error } = await supabase.auth.getUser()

      if (error) {
        console.error("Erreur de récupération d'utilisateur:", error)
        throw new Error(error.message)
      }

      return data.user
    } catch (error) {
      console.error("Exception lors de la récupération d'utilisateur:", error)
      throw error
    }
  },

  // Réinitialiser le mot de passe
  async resetPassword(email: string) {
    try {
      this.checkSupabaseConfig()
      ()

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error("Erreur de réinitialisation de mot de passe:", error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Exception lors de la réinitialisation de mot de passe:", error)
      throw error
    }
  },

  // Mettre à jour le mot de passe
  async updatePassword(password: string) {
    try {
      this.checkSupabaseConfig()
      ()

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        console.error("Erreur de mise à jour de mot de passe:", error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error("Exception lors de la mise à jour de mot de passe:", error)
      throw error
    }
  },
}
