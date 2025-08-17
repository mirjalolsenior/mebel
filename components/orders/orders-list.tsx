"use client"

import { useState } from "react"
import { useOrders } from "@/hooks/use-orders"
import { OrderCard } from "./order-card"
import { OrderForm } from "./order-form"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isToday, isTomorrow, isPast } from "date-fns"
import type { Database } from "@/lib/supabase/client"

type Order = Database["public"]["Tables"]["orders"]["Row"]

export function OrdersList() {
  const { orders, loading, error, deleteOrder } = useOrders()
  const [searchTerm, setSearchTerm] = useState("")
  const [dueDateFilter, setDueDateFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Bu zakazni o'chirishni xohlaysizmi?")) {
      const { error } = await deleteOrder(id)
      if (error) {
        alert("Xatolik: " + error)
      }
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingOrder(null)
  }

  // Get unique order types for filter
  const orderTypes = Array.from(new Set(orders.map((order) => order.type)))

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Search filter (by type and number)
    const matchesSearch =
      order.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.number.toLowerCase().includes(searchTerm.toLowerCase())

    // Type filter
    const matchesType = typeFilter === "all" || order.type === typeFilter

    // Due date filter
    let matchesDueDate = true
    if (dueDateFilter !== "all" && order.due_date) {
      const dueDate = new Date(order.due_date)
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
    } else if (dueDateFilter !== "all" && !order.due_date) {
      matchesDueDate = false
    }

    return matchesSearch && matchesType && matchesDueDate
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
            placeholder="Zakaz turi yoki raqamini qidiring..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tur bo'yicha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha turlar</SelectItem>
            {orderTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || dueDateFilter !== "all" || typeFilter !== "all"
              ? "Hech narsa topilmadi"
              : "Hali zakazlar yo'q"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingOrder ? "Zakazni tahrirlash" : "Yangi zakaz"}</DialogTitle>
          </DialogHeader>
          <OrderForm order={editingOrder} onSuccess={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
