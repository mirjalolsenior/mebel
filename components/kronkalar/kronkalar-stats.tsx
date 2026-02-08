"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { isIn, isOut, toNumber, normalizeText } from "@/lib/ombor/amal-turi"

interface StatsData {
  jamiKronkalar: number
  jamiKeltirilgan: number
  jamiIshlatilgan: number
}

interface KronkalarStatsProps {
  refreshTrigger?: number
}

export function KronkalarStats({ refreshTrigger = 0 }: KronkalarStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    jamiKronkalar: 0,
    jamiKeltirilgan: 0,
    jamiIshlatilgan: 0,
  })
  const [loading, setLoading] = useState(true)

  // Define fetch function outside useEffect to avoid recreating it
  const fetchStats = useCallback(async () => {
    const supabase = createClient()

    try {
      // Get all kronkalar records
      const { data: allData, error } = await supabase.from("kronkalar").select("tovar_nomi, raqami, amal_turi, miqdor, izoh")

      if (error) throw error

      // Calculate statistics
      const uniqueProducts = new Set<string>()
      let jamiKeltirilgan = 0
      let jamiIshlatilgan = 0

      if (allData) {
        for (const item of allData) {
          // Count unique products by tovar_nomi + raqami composite key
          if (item.tovar_nomi) {
            const key = `${normalizeText(item.tovar_nomi)}__${normalizeText(item.raqami ?? "")}`
            uniqueProducts.add(key)
          }

          // Use helper to categorize action type (with fallback to izoh field)
          const miqdor = toNumber(item.miqdor)

          if (isIn(item.amal_turi, item.izoh)) {
            jamiKeltirilgan += miqdor
          } else if (isOut(item.amal_turi, item.izoh)) {
            jamiIshlatilgan += miqdor
          }
        }
      }

      const newStats = {
        jamiKronkalar: uniqueProducts.size,
        jamiKeltirilgan,
        jamiIshlatilgan,
      }
      setStats(newStats)
    } catch (error) {
      console.error("Error fetching kronkalar stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Setup initial fetch and real-time subscription
  useEffect(() => {
    // Initial fetch
    fetchStats()

    // Subscribe to real-time changes
    const supabase = createClient()
    const subscription = supabase
      .channel("kronkalar_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "kronkalar" }, () => {
        fetchStats()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchStats, refreshTrigger])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted/20 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="glass-card border-blue-500/20 bg-blue-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami kronkalar</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiKronkalar}</div>
          <p className="text-xs text-muted-foreground">Turli xil kronkalar</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-green-500/20 bg-green-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami keltirilgan</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiKeltirilgan}</div>
          <p className="text-xs text-muted-foreground">Metr kronka keltirilgan</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-red-500/20 bg-red-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami ishlatilgan</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiIshlatilgan}</div>
          <p className="text-xs text-muted-foreground">Metr kronka ishlatilgan</p>
        </CardContent>
      </Card>
    </div>
  )
}
