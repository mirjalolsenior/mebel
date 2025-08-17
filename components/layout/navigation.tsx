"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Package, ShoppingCart, Users, UserCheck, Settings, Shield } from "lucide-react"
import { isAdminLoggedIn } from "@/lib/auth"
import { useEffect, useState } from "react"

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

  useEffect(() => {
    setIsAdmin(isAdminLoggedIn())

    const interval = setInterval(() => {
      setIsAdmin(isAdminLoggedIn())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary">
              Sherdor Mebel
            </Link>

            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
                  <Shield className="h-3 w-3" />
                  <span>Admin</span>
                </div>
                <Link
                  href="/admin/panel"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  <Settings className="h-4 w-4" />
                  <span>Panel</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/admin"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                <span>Kirish</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
