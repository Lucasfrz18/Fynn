"use client"

import Image from "next/image"
import { getServiceLogo } from "@/services/logo-service"
import { categoriesInfo } from "@/data/mock-data"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ServiceLogoProps {
  serviceName: string
  category: string
  className?: string
  size?: number
}

// Modifier le composant pour qu'il fonctionne correctement avec les tailles personnalisées
export function ServiceLogo({ serviceName, category, className = "", size = 40 }: ServiceLogoProps) {
  const logoUrl = getServiceLogo(serviceName)
  const categoryInfo = categoriesInfo[category as keyof typeof categoriesInfo] || categoriesInfo.other
  const IconComponent = Icons[categoryInfo.icon as keyof typeof Icons] as LucideIcon

  if (logoUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-white ${className}`}
        style={{ height: size, width: size }}
      >
        <Image
          src={logoUrl || "/placeholder.svg"}
          alt={serviceName}
          width={size * 0.8}
          height={size * 0.8}
          className="p-1 object-contain"
        />
      </div>
    )
  }

  // Fallback à l'icône de catégorie
  return (
    <div
      className={`flex items-center justify-center rounded-full ${categoryInfo.color} ${className}`}
      style={{ height: size, width: size }}
    >
      <IconComponent className="text-white" style={{ height: size * 0.5, width: size * 0.5 }} />
    </div>
  )
}
