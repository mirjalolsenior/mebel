"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Package, ShoppingCart, Users, UserCheck, Settings, Shield } from "lucide-react"
import { isAdminLoggedIn } from "@/lib/auth"
import { useEffect, useState } from "react"
import FurnitureScene from "@/components/3d/furniture-scene"

const navItems = [
  {
    href: "/",
    label: "Tovarlar",
    icon: Package,
  },
  {
    href: "/orders",
    label: "Zakazlar",
    icon: ShoppingCart,
  },
  {
    href: "/clients",
    label: "Mijozlar",
    icon: Users,
  },
  {
    href: "/regular-clients",
    label: "Doimiy mijozlar",
    icon: UserCheck,
  },
]

export function Navigation() {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogo3D, setShowLogo3D] = useState(false)

  useEffect(() => {
    setIsAdmin(isAdminLoggedIn())

    const interval = setInterval(() => {
      setIsAdmin(isAdminLoggedIn())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="relative">
              <motion.div
                onHoverStart={() => setShowLogo3D(true)}
                onHoverEnd={() => setShowLogo3D(false)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/"
                  className="text-2xl font-bold bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-600 bg-clip-text text-transparent hover:from-cyan-600 hover:via-pink-600 hover:to-cyan-700 transition-all duration-300"
                >
                  Sherdor Mebel
                </Link>
              </motion.div>

              {showLogo3D && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-64 h-32 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <FurnitureScene showLogo={true} className="w-full h-full" />
                </motion.div>
              )}
            </div>

            <div className="hidden md:flex space-x-2">
              {navItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative group",
                        pathname === item.href
                          ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-500/25"
                          : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-cyan-50 hover:to-pink-50 dark:hover:from-cyan-950/20 dark:hover:to-pink-950/20 hover:shadow-md",
                      )}
                    >
                      <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                        <Icon className="h-4 w-4" />
                      </motion.div>
                      <span>{item.label}</span>
                      {pathname === item.href && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-pink-500/20 -z-10"
                          layoutId="activeTab"
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin ? (
              <div className="flex items-center space-x-3">
                <motion.div
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Shield className="h-3 w-3" />
                  </motion.div>
                  <span>Admin</span>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/admin/panel"
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Panel</span>
                  </Link>
                </motion.div>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/admin"
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-cyan-50 hover:to-pink-50 dark:hover:from-cyan-950/20 dark:hover:to-pink-950/20 transition-all duration-300"
                >
                  <Settings className="h-4 w-4" />
                  <span>Kirish</span>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        <div className="md:hidden pb-4">
          <motion.div
            className="flex space-x-2 overflow-x-auto scrollbar-hide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {navItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300",
                      pathname === item.href
                        ? "bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg shadow-cyan-500/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-cyan-50 hover:to-pink-50 dark:hover:from-cyan-950/20 dark:hover:to-pink-950/20",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </nav>
  )
}
