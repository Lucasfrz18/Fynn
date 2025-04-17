import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, name, email } = await request.json()

    if (!userId || !name || !email) {
      return NextResponse.json({ message: "Données utilisateur incomplètes" }, { status: 400 })
    }

    // Simuler une création réussie pour le moment
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Exception lors de la création des données utilisateur:", error)
    return NextResponse.json({ message: error.message || "Erreur serveur" }, { status: 500 })
  }
}
