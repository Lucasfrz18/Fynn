// Réexporter les clients depuis les nouveaux emplacements
import { createClientComponentClient} from "@/utils/supabase/client"
import { createServerComponentClient } from "@/utils/supabase/server"



const supabase = createClientComponentClient(); // Or use the appropriate client creation method

// Function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabase.auth !== undefined;
};

export { supabase };
// ... utiliser supabase directement ...
// Exemple: const { data, error } = await supabase.from(...)...
