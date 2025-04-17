import { createClientComponentClient } from "@/lib/supabase"

// Fonction pour vérifier la connexion à Supabase
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.error("Erreur de connexion à Supabase:", error)
      return {
        connected: false,
        error: error.message,
        details: error,
      }
    }

    return {
      connected: true,
      data,
    }
  } catch (error) {
    console.error("Exception lors de la connexion à Supabase:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    }
  }
}

// Fonction pour vérifier l'état de l'authentification
export async function checkAuthState() {
  try {
    ()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Erreur lors de la récupération de la session:", error)
      return {
        authenticated: false,
        error: error.message,
      }
    }

    return {
      authenticated: !!data.session,
      session: data.session,
      user: data.session?.user,
    }
  } catch (error) {
    console.error("Exception lors de la vérification de l'authentification:", error)
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    }
  }
}

// Fonction pour vérifier les permissions RLS
export async function checkRLSPermissions(userId: string) {
  try {
    ()

    // Tester l'accès aux profils
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    // Tester l'accès aux transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("count")
      .eq("user_id", userId)

    return {
      profileAccess: !profileError,
      profileData,
      profileError,
      transactionsAccess: !transactionsError,
      transactionsCount: transactionsData?.[0]?.count,
      transactionsError,
    }
  } catch (error) {
    console.error("Exception lors de la vérification des permissions RLS:", error)
    return {
      error: error instanceof Error ? error.message : "Erreur inconnue",
    }
  }
}
