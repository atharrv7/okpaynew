// import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowDownLeft, BarChart3, QrCode, Store } from "lucide-react"
import { Button } from "../../components/ui/Button"
// import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

export default function MerchantDashboard() {
    const { user } = useAuth()
    // const navigate = useNavigate()
    // const [showQr, setShowQr] = useState(false)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Store className="w-5 h-5 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Merchant Portal</span>
                    </div>
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-slate-400">Merchant ID: {user?.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Today's Sales</p>
                    <h3 className="text-3xl font-bold text-emerald-400">₹24,500</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 glass-card p-6 rounded-2xl relative overflow-hidden"
                >
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-400" /> Revenue Analytics
                    </h3>

                    {/* Fake Chart */}
                    <div className="h-64 flex items-end justify-between gap-2 px-4 pb-2 border-b border-slate-700">
                        {[40, 65, 30, 80, 50, 90, 75].map((h, i) => (
                            <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all relative group" style={{ height: `${h}%` }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    ₹{h * 100}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-slate-500">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </motion.div>

                {/* QR Code Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center"
                >
                    <div className="w-16 h-16 bg-white p-2 rounded-xl mb-4 shadow-lg shadow-white/10">
                        <QrCode className="w-full h-full text-black" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Accept Payments</h3>
                    <p className="text-slate-400 text-sm mb-6">Show this QR code to customers to accept UPI payments instantly.</p>

                    <Button className="w-full">
                        View Full QR
                    </Button>
                </motion.div>
            </div>

            {/* Recent Orders */}
            <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">Recent Orders</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center justify-between p-3 border-b border-slate-800 last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <ArrowDownLeft className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">Payment Received</p>
                                    <p className="text-xs text-slate-500">Order #ORD-{202400 + i}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-white">₹{500 * i}</p>
                                <p className="text-xs text-emerald-500">Success</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
