import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 !w-auto shrink-0 max-w-fit",
  {
    variants: {
      variant: {
        default: "bg-gradient-luxury text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-glow-gold hover:scale-[1.02] hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:opacity-90 shadow-lg hover:shadow-xl",
        outline:
          "border-2 border-primary/30 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Zaf Ride variants
        zafPrimary: "bg-gradient-to-r from-ethiopian-green via-ethiopian-yellow to-ethiopian-green text-foreground font-bold shadow-lg hover:shadow-glow-green hover:scale-[1.02] hover:-translate-y-0.5",
        zafSecondary: "bg-secondary/80 backdrop-blur-sm text-secondary-foreground border border-border/50 hover:bg-secondary hover:border-primary/30",
        zafGlass: "glass border border-border/30 text-foreground hover:border-primary/50 hover:shadow-glow-gold",
        zafDanger: "bg-gradient-to-r from-ethiopian-red to-ethiopian-red/80 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02]",
        zafOutline: "border-2 border-ethiopian-green/50 bg-transparent text-ethiopian-green hover:bg-ethiopian-green/10 hover:border-ethiopian-green",
        // Premium luxury variants
        luxury: "bg-gradient-luxury text-primary-foreground shadow-luxury hover:shadow-glow-gold hover:scale-[1.02] hover:-translate-y-1",
        gold: "bg-gradient-gold text-foreground shadow-lg hover:shadow-glow-gold hover:scale-[1.02]",
        ethiopian: "bg-gradient-ethiopian text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
