import { Suspense } from "react"
import { OrdersList } from "@/components/orders/orders-list"
import { OrdersStats } from "@/components/orders/orders-stats"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zakazlar</h1>
          <p className="text-muted-foreground">Barcha zakazlar va ularning holati</p>
        </div>
        <Link href="/orders/new">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Yangi zakaz</span>
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Yuklanmoqda...</div>}>
        <OrdersStats />
      </Suspense>

      <Suspense fallback={<div>Zakazlar yuklanmoqda...</div>}>
        <OrdersList />
      </Suspense>
    </div>
  )
}
