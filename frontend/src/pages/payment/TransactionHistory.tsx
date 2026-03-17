import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowDownLeft, ArrowUpRight, Search, Filter, Smartphone, CreditCard, Landmark, Wallet, CheckCircle2, XCircle, ChevronRight, X, Download } from "lucide-react"

type Transaction = {
    id: string
    date: string
    amount: number
    type: "send" | "receive"
    method: "upi" | "card" | "netbanking" | "wallet"
    status: "success" | "failed" | "pending"
    recipient: string
    description?: string
}

const getStoredTxns = (): Transaction[] => {
    const raw = localStorage.getItem('okpay_transactions')
    if (raw) {
        return JSON.parse(raw);
    }
    return [
        { id: "TXN98237489", date: "2026-03-15T14:30:00", amount: 1500, type: "send", method: "upi", status: "success", recipient: "Amazon Order" },
        { id: "TXN12837492", date: "2026-03-14T09:15:00", amount: 5000, type: "send", method: "card", status: "success", recipient: "Electricity Bill" },
        { id: "TXN56291038", date: "2026-03-12T18:45:00", amount: 200, type: "receive", method: "wallet", status: "success", recipient: "Cashback" },
        { id: "TXN48201934", date: "2026-03-10T11:20:00", amount: 8500, type: "send", method: "netbanking", status: "failed", recipient: "Flight Tickets", description: "Bank server timeout" },
        { id: "TXN93847561", date: "2026-03-08T16:10:00", amount: 350, type: "send", method: "upi", status: "success", recipient: "Starbucks" },
        { id: "TXN29384756", date: "2026-03-05T08:30:00", amount: 12000, type: "receive", method: "upi", status: "success", recipient: "Salary Advance" },
    ]
}

export default function TransactionHistory() {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterMethod, setFilterMethod] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null)
    const [transactions] = useState<Transaction[]>(getStoredTxns())

    const filteredTransactions = transactions.filter((txn) => {
        const matchesSearch = txn.recipient.toLowerCase().includes(searchTerm.toLowerCase()) || txn.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesMethod = filterMethod === "all" || txn.method === filterMethod
        const matchesStatus = filterStatus === "all" || txn.status === filterStatus
        return matchesSearch && matchesMethod && matchesStatus
    })

    const getMethodIcon = (method: string) => {
        switch (method) {
            case "upi": return <Smartphone className="w-4 h-4" />
            case "card": return <CreditCard className="w-4 h-4" />
            case "netbanking": return <Landmark className="w-4 h-4" />
            case "wallet": return <Wallet className="w-4 h-4" />
            default: return <Smartphone className="w-4 h-4" />
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Transaction History</h1>
                    <p className="text-slate-400 text-sm">View and manage your recent payments</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 border border-slate-800/80 bg-slate-900/50">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by name or Txn ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-500 text-slate-200"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <select
                            value={filterMethod}
                            onChange={(e) => setFilterMethod(e.target.value)}
                            className="bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-8 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 appearance-none text-slate-200"
                        >
                            <option value="all">All Methods</option>
                            <option value="upi">UPI</option>
                            <option value="card">Cards</option>
                            <option value="netbanking">Net Banking</option>
                            <option value="wallet">Wallet</option>
                        </select>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 text-slate-200"
                    >
                        <option value="all">All Status</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Transaction List */}
            <div className="glass-card rounded-2xl border border-slate-800/80 bg-slate-900/50 overflow-hidden text-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-800/30">
                            <th className="px-6 py-4 font-medium">Transaction</th>
                            <th className="px-6 py-4 font-medium hidden md:table-cell">Date & Time</th>
                            <th className="px-6 py-4 font-medium">Amount</th>
                            <th className="px-6 py-4 font-medium hidden sm:table-cell">Status</th>
                            <th className="px-6 py-4 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((txn, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={txn.id}
                                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                                    onClick={() => setSelectedTxn(txn)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'send' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-green-500/10 text-green-400'}`}>
                                                {txn.type === 'send' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{txn.recipient}</p>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                                    {getMethodIcon(txn.method)}
                                                    <span className="capitalize">{txn.method}</span> • {txn.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-400">
                                        {new Date(txn.date).toLocaleDateString()} <br />
                                        <span className="text-xs">{new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        <span className={txn.type === 'receive' ? 'text-green-400' : 'text-slate-200'}>
                                            {txn.type === 'receive' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        {txn.status === "success" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Success</span>}
                                        {txn.status === "failed" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3.5 h-3.5" /> Failed</span>}
                                        {txn.status === "pending" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Pending</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors inline-block" />
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    No transactions found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Transaction Details Modal */}
            <AnimatePresence>
                {selectedTxn && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTxn(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[#0F1629] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
                            <button onClick={() => setSelectedTxn(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            
                            <div className="text-center mb-8 mt-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedTxn.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                                    {selectedTxn.status === "success" ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">₹{selectedTxn.amount.toLocaleString()}</h3>
                                <p className="text-slate-400">{selectedTxn.status === "success" ? "Payment Successful" : "Payment Failed"}</p>
                            </div>

                            <div className="space-y-4 text-sm bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
                                <div className="flex justify-between py-2 border-b border-slate-700/50">
                                    <span className="text-slate-400">{selectedTxn.type === 'send' ? 'To' : 'From'}</span>
                                    <span className="font-semibold text-white">{selectedTxn.recipient}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-700/50">
                                    <span className="text-slate-400">Date & Time</span>
                                    <span className="font-medium text-white">{new Date(selectedTxn.date).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-700/50">
                                    <span className="text-slate-400">Payment Method</span>
                                    <span className="font-medium text-white capitalize">{selectedTxn.method}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-400">Transaction ID</span>
                                    <span className="font-mono text-cyan-400">{selectedTxn.id}</span>
                                </div>
                                {selectedTxn.description && (
                                    <div className="flex justify-between py-2 pt-4 border-t border-slate-700/50 text-red-400">
                                        <span className="text-slate-400">Error Info</span>
                                        <span className="font-medium">{selectedTxn.description}</span>
                                    </div>
                                )}
                            </div>

                            <button className="w-full mt-6 py-4 bg-cyan-500 hover:bg-cyan-400 text-[#020817] rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                <Download className="w-5 h-5" /> Download Receipt
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
