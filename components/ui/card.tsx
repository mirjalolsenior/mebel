import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm text-card-foreground shadow-lg hover:shadow-xl transition-all duration-300 relative group overflow-hidden",
      "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-primary/5 before:to-secondary/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
      className,
    )}
    {...props}
  />
))

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  )
}

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text",
        className,
      )}
      {...props}
    />
  ),
)

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-description" className={cn("text-sm text-muted-foreground text-sm", className)} {...props} />
  )
}

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0 relative z-10", className)} {...props} />,
)

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-6 pt-0 relative z-10 border-t border-border/30 mt-4", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
