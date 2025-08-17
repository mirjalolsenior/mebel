"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AnimatedCounter from "@/components/ui/animated-counter"
import { useProducts } from "@/hooks/use-products"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function ProductsStats() {
  const { products, loading } = useProducts()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yuklanmoqda...</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div
                  className="h-6 bg-gradient-to-r from-cyan-200 to-pink-200 dark:from-cyan-800 dark:to-pink-800 rounded"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  const totalGot = products.reduce((sum, product) => sum + product.got_amount, 0)
  const totalPaid = products.reduce((sum, product) => sum + product.paid_amount, 0)
  const totalRemaining = products.reduce((sum, product) => sum + product.remaining, 0)

  const stats = [
    {
      title: "Jami oldi",
      value: totalGot,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
    },
    {
      title: "Jami berdi",
      value: totalPaid,
      icon: TrendingDown,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    },
    {
      title: "Jami qoldi",
      value: totalRemaining,
      icon: Minus,
      gradient: "from-orange-500 to-pink-500",
      bgGradient: "from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20",
    },
  ]

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              scale: 1.05,
              rotateX: 5,
              rotateY: 5,
              z: 50,
              transition: { duration: 0.2 },
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <Card
              className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                  <Icon className={`h-4 w-4 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter
                    value={stat.value}
                    suffix=" mln"
                    className={`bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
