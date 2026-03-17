import { ShieldAlert, Activity, CheckCircle2, XCircle, Smartphone, CreditCard, Landmark, Wallet } from "lucide-react"

export default function AdminDashboard() {
    // Mock Statistics
    const stats = {
        totalTxns: 12489,
        successTxns: 11840,
        failedTxns: 649,
        totalVolume: "₹4.2 Cr",
        methodStats: {
            upi: 65,
            card: 20,
            netbanking: 10,
            wallet: 5
        }
    }

    const successRate = ((stats.successTxns / stats.totalTxns) * 100).toFixed(1)
    const failedRate = ((stats.failedTxns / stats.totalTxns) * 100).toFixed(1)

    return (
        <div className="space-y-8 animate-fade-in content-smooth">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Admin Console</h1>
                    <p className="text-slate-400 text-sm">Real-time Transaction Monitoring & Analytics</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border-l-4 border-cyan-500 relative overflow-hidden bg-slate-900/40">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-slate-400 font-medium mb-1 text-sm uppercase tracking-wider">Total Transactions</p>
                            <h3 className="text-4xl font-black text-white">{stats.totalTxns.toLocaleString()}</h3>
                        </div>
                        <Activity className="w-8 h-8 text-cyan-500 opacity-60" />
                    </div>
                </div>
                
                <div className="glass-card p-6 rounded-2xl border-l-4 border-emerald-500 relative overflow-hidden bg-slate-900/40">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-slate-400 font-medium mb-1 text-sm uppercase tracking-wider">Success Volume</p>
                            <h3 className="text-4xl font-black text-white">{stats.totalVolume}</h3>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-60" />
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border-l-4 border-red-500 relative overflow-hidden bg-slate-900/40">
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-slate-400 font-medium mb-1 text-sm uppercase tracking-wider">Failed Transactions</p>
                            <h3 className="text-4xl font-black text-white">{stats.failedTxns.toLocaleString()}</h3>
                        </div>
                        <XCircle className="w-8 h-8 text-red-500 opacity-60" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Success vs Failed Chart */}
                <div className="glass-card p-6 rounded-2xl bg-slate-900/40">
                    <h3 className="text-lg font-bold text-white mb-6">Success vs Failed Rate</h3>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Success ({successRate}%)</span>
                                <span className="text-slate-300 font-mono">{stats.successTxns.toLocaleString()} txns</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden shadow-inner">
                                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-4 rounded-full" style={{ width: `${successRate}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-red-400 flex items-center gap-2"><XCircle className="w-4 h-4"/> Failed ({failedRate}%)</span>
                                <span className="text-slate-300 font-mono">{stats.failedTxns.toLocaleString()} txns</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden shadow-inner">
                                <div className="bg-gradient-to-r from-red-600 to-red-400 h-4 rounded-full" style={{ width: `${failedRate}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method Statistics */}
                <div className="glass-card p-6 rounded-2xl bg-slate-900/40">
                    <h3 className="text-lg font-bold text-white mb-6">Payment Method Statistics</h3>
                    
                    <div className="space-y-4">
                        {[
                            { label: "UPI", value: stats.methodStats.upi, icon: <Smartphone className="w-5 h-5 text-cyan-400" /> },
                            { label: "Debit/Credit Cards", value: stats.methodStats.card, icon: <CreditCard className="w-5 h-5 text-purple-400" /> },
                            { label: "Net Banking", value: stats.methodStats.netbanking, icon: <Landmark className="w-5 h-5 text-blue-400" /> },
                            { label: "Wallet", value: stats.methodStats.wallet, icon: <Wallet className="w-5 h-5 text-emerald-400" /> },
                        ].map((method) => (
                            <div key={method.label} className="flex items-center gap-4">
                                <div className="p-2 bg-slate-800 rounded-lg shrink-0">
                                    {method.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-200">{method.label}</span>
                                        <span className="text-slate-400">{method.value}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800/80 rounded-full h-2">
                                        <div className="bg-slate-600 h-2 rounded-full transition-all" style={{ width: `${method.value}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transaction Logs */}
            <div className="glass-card p-6 rounded-2xl bg-slate-900/40">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Live Transaction Logs</h3>
                    <span className="flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Listening
                    </span>
                </div>

                <div className="space-y-2 font-mono text-sm max-h-72 overflow-y-auto custom-scrollbar pr-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 hover:bg-slate-800/50 rounded-lg border border-transparent hover:border-slate-700/50 transition-colors">
                            <span className="text-slate-500 shrink-0">16:{42 - i}:{10 + i * 5}</span>
                            <span className={i === 2 ? "text-red-400 font-semibold" : "text-emerald-400 font-semibold shrink-0"}>
                                {i === 2 ? "[FAILED]" : "[SUCCESS]"}
                            </span>
                            <span className="text-slate-300 break-all">
                                {i === 2 
                                    ? "Txn TXN9842... failed: Bank server timeout (Method: Credit Card)"
                                    : `Txn TXN${1000 + (i * 927) % 8999}... processed ₹${(100 + (i * 456) % 4900).toFixed(2)} via ${['UPI', 'Netbanking', 'Wallet'][i%3]}`
                                }
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
