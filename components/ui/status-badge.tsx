import type { FinancialHealthStatus } from "@/types"
import { ShieldCheck, AlertTriangle, AlertCircle } from "lucide-react"

interface StatusBadgeProps {
  status: FinancialHealthStatus
  withLabel?: boolean
  className?: string
}

export function StatusBadge({ status, withLabel = false, className = "" }: StatusBadgeProps) {
  const statusConfig = {
    good: {
      icon: ShieldCheck,
      bgColor: "bg-green-500",
      textColor: "text-white",
      label: "Bonne santé",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-500",
      textColor: "text-white",
      label: "Attention",
    },
    danger: {
      icon: AlertCircle,
      bgColor: "bg-red-500",
      textColor: "text-white",
      label: "Danger",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full ${config.bgColor} ${config.textColor} px-2 py-1 text-xs font-medium ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {withLabel && <span>{config.label}</span>}
    </div>
  )
}
