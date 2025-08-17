"use client"

import { useRouter } from "next/navigation"
import { OrderForm } from "@/components/orders/order-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewOrderPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/orders")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Yangi zakaz qo'shish</h1>
          <p className="text-muted-foreground">Yangi zakaz ma'lumotlarini kiriting</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zakaz ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  )
}
