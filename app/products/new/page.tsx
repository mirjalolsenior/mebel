"use client"

import { useRouter } from "next/navigation"
import { ProductForm } from "@/components/products/product-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewProductPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Orqaga
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Yangi tovar qo'shish</h1>
          <p className="text-muted-foreground">Yangi tovar ma'lumotlarini kiriting</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tovar ma'lumotlari</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  )
}
