"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Ribbon, Search, X } from "lucide-react"
import { isIn, isOut, toNumber } from "@/lib/ombor/amal-turi"

interface BalanceItem {
  tovar_nomi: string
  raqami: string | null
  keltirilgan: number
  ishlatilgan: number
  balans: number
  oxirgi_yangilanish: string
}

export function KronkalarBalance({ refreshTrigger }: { refreshTrigger: number }) {
  const [items, setItems] = useState<BalanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchItems() {
      const supabase = createClient()

      try {
        const { data: rawData, error } = await supabase
          .from("kronkalar")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error

        // Group by: tovar_nomi + raqami
        const grouped: Record<string, BalanceItem> = {}
        const lastUpdated: Record<string, number> = {}

        if (rawData) {
          for (const row of rawData as any[]) {
            const name = (row.tovar_nomi || "").trim()
            const code = (row.raqami || "").trim()
            const key = `${name}__${code}`

            if (!grouped[key]) {
              grouped[key] = {
                tovar_nomi: name,
                raqami: code || null,
                keltirilgan: 0,
                ishlatilgan: 0,
                balans: 0,
                oxirgi_yangilanish: row.created_at,
              }
              lastUpdated[key] = new Date(row.created_at).getTime()
            }

            const qty = toNumber(row.miqdor)

            if (isIn(row.amal_turi, row.izoh)) {
              grouped[key].keltirilgan += qty
            } else if (isOut(row.amal_turi, row.izoh)) {
              grouped[key].ishlatilgan += qty
            }

            grouped[key].balans = grouped[key].keltirilgan - grouped[key].ishlatilgan

            const t = new Date(row.created_at).getTime()
            if (t > (lastUpdated[key] ?? 0)) {
              lastUpdated[key] = t
              grouped[key].oxirgi_yangilanish = row.created_at
            }
          }
        }

        const itemList = Object.values(grouped).sort(
          (a, b) => new Date(b.oxirgi_yangilanish).getTime() - new Date(a.oxirgi_yangilanish).getTime(),
        )

        setItems(itemList)
      } catch (error) {
        console.error("Error fetching kronkalar balance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [refreshTrigger])

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ribbon className="h-5 w-5" />
            Kronkalar Ombor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted/20 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase().trim()
    return item.tovar_nomi.toLowerCase().includes(q) || (item.raqami && item.raqami.toLowerCase().includes(q))
  })

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ribbon className="h-5 w-5" />
          Kronkalar Ombor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tovar nomi yoki raqami bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Kronkalar omborda hozircha tovarlar yo'q</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Qidiruvga mos tovarlar topilmadi</p>
          ) : (
            filteredItems.map((item) => (
              <div
                key={`${item.tovar_nomi}__${item.raqami || ""}`}
                className="p-4 rounded-lg bg-muted/10 border border-border/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{item.tovar_nomi}</h4>
                    {item.raqami && (
                      <Badge variant="outline" className="text-xs">
                        {item.raqami}
                      </Badge>
                    )}
                  </div>
                  <Badge variant={item.balans > 0 ? "default" : "secondary"}>Qoldiq: {item.balans}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Jami keltirilgan</p>
                    <p className="font-medium text-green-600">{item.keltirilgan}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jami ishlatilgan</p>
                    <p className="font-medium text-red-600">{item.ishlatilgan}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Oxirgi yangilanish:{" "}
                  {new Date(item.oxirgi_yangilanish).toLocaleDateString("uz-UZ", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
