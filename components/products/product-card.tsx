"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BadgeAmount } from "@/components/ui/badge-amount"
import { DueDateBadge } from "@/components/ui/due-date-badge"
import { Edit, Trash2 } from "lucide-react"
import { isAdminLoggedIn } from "@/lib/auth"
import { useEffect, useState } from "react"
import type { Database } from "@/lib/supabase/client"

type Product = Database["public"]["Tables"]["products"]["Row"]

interface ProductCardProps {
  product: Product
  onEdit?: (product: Product) => void
  onDelete?: (id: string) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setIsAdmin(isAdminLoggedIn())
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        scale: 1.02,
        rotateX: 5,
        rotateY: 5,
        z: 50,
        transition: { duration: 0.2 },
      }}
      style={{ transformStyle: "preserve-3d" }}
      className="perspective-1000"
    >
      <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
              <CardTitle className="text-lg font-semibold line-clamp-2 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                {product.name}
              </CardTitle>
            </motion.div>
            {isAdmin && (
              <div className="flex space-x-1 ml-2">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(product)}
                    className="h-8 w-8 p-0 hover:bg-cyan-100 dark:hover:bg-cyan-900/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(product.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, staggerChildren: 0.1 }}
          >
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
              <BadgeAmount amount={product.got_amount} type="money" />
            </motion.div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>
              <BadgeAmount amount={product.paid_amount} type="money" />
            </motion.div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
              <BadgeAmount amount={product.remaining} type="money" />
            </motion.div>
          </motion.div>

          {product.due_date && (
            <motion.div
              className="flex justify-between items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-sm text-muted-foreground">Muddat:</span>
              <DueDateBadge dueDate={product.due_date} />
            </motion.div>
          )}

          <motion.div
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Yaratilgan: {new Date(product.created_at).toLocaleDateString("uz-UZ")}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
