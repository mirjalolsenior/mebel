"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Zapchastlar {
  id: string
  tovar_nomi: string
  raqami: string | null
  amal_turi: string
  miqdor: number
  izoh: string | null
  created_at: string
}

interface ZapchastlarListProps {
  refreshTrigger?: number
}

export function ZapchastlarList({ refreshTrigger = 0 }: ZapchastlarListProps) {
  const [zapchastlar, setZapchastlar] = useState<Zapchastlar[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadZapchastlar()
  }, [refreshTrigger])

  const loadZapchastlar = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("zapchastlar")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setZapchastlar(data || [])
    } catch (error) {
      console.error("Error loading zapchastlar:", error)
      toast({
        title: "Xatolik",
        description: "Zapchastlar yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yozuvni o'chirmoqchimisiz?")) return

    try {
      const { error } = await supabase.from("zapchastlar").delete().eq("id", id)

      if (error) throw error

      setZapchastlar(zapchastlar.filter((item) => item.id !== id))
      toast({
        title: "Muvaffaqiyat",
        description: "Yozuv muvaffaqiyatli o'chirildi",
      })
    } catch (error) {
      console.error("Error deleting zapchastlar:", error)
      toast({
        title: "Xatolik",
        description: "O'chirish jarayonida xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Yuklanmoqda...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Zapchastlar tarixchasi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zapchastlar nomi</TableHead>
                <TableHead>Raqami/Kodi</TableHead>
                <TableHead>Amal turi</TableHead>
                <TableHead>Miqdor (blok)</TableHead>
                <TableHead>Izoh</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zapchastlar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Zapchastlar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                zapchastlar.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.tovar_nomi}</TableCell>
                    <TableCell>{item.raqami || "-"}</TableCell>
                    <TableCell>{item.amal_turi}</TableCell>
                    <TableCell>{item.miqdor}</TableCell>
                    <TableCell>{item.izoh || "-"}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString("uz-UZ")}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
