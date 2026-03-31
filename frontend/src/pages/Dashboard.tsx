import { motion, AnimatePresence } from "framer-motion"
import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard, ShieldCheck, Clock, History, Bell, Plus, X, Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

import { useState, useEffect } from "react"

const getStoredTxns = () => {
    const raw = localStorage.getItem('okpay_transactions')
    if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.slice(0, 5).map((t: { id: string; date: string; amount: number; method: string; status: string; type: string }) => ({
           id: t.id,
           date: new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
           amount: `₹${t.amount}`,
           method: t.method === 'upi' ? 'UPI' : t.method === 'card' ? 'Card' : t.method === 'netbanking' ? 'Net Banking' : 'Wallet',
           status: t.status === 'success' ? 'Success' : 'Failed',
           type: t.type === 'send' ? 'debit' : 'credit'
        }));
    }
    return [
        { id: "TXN12345", date: "16 Mar", amount: "₹500", method: "UPI", status: "Success", type: "debit" },
        { id: "TXN12344", date: "15 Mar", amount: "₹300", method: "Card", status: "Failed", type: "debit" },
        { id: "TXN12343", date: "14 Mar", amount: "₹1,200", method: "Net Banking", status: "Success", type: "credit" },
        { id: "TXN12342", date: "12 Mar", amount: "₹450", method: "UPI", status: "Success", type: "debit" },
        { id: "TXN12341", date: "10 Mar", amount: "₹2,500", method: "Wallet", status: "Success", type: "credit" },
    ]
}

