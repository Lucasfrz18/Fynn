// Table de correspondance des logos de services
export const serviceLogos: Record<string, string> = {
  "google drive": "/logos/services/google-drive.svg",
  google: "/logos/services/google-drive.svg",
  uber: "/logos/services/uber.svg",
  apple: "/logos/services/apple.svg",
  carrefour: "/logos/services/carrefour.svg",
  chatgpt: "/logos/services/chatgpt.svg",
  spotify: "/logos/services/spotify.svg",
  tcl: "/logos/services/tcl.svg",
  sytral: "/logos/services/tcl.svg",
  mycanal: "/logos/services/mycanal.webp",
  "canal+": "/logos/services/mycanal.webp",
  canal: "/logos/services/mycanal.webp",
  netflix: "/logos/services/netflix.svg",
  edf: "/logos/services/edf.svg",
}

/**
 * Récupère le logo correspondant au nom du service
 * @param serviceName Nom du service
 * @returns URL du logo ou undefined si aucun logo n'est trouvé
 */
export function getServiceLogo(serviceName: string): string | undefined {
  const normalizedName = serviceName.toLowerCase().trim()

  // Recherche directe
  if (serviceLogos[normalizedName]) {
    return serviceLogos[normalizedName]
  }

  // Recherche partielle
  for (const [key, value] of Object.entries(serviceLogos)) {
    if (normalizedName.includes(key)) {
      return value
    }
  }

  return undefined
}
