import { Suspense } from "react"
import { ProductsList } from "@/components/products/products-list"
import { ProductsStats } from "@/components/products/products-stats"
import { NotificationSetup } from "@/components/pwa/notification-setup"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import FurnitureScene from "@/components/3d/furniture-scene"

export default function HomePage() {
  return (
    <div className="space-y-6">
      <NotificationSetup />

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 via-pink-50 to-cyan-100 dark:from-cyan-950/20 dark:via-pink-950/20 dark:to-cyan-900/20 p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-600 to-pink-600 bg-clip-text text-transparent">
              Sherdor Mebel
            </h1>
            <p className="text-lg text-muted-foreground">Zamonaviy mebel boshqaruv tizimi</p>
            <Link href="/products/new">
              <Button className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                Yangi tovar qo'shish
              </Button>
            </Link>
          </div>
          <div className="h-64 lg:h-80">
            <FurnitureScene />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tovarlar</h2>
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
