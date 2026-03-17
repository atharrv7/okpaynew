import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { Shield, ArrowRight } from "lucide-react"

export default function PinVerification() {
    const navigate = useNavigate()
    const location = useLocation()
    const state = location.state as { recipient?: string, amount?: string, method?: string, note?: string } | null
    const [pin, setPin] = useState("")
    const [error, setError] = useState("")

    if (!state) {
        navigate("/dashboard/send")
        return null
    }

    const handleVerify = () => {
        if (pin.length !== 4) {
            setError("Please enter a 4-digit PIN")
            return
        }
        
        // Simulating correct PIN logic for any 4 digits
        navigate("/dashboard/processing", { state })
    }

    return (
        <div className="max-w-md mx-auto py-12 animate-in fade-in duration-500">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121A2F]/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[32px] shadow-2xl text-center relative"
            >
                <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">PIN Verification</h2>
                <p className="text-slate-400 text-sm mb-8">Enter your 4-digit OKPAY security PIN to authorize this payment.</p>

                {error && (
                    <div className="mb-4 text-rose-400 text-sm">{error}</div>
                )}

                <div className="relative flex justify-center gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`w-12 h-14 rounded-xl border flex items-center justify-center text-2xl font-bold ${
                            pin.length >= i ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400" : "bg-[#0B0F19] border-slate-700/50 text-slate-500"
                        }`}>
                            {pin.length >= i ? "•" : ""}
                        </div>
                    ))}
                    
                    {/* Hidden input to capture keyboard */}
                    <input 
                        type="password"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                        autoFocus
                    />
                </div>

                <div className="bg-[#0B0F19] rounded-2xl p-4 mb-8 text-left border border-slate-700/50">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-sm">Paying</span>
                        <span className="font-semibold text-white truncate max-w-[150px]">{state.recipient}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Amount</span>
                        <span className="font-bold text-cyan-400">₹{state.amount}</span>
                    </div>
                </div>

                <button 
                    onClick={handleVerify}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#020817] rounded-xl font-bold transition-all"
                >
                    Verify & Proceed <ArrowRight className="w-4 h-4" />
                </button>
            </motion.div>
        </div>
    )
}
