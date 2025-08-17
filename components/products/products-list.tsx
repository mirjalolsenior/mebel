"use client"

import { useState } from "react"
import { useProducts } from "@/hooks/use-products"
import { ProductCard } from "./product-card"
import { ProductForm } from "./product-form"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isToday, isTomorrow, isPast } from "date-fns"
import type { Database } from "@/lib/supabase/client"

type Product = Database["public"]["Tables"]["products"]["Row"]

export function ProductsList() {
  const { products, loading, error, deleteProduct } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [dueDateFilter, setDueDateFilter] = useState<string>("all")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bu tovarni o'chirishni xohlaysizmi?")) {
      const { error } = await deleteProduct(id)
      if (error) {
        alert("Xatolik: " + error)
      }
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())

    // Due date filter
    let matchesDueDate = true
    if (dueDateFilter !== "all" && product.due_date) {
      const dueDate = new Date(product.due_date)
      switch (dueDateFilter) {
        case "overdue":
          matchesDueDate = isPast(dueDate) && !isToday(dueDate)
          break
        case "today":
          matchesDueDate = isToday(dueDate)
          break
        case "tomorrow":
          matchesDueDate = isTomorrow(dueDate)
          break
      }
    } else if (dueDateFilter !== "all" && !product.due_date) {
      matchesDueDate = false
    }

    return matchesSearch && matchesDueDate
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Xatolik: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tovar nomini qidiring..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Muddat bo'yicha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            <SelectItem value="overdue">Kechikkan</SelectItem>
            <SelectItem value="today">Bugun</SelectItem>
            <SelectItem value="tomorrow">Ertaga</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || dueDateFilter !== "all" ? "Hech narsa topilmadi" : "Hali tovarlar yo'q"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Tovarni tahrirlash" : "Yangi tovar"}</DialogTitle>
          </DialogHeader>
          <ProductForm product={editingProduct} onSuccess={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
