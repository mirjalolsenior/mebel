"use client"

import type React from "react"

import { useState } from "react"
import { useOrders } from "@/hooks/use-orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { Database } from "@/lib/supabase/client"

type Order = Database["public"]["Tables"]["orders"]["Row"]

interface OrderFormProps {
  order?: Order | null
  onSuccess?: () => void
}

export function OrderForm({ order, onSuccess }: OrderFormProps) {
  const { createOrder, updateOrder } = useOrders()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    type: order?.type || "",
    number: order?.number || "",
    got_amount: order?.got_amount?.toString() || "",
    paid_amount: order?.paid_amount?.toString() || "",
    due_date: order?.due_date || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = {
        type: formData.type.trim(),
        number: formData.number.trim(),
        got_amount: Number.parseFloat(formData.got_amount) || 0,
        paid_amount: Number.parseFloat(formData.paid_amount) || 0,
        due_date: formData.due_date || null,
      }

      let result
      if (order) {
        result = await updateOrder(order.id, data)
      } else {
        result = await createOrder(data)
      }

      if (result.error) {
        setError(result.error)
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError("Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Zakaz turi *</Label>
          <Input
            id="type"
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
            placeholder="Masalan: Maxsus buyurtma"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">Zakaz raqami *</Label>
          <Input
            id="number"
            value={formData.number}
            onChange={(e) => handleChange("number", e.target.value)}
            placeholder="Masalan: ORD-001"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="got_amount">Oldi (mln) *</Label>
          <Input
            id="got_amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.got_amount}
            onChange={(e) => handleChange("got_amount", e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paid_amount">Berdi (mln) *</Label>
          <Input
            id="paid_amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.paid_amount}
            onChange={(e) => handleChange("paid_amount", e.target.value)}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Muddat</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => handleChange("due_date", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {order ? "Yangilash" : "Yaratish"}
        </Button>
      </div>
    </form>
  )
}
