"use client"

import { motion, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  suffix?: string
}

export default function AnimatedCounter({ value, duration = 2, className, suffix = "" }: AnimatedCounterProps) {
  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString())

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return (
    <motion.span
      className={className}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  )
}
