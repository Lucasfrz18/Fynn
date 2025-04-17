// ----- IMPORTS EN HAUT -----
import { supabase } from '@/lib/supabase'; // Importe l'INSTANCE unique et partagée
import { isDemoMode, mockSignUp, mockSignIn } from "./mock-auth";
// PAS BESOIN d'importer createClientComponentClient ici

// ----- FONCTION signUp (Déjà correcte dans ta dernière version) -----
export async function signUp(email: string, password: string, name: string) {
  try {
    if (!email || !password) {
      return { success: false, error: "Email et mot de passe requis" };
    }

    if (isDemoMode()) {
      console.log("Utilisation du mode démo pour l'inscription");
      return await mockSignUp(email, password, name);
    }

    // Utilise directement l'instance supabase importée
    try {
      console.log("Tentative d'inscription avec Supabase...");
      const { data, error } = await supabase.auth.signUp({ // Utilise l'instance importée
        email,
        password,
        options: {
          data: { name: name || email.split("@")[0] },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.error("Erreur d'inscription :", error.message);
        return { success: false, error: error.message };
      }
      if (!data.user) {
        return { success: false, error: "Aucun utilisateur créé" };
      }
      console.log("Utilisateur inscrit :", data);
      return { success: true, data };

    } catch (fetchError: any) {
      console.error("Erreur de connexion à Supabase (signUp):", fetchError);
      if (fetchError.message === "Failed to fetch") {
        return { success: false, error: "Impossible de se connecter au serveur Supabase. Vérifiez votre connexion internet ou réessayez plus tard." };
      }
      return { success: false, error: fetchError.message || "Erreur de connexion au serveur" };
    }
  } catch (err: any) {
    console.error("Exception lors de l'inscription :", err);
    return { success: false, error: err.message || "Une erreur est survenue lors de l'inscription" };
  }
}

// ----- FONCTION signIn (CORRIGÉE) -----
export async function signIn(email: string, password: string) {
  try {
    if (!email || !password) {
      return { success: false, error: "Email et mot de passe requis" };
    }

    if (isDemoMode()) {
      console.log("Utilisation du mode démo pour la connexion");
      return await mockSignIn(email, password);
    }

    // ====> SUPPRIMER LE BLOC QUI CRÉAIT LE CLIENT LOCALEMENT <====
    /*
    // Créer le client Supabase avec gestion d'erreur  <-- BLOC SUPPRIMÉ
    let supabase
    try {
      supabase = createClientComponentClient()
    } catch (error: any) {
       // ... gestion erreur création ...
    }
    */

    // Utilise directement l'instance supabase importée
    try {
      console.log("Tentative de connexion avec Supabase...");
      const { data, error } = await supabase.auth.signInWithPassword({ // Utilise l'instance importée
        email,
        password,
      });

      if (error) {
        console.error("Erreur de connexion :", error.message);
        return { success: false, error: error.message };
      }
      console.log("Utilisateur connecté :", data);
      return { success: true, data };

    } catch (fetchError: any) {
      console.error("Erreur de connexion à Supabase (signIn):", fetchError);
      if (fetchError.message === "Failed to fetch") {
        return { success: false, error: "Impossible de se connecter au serveur Supabase. Vérifiez votre connexion internet ou réessayez plus tard." };
      }
      return { success: false, error: fetchError.message || "Erreur de connexion au serveur" };
    }
  } catch (err: any) {
    console.error("Exception lors de la connexion :", err);
    return { success: false, error: err.message || "Une erreur est survenue lors de la connexion" };
  }
}