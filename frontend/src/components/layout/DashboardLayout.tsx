import { Sidebar } from "./Sidebar"
import { Outlet, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

export function DashboardLayout() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-[#070A11] text-slate-200 selection:bg-cyan-500/30">
            <Sidebar />

            <main className="pl-64 min-h-screen flex flex-col pt-0">
                {/* Header Navbar */}
                <header className="h-[72px] border-b border-slate-800/80 flex items-center justify-between px-8 bg-[#0B101D]/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-8">
                        <nav className="hidden lg:flex items-center gap-6">
                            <Link to="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                                <span className="opacity-60">🏠</span> OkPay Home
                            </Link>
                            <Link to="/dashboard/pay" className="text-sm font-medium text-cyan-400 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-cyan-500/10 flex items-center justify-center">💳</span> Send / Receive
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-[1px] shadow-lg shadow-cyan-500/10">
                            <div className="h-full w-full rounded-[11px] bg-[#0B101D] flex items-center justify-center text-xs font-bold text-cyan-400">
                                {user?.name ? user.name.substring(0, 2).toUpperCase() : "DU"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-10 flex-1 bg-[#070A11]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}
