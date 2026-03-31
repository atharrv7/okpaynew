import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Wallet, ArrowRight, User, ShieldCheck, Smartphone, Lock, X } from "lucide-react"
import { apiUrl } from "../../lib/api"

export default function SendMoney() {
    const navigate = useNavigate()

    const [recipient, setRecipient] = useState("")
    const [amount, setAmount] = useState("")
    const [note, setNote] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("")
    const [error, setError] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [showPinModal, setShowPinModal] = useState(false)
    const [pin, setPin] = useState("")

    const methods = [
        { id: "OkPay", name: "OKPAY Gateway", desc: "Advanced payment options", icon: <ShieldCheck className="w-5 h-5 text-cyan-400" /> },
        { id: "Razorpay", name: "Razorpay", desc: "UPI, Cards, NetBanking", icon: <ShieldCheck className="w-5 h-5 text-blue-400" /> },
        { id: "Wallet", name: "Wallet", desc: "Use OKPAY wallet balance", icon: <Wallet className="w-5 h-5 text-amber-400" /> },
        { id: "FakeUPI", name: "UPI Gateway (Demo)", desc: "Test UPI Flow", icon: <Smartphone className="w-5 h-5 text-emerald-400" /> },
    ]

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleProceed = async () => {
        if (!recipient) {
            setError("Recipient Username / Email is required")
            return
        }
        if (!amount || Number(amount) <= 0) {
            setError("Enter a valid amount")
            return
        }
        if (!paymentMethod) {
            setError("Select a payment method")
            return
        }

        if (paymentMethod === "Wallet") {
            const currentBalance = Number(localStorage.getItem('okpay_wallet_balance') || 12540)
            const sendAmount = Number(amount)
            if (sendAmount > currentBalance) {
                setError(`Insufficient wallet balance. You have ₹${currentBalance} available.`)
                return
            }
            setError("")
            navigate("/dashboard/pin", {
                state: {
                    recipient,
                    amount,
                    note,
                    method: paymentMethod
                }
            })
            return
        }

        if (paymentMethod === "FakeUPI") {
            setError("")
            navigate("/dashboard/fake-upi", {
                state: {
                    recipient,
                    amount,
                    note
                }
            })
            return
        }

        if (paymentMethod === "OkPay") {
            setError("")
            navigate("/dashboard/okpay-gateway", {
                state: {
                    recipient,
                    amount,
                    note
                }
            })
            return
        }

        if (paymentMethod === "Razorpay") {
            setError("")
            setShowPinModal(true)
            return
        }
    }

    const processRazorpay = async () => {
        if (pin.length < 4) {
            setError("Please enter a valid OKPAY PIN to proceed")
            return
        }
        setShowPinModal(false)
        setIsProcessing(true)

        const res = await loadRazorpayScript()
        if (!res) {
            setError("Failed to load Razorpay SDK. Please check your connection.")
            setIsProcessing(false)
            return
        }

        try {
            const orderResponse = await fetch(apiUrl("/api/payment/create-order"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: Number(amount) })
            })

            const orderData = await orderResponse.json()

            if (!orderResponse.ok || !orderData.success) {
                setError("Failed to create payment order")
                setIsProcessing(false)
                return
            }

            const options = {
                key: orderData.key_id || "rzp_test_SSLTRWNo4pUMGv",
                amount: orderData.order.amount, 
                currency: orderData.order.currency,
                name: "OKPAY",
                description: note || `Transfer to ${recipient}`,
                image: "https://cdn-icons-png.flaticon.com/512/6041/6041366.png",
                order_id: orderData.order.id,
                handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                    try {
                        const verifyResponse = await fetch(apiUrl("/api/payment/verify"), {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        })
                        
                        const verifyData = await verifyResponse.json()
                        if (verifyData.success) {
                            setIsProcessing(false)

                            const currentBalance = Number(localStorage.getItem('okpay_wallet_balance') || 12540)
                            const sendAmount = Number(amount)
                            const newBalance = currentBalance - sendAmount
                            localStorage.setItem('okpay_wallet_balance', String(newBalance))

                            const txnId = response.razorpay_payment_id || ("TXN" + Math.random().toString(36).slice(2, 9).toUpperCase())
                            const txns = JSON.parse(localStorage.getItem('okpay_transactions') || '[]')
                            txns.unshift({
                                id: txnId,
                                date: new Date().toISOString(),
                                amount: sendAmount,
                                type: "send",
                                method: "razorpay",
                                status: "success",
                                recipient: recipient || "Unknown"
                            })
                            localStorage.setItem('okpay_transactions', JSON.stringify(txns))

                            navigate("/dashboard/success", {
                                state: {
                                    status: "success",
                                    recipient,
                                    amount,
                                    note,
                                    method: "Razorpay",
                                    txnId: txnId,
                                    transactionId: response.razorpay_payment_id,
                                    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                }
                            })
                        } else {
                            setError("Payment signature verification failed.")
                            setIsProcessing(false)
                        }
                    } catch (err) {
                        console.error("Verification error", err)
                        setError("Payment verification failed processing")
                        setIsProcessing(false)
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: "9999999999"
                },
                hidden: {
                    contact: true
                },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "Pay via UPI",
                                instruments: [
                                    { method: "upi" }
                                ]
                            },
                            other: {
                                name: "Other Payment Modes",
                                instruments: [
                                    { method: "card" },
                                    { method: "netbanking" },
                                    { method: "wallet" }
                                ]
                            }
                        },
                        sequence: ["block.upi", "block.other"],
                        preferences: {
                            show_default_blocks: false
                        }
                    }
                },
                remember_customer: false,
                theme: {
                    color: "#06b6d4"
                },
                modal: {
                    ondismiss: function() {
                        setIsProcessing(false)
                    }
                }
            }

            const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay
            const paymentObject = new RazorpayConstructor(options)
            paymentObject.open()
        } catch (err) {
            console.error(err)
            setError("Something went wrong initializing payment.")
            setIsProcessing(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto py-8 animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Send Money</h1>
                <p className="text-slate-400">Transfer funds securely and instantly.</p>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121A2F]/80 backdrop-blur-xl border border-slate-700/50 p-6 md:p-8 rounded-[32px] shadow-2xl space-y-8 relative overflow-hidden"
            >
                {/* Background effects */}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Recipient</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="w-5 h-5 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Recipient Username or Email"
                                value={recipient}
                                onChange={e => setRecipient(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-[#0B0F19] border border-slate-700/50 rounded-2xl text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Amount</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-xl font-bold text-slate-400">₹</span>
                            </div>
                            <input
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-4 bg-[#0B0F19] border border-slate-700/50 rounded-2xl text-2xl font-bold text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Note (Optional)</label>
                        <input
                            type="text"
                            placeholder="What's this for?"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="w-full px-4 py-4 bg-[#0B0F19] border border-slate-700/50 rounded-2xl text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Select Payment Method</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {methods.map(method => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                                    paymentMethod === method.id
                                        ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                                        : "bg-[#0B0F19] border-slate-700/50 hover:border-slate-600"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    paymentMethod === method.id ? "bg-cyan-500/20" : "bg-slate-800"
                                }`}>
                                    {method.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`font-semibold ${paymentMethod === method.id ? "text-white" : "text-slate-200"}`}>
                                        {method.name}
                                    </span>
                                    <span className="text-xs text-slate-500 mt-0.5">{method.desc}</span>
                                </div>
                                {paymentMethod === method.id && (
                                    <div className="w-4 h-4 rounded-full bg-cyan-400 shrink-0 ml-auto mt-1 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleProceed}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#020817] rounded-2xl font-bold text-lg transition-all active:scale-[0.98] mt-6"
                >
                    {isProcessing ? "Processing..." : `Proceed to Pay ${amount ? `₹${amount}` : ""}`}
                    {!isProcessing && <ArrowRight className="w-5 h-5" />}
                </button>
            </motion.div>

            {/* PIN Verification Modal */}
            {showPinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#121A2F]/90 border border-slate-700/50 rounded-[32px] p-8 max-w-sm w-full relative shadow-2xl"
                    >
                        <button 
                            onClick={() => { setShowPinModal(false); setPin(""); }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center space-y-4 mb-8">
                            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                                <Lock className="w-8 h-8 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Enter OKPAY PIN</h3>
                                <p className="text-slate-400 text-sm">Authorizing ₹{amount} to {recipient}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="relative">
                                <input
                                    type="password"
                                    maxLength={4}
                                    value={pin}
                                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                    placeholder="••••"
                                    className="w-full text-center tracking-[1em] py-4 bg-[#0B0F19] border border-slate-700/50 rounded-2xl text-2xl font-bold text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
                                    autoFocus
                                />
                            </div>

                            <button 
                                onClick={processRazorpay}
                                disabled={pin.length < 4}
                                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#020817] font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                            >
                                Verify & Continue to Razorpay
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
