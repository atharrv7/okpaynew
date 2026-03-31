import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ShieldCheck, Loader2, AlertCircle, CheckCircle2, Clock, User } from "lucide-react"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

interface LinkData {
    linkId: string
    receiverName: string
    amount: number
    description: string
    status: string
    expiresAt: string | null
}

export default function PayLink() {
    const { linkId } = useParams()
    const navigate = useNavigate()

    const [linkData, setLinkData] = useState<LinkData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [alreadyPaid, setAlreadyPaid] = useState(false)
    const [payerAmount, setPayerAmount] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [payError, setPayError] = useState("")

    useEffect(() => {
        const fetchLinkDetails = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/payment/link/${linkId}`)
                const data = await res.json()

                if (data.success) {
                    setLinkData(data.link)
                    if (data.alreadyPaid) setAlreadyPaid(true)
                } else {
                    setError(data.message || "Payment link not found or expired")
                }
            } catch {
                setError("Could not connect to server.")
            } finally {
                setLoading(false)
            }
        }

        fetchLinkDetails()
    }, [linkId])

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if ((window as unknown as { Razorpay?: unknown }).Razorpay) return resolve(true)
            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handlePay = async () => {
        if (!linkData) return

        const finalAmount = linkData.amount > 0 ? linkData.amount : Number(payerAmount)
        if (!finalAmount || finalAmount <= 0) {
            setPayError("Please enter a valid amount")
            return
        }

        setPayError("")
        setIsProcessing(true)

        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
            setPayError("Failed to load payment gateway. Please try again.")
            setIsProcessing(false)
            return
        }

        try {
            // Create order via backend for this payment link
            const orderRes = await fetch(`${BACKEND_URL}/api/payment/link/${linkId}/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: finalAmount })
            })
            const orderData = await orderRes.json()

            if (!orderData.success) {
                setPayError(orderData.message || "Could not create order")
                setIsProcessing(false)
                return
            }

            const options = {
                key: orderData.key_id,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: "OKPAY",
                description: linkData.description || `Payment to ${linkData.receiverName}`,
                image: "https://cdn-icons-png.flaticon.com/512/6041/6041366.png",
                order_id: orderData.order.id,
                handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                    // Verify payment
                    try {
                        const verifyRes = await fetch(`${BACKEND_URL}/api/payment/verify`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                linkId: linkId
                            })
                        })
                        const verifyData = await verifyRes.json()
                        if (verifyData.success) {
                            setIsProcessing(false)
                            // Navigate to a simple success view
                            navigate("/pay/success", {
                                state: {
                                    status: "success",
                                    amount: String(finalAmount),
                                    receiver: linkData.receiverName,
                                    transactionId: response.razorpay_payment_id
                                }
                            })
                        } else {
                            setPayError("Payment verification failed")
                            setIsProcessing(false)
                        }
                    } catch {
                        setPayError("Verification error. Contact support.")
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
                    ondismiss: function () {
                        setIsProcessing(false)
                    }
                }
            }

            const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay
            const paymentObject = new RazorpayConstructor(options)
            paymentObject.open()
        } catch {
            setPayError("Something went wrong. Please try again.")
            setIsProcessing(false)
        }
    }

    // ── Loading State ──
    if (loading) {
        return (
            <div className="min-h-screen bg-[#020817] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading payment details...</p>
                </div>
            </div>
        )
    }

    // ── Error State ──
    if (error) {
        return (
            <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#121A2F]/80 backdrop-blur-xl rounded-[32px] border border-slate-700/50 p-10 text-center max-w-md w-full"
                >
                    <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-rose-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Link Unavailable</h2>
                    <p className="text-slate-400 mb-8">{error}</p>
                    <a href="/" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors border border-slate-700">
                        Go to OKPAY
                    </a>
                </motion.div>
            </div>
        )
    }

    // ── Already Paid State ──
    if (alreadyPaid) {
        return (
            <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#121A2F]/80 backdrop-blur-xl rounded-[32px] border border-slate-700/50 p-10 text-center max-w-md w-full"
                >
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Already Paid</h2>
                    <p className="text-slate-400 mb-8">This payment link has already been used.</p>
                    <a href="/" className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#020817] rounded-xl font-bold transition-colors">
                        Go to OKPAY
                    </a>
                </motion.div>
            </div>
        )
    }

    // ── Main Payment Page ──
    return (
        <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 py-12">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#121A2F]/80 backdrop-blur-xl rounded-[32px] border border-slate-700/50 overflow-hidden shadow-2xl max-w-md w-full relative"
            >
                {/* Glow */}
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

                {/* Header */}
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 px-8 pt-10 pb-8 text-center border-b border-slate-700/50">
                    <div className="w-14 h-14 bg-[#0B0F19] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                        <ShieldCheck className="w-7 h-7 text-cyan-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">OKPAY</h1>
                    <p className="text-slate-400 text-sm">Secure Payment</p>
                </div>

                {/* Payment Details */}
                <div className="px-8 py-8 space-y-6">
                    {/* Receiver Info */}
                    <div className="flex items-center gap-4 p-4 bg-[#0B0F19] rounded-2xl border border-slate-700/50">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Paying to</p>
                            <p className="text-lg font-bold text-white">{linkData?.receiverName}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {linkData?.description && (
                        <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-700/50">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">For</p>
                            <p className="text-white">{linkData.description}</p>
                        </div>
                    )}

                    {/* Amount */}
                    {linkData && linkData.amount > 0 ? (
                        <div className="text-center py-6">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Amount</p>
                            <p className="text-5xl font-bold text-white">₹{linkData.amount.toLocaleString()}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">
                                Enter Amount to Pay
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-2xl font-bold text-slate-400">₹</span>
                                </div>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={payerAmount}
                                    onChange={e => setPayerAmount(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-[#0B0F19] border border-slate-700/50 rounded-2xl text-3xl font-bold text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all text-center placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                    )}

                    {/* Expiry Info */}
                    {linkData?.expiresAt && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Expires: {new Date(linkData.expiresAt).toLocaleString()}</span>
                        </div>
                    )}

                    {payError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-center text-sm font-medium">
                            {payError}
                        </div>
                    )}

                    {/* Pay Button */}
                    <button
                        onClick={handlePay}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#020817] rounded-2xl font-bold text-lg transition-all active:scale-[0.98]"
                    >
                        {isProcessing ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                        ) : (
                            <>Pay {linkData && linkData.amount > 0 ? `₹${linkData.amount.toLocaleString()}` : payerAmount ? `₹${payerAmount}` : ""} via Razorpay</>
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-500">
                        Secured by <span className="text-cyan-400 font-semibold">OKPAY</span> × Razorpay
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
