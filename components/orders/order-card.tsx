"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BadgeAmount } from "@/components/ui/badge-amount"
import { DueDateBadge } from "@/components/ui/due-date-badge"
import { Edit, Trash2 } from "lucide-react"
import { isAdminLoggedIn } from "@/lib/auth"
import { useEffect, useState } from "react"
import type { Database } from "@/lib/supabase/client"

type Order = Database["public"]["Tables"]["orders"]["Row"]

interface OrderCardProps {
  order: Order
  onEdit?: (order: Order) => void
  onDelete?: (id: string) => void
}

export function OrderCard({ order, onEdit, onDelete }: OrderCardProps) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(isAdminLoggedIn())
  }, [])

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{order.type}</CardTitle>
            <p className="text-sm text-muted-foreground">#{order.number}</p>
          </div>
          {isAdmin && (
            <div className="flex space-x-1 ml-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit?.(order)} className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(order.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <BadgeAmount amount={order.got_amount} type="money" />
          <BadgeAmount amount={order.paid_amount} type="money" />
          <BadgeAmount amount={order.remaining} type="money" />
        </div>

        {order.due_date && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Muddat:</span>
            <DueDateBadge dueDate={order.due_date} />
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Yaratilgan: {new Date(order.created_at).toLocaleDateString("uz-UZ")}
        </div>
      </CardContent>
    </Card>
  )
}
