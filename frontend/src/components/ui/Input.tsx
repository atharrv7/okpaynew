import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-medium text-slate-400 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            "flex h-12 w-full rounded-xl border border-white/5 bg-[#0B0F19] px-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all",
                            icon && "pl-11",
                            error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-500 ml-1">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
