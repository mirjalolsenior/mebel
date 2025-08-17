"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeAmount } from "@/components/ui/badge-amount"
import { useOrders } from "@/hooks/use-orders"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function OrdersStats() {
  const { orders, loading } = useOrders()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yuklanmoqda...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalGot = orders.reduce((sum, order) => sum + order.got_amount, 0)
  const totalPaid = orders.reduce((sum, order) => sum + order.paid_amount, 0)
  const totalRemaining = orders.reduce((sum, order) => sum + order.remaining, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jami oldi</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <BadgeAmount amount={totalGot} type="money" className="text-lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jami berdi</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <BadgeAmount amount={totalPaid} type="money" className="text-lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jami qoldi</CardTitle>
          <Minus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <BadgeAmount amount={totalRemaining} type="money" className="text-lg" />
        </CardContent>
      </Card>
    </div>
  )
}
