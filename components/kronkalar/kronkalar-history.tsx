"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface KronkaItem {
  id: string
  tovar_nomi: string
  raqami: string | null
  amal_turi: string
  miqdor: number
  izoh: string | null
  created_at: string
}

export function KronkalarHistory({ refreshTrigger }: { refreshTrigger: number }) {
  const [items, setItems] = useState<KronkaItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KronkaItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchItems() {
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("kronkalar")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setItems(data || [])
        setFilteredItems(data || [])
      } catch (error) {
        console.error("Error fetching kronkalar history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [refreshTrigger])

  useEffect(() => {
    const filtered = items.filter((item) =>
      item.tovar_nomi.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredItems(filtered)
  }, [searchQuery, items])

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted/20 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="glass-card p-6">
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Kronkalar tarixi bo'sh</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tovar nomi bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="glass-card p-6">
        {filteredItems.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Hech qanday ma'lumot topilmadi</p>
          </div>
        )}
        {filteredItems.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Amal</TableHead>
                  <TableHead className="text-right">Miqdor (metr)</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead>Izoh</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.tovar_nomi}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.amal_turi === "Keltirildi"
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-red-500/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {item.amal_turi}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{item.miqdor}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">{item.izoh || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
