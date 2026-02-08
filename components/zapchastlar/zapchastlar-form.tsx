"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ZapchastlarFormProps {
  onSuccess?: () => void
}

export function ZapchastlarForm({ onSuccess }: ZapchastlarFormProps) {
  const [formData, setFormData] = useState({
    tovar_nomi: "",
    raqami: "",
    amal_turi: "",
    miqdor: "",
    izoh: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.tovar_nomi || !formData.amal_turi || !formData.miqdor) {
      toast({
        title: "Xatolik",
        description: "Barcha majburiy maydonlarni to'ldiring",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("zapchastlar").insert({
        tovar_nomi: formData.tovar_nomi,
        raqami: formData.raqami || null,
        amal_turi: formData.amal_turi,
        miqdor: Number.parseFloat(formData.miqdor),
        izoh: formData.izoh || null,
      })

      if (error) throw error

      toast({
        title: "Muvaffaqiyat",
        description: "Zapchastlar muvaffaqiyatli qo'shildi",
      })

      setFormData({
        tovar_nomi: "",
        raqami: "",
        amal_turi: "",
        miqdor: "",
        izoh: "",
      })

      onSuccess?.()
    } catch (error) {
      console.error("Error adding spare part:", error)
      toast({
        title: "Xatolik",
        description: "Zapchastlar qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Yangi zapchastlar yozuvi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tovar_nomi">Zapchastlar nomi *</Label>
            <Input
              id="tovar_nomi"
              placeholder="Masalan: Metall plata"
              value={formData.tovar_nomi}
              onChange={(e) => setFormData({ ...formData, tovar_nomi: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="raqami">Raqami/Kodi (ixtiyoriy)</Label>
            <Input
              id="raqami"
              placeholder="Masalan: ZP001"
              value={formData.raqami}
              onChange={(e) => setFormData({ ...formData, raqami: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amal_turi">Amal turi *</Label>
            <Select
              value={formData.amal_turi}
              onValueChange={(value) => setFormData({ ...formData, amal_turi: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Amal turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Olib kelindi">Olib kelindi</SelectItem>
                <SelectItem value="Ishlatildi">Ishlatildi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="miqdor">Miqdor (blok) *</Label>
            <Input
              id="miqdor"
              type="number"
              step="0.01"
              placeholder="Masalan: 10"
              value={formData.miqdor}
              onChange={(e) => setFormData({ ...formData, miqdor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="izoh">Izoh (ixtiyoriy)</Label>
            <Input
              id="izoh"
              placeholder="Qo'shimcha ma'lumot..."
              value={formData.izoh}
              onChange={(e) => setFormData({ ...formData, izoh: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Qo'shilmoqda..." : "Qo'shish"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
