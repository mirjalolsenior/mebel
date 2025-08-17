"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "./card"
import type { ReactNode } from "react"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover3d?: boolean
}

export function AnimatedCard({ children, className, delay = 0, hover3d = true }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={
        hover3d
          ? {
              scale: 1.02,
              rotateX: 5,
              rotateY: 5,
              z: 50,
              transition: { duration: 0.2 },
            }
          : { scale: 1.02 }
      }
      style={{ transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }} className={className}>
      {children}
    </motion.div>
  )
}

export { Card, CardContent, CardDescription, CardFooter, CardTitle }
