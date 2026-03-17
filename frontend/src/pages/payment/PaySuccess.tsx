import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import { Check, XCircle } from "lucide-react"

export default function PaySuccess() {
    const location = useLocation()
    const state = location.state as {
        status?: "success" | "failed"
        amount?: string
        receiver?: string
        transactionId?: string
    } || {
        status: "success",
        amount: "0",
        receiver: "Unknown",
        transactionId: ""
    }

    const isSuccess = state.status === "success"

    return (
        <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#121A2F]/80 backdrop-blur-xl rounded-[32px] border border-slate-700/50 overflow-hidden shadow-2xl max-w-md w-full"
            >
                {/* Status Header */}
                <div className={`pt-12 pb-8 px-6 text-center relative overflow-hidden ${
                    isSuccess ? "bg-emerald-500/10" : "bg-rose-500/10"
                }`}>
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 
                        ${isSuccess ? 'text-emerald-500' : 'text-rose-500'}`} 
                    />
                    
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl z-10 relative
                        ${isSuccess 
                            ? "bg-emerald-500 shadow-emerald-500/30" 
                            : "bg-rose-500 shadow-rose-500/30"
                        }`}
                    >
                        {isSuccess ? (
                            <Check className="w-10 h-10 text-white" strokeWidth={3} />
                        ) : (
                            <XCircle className="w-10 h-10 text-white" strokeWidth={3} />
                        )}
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                        {isSuccess ? "Payment Successful!" : "Payment Failed"}
                    </h2>
                    <p className={`font-medium ${isSuccess ? "text-emerald-400" : "text-rose-400"}`}>
                        {isSuccess ? "Your payment has been processed securely" : "Something went wrong with the payment"}
                    </p>
                </div>

                {/* Details */}
                <div className="p-8">
                    <div className="space-y-4 text-sm font-medium">
                        {state.transactionId && (
                            <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                                <span className="text-slate-400 uppercase tracking-wider text-xs">Transaction ID</span>
                                <span className="font-mono text-cyan-400 text-xs">{state.transactionId}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                            <span className="text-slate-400 uppercase tracking-wider text-xs">Paid To</span>
                            <span className="text-white font-medium">{state.receiver}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                            <span className="text-slate-400 uppercase tracking-wider text-xs">Amount</span>
                            <span className="font-bold text-2xl text-white">₹{state.amount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 uppercase tracking-wider text-xs">Method</span>
                            <span className="text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">Razorpay</span>
                        </div>
                    </div>

                    <div className="mt-10">
                        <a 
                            href="/"
                            className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl font-bold transition-all"
                        >
                            Go to OKPAY
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
