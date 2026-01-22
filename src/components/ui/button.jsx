import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:bg-destructive/90 hover:-translate-y-0.5 active:translate-y-0",
        outline:
          "border-2 border-border bg-transparent text-foreground hover:bg-accent/10 hover:border-accent hover:text-accent-foreground hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:bg-secondary/80 hover:-translate-y-0.5 active:translate-y-0",
        ghost: 
          "text-foreground hover:bg-accent/10 hover:text-accent-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline",
        // Premium Ethiopian-inspired variants with micro-interactions
        gold:
          "bg-gradient-to-r from-[hsl(var(--gold-400))] to-[hsl(var(--gold-500))] text-foreground shadow-md hover:shadow-[0_0_30px_hsl(var(--gold-400)/0.4)] hover:-translate-y-1 active:translate-y-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700",
        ethiopian:
          "bg-gradient-to-r from-accent to-accent/90 text-accent-foreground shadow-md hover:shadow-[0_0_30px_hsl(var(--ethiopian-green)/0.4)] hover:-translate-y-1 active:translate-y-0 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700",
        premium:
          "bg-gradient-to-r from-[hsl(var(--ethiopian-green))] via-[hsl(var(--ethiopian-yellow))] to-[hsl(var(--ethiopian-red))] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:translate-y-0 active:scale-100 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700",
        glass:
          "bg-[hsl(var(--background)/0.6)] backdrop-blur-lg border border-border/50 text-foreground hover:bg-[hsl(var(--background)/0.8)] hover:border-[hsl(var(--gold-400)/0.3)] hover:shadow-[0_0_20px_hsl(var(--gold-400)/0.2)] hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-10 text-base",
        xl: "h-14 rounded-2xl px-12 text-lg",
        icon: "h-10 w-10 rounded-xl",
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
