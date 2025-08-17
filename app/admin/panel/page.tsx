"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAdminLoggedIn, clearAdminSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Package, ShoppingCart, Users, UserCheck, BarChart3, Settings } from "lucide-react"
import Link from "next/link"
import { useProducts } from "@/hooks/use-products"
import { useOrders } from "@/hooks/use-orders"
import { useClients } from "@/hooks/use-clients"
import { useRegularClients } from "@/hooks/use-regular-clients"

export default function AdminPanelPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  const { products } = useProducts()
  const { orders } = useOrders()
  const { clients } = useClients()
  const { regularClients } = useRegularClients()

  useEffect(() => {
    const adminStatus = isAdminLoggedIn()
    setIsAdmin(adminStatus)
    if (!adminStatus) {
      router.push("/admin")
    }
  }, [router])

  const handleLogout = () => {
    clearAdminSession()
    router.push("/")
  }

  if (!isAdmin) {
    return <div>Yuklanmoqda...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin paneli</h1>
          <p className="text-muted-foreground">Tizimni boshqarish va tahrirlash</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Chiqish
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tovarlar</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Jami tovarlar soni</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zakazlar</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">Jami zakazlar soni</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mijozlar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">Jami mijozlar soni</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doimiy mijozlar</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularClients.length}</div>
            <p className="text-xs text-muted-foreground">Doimiy mijozlar soni</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tovarlarni boshqarish</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Tovarlarni tahrirlash, o'chirish va yangi tovar qo'shish</CardDescription>
              <div className="mt-2 text-xs text-muted-foreground">
                Admin sifatida siz barcha tovarlarni tahrirlash va o'chirish imkoniyatiga egasiz
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zakazlarni boshqarish</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Zakazlarni tahrirlash, o'chirish va yangi zakaz qo'shish</CardDescription>
              <div className="mt-2 text-xs text-muted-foreground">Barcha zakazlar ustidan to'liq nazorat</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clients">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mijozlarni boshqarish</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Mijozlarni tahrirlash, o'chirish va yangi mijoz qo'shish</CardDescription>
              <div className="mt-2 text-xs text-muted-foreground">Mijozlar ma'lumotlarini to'liq boshqarish</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/regular-clients">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doimiy mijozlar</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>Doimiy mijozlarni tahrirlash va boshqarish</CardDescription>
              <div className="mt-2 text-xs text-muted-foreground">Eng muhim mijozlar ustidan nazorat</div>
            </CardContent>
          </Card>
        </Link>

        <Card className="opacity-75">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hisobotlar</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Moliyaviy hisobotlar va statistika</CardDescription>
            <div className="mt-2 text-xs text-muted-foreground">Tez orada qo'shiladi</div>
          </CardContent>
        </Card>

        <Card className="opacity-75">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sozlamalar</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Tizim sozlamalari va konfiguratsiya</CardDescription>
            <div className="mt-2 text-xs text-muted-foreground">Tez orada qo'shiladi</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Admin huquqlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">Admin sifatida siz quyidagi imkoniyatlarga egasiz:</p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Barcha tovarlar, zakazlar va mijozlarni tahrirlash</li>
            <li>• Ma'lumotlarni o'chirish</li>
            <li>• Yangi yozuvlar qo'shish</li>
            <li>• Barcha statistikalarni ko'rish</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4">
            Sessiya tugashi: Brauzer yopilganda yoki "Chiqish" tugmasi bosilganda
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
