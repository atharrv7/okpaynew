import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { Landmark, ArrowRight, Lock } from "lucide-react"

export default function BankLogin() {
    const navigate = useNavigate()
    const location = useLocation()
    const state = location.state as { recipient?: string, amount?: string, method?: string, note?: string, bank?: string } | null
    
    const [userId, setUserId] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    if (!state) {
        navigate("/dashboard/send")
        return null
    }

    const bankNames: Record<string, string> = {
        "sbi": "State Bank of India",
        "hdfc": "HDFC Bank",
        "icici": "ICICI Bank",
        "axis": "Axis Bank"
    }
    
    const displayBank = state.bank ? bankNames[state.bank] || "Your Bank" : "Your Bank"

    const handleLogin = () => {
        if (!userId.trim()) {
            setError("Please enter your User ID")
            return
        }
        if (!password.trim()) {
            setError("Please enter your Password")
            return
        }
        
        // Simulating Bank Login
        navigate("/dashboard/bank-confirmation", { state })
    }

    return (
        <div className="max-w-md mx-auto py-12 animate-in fade-in duration-500">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden"
            >
                {/* Simulated Bank Header with distinct style differing from main app */}
                <div className="text-center mb-8 border-b pb-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Landmark className="w-8 h-8 text-slate-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{displayBank}</h2>
                    <p className="text-slate-500 text-sm mt-1">NetBanking Portal</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Customer / User ID</label>
                        <input
                            id="userId"
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 relative z-20"
                            placeholder="Enter User ID"
                            autoComplete="off"
                        />
                    </div>
                    <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Password / IPIN</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 relative z-20"
                            placeholder="Enter Password"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-8 text-xs text-slate-500 justify-center">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span>Secure Encrypted Connection</span>
                </div>

                <button 
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                    Login to Proceed <ArrowRight className="w-4 h-4" />
                </button>
                <div className="mt-4 text-center">
                    <button 
                        onClick={() => navigate("/dashboard/send")}
                        className="text-sm font-medium text-slate-500 hover:text-slate-700"
                    >
                        Cancel Transaction
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
