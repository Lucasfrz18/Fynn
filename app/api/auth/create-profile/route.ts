// app/api/auth/create-profile/route.ts

import { createRouteHandlerClient } from '@supabase/ssr'; // Importe le bon helper pour les Route Handlers
import { cookies } from 'next/headers'; // Pour accéder aux cookies côté serveur
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Tu l'utilises pour l'ID du résumé

// Assure-toi que ce chemin est correct et que tu as généré tes types
import type { Database } from '@/types/supabase';

// On attend juste le 'name' du client (si nécessaire), le reste vient de la session
interface RequestBody {
  name?: string; // Rend le nom optionnel si jamais il n'est pas fourni
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  // Crée un client Supabase spécifique à cette requête serveur, typé avec ta BDD
  // Il lira automatiquement la session depuis les cookies
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  try {
    // 1. Vérifier si l'utilisateur est authentifié (étape CRUCIALE de sécurité)
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError) {
      console.error("Erreur de session:", sessionError);
      return NextResponse.json({ message: "Erreur lors de la récupération de la session" }, { status: 500 });
    }

    if (!user) {
      // Si aucun utilisateur n'est trouvé dans la session, refuser l'accès
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    // 2. Récupérer les données envoyées par le client (seulement le nom ici)
    let nameToUse: string;
    try {
        const body = await request.json() as RequestBody;
        // Utilise le nom fourni OU un nom par défaut s'il n'est pas envoyé
        nameToUse = body.name || `Utilisateur_${user.id.substring(0, 6)}`; // Ex: Utilisateur_abcdef
    } catch (parseError) {
        // Si le corps JSON est invalide ou vide, utilise un nom par défaut
        console.warn("Corps de la requête invalide ou manquant, utilisation du nom par défaut.");
        nameToUse = `Utilisateur_${user.id.substring(0, 6)}`;
    }


    // --- Début des insertions ---

    // 3. Créer un profil pour l'utilisateur (utilise user.id et user.email de la session)
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id, // ID de l'utilisateur authentifié
        name: nameToUse, // Nom reçu du client ou généré
        email: user.email, // Email de l'utilisateur authentifié (si disponible)
        // avatar: user.user_metadata?.avatar_url || null, // Tu peux pré-remplir l'avatar si dispo via oAuth
      });

    // Note: Gère le cas où le profil existe déjà (ex: via ON CONFLICT DO NOTHING dans Postgres ou ignore l'erreur spécifique)
    if (profileError && profileError.code !== '23505') { // 23505 = unique_violation (le profil existe déjà)
      console.error("Erreur de création de profil (non-duplication):", profileError);
      return NextResponse.json(
        { message: `Erreur lors de la création du profil: ${profileError.message}` },
        { status: 500 },
      );
    } else if (profileError?.code === '23505') {
        console.warn(`Le profil pour l'utilisateur ${user.id} existe déjà.`);
        // Continue quand même pour créer les autres éléments s'ils manquent
    }


    // 4. Créer un résumé financier par défaut
    const financialSummaryId = uuidv4(); // Tu génères l'ID manuellement
    const { error: summaryError } = await supabase
      .from("financial_summaries")
      .insert({
        id: financialSummaryId, // Ton ID généré
        user_id: user.id, // ID de l'utilisateur authentifié
        current_balance: 0,
        health_status: "good",
        monthly_income: 0,
        monthly_expenses: 0,
        recurring_payments: 0,
        // daily_budget_remaining: 0, // Supprimé car colonne inexistante
      });

    // Gère aussi le cas où le résumé existe déjà
    if (summaryError && summaryError.code !== '23505') {
      console.error("Erreur de création du résumé financier (non-duplication):", summaryError);
      // Que faire si le résumé échoue mais le profil a réussi ? Transaction ? Compensation ?
      // Pour l'instant, on retourne une erreur.
      return NextResponse.json(
        { message: `Erreur lors de la création du résumé financier: ${summaryError.message}` },
        { status: 500 },
      );
    } else if (summaryError?.code === '23505') {
        console.warn(`Le résumé financier pour l'utilisateur ${user.id} existe déjà.`);
    }

    // 5. Créer les préférences utilisateur par défaut
    const { error: preferencesError } = await supabase
      .from("user_preferences")
      .insert({
        user_id: user.id, // ID de l'utilisateur authentifié
        theme: "light",
        notifications_enabled: true,
        // onboarding_complete: false, // Ajoute ceci si tu as ajouté la colonne
      });

     // Gère aussi le cas où les préférences existent déjà
    if (preferencesError && preferencesError.code !== '23505') {
      console.error("Erreur de création des préférences (non-duplication):", preferencesError);
      return NextResponse.json(
        { message: `Erreur lors de la création des préférences: ${preferencesError.message}` },
        { status: 500 },
      );
    } else if (preferencesError?.code === '23505') {
        console.warn(`Les préférences pour l'utilisateur ${user.id} existent déjà.`);
    }

    // Si tout s'est bien passé (ou que les éléments existaient déjà)
    console.log(`Configuration initiale terminée (ou vérifiée) pour l'utilisateur ${user.id}`);
    return NextResponse.json({ success: true, message: "Configuration initiale terminée." });

  } catch (error: any) {
    // Erreur générale inattendue
    console.error("Exception globale lors de la création du profil/configuration:", error);
    return NextResponse.json({ message: error.message || "Erreur serveur inattendue" }, { status: 500 });
  }
}

// Optionnel : Ajouter une fonction GET ou autre si nécessaire
// export async function GET(request: Request) { ... }