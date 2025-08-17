import { cn } from "@/lib/utils"
import { format, isToday, isTomorrow, isPast } from "date-fns"
import { uz } from "date-fns/locale"

interface DueDateBadgeProps {
  dueDate: string | null
  className?: string
}

export function DueDateBadge({ dueDate, className }: DueDateBadgeProps) {
  if (!dueDate) return null

  const date = new Date(dueDate)
  const isOverdue = isPast(date) && !isToday(date)
  const isDueToday = isToday(date)
  const isDueTomorrow = isTomorrow(date)

  const getBadgeConfig = () => {
    if (isOverdue) {
      return {
        text: "Kechikkan",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      }
    }
    if (isDueToday) {
      return {
        text: "Bugun",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      }
    }
    if (isDueTomorrow) {
      return {
        text: "Ertaga",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      }
    }
    return {
      text: format(date, "dd MMM", { locale: uz }),
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    }
  }

  const config = getBadgeConfig()

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.text}
    </span>
  )
}