export default function Dashboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [balance, setBalance] = useState(() => Number(localStorage.getItem('okpay_wallet_balance') || 12540).toLocaleString())
    const [recentTransactions] = useState<{ id: string, date: string, amount: string, method: string, status: string, type: string }[]>(() => getStoredTxns())
    const [showNotifications, setShowNotifications] = useState(false)
    const [showAddMoney, setShowAddMoney] = useState(false)
    const [addAmount, setAddAmount] = useState("")
    const [showBalance, setShowBalance] = useState(false)
    const [showPinModal, setShowPinModal] = useState(false)
    const [pin, setPin] = useState("")

    const handleAddMoney = () => {
        if (!addAmount || Number(addAmount) <= 0) return
        
        const currentBalance = Number(localStorage.getItem('okpay_wallet_balance') || 12540)
        const newBalance = currentBalance + Number(addAmount)
        localStorage.setItem('okpay_wallet_balance', String(newBalance))
        setBalance(newBalance.toLocaleString())
        
        setShowAddMoney(false)
        setAddAmount("")
    }

    // Removed direct state calls from useEffect during mount
    useEffect(() => {
        // Future sync or subscriptions if needed
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Welcome back, {user?.name?.split(' ')[0] || "User"} <span className="text-2xl animate-waving-hand">👋</span>
                    </h1>
                    <p className="text-slate-400 mt-1">Your payments are secure and ready.</p>
                </div>
                <div className="flex items-center gap-3 relative z-30">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-700/50 relative"
                    >
                        <Bell className="w-4 h-4" />
                        <span className="text-sm font-medium">Notifications</span>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 ml-1 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute top-12 right-0 w-80 bg-[#121A2F]/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-4 text-left"
                            >
                                <h3 className="text-white font-bold mb-3 border-b border-slate-700/50 pb-2">Notifications</h3>
                                <div className="space-y-3">
                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-200">You received <span className="text-emerald-400">₹500</span> from Rahul</p>
                                            <span className="text-xs text-slate-500">2 mins ago</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                                            <ArrowUpRight className="w-4 h-4 text-rose-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-200">Sent <span className="text-rose-400">₹300</span> to Amazon Order</p>
                                            <span className="text-xs text-slate-500">1 hour ago</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <ShieldCheck className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-200">New login from iPhone 14 detected</p>
                                            <span className="text-xs text-slate-500">5 hours ago</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Wallet Balance Card - Glassmorphism */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 backdrop-blur-xl border border-slate-700/50 p-8 md:p-10 shadow-2xl"
            >
                {/* Background Details */}
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-cyan-500/10 rotate-12 blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[80%] bg-blue-500/10 blur-[80px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start md:items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Wallet className="w-5 h-5" />
                            <span className="font-medium text-sm tracking-wide uppercase">Wallet Balance</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-5xl md:text-6xl font-bold text-white tracking-tight flex items-center gap-1">
                                <span className="text-cyan-400">₹</span>
                                {showBalance ? balance : "••••••"}
                            </div>
                            <button
                                onClick={() => showBalance ? setShowBalance(false) : setShowPinModal(true)}
                                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                                {showBalance ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 w-full md:w-auto">
                        <div className="flex flex-col gap-1.5">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">KYC Status</span>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                <span className="text-white font-medium">Verified</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Last Transaction</span>
                            <div className="flex items-center gap-2">
                                <ArrowUpRight className="w-5 h-5 text-rose-400" />
                                <span className="text-white font-medium">₹500 sent</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1 border-t md:border-t-0 border-slate-700/50 pt-4 md:pt-0">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Trans</span>
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-blue-400" />
                                <span className="text-white font-medium">142</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => setShowAddMoney(true)}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-[#020817] transition-all group shrink-0"
                >
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-bold tracking-wide">Add Money</span>
                </motion.button>

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => navigate('/dashboard/send')}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#121A2F]/80 backdrop-blur-sm border border-slate-800 hover:border-slate-600 hover:bg-slate-800/80 transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-white tracking-wide">Send Money</span>
                </motion.button>

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => navigate('/dashboard/receive')}
                    className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#121A2F]/80 backdrop-blur-sm border border-slate-800 hover:border-slate-600 hover:bg-slate-800/80 transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowDownRight className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-white tracking-wide">Receive Money</span>
                </motion.button>
            </div>

            {/* Recent Transactions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#121A2F]/60 backdrop-blur-md border border-slate-800/50 rounded-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                            <p className="text-sm text-slate-400">Your last 5 transactions</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/transactions')}
                        className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors px-4 py-2 rounded-xl hover:bg-cyan-500/10"
                    >
                        View All
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800/30 text-xs uppercase tracking-widest text-slate-400 font-semibold">
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Method</th>
                                <th className="px-6 py-4 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {recentTransactions.map((txn, i) => (
                                <tr key={i} className="hover:bg-slate-800/20 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-200">{txn.date}</div>
                                        <div className="text-xs text-slate-500">{txn.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm font-bold flex items-center gap-1 ${txn.type === 'debit' ? 'text-white' : 'text-emerald-400'}`}>
                                            {txn.type === 'debit' ? '-' : '+'}
                                            {txn.amount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-[#0B0F19] border border-slate-800 flex items-center justify-center">
                                                {txn.method === 'UPI' ? (
                                                    <span className="text-[10px] font-bold text-slate-300">UPI</span>
                                                ) : txn.method === 'Card' ? (
                                                    <CreditCard className="w-4 h-4 text-slate-400" />
                                                ) : (
                                                    <Wallet className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                            <span className="text-sm text-slate-300">{txn.method}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${txn.status === 'Success'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : txn.status === 'Failed'
                                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${txn.status === 'Success' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                            {txn.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes wave {
                    0% { transform: rotate(0deg); }
                    10% { transform: rotate(14deg); }
                    20% { transform: rotate(-8deg); }
                    30% { transform: rotate(14deg); }
                    40% { transform: rotate(-4deg); }
                    50% { transform: rotate(10deg); }
                    60% { transform: rotate(0deg); }
                    100% { transform: rotate(0deg); }
                }
                .animate-waving-hand {
                    animation: wave 2.5s infinite;
                    transform-origin: 70% 70%;
                    display: inline-block;
                }
            `}} />

            {/* Add Money Modal */}
            <AnimatePresence>
                {showAddMoney && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddMoney(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm bg-[#0F1629] border border-slate-700 rounded-[32px] shadow-2xl p-6 md:p-8 text-center text-white">
                            <button onClick={() => setShowAddMoney(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Add Money</h2>
                            <p className="text-slate-400 text-sm mb-6">Instantly top up your OKPAY wallet.</p>
                            
                            <div className="relative mb-6">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-xl font-bold text-slate-400">₹</div>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={addAmount}
                                    onChange={e => setAddAmount(e.target.value)}
                                    className="w-full pl-10 pr-4 py-4 bg-[#121A2F] border border-slate-700/50 rounded-2xl text-2xl font-bold text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
                                    autoFocus
                                />
                            </div>

                            <button onClick={handleAddMoney} disabled={!addAmount} className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-[#020817] font-bold rounded-2xl transition-all">
                                Confirm & Add
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PIN Verification Modal */}
            <AnimatePresence>
                {showPinModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPinModal(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-sm bg-[#0F1629] border border-slate-700 rounded-[32px] shadow-2xl p-6 md:p-8 text-center text-white">
                            <button onClick={() => { setShowPinModal(false); setPin(""); }} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Enter PIN</h2>
                            <p className="text-slate-400 text-sm mb-6">Enter your security PIN to view balance.</p>
                            
                            <div className="relative mb-6 flex justify-center">
                                <input
                                    type="password"
                                    placeholder="••••"
                                    value={pin}
                                    maxLength={6}
                                    onChange={e => setPin(e.target.value.replace(/\\D/g, ''))}
                                    className="w-3/4 px-4 py-4 bg-[#121A2F] border border-slate-700/50 rounded-2xl text-2xl font-bold text-center tracking-widest text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
                                    autoFocus
                                />
                            </div>

                            <button
                                onClick={() => {
                                    if (pin.length >= 4) {
                                        setShowBalance(true);
                                        setShowPinModal(false);
                                        setPin("");
                                    }
                                }}
                                disabled={pin.length < 4}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all"
                            >
                                Verify PIN
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
