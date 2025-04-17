"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  
  useEffect(() => {
    // Récupérer le hash fragment de l'URL
    const hashParams = window.location.hash.substring(1);
    
    if (hashParams.includes('access_token')) {
      // Stocker les tokens dans localStorage pour usage ultérieur
      const params = new URLSearchParams(hashParams);
      
      // Extraire et stocker les tokens
      localStorage.setItem('access_token', params.get('access_token') || '');
      localStorage.setItem('refresh_token', params.get('refresh_token') || '');
      
      console.log("Authentification réussie, redirection...");
      
      // Rediriger vers la page d'accueil
      router.push("/");
    } else {
      console.log("Aucun token trouvé, redirection vers login");
      router.push("/login");
    }
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Traitement de l'authentification...</p>
    </div>
  );
}
