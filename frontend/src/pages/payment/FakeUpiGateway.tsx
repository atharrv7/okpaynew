import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ShieldCheck, Fingerprint, Lock, IndianRupee } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

export default function FakeUpiGateway() {
    const location = useLocation()
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [upi, setUpi] = useState(location.state?.recipient || "")
    const [amount, setAmount] = useState(location.state?.amount || "")
    const [pin, setPin] = useState("")
    const [receiver, setReceiver] = useState("")
    const [error, setError] = useState("")

    const logos = [
        { name: "Google Pay", content: <span className="font-bold flex items-center text-[15px]"><span className="text-[#4285F4]">G</span><span className="text-slate-200 ml-0.5 font-medium">Pay</span></span> },
        { name: "PhonePe", content: <span className="font-bold text-white text-[15px] tracking-tight">Phone<span className="text-[#5f259f]">Pe</span></span> },
        { name: "Paytm", content: <span className="font-bold text-[15px] tracking-tight"><span className="text-[#00bAF2]">Pay</span><span className="text-white">tm</span></span> }
    ]

    const verify = () => {
        const upiPattern = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/
        
        if (!upiPattern.test(upi)) {
            setError("Invalid UPI ID. Format: name@bank")
            return
        }
        
        if (Number(amount) <= 0) {
            setError("Enter a valid amount")
            return
        }

        setError("")
        const namePart = upi.split('@')[0]
        setReceiver(namePart.charAt(0).toUpperCase() + namePart.slice(1))
        setStep(2)
    }

    const sendMoney = () => {
        if (pin.length < 4) {
            setError("Invalid PIN. Enter at least 4 digits.")
            return
        }

        setError("")
        setStep(3)

        setTimeout(() => {
            const newTxnId = "UPI" + Math.floor(Math.random() * 1000000000000)
            
            const txns = JSON.parse(localStorage.getItem('okpay_transactions') || '[]')
            txns.unshift({
                id: newTxnId,
                date: new Date().toISOString(),
                amount: Number(amount),
                type: "send",
                method: "UPI Gateway",
                status: "success",
                recipient: receiver
            })
            localStorage.setItem('okpay_transactions', JSON.stringify(txns))

            navigate("/dashboard/success", {
                state: {
                    status: "success",
                    amount,
                    recipient: receiver,
                    method: "UPI Gateway",
                    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    txnId: newTxnId
                }
            })
        }, 2500)
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] py-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#121A2F]/90 backdrop-blur-xl border border-slate-700/50 rounded-[32px] overflow-hidden shadow-2xl relative"
            >
                {/* Header elements */}
                <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="p-6 md:p-8 space-y-8 relative z-10">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-3 bg-slate-800/80 rounded-2xl border border-slate-700/50 mb-2">
                            <ShieldCheck className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Standard UPI Gateway</h2>
                        
                        {/* Supported Apps Logos */}
                        <div className="flex items-center justify-center gap-4 mt-4">
                            {logos.map((logo, idx) => (
                                <div key={idx} className="bg-white/5 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center">
                                    {logo.content}
                                </div>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-center text-sm font-medium"
                            >
                                {error}
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-5"
                            >
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">UPI ID</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={upi}
                                            onChange={e => setUpi(e.target.value)}
                                            placeholder="example@upi"
                                            className="w-full pl-4 pr-10 py-4 bg-[#0B0F19] border border-slate-700/50 rounded-2xl text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <Fingerprint className="w-5 h-5 text-slate-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Amount</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <IndianRupee className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-11 pr-4 py-4 bg-[#0B0F19] border border-slate-700/50 rounded-2xl text-2xl font-bold text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={verify}
                                    className="w-full py-4 mt-4 bg-cyan-500 hover:bg-cyan-400 text-[#020817] font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                                >
                                    Verify & Continue
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6 text-center"
                            >
                                <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50 space-y-2">
                                    <p className="text-slate-400 text-sm">Transferring</p>
                                    <h3 className="text-3xl font-bold text-white flex justify-center items-center gap-1">
                                        <span className="text-cyan-400 text-xl leading-none">₹</span>{amount}
                                    </h3>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <span className="text-slate-300">to</span>
                                        <span className="font-bold text-white flex items-center gap-1">
                                            {receiver}
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{upi}</p>
                                </div>

                                <div className="space-y-2 text-left">
                                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Secure UPI PIN</label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            value={pin}
                                            onChange={e => setPin(e.target.value)}
                                            maxLength={6}
                                            placeholder="••••••"
                                            className="w-full text-center tracking-[0.5em] pl-4 pr-10 py-4 bg-[#0B0F19] border border-slate-700/50 rounded-2xl text-2xl font-bold text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                            autoFocus
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-slate-500" />
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={sendMoney}
                                    className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-[#020817] font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                                >
                                    Securely Pay
                                </button>
                                
                                <button 
                                    onClick={() => setStep(1)}
                                    className="w-full py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 flex flex-col items-center justify-center space-y-6"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-slate-700 rounded-full"></div>
                                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShieldCheck className="w-8 h-8 text-cyan-400" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-white">Security Check</h3>
                                    <p className="text-slate-400 text-sm">Connecting with your bank...</p>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
