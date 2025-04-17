"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

interface NavLinkProps {
  href: string
  icon: LucideIcon
  label: string
  onClick?: () => void
}

export function NavLink({ href, icon: Icon, label, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors ${
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      {label && <span className="text-xs">{label}</span>}
    </Link>
  )
}
