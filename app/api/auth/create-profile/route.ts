// app/api/auth/create-profile/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Assure-toi que ce chemin est correct et que le fichier existe
import type { Database } from '@/types/supabase'; // Chemin vers tes types générés

// Interface pour le corps de la requête (si tu attends un nom)
interface RequestBody {
  name?: string;
}

export async function POST(request: Request) {
  const cookieStore = cookies();

  // 1. Création du client Supabase pour les Route Handlers/Server Actions
  // Nécessite l'URL et la clé Anon, ainsi que les fonctions de gestion des cookies
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // Doit être défini dans .env.local et Vercel
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Doit être défini dans .env.local et Vercel
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Gérer l'erreur si les en-têtes sont en lecture seule (peut arriver dans certains contextes)
            console.warn(`Failed to set cookie '${name}':`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Gérer l'erreur si les en-têtes sont en lecture seule
            console.warn(`Failed to remove cookie '${name}':`, error);
          }
        },
      },
    }
  );

  try {
    // 2. Vérifier l'authentification de l'utilisateur via les cookies
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("Erreur Supabase Auth getUser:", authError);
      return NextResponse.json({ message: "Erreur d'authentification serveur" }, { status: 500 });
    }

    if (!user) {
      // Si aucun utilisateur n'est connecté, refuser l'accès
      console.warn("Tentative de création de profil non authentifiée.");
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // 3. Récupérer le nom optionnel du corps de la requête
    let nameToUse: string;
    try {
      // Essaye de parser le JSON, mais ne plante pas si le corps est vide ou invalide
      const body = await request.json().catch(() => ({})) as RequestBody;
      // Utilise le nom fourni OU génère un nom par défaut
      nameToUse = body.name || `Utilisateur_${user.id.substring(0, 6)}`;
    } catch (parseError) {
      // En cas d'erreur inattendue pendant le parsing (peu probable avec le .catch)
      console.error("Erreur de parsing du corps de la requête:", parseError);
      nameToUse = `Utilisateur_${user.id.substring(0, 6)}`; // fallback
    }

    // --- Début des insertions idempotentes (ne créent que si ça n'existe pas) ---

    // 4. Tenter de créer le profil (ignore si déjà existant)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id, // Utilise l'ID de l'utilisateur authentifié
        name: nameToUse,
        email: user.email, // Utilise l'email de l'utilisateur authentifié (peut être null)
        // avatar_url: user.user_metadata?.avatar_url || null, // Exemple pour pré-remplir
      })
      // Si la ligne existe déjà à cause de la contrainte unique sur 'id', ne rien faire.
      // Note: 'id' doit être la clé primaire ou avoir une contrainte unique pour que cela fonctionne.
      // Cette approche spécifique `onConflict().ignore()` nécessite des RLS et policies adaptées
      // Une alternative plus simple est de vérifier l'erreur après l'insert (voir ci-dessous).

    // Gestion de l'erreur de création de profil (autre que 'déjà existant')
    if (profileError && profileError.code !== '23505') { // '23505' = unique_violation
      console.error("Erreur DB (Profile Insert):", profileError);
      return NextResponse.json({ message: `Erreur base de données profil: ${profileError.message}` }, { status: 500 });
    } else if (profileError?.code === '23505') {
      console.warn(`Profil pour l'utilisateur ${user.id} existe déjà. Ignoré.`);
    } else {
      console.log(`Profil créé ou déjà existant pour ${user.id}.`);
    }

    // 5. Tenter de créer le résumé financier par défaut (ignore si déjà existant)
    const financialSummaryId = uuidv4(); // Génère un nouvel ID unique
    const { error: summaryError } = await supabase
      .from('financial_summaries')
      .insert({
        // id: financialSummaryId, // Si tu veux un ID auto-généré par Postgres, ne mets pas cette ligne
        user_id: user.id,
        // Initialise les valeurs par défaut
        current_balance: 0,
        health_status: "good",
        monthly_income: 0,
        monthly_expenses: 0,
        recurring_payments: 0,
      });
      // .onConflict('user_id').ignore(); // Si 'user_id' a une contrainte unique dans cette table

    // Gestion de l'erreur de création de résumé (autre que 'déjà existant')
     if (summaryError && summaryError.code !== '23505') { // 23505 = unique_violation (sur user_id si contrainte unique)
      console.error("Erreur DB (Summary Insert):", summaryError);
      return NextResponse.json({ message: `Erreur base de données résumé: ${summaryError.message}` }, { status: 500 });
    } else if (summaryError?.code === '23505') {
      console.warn(`Résumé financier pour l'utilisateur ${user.id} existe déjà. Ignoré.`);
    } else {
      console.log(`Résumé financier créé ou déjà existant pour ${user.id}.`);
    }


    // 6. Tenter de créer les préférences utilisateur par défaut (ignore si déjà existant)
    const { error: preferencesError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        theme: 'light',
        notifications_enabled: true,
        // onboarding_complete: false, // Décommente si tu as cette colonne
      });
      // .onConflict('user_id').ignore(); // Si 'user_id' a une contrainte unique dans cette table

    // Gestion de l'erreur de création des préférences (autre que 'déjà existant')
    if (preferencesError && preferencesError.code !== '23505') { // 23505 = unique_violation
      console.error("Erreur DB (Preferences Insert):", preferencesError);
      return NextResponse.json({ message: `Erreur base de données préférences: ${preferencesError.message}` }, { status: 500 });
    } else if (preferencesError?.code === '23505') {
      console.warn(`Préférences pour l'utilisateur ${user.id} existent déjà. Ignorées.`);
    } else {
      console.log(`Préférences créées ou déjà existantes pour ${user.id}.`);
    }

    // 7. Si tout s'est bien passé (ou les enregistrements existaient déjà)
    console.log(`Configuration initiale terminée (ou vérifiée) pour l'utilisateur ${user.id}`);
    return NextResponse.json({ success: true, message: "Profil et configuration initiale vérifiés/créés." });

  } catch (error: any) {
    // Erreur générale inattendue
    console.error("Erreur inattendue dans /api/auth/create-profile:", error);
    return NextResponse.json({ message: error.message || "Erreur serveur interne" }, { status: 500 });
  }
}