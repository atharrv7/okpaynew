import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { Check, XCircle, Download, FileText, ArrowLeft, RefreshCcw } from "lucide-react"

export default function Success() {
    const location = useLocation()
    const navigate = useNavigate()
    
    // Fallback if accessed directly
    const state = location.state as { 
        status?: "success" | "failed", 
        amount?: string, 
        method?: string, 
        txnId?: string,
        date?: string,
        time?: string,
        recipient?: string
    } || { 
        status: "success", 
        amount: "500", 
        method: "UPI", 
        txnId: "TXNTEST123",
        date: "16 March 2026",
        time: "11:45 PM"
    }

    const { status, amount, method, txnId, date, time } = state

    return (
        <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in duration-500">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-[#121A2F]/80 backdrop-blur-xl rounded-[32px] border border-slate-700/50 overflow-hidden shadow-2xl relative"
            >
                {/* Status Header */}
                <div className={`pt-12 pb-8 px-6 text-center relative overflow-hidden ${
                    status === "success" ? "bg-emerald-500/10" : "bg-rose-500/10"
                }`}>
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 
                        ${status === 'success' ? 'text-emerald-500' : 'text-rose-500'}`} 
                    />
                    
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl z-10 relative
                        ${status === "success" 
                            ? "bg-emerald-500 shadow-emerald-500/30" 
                            : "bg-rose-500 shadow-rose-500/30"
                        }`}
                    >
                        {status === "success" ? (
                            <Check className="w-10 h-10 text-white" strokeWidth={3} />
                        ) : (
                            <XCircle className="w-10 h-10 text-white" strokeWidth={3} />
                        )}
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                        {status === "success" ? "Payment Successful" : "Payment Failed"}
                    </h2>
                    <p className={`font-medium ${status === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                        {status === "success" ? "Your transaction has been securely processed" : "Reason: Insufficient balance or bank error"}
                    </p>
                </div>

                {/* Details Card */}
                <div className="p-8">
                    <div className="space-y-4 text-sm font-medium">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                            <span className="text-slate-400 uppercase tracking-wider text-xs">Transaction ID</span>
                            <span className="font-mono text-cyan-400">{txnId}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                            <span className="text-slate-400 uppercase tracking-wider text-xs">Paid To</span>
                            <span className="text-white font-medium">{state.recipient || "User"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                            <span className="text-slate-400 uppercase tracking-wider text-xs">Amount Paid</span>
                            <span className="font-bold text-2xl text-white">₹{amount}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                            <span className="text-slate-400 uppercase tracking-wider text-xs">Date</span>
                            <span className="text-white">{date}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                            <span className="text-slate-400 uppercase tracking-wider text-xs">Time</span>
                            <span className="text-white">{time}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 uppercase tracking-wider text-xs">Payment Method</span>
                            <span className="text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">{method}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-10 grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors border border-slate-700 hover:border-slate-500">
                            <Download className="w-4 h-4" /> Receipt
                        </button>
                        <button onClick={() => navigate('/dashboard/transactions')} className="flex items-center justify-center gap-2 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors border border-slate-700 hover:border-slate-500">
                            <FileText className="w-4 h-4" /> View TXN
                        </button>
                        
                        {status === "success" ? (
                            <button onClick={() => navigate('/dashboard/send')} className="col-span-2 flex items-center justify-center gap-2 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl font-bold transition-all mt-2">
                                <ArrowLeft className="w-4 h-4" /> Make Another Payment
                            </button>
                        ) : (
                            <button onClick={() => navigate('/dashboard/send')} className="col-span-2 flex items-center justify-center gap-2 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all mt-2">
                                <RefreshCcw className="w-4 h-4" /> Retry Payment
                            </button>
                        )}
                        
                        <button onClick={() => navigate('/dashboard')} className="col-span-2 mt-2 text-slate-500 hover:text-white font-medium text-sm transition-colors mx-auto p-2">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
