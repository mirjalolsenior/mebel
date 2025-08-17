"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BadgeAmount } from "@/components/ui/badge-amount"
import { Edit, Trash2 } from "lucide-react"
import { isAdminLoggedIn } from "@/lib/auth"
import { useEffect, useState } from "react"
import type { Database } from "@/lib/supabase/client"

type Client = Database["public"]["Tables"]["clients"]["Row"]

interface ClientCardProps {
  client: Client
  onEdit?: (client: Client) => void
  onDelete?: (id: string) => void
}

export function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(isAdminLoggedIn())
  }, [])

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">{client.client_name}</CardTitle>
          {isAdmin && (
            <div className="flex space-x-1 ml-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit?.(client)} className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(client.id)}
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
          <BadgeAmount amount={client.delivered_count} type="quantity" />
          <BadgeAmount amount={client.tape_used_m} type="meters" />
          <BadgeAmount amount={client.paid_amount} type="money" />
          <BadgeAmount amount={client.remaining} type="money" />
        </div>

        {client.note && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            <strong>Eslatma:</strong> {client.note}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Yaratilgan: {new Date(client.created_at).toLocaleDateString("uz-UZ")}
        </div>
      </CardContent>
    </Card>
  )
}
