import { createServerComponentClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, ...userData } = await request.json()

    if (!userId) {
      return NextResponse.json({ message: "ID utilisateur manquant" }, { status: 400 })
    }

    // Utiliser le client serveur avec le service role key
    const supabase = createServerComponentClient()

    // Mettre à jour le profil utilisateur
    const { error } = await supabase
      .from("profiles")
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Erreur de mise à jour du profil:", error)
      return NextResponse.json(
        { message: `Erreur lors de la mise à jour du profil: ${error.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, ...userData })
  } catch (error: any) {
    console.error("Exception lors de la mise à jour du profil:", error)
    return NextResponse.json({ message: error.message || "Erreur serveur" }, { status: 500 })
  }
}
