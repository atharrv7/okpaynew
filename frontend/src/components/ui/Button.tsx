import * as React from "react"
import { cn } from "../../lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
    size?: "sm" | "md" | "lg"
    loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", loading, children, ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-[#020817] hover:bg-primary/90 hover:shadow-glow-lg border-0",
            secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
            outline: "border border-primary/50 text-white hover:bg-primary/10 hover:border-primary",
            ghost: "hover:bg-white/5 text-slate-300 hover:text-white",
            danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20",
        }

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-6 text-lg",
        }

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] duration-200",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={loading || props.disabled}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
