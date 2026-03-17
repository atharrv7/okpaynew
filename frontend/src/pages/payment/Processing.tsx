import { useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { ShieldCheck, Lock } from "lucide-react"

export default function Processing() {
    const navigate = useNavigate()
    const location = useLocation()
    const state = location.state as { recipient?: string, amount?: string, method?: string, note?: string } | null
    
    useEffect(() => {
        if (!state) {
            navigate("/dashboard/send")
            return
        }

        const timer = setTimeout(() => {
            // Simulate 90% success rate
            const isSuccess = Math.random() > 0.1
            const txnId = "TXN" + Math.random().toString(36).slice(2, 9).toUpperCase();
            const dateStr = new Date().toISOString();

            if (isSuccess) {
                // Update local storage wallet balance
                const currentBalance = Number(localStorage.getItem('okpay_wallet_balance') || 12540)
                const amountNum = Number(state.amount || 0)
                localStorage.setItem('okpay_wallet_balance', (currentBalance - amountNum).toString())
                
                // Add to transactions history
                const txns = JSON.parse(localStorage.getItem('okpay_transactions') || '[]')
                txns.unshift({
                    id: txnId,
                    date: dateStr,
                    amount: amountNum,
                    type: "send",
                    method: state.method?.toLowerCase() || "upi",
                    status: "success",
                    recipient: state.recipient || "Unknown"
                })
                localStorage.setItem('okpay_transactions', JSON.stringify(txns))
            } else {
                // Save failed transaction too
                const amountNum = Number(state.amount || 0)
                const txns = JSON.parse(localStorage.getItem('okpay_transactions') || '[]')
                txns.unshift({
                    id: txnId,
                    date: dateStr,
                    amount: amountNum,
                    type: "send",
                    method: state.method?.toLowerCase() || "upi",
                    status: "failed",
                    recipient: state.recipient || "Unknown",
                    description: "Bank server timeout or insufficient funds"
                })
                localStorage.setItem('okpay_transactions', JSON.stringify(txns))
            }

            navigate("/dashboard/success", { 
                state: { 
                    ...state,
                    status: isSuccess ? "success" : "failed",
                    txnId: txnId,
                    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                } 
            })
        }, 3000)

        return () => clearTimeout(timer)
    }, [navigate, state])

    if (!state) return null

    return (
        <div className="max-w-md mx-auto py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ duration: 0.5 }}
                className="relative w-40 h-40 mb-10"
            >
                {/* Outer decorative ring */}
                <div className="absolute inset-0 rounded-full border border-slate-800/80 scale-[1.3]"></div>
                
                {/* Track circle */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-800 bg-[#0F1629]"></div>
                
                {/* Animated progress ring */}
                <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_20px_rgba(34,211,238,0.4)]"></div>
                
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-12 h-12 text-cyan-400" />
                </div>
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-3">Processing Payment...</h2>
            
            <div className="bg-[#121A2F]/60 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 flex flex-col gap-3 w-full max-w-sm mb-10 shadow-xl">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Method</span>
                    <span className="text-white font-semibold">{state.method}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-medium">Amount</span>
                    <span className="text-white font-bold text-lg">₹{state.amount}</span>
                </div>
            </div>

            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-lg">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-wide">Secure Transaction</span>
                </div>
                <p className="text-slate-500 text-sm mt-3 animate-pulse">
                    Please do not refresh this page.
                </p>
            </div>
            
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes heartbeat {
                    0% { transform: scale(1); }
                    14% { transform: scale(1.1); }
                    28% { transform: scale(1); }
                    42% { transform: scale(1.1); }
                    70% { transform: scale(1); }
                }
            `}} />
        </div>
    )
}
