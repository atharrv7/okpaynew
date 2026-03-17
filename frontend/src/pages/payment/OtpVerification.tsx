import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import { FileKey, ArrowRight } from "lucide-react"

export default function OtpVerification() {
    const navigate = useNavigate()
    const location = useLocation()
    const state = location.state as { recipient?: string, amount?: string, method?: string, note?: string, cardNumber?: string, cardHolder?: string, bank?: string } | null
    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")

    if (!state) {
        navigate("/dashboard/send")
        return null
    }

    const maskedCard = state.cardNumber ? `•••• •••• •••• ${state.cardNumber.slice(-4)}` : "•••• 1234"

    const handleVerify = () => {
        if (otp.length !== 6) {
            setError("Please enter a 6-digit OTP")
            return
        }
        
        // Simulating correct OTP logic
        navigate("/dashboard/pin", { state })
    }

    return (
        <div className="max-w-md mx-auto py-12 animate-in fade-in duration-500">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121A2F]/80 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[32px] shadow-2xl text-center relative"
            >
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileKey className="w-8 h-8 text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">OTP Verification</h2>
                <p className="text-slate-400 text-sm mb-6">Enter the 6-digit OTP sent to your registered mobile number.</p>

                <div className="bg-[#0B0F19] rounded-2xl p-4 mb-8 text-left border border-slate-700/50 space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                        <span className="text-slate-400 text-sm">Amount</span>
                        <span className="font-bold text-cyan-400">₹{state.amount}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                        <span className="text-slate-400 text-sm">Paying</span>
                        <span className="font-semibold text-white truncate max-w-[150px]">{state.recipient}</span>
                    </div>
                    {(state.method === "Debit Card" || state.method === "Credit Card") ? (
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">Card Number</span>
                            <span className="font-mono text-slate-200 text-sm">{maskedCard}</span>
                        </div>
                    ) : (state.method === "Net Banking" && state.bank) && (
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">Bank</span>
                            <span className="font-mono text-slate-200 text-sm uppercase">{state.bank}</span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-4 text-rose-400 text-sm">{error}</div>
                )}

                <div className="relative flex justify-center gap-3 mb-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={`w-10 h-12 md:w-12 md:h-14 rounded-xl border flex items-center justify-center text-xl md:text-2xl font-bold ${
                            otp.length >= i ? "bg-blue-500/10 border-blue-500/50 text-blue-400" : "bg-[#0B0F19] border-slate-700/50 text-slate-500"
                        }`}>
                            {otp[i - 1] || ""}
                        </div>
                    ))}
                    
                    {/* Hidden input to capture keyboard */}
                    <input 
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                        autoFocus
                    />
                </div>

                <div className="mb-6 text-sm text-slate-400">
                    Didn't receive code? <button className="text-blue-400 font-medium hover:text-blue-300">Resend OTP</button>
                </div>

                <button 
                    onClick={handleVerify}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#020817] rounded-xl font-bold transition-all"
                >
                    Verify OTP <ArrowRight className="w-4 h-4" />
                </button>
            </motion.div>
        </div>
    )
}
