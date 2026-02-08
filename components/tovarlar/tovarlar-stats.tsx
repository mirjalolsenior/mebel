"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, TrendingDown } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface StatsData {
  jamiTovarlar: number
  jamiKeltirilgan: number
  jamiIshlatilgan: number
}

interface TovarlarStatsProps {
  refreshTrigger?: number
}

// Safe number parser: converts to finite number, returns 0 for invalid input
function toNumber(value: unknown): number {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export function TovarlarStats({ refreshTrigger = 0 }: TovarlarStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    jamiTovarlar: 0,
    jamiKeltirilgan: 0,
    jamiIshlatilgan: 0,
  })
  const [loading, setLoading] = useState(true)

  // ISSUE: Was querying `tovarlar` table (transaction history) instead of `ombor` (aggregated balance)
  //        causing stats to always show 0 while balance list showed correct values
  // CHANGE: Query from `ombor` table which has pre-aggregated jami_keltirilgan/jami_ishlatilgan fields
  //        Use safe toNumber() parser; support refreshTrigger for form submission updates
  // WHY IT WORKS: ombor table contains the computed totals per item (not raw transactions),
  //        matching what ombor-balance.tsx displays; refreshTrigger refetches on form success

  const fetchStats = useCallback(async () => {
    const supabase = createClient()

    try {
      // Query from ombor table which has aggregated totals (not transaction history)
      const { data: allData, error } = await supabase
        .from("ombor")
        .select("tovar_nomi, raqami, jami_keltirilgan, jami_ishlatilgan, qoldiq")

      if (error) {
        console.error("[tovarlar-stats] query error:", error)
        return
      }

      console.log("[tovarlar-stats] source=ombor rowCount=", allData?.length ?? 0)

      // Calculate statistics from ombor table
      let jamiKeltirilgan = 0
      let jamiIshlatilgan = 0

      if (allData && allData.length > 0) {
        for (const item of allData) {
          jamiKeltirilgan += toNumber(item.jami_keltirilgan)
          jamiIshlatilgan += toNumber(item.jami_ishlatilgan)
        }
      }

      const newStats = {
        jamiTovarlar: allData?.length ?? 0,
        jamiKeltirilgan,
        jamiIshlatilgan,
      }
      console.log("[tovarlar-stats] computed:", newStats)
      setStats(newStats)
    } catch (error) {
      console.error("[tovarlar-stats] exception:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Setup initial fetch and real-time subscription
  useEffect(() => {
    fetchStats()

    // Subscribe to real-time changes on ombor table (not tovarlar)
    const supabase = createClient()
    const subscription = supabase
      .channel("ombor_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "ombor" }, () => {
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
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami tovarlar</CardTitle>
          <Package className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiTovarlar}</div>
          <p className="text-xs text-muted-foreground">Turli xil tovarlar</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-green-500/20 bg-green-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami keltirilgan</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiKeltirilgan}</div>
          <p className="text-xs text-muted-foreground">Dona tovar keltirilgan</p>
        </CardContent>
      </Card>

      <Card className="glass-card border-red-500/20 bg-red-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Jami ishlatilgan</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.jamiIshlatilgan}</div>
          <p className="text-xs text-muted-foreground">Dona tovar ishlatilgan</p>
        </CardContent>
      </Card>
    </div>
  )
}
