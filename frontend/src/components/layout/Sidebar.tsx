import { Link, useLocation } from "react-router-dom"
import {
    Home,
    ArrowLeftRight,
    LogOut,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useAuth } from "../../contexts/AuthContext"

const mainNavItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: ArrowLeftRight, label: "Transactions", path: "/dashboard/transactions" },
]



export function Sidebar() {
    const location = useLocation()
    const { user, logout } = useAuth()

    return (
        <aside className="w-64 bg-[#080B14] border-r border-slate-800/80 flex flex-col h-screen fixed left-0 top-0 z-20">
            {/* Logo area */}
            <div className="p-6 pb-4">
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        <span className="text-[#080B14] font-bold text-lg">O</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        OkPay
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-3 mt-4 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Main Nav */}
                <div className="space-y-1">
                    {mainNavItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 group",
                                    isActive
                                        ? "bg-cyan-500/10 text-cyan-400 font-medium"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                                )}
                            >
                                <item.icon className={cn("w-[18px] h-[18px]", isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>


            </nav>

            {/* Profile area */}
            <div className="p-4 mt-auto border-t border-slate-800/50">
                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-800/40 transition-colors group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-cyan-900/30 flex items-center justify-center text-cyan-400 font-bold text-sm border border-cyan-500/20">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : "DU"}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold text-white truncate">{user?.name || "Demo User"}</span>
                        <span className="text-[11px] text-slate-500 truncate">Account Active</span>
                    </div>
                </div>

                <button
                    onClick={() => logout && logout()}
                    className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
                >
                    <LogOut className="w-[18px] h-[18px]" />
                    Sign Out
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #1e293b; border-radius: 20px; }
            `}} />
        </aside>
    )
}
