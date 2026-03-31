import { motion, AnimatePresence } from "framer-motion"
import QRCode from "react-qr-code"
import { Copy, Share2, Check, QrCode as QrIcon, Link as LinkIcon, Send, Loader2, Download, Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useState, useEffect } from "react"

const BACKEND_URL = "https://okpay-3818.onrender.com"

export default function ReceiveMoney() {
    const { user } = useAuth()
    const [copied, setCopied] = useState(false)
    const [activeTab, setActiveTab] = useState<"qr" | "link" | "request">("qr")
    const [showBalance, setShowBalance] = useState(false)

    // QR Code State
    const [qrAmount, setQrAmount] = useState("")
    const [qrPaymentSim, setQrPaymentSim] = useState(false)

    // Payment Link State
    const [linkAmount, setLinkAmount] = useState("")
    const [linkDescription, setLinkDescription] = useState("")
    const [linkExpiry, setLinkExpiry] = useState("24h")
    const [generatedLinkId, setGeneratedLinkId] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [linkError, setLinkError] = useState("")
    const [isLinkDisabled, setIsLinkDisabled] = useState(false)

    // Request Money State
    const [requestReceiver, setRequestReceiver] = useState("")
    const [requestAmount, setRequestAmount] = useState("")
    const [requestNote, setRequestNote] = useState("")
    const [requestSent, setRequestSent] = useState(false)
    const [balance, setBalance] = useState("12,540")

    useEffect(() => {
        setBalance(Number(localStorage.getItem('okpay_wallet_balance') || 12540).toLocaleString())
    }, [])

    const username = user?.name?.toLowerCase().replace(/\s+/g, '') || "user"
    const okpayId = `${username}@okpay`

    const frontendUrl = window.location.origin
    const generatedPayUrl = generatedLinkId ? `${frontendUrl}/pay/${generatedLinkId}` : ""
    const qrPaymentLink = `${frontendUrl}/pay/qr?user=${username}${qrAmount ? `&amount=${qrAmount}` : ""}`

    const handleSimulatePayment = () => {
        setQrPaymentSim(true)
        const currentBalance = Number(localStorage.getItem('okpay_wallet_balance') || 12540)
        const amt = Number(qrAmount || 500)
        const newBal = currentBalance + amt
        localStorage.setItem('okpay_wallet_balance', String(newBal))
        setBalance(newBal.toLocaleString())
        
        const txns = JSON.parse(localStorage.getItem('okpay_transactions') || '[]')
        txns.unshift({
            id: 'UPI' + Math.random().toString().slice(2, 10),
            date: new Date().toISOString(),
            amount: amt,
            type: "receive",
            method: "QR Scan",
            status: "success",
            recipient: "राहुल"
        })
        localStorage.setItem('okpay_transactions', JSON.stringify(txns))
        
        setTimeout(() => setQrPaymentSim(false), 5000)
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = async (text: string, title: string) => {
        if (navigator.share) {
            try {
                await navigator.share({ title, text: `Pay via OKPAY: ${text}`, url: text })
            } catch { /* user cancelled */ }
        } else {
            handleCopy(text)
        }
    }

    const handleGenerateLink = async () => {
        setLinkError("")
        setIsGenerating(true)
        setIsLinkDisabled(false)
        try {
            const res = await fetch(`${BACKEND_URL}/api/payment/create-link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverName: user?.name || "OKPAY User",
                    receiverEmail: user?.email || "",
                    amount: linkAmount ? Number(linkAmount) : 0,
                    description: linkDescription,
                    expiry: linkExpiry
                })
            })
            const data = await res.json()
            if (data.success) {
                setGeneratedLinkId(data.linkId)
            } else {
                setLinkError(data.message || "Failed to generate link")
            }
        } catch {
            setLinkError("Could not connect to server. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    const [requestError, setRequestError] = useState("")
    const [isRequesting, setIsRequesting] = useState(false)

    const handleRequestMoney = async () => {
        if (!requestReceiver || !requestAmount) {
            setRequestError("Please enter email and amount")
            return
        }
        setRequestError("")
        setIsRequesting(true)
        
        try {
            const res = await fetch(`${BACKEND_URL}/api/payment/request-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    receiverEmail: requestReceiver,
                    amount: Number(requestAmount),
                    note: requestNote,
                    senderName: user?.name || "OKPAY User"
                })
            })
            
            const data = await res.json()
            if (data.success) {
                setRequestSent(true)
                setTimeout(() => {
                    setRequestSent(false)
                    setRequestReceiver("")
                    setRequestAmount("")
                    setRequestNote("")
                }, 3000)
            } else {
                setRequestError(data.message || "Could not send email request.")
            }
        } catch (error) {
            setRequestError("Could not connect to server to send email request.")
        } finally {
            setIsRequesting(false)
        }
    }

    const handleDownloadQR = () => {
        const svg = document.getElementById("okpay-qr-code")
        if (!svg) return
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        canvas.width = 280
        canvas.height = 280
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        const img = new Image()
        img.onload = () => {
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 40, 40, 200, 200)
            const pngUrl = canvas.toDataURL("image/png")
            const a = document.createElement("a")
            a.download = `okpay-qr-${username}.png`
            a.href = pngUrl
            a.click()
        }
        img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }

    return (
        <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Receive Money</h1>
                    <p className="text-slate-400 mb-8">Accept payments securely via QR, Link, or Request.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Wallet Balance</p>
                    <div className="flex items-center justify-end gap-2 text-cyan-400">
                        <p className="text-xl font-bold text-cyan-400 tracking-wider">
                            ₹{showBalance ? balance : "••••••"}
                        </p>
                        <button 
                            onClick={() => setShowBalance(!showBalance)}
                            className="text-cyan-500/70 hover:text-cyan-400 transition-colors focus:outline-none"
                            aria-label="Toggle balance visibility"
                        >
                            {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-6 bg-[#0B0F19] p-2 rounded-2xl border border-slate-800">
                <button 
                    onClick={() => setActiveTab("qr")}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                        activeTab === "qr" ? "bg-[#121A2F] text-white shadow-lg border border-slate-700" : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <QrIcon className="w-4 h-4" /> QR Code
                </button>
                <button 
                    onClick={() => setActiveTab("link")}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                        activeTab === "link" ? "bg-[#121A2F] text-white shadow-lg border border-slate-700" : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <LinkIcon className="w-4 h-4" /> Payment Link
                </button>
                <button 
                    onClick={() => setActiveTab("request")}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                        activeTab === "request" ? "bg-[#121A2F] text-white shadow-lg border border-slate-700" : "text-slate-400 hover:text-slate-200"
                    }`}
                >
                    <Send className="w-4 h-4" /> Request
                </button>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121A2F]/80 backdrop-blur-xl border border-slate-700/50 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Glow behind QR code */}
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                {/* ─── QR CODE TAB ─── */}
                {activeTab === "qr" && (
                    <div className="flex flex-col items-center justify-center relative z-10 text-center animate-in fade-in zoom-in-95 duration-300">
                        <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-1.5">Your OKPAY ID</p>
                        <div className="flex items-center justify-between border-b border-dashed border-slate-600 pb-6 mb-6 w-full">
                            <h2 className="text-2xl font-bold text-white tracking-wide truncate pr-4">
                                {okpayId}
                            </h2>
                            <button 
                                onClick={() => handleCopy(okpayId)}
                                className="flex-shrink-0 text-cyan-400 hover:text-cyan-300 transition-colors p-2 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg flex items-center gap-2 text-xs font-bold whitespace-nowrap"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />} Copy UPI ID
                            </button>
                        </div>

                        <div className="w-full mb-6 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-slate-400 font-bold">₹</span>
                            </div>
                            <input
                                type="number"
                                placeholder="Leave blank to allow custom amount"
                                value={qrAmount}
                                onChange={e => setQrAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50 text-center text-sm"
                            />
                        </div>
                    
                        <div className="p-4 bg-white rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6">
                            <QRCode 
                                id="okpay-qr-code"
                                value={qrPaymentLink}
                                size={200}
                                bgColor={"#ffffff"}
                                fgColor={"#020817"}
                                level={"Q"}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-slate-400 mb-6 bg-slate-800/20 p-4 rounded-xl text-left w-full border border-slate-700/30">
                            <div className="flex justify-between"><span>Status:</span> <span className="text-emerald-400 font-bold">Active</span></div>
                            <div className="flex justify-between"><span>Expires:</span> <span className="font-bold text-white">Never</span></div>
                            <div className="flex justify-between col-span-2"><span>Supported:</span> <span className="font-bold text-white">All UPI Apps</span></div>
                        </div>

                        {qrPaymentSim && (
                            <div className="mb-6 w-full animate-in zoom-in slide-in-from-top-4 duration-300">
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                                        <Check className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h4 className="font-bold text-white text-lg mb-1">₹{qrAmount || "500"} received successfully</h4>
                                    <p className="text-sm text-emerald-400/80 mb-2">From: राहुल</p>
                                    <p className="text-xs font-mono text-emerald-500/50">Ref ID: UPI{Math.random().toString().slice(2, 10)}</p>
                                </div>
                            </div>
                        )}

                        <div className="w-full flex justify-end mb-2">
                            <button onClick={handleSimulatePayment} disabled={qrPaymentSim} className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors">Simulate Scan</button>
                        </div>

                        <div className="w-full space-y-3">
                            <div className="w-full flex items-center justify-between bg-[#0B0F19] border border-slate-700/50 p-4 rounded-xl">
                                <span className="text-slate-300 font-mono text-xs truncate mr-4">
                                    {qrPaymentLink}
                                </span>
                                <button 
                                    onClick={() => handleCopy(qrPaymentLink)}
                                    className="flex-shrink-0 text-cyan-400 hover:text-cyan-300 transition-colors p-2 hover:bg-cyan-500/10 rounded-lg"
                                >
                                    {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={handleDownloadQR}
                                    className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors border border-slate-700"
                                >
                                    <Download className="w-4 h-4" /> Download QR
                                </button>
                                <button 
                                    onClick={() => handleShare(qrPaymentLink, "Pay me via OKPAY")}
                                    className="flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#020817] rounded-xl font-semibold transition-all"
                                >
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── PAYMENT LINK TAB ─── */}
                {activeTab === "link" && (
                    <div className="space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
                        <AnimatePresence mode="wait">
                            {!generatedLinkId ? (
                                <motion.div
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-5"
                                >
                                    {linkError && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm font-medium">
                                            {linkError}
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1 mb-2 block">Amount (Optional)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="text-slate-400 font-bold">₹</span>
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="Leave empty to let payer decide"
                                                value={linkAmount}
                                                onChange={e => setLinkAmount(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1 mb-2 block">Description</label>
                                        <input
                                            type="text"
                                            placeholder="What's this for?"
                                            value={linkDescription}
                                            onChange={e => setLinkDescription(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1 mb-2 block">Link Expires In</label>
                                        <select 
                                            value={linkExpiry}
                                            onChange={e => setLinkExpiry(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50"
                                        >
                                            <option value="1h">1 Hour</option>
                                            <option value="24h">24 Hours</option>
                                            <option value="7d">7 Days</option>
                                            <option value="never">Never</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleGenerateLink}
                                        disabled={isGenerating}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#020817] transition-all rounded-xl font-bold mt-2"
                                    >
                                        {isGenerating ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                                        ) : (
                                            <><LinkIcon className="w-5 h-5" /> Generate Payment Link</>
                                        )}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                            <Check className="w-8 h-8 text-emerald-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">Link Generated Successfully</h3>
                                        <p className="text-slate-400 text-sm">Share this link to receive payment</p>
                                    </div>

                                    <div className="bg-[#0B0F19] rounded-xl border border-slate-700/50 p-4 shrink-0">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex gap-4 text-xs">
                                                <span>Status: <strong className={isLinkDisabled ? "text-red-400" : "text-emerald-400"}>{isLinkDisabled ? "Disabled" : "Active"}</strong></span>
                                                <span className="text-slate-400">Expires in: <strong>{linkExpiry === 'never' ? 'Never' : linkExpiry}</strong></span>
                                            </div>
                                            {linkAmount && <span className="text-xl font-bold text-white">₹{linkAmount}</span>}
                                        </div>
                                        
                                        <div className="flex items-center justify-between bg-slate-800/30 border border-cyan-500/20 p-3 rounded-lg mb-3">
                                            <span className={`font-mono text-xs truncate max-w-[200px] ${isLinkDisabled ? 'text-slate-500 line-through' : 'text-cyan-400'}`}>
                                                {generatedPayUrl}
                                            </span>
                                            <button 
                                                onClick={() => handleCopy(generatedPayUrl)}
                                                disabled={isLinkDisabled}
                                                className="flex-shrink-0 text-white hover:text-cyan-300 transition-colors p-2 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white disabled:pointer-events-none cursor-pointer"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-3">
                                            <div className="text-center"><p className="text-[10px] text-slate-500 uppercase tracking-wider">Views</p><p className="font-bold text-slate-200">0</p></div>
                                            <div className="text-center"><p className="text-[10px] text-slate-500 uppercase tracking-wider">Paid</p><p className="font-bold text-emerald-400">0</p></div>
                                            <div className="text-center"><p className="text-[10px] text-slate-500 uppercase tracking-wider">Pending</p><p className="font-bold text-amber-400">0</p></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <button 
                                            onClick={() => handleCopy(generatedPayUrl)}
                                            disabled={isLinkDisabled}
                                            className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all border border-slate-700 text-xs disabled:opacity-50 disabled:hover:bg-slate-800 cursor-pointer disabled:pointer-events-none"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />} Copy Link
                                        </button>
                                        <button 
                                            onClick={() => handleShare(generatedPayUrl, "Pay me via OKPAY")}
                                            disabled={isLinkDisabled}
                                            className="flex items-center justify-center gap-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#020817] rounded-xl font-bold transition-all text-xs disabled:opacity-50 disabled:hover:bg-cyan-500 cursor-pointer disabled:pointer-events-none"
                                        >
                                            <Share2 className="w-4 h-4" /> Share
                                        </button>
                                        <button 
                                            onClick={() => setIsLinkDisabled(true)}
                                            disabled={isLinkDisabled}
                                            className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-semibold transition-all border border-red-500/20 text-xs disabled:opacity-50 disabled:hover:bg-red-500/10 cursor-pointer disabled:pointer-events-none"
                                        >
                                            {isLinkDisabled ? "Disabled" : "Disable Link"}
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setGeneratedLinkId("")
                                            setLinkAmount("")
                                            setLinkDescription("")
                                        }}
                                        className="w-full text-slate-400 hover:text-white text-sm font-medium py-2 transition-colors"
                                    >
                                        ← Create Another Link
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {activeTab === "request" && (
                    <div className="space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
                        {requestError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center text-sm font-medium">
                                {requestError}
                            </div>
                        )}
                        {requestSent && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-xl text-center flex flex-col items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-1">
                                    <Check className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h4 className="font-bold text-white text-lg">Request Sent Successfully</h4>
                                <p className="text-sm font-medium text-amber-400 flex items-center gap-2 mb-2"><Loader2 className="w-4 h-4 animate-spin"/> Pending Payment</p>
                                
                                <button className="text-xs bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">Set Reminder for 24h</button>
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1 mb-2 block">From Who? (Email / UPI ID / Mobile)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., rahul@gmail.com, rahul@oksbi, +91 9876543210"
                                    value={requestReceiver}
                                    onChange={e => setRequestReceiver(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1 mb-2 block">Amount to Request</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-bold">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={requestAmount}
                                        onChange={e => setRequestAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1 mb-2 block">Note (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Dinner split, Rent, etc."
                                    value={requestNote}
                                    onChange={e => setRequestNote(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50"
                                />
                            </div>
                        </div>

                        <button 
                            onClick={handleRequestMoney}
                            disabled={!requestReceiver || !requestAmount || isRequesting}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-[#020817] transition-all rounded-xl font-bold mt-8"
                        >
                            {isRequesting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                            ) : (
                                <>Send Request <Send className="w-5 h-5" /></>
                            )}
                        </button>


                    </div>
                )}
            </motion.div>
        </div>
    )
}
