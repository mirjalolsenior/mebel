import { cn } from "@/lib/utils"

interface BadgeAmountProps {
  amount: number
  type: "money" | "quantity" | "meters"
  className?: string
}

export function BadgeAmount({ amount, type, className }: BadgeAmountProps) {
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat("uz-UZ").format(value)
  }

  const getTypeConfig = () => {
    switch (type) {
      case "money":
        return {
          suffix: "mln",
          className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        }
      case "quantity":
        return {
          suffix: "ta",
          className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        }
      case "meters":
        return {
          suffix: "m",
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        }
    }
  }

  const config = getTypeConfig()

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className,
      )}
    >
      {formatAmount(amount)} {config.suffix}
    </span>
  )
}
