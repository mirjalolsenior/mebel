"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { Database } from "@/lib/supabase/client"

type Client = Database["public"]["Tables"]["clients"]["Row"]

interface ClientFormProps {
  client?: Client | null
  onSuccess?: () => void
  onSubmit: (data: any) => Promise<{ data: any; error: string | null }>
  title?: string
}

export function ClientForm({ client, onSuccess, onSubmit, title = "Mijoz" }: ClientFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    client_name: client?.client_name || "",
    delivered_count: client?.delivered_count?.toString() || "",
    tape_used_m: client?.tape_used_m?.toString() || "",
    paid_amount: client?.paid_amount?.toString() || "",
    note: client?.note || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = {
        client_name: formData.client_name.trim(),
        delivered_count: Number.parseFloat(formData.delivered_count) || 0,
        tape_used_m: Number.parseFloat(formData.tape_used_m) || 0,
        paid_amount: Number.parseFloat(formData.paid_amount) || 0,
        note: formData.note.trim() || null,
      }

      const result = await onSubmit(data)

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
      <div className="space-y-2">
        <Label htmlFor="client_name">{title} nomi *</Label>
        <Input
          id="client_name"
          value={formData.client_name}
          onChange={(e) => handleChange("client_name", e.target.value)}
          placeholder="Masalan: Aziz Karimov"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="delivered_count">Olib kelgan (ta) *</Label>
          <Input
            id="delivered_count"
            type="number"
            step="1"
            min="0"
            value={formData.delivered_count}
            onChange={(e) => handleChange("delivered_count", e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tape_used_m">Lenta (m) *</Label>
          <Input
            id="tape_used_m"
            type="number"
            step="0.1"
            min="0"
            value={formData.tape_used_m}
            onChange={(e) => handleChange("tape_used_m", e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paid_amount">To'langan (mln) *</Label>
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
        <Label htmlFor="note">Eslatma</Label>
        <Textarea
          id="note"
          value={formData.note}
          onChange={(e) => handleChange("note", e.target.value)}
          placeholder="Qo'shimcha ma'lumotlar..."
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {client ? "Yangilash" : "Yaratish"}
        </Button>
      </div>
    </form>
  )
}
