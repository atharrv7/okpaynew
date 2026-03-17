// Remove unused useState import
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { Landmark, CheckCircle, ShieldAlert } from "lucide-react"

export default function BankConfirmation() {
    const navigate = useNavigate()
    const location = useLocation()
    const state = location.state as { recipient?: string, amount?: string, method?: string, note?: string, bank?: string } | null
    
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

    const handleConfirm = () => {
        // Navigating to OTP automatically carrying forward the state
        navigate("/dashboard/otp", { state })
    }

    return (
        <div className="max-w-md mx-auto py-12 animate-in fade-in duration-500">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden"
            >
                {/* Simulated Bank Header with distinct style differing from main app */}
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Landmark className="w-6 h-6 text-slate-700" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">{displayBank}</h2>
                </div>

                <div className="bg-blue-50/50 rounded-2xl p-6 mb-8 border border-blue-100 text-center">
                    <div className="mb-2 text-sm font-semibold text-slate-500 uppercase tracking-widest">You are paying</div>
                    <div className="text-2xl font-bold text-slate-800 mb-6 truncate">{state.recipient}</div>
                    
                    <div className="mb-2 text-sm font-semibold text-slate-500 uppercase tracking-widest">Amount</div>
                    <div className="text-4xl font-black tracking-tighter text-blue-600">₹{state.amount}</div>
                </div>

                <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 mb-8">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 font-medium">
                        Ensure you are transferring funds to a trusted recipient. Do not hit back or refresh.
                    </p>
                </div>

                <button 
                    onClick={handleConfirm}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                    Confirm Payment <CheckCircle className="w-5 h-5" />
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
