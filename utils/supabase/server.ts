import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Utiliser les variables d'environnement pour les informations de connexion
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ccnccbdkvsvnszmolblx.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbmNjYmRrdnN2bnN6bW9sYmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NjE3NjUsImV4cCI6MjA1OTUzNzc2NX0.92X4i4B211uVWD95l8txFoOOG0uRue4AQ-ID52C0JaE"

// Créer un client Supabase pour le côté serveur
export const createServerComponentClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Exporter également le client directement pour la compatibilité
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
