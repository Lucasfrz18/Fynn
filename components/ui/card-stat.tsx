import type { LucideIcon } from "lucide-react"

interface CardStatProps {
  title: string
  value: string | number
  icon: LucideIcon
  className?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function CardStat({ title, value, icon: Icon, className = "", trend }: CardStatProps) {
  return (
    <div className={`rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-foreground/70" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {trend && (
        <div className="mt-2 flex items-center space-x-1">
          <span className={trend.isPositive ? "text-success" : "text-danger"}>{trend.isPositive ? "↑" : "↓"}</span>
          <span className="text-xs font-medium">{trend.value}% vs mois dernier</span>
        </div>
      )}
    </div>
  )
}
