import { createServerComponentClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, name, email } = await request.json()

    if (!userId || !name || !email) {
      return NextResponse.json({ message: "Données utilisateur incomplètes" }, { status: 400 })
    }

    // Utiliser le client serveur avec le service role key
    const supabase = createServerComponentClient()

    // 1. Créer un profil pour l'utilisateur
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      name,
      email,
    })

    if (profileError) {
      console.error("Erreur de création de profil:", profileError)
      return NextResponse.json(
        { message: `Erreur lors de la création du profil: ${profileError.message}` },
        { status: 500 },
      )
    }

    // 2. Créer un résumé financier par défaut
    const financialSummaryId = uuidv4()
    const { error: summaryError } = await supabase.from("financial_summaries").insert({
      id: financialSummaryId,
      user_id: userId,
      current_balance: 0,
      health_status: "good",
      monthly_income: 0,
      monthly_expenses: 0,
      recurring_payments: 0,
      daily_budget_remaining: 0,
    })

    if (summaryError) {
      console.error("Erreur de création du résumé financier:", summaryError)
      return NextResponse.json(
        { message: `Erreur lors de la création du résumé financier: ${summaryError.message}` },
        { status: 500 },
      )
    }

    // 3. Créer les préférences utilisateur par défaut
    const { error: preferencesError } = await supabase.from("user_preferences").insert({
      user_id: userId,
      theme: "light",
      notifications_enabled: true,
    })

    if (preferencesError) {
      console.error("Erreur de création des préférences:", preferencesError)
      return NextResponse.json(
        { message: `Erreur lors de la création des préférences: ${preferencesError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Exception lors de la création du profil:", error)
    return NextResponse.json({ message: error.message || "Erreur serveur" }, { status: 500 })
  }
}
