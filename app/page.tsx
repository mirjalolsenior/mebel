import { Suspense } from "react"
import { ProductsList } from "@/components/products/products-list"
import { ProductsStats } from "@/components/products/products-stats"
import { NotificationSetup } from "@/components/pwa/notification-setup"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="space-y-6">
      <NotificationSetup />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tovarlar</h1>
          <p className="text-muted-foreground">Barcha tovarlar va ularning holati</p>
        </div>
        <Link href="/products/new">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Yangi tovar</span>
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Yuklanmoqda...</div>}>
        <ProductsStats />
      </Suspense>

      <Suspense fallback={<div>Tovarlar yuklanmoqda...</div>}>
        <ProductsList />
      </Suspense>
    </div>
  )
}
