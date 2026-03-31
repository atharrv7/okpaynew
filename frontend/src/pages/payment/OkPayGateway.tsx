import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import {
    CreditCard,
    Smartphone,
    Landmark,
    Wallet,
    Building2,
    ShieldCheck,
    Lock,
    CheckCircle2,
    ChevronRight,
    Loader2,
    Search,
    Gift,
    Eye,
    EyeOff
} from "lucide-react"

const BACKEND_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000' : 'https://okpay-3818.onrender.com'

export default function OkPayGateway() {
    const location = useLocation()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("upi")
    const [isProcessing, setIsProcessing] = useState(false)
    const [showPin, setShowPin] = useState(false)
    const [pin, setPin] = useState("")
    const [processingStep, setProcessingStep] = useState("")
    const [cardNumber, setCardNumber] = useState("")
    const [upiId, setUpiId] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [upiStep, setUpiStep] = useState(1)
    const [upiReceiver, setUpiReceiver] = useState("")
    
    // Cards State
    const [showCardOtp, setShowCardOtp] = useState(false)
    const [savedCardActive, setSavedCardActive] = useState(false)
    const [cardExpiry, setCardExpiry] = useState("")
    const [cardCvv, setCardCvv] = useState("")
    const [cardType, setCardType] = useState("")
    const [cardOffer, setCardOffer] = useState("")
    const [cardOtp, setCardOtp] = useState("")
    const [cardResendTimer, setCardResendTimer] = useState(30)

    // Wallet State
    const [walletBal, setWalletBal] = useState(() => Number(localStorage.getItem('okpay_wallet_balance') || '10000'));
    const [walletCashback, setWalletCashback] = useState(false);
    const [showBal, setShowBal] = useState(false);

    // NetBanking State
    const [nbStep, setNbStep] = useState(1)
    const [selectedBank, setSelectedBank] = useState("")
    const [nbCustomerId, setNbCustomerId] = useState("")
    const [nbPassword, setNbPassword] = useState("")
    const [nbOtp, setNbOtp] = useState("")

    // Bank Transfer State
    const [btAcc, setBtAcc] = useState("")
    const [btConf, setBtConf] = useState("")
    const [btIfsc, setBtIfsc] = useState("")
    const [btName, setBtName] = useState("")
    const [btVerified, setBtVerified] = useState(false)
    const [btType, setBtType] = useState("IMPS")

    const amount = location.state?.amount || "1,500"
    const recipient = location.state?.recipient || "Merchant Name"

    const tabs = [
        { id: "upi", label: "UPI", icon: Smartphone, time: "Instant", success: "99.2%" },
        { id: "cards", label: "Cards", icon: CreditCard, time: "5 Sec", success: "98.5%" },
        { id: "netbanking", label: "NetBanking", icon: Landmark, time: "10 Sec", success: "95.0%" },
        { id: "wallets", label: "Wallets", icon: Wallet, time: "Instant", success: "99.9%" },
        { id: "bank_transfer", label: "Bank Transfer", icon: Building2, time: "1 Min", success: "97.1%" },
    ]
    useEffect(() => {
        if (showCardOtp && cardResendTimer > 0) {
            const t = setTimeout(() => setCardResendTimer(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [showCardOtp, cardResendTimer])

    const handleAddMoney = (amt: number) => {
        const currentBalance = Number(localStorage.getItem('okpay_wallet_balance') || '10000');
        const newBal = currentBalance + amt;
        localStorage.setItem('okpay_wallet_balance', String(newBal));
        setWalletBal(newBal);
        
        const txns = JSON.parse(localStorage.getItem('okpay_transactions') || '[]');
        txns.unshift({
            id: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: new Date().toISOString(),
            amount: amt,
            type: "receive",
            method: "Wallet Topup",
            status: "success",
            recipient: "Self"
        });
        localStorage.setItem('okpay_transactions', JSON.stringify(txns));
    }

    const handlePay = () => {
        if (activeTab === "cards") {
            if (!savedCardActive && (cardNumber.replace(/\s/g, '').length < 15 || !cardExpiry || cardCvv.length < 3)) {
                alert("Please enter valid card details or select a saved card.");
                return;
            }
            setShowCardOtp(true);
        } else if (activeTab === "wallets") {
            const numericAmount = Number(amount.toString().replace(/,/g, ''));
            const finalAmount = walletCashback ? numericAmount - 20 : numericAmount;
            if (walletBal < finalAmount) {
                // Don't show modal if insufficient
                return;
            }
            setShowPin(true);
        } else if (activeTab === "bank_transfer") {
            if (!btAcc || btAcc.length < 9) {
                alert("Please enter a valid Account Number (min 9 digits).");
                return;
            }
            if (btAcc !== btConf) {
                alert("Account numbers do not match");
                return;
            }
            const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
            if (!btIfsc || !ifscRegex.test(btIfsc)) {
                alert("Please enter a valid IFSC Code.");
                return;
            }
            if (!btVerified && !btName) {
                alert("Please verify beneficiary or enter a name manually.");
                return;
            }
            setShowPin(true);
        } else {
            setShowPin(true)
        }
    }

    const processCardPayment = () => {
        if (cardOtp.length < 4) return;
        setIsProcessing(true);
        setProcessingStep("Verifying OTP with Bank...");
        
        setTimeout(async () => {
            try {
                const sendAmount = Number(amount.toString().replace(/,/g, ''));
                const methodLabel = "Card Payment";

                const response = await fetch(`${BACKEND_URL}/api/payment/okpay-process`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: sendAmount,
                        method: methodLabel,
                        recipient,
                        pin: cardOtp || "1234"
                    })
                });

                const data = await response.json();
                
                setProcessingStep("Processing transaction...");

                setTimeout(() => {
                    if (data.success) {
                        const txns = JSON.parse(localStorage.getItem('okpay_transactions') || '[]');
                        txns.unshift({
                            id: data.transactionId,
                            date: new Date().toISOString(),
                            amount: sendAmount,
                            type: "send",
                            method: methodLabel,
                            status: "success",
                            recipient: recipient
                        });
                        localStorage.setItem('okpay_transactions', JSON.stringify(txns));

                        setIsProcessing(false);
                        navigate("/dashboard/success", {
                            state: {
                                status: "success",
                                amount: amount,
                                recipient: recipient,
                                method: methodLabel,
                                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                txnId: data.transactionId
                            }
                        });
                    } else {
                        alert(data.message || "Payment Failed");
                        setIsProcessing(false);
                    }
                }, 1000);

            } catch (err) {
                console.error(err);
                alert("Error connecting to OKPAY Backend servers.");
                setIsProcessing(false);
            }
        }, 1500);
    }

    const processPayment = async () => {
        if (pin.length < 4) return
        setShowPin(false)
        setIsProcessing(true)
        setProcessingStep("Connecting to bank securely...")

        try {
            const originalAmount = Number(amount.toString().replace(/,/g, ''))
            const methodLabel = tabs.find(t => t.id === activeTab)?.label || "OKPAY"
            
            const sendAmount = (activeTab === 'wallets' && walletCashback) ? originalAmount - 20 : originalAmount;

            const currentBalance = Number(localStorage.getItem('okpay_wallet_balance') || '10000')
            if (activeTab === 'wallets' || methodLabel === 'OKPAY') {
                if (currentBalance < sendAmount) {
                    alert("Insufficient Wallet Balance!")
                    setIsProcessing(false)
                    return
                }
            }

            setTimeout(() => setProcessingStep("Verifying payment details..."), 1000)
            
            // Real Backend API call
            const response = await fetch(`${BACKEND_URL}/api/payment/okpay-process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: sendAmount,
                    method: methodLabel,
                    recipient,
                    pin
                })
            })

            const data = await response.json()
            
            setProcessingStep("Processing transaction...")

            setTimeout(() => {
                if (data.success) {
                    const currentBalance = Number(localStorage.getItem('okpay_wallet_balance') || '10000')
                    localStorage.setItem('okpay_wallet_balance', String(currentBalance - sendAmount))

                    const txns = JSON.parse(localStorage.getItem('okpay_transactions') || '[]')
                    txns.unshift({
                        id: data.transactionId,
                        date: new Date().toISOString(),
                        amount: sendAmount,
                        type: "send",
                        method: methodLabel,
                        status: "success",
                        recipient: upiReceiver || recipient || "Unknown"
                    })
                    localStorage.setItem('okpay_transactions', JSON.stringify(txns))

                    setIsProcessing(false)
                    navigate("/dashboard/success", {
                        state: {
                            status: "success",
                            amount: amount,
                            recipient: activeTab === "upi" ? upiReceiver : recipient,
                            method: methodLabel,
                            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            txnId: data.transactionId
                        }
                    })
                } else {
                    alert(data.message || "Payment Failed")
                    setIsProcessing(false)
                }
            }, 1000)

        } catch (err) {
            console.error(err)
            alert("Error connecting to OKPAY Backend servers.")
            setIsProcessing(false)
        }
    }

    const processUpiPayment = () => {
        if (pin.length < 4) return;
        setUpiStep(5); // Show loading/process inside UPI tab
        processPayment(); // Actually run payment
    }

    const processNetBankingPayment = () => {
        if (nbOtp.length < 4) return;
        setNbStep(5);
        setIsProcessing(true);
        setProcessingStep("Connecting to bank securely...");

        setTimeout(() => setProcessingStep("Verifying payment details..."), 1000);

        setTimeout(async () => {
            try {
                const sendAmount = Number(amount.toString().replace(/,/g, ''));
                const methodLabel = selectedBank || "NetBanking";

                const response = await fetch(`${BACKEND_URL}/api/payment/okpay-process`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: sendAmount,
                        method: methodLabel,
                        recipient,
                        pin: "1234"
                    })
                });

                const data = await response.json();
                
                setProcessingStep("Processing transaction...");

                setTimeout(() => {
                    if (data.success) {
                        const txns = JSON.parse(localStorage.getItem('okpay_transactions') || '[]');
                        txns.unshift({
                            id: data.transactionId,
                            date: new Date().toISOString(),
                            amount: sendAmount,
                            type: "send",
                            method: methodLabel,
                            status: "success",
                            recipient: recipient
                        });
                        localStorage.setItem('okpay_transactions', JSON.stringify(txns));

                        setIsProcessing(false);
                        navigate("/dashboard/success", {
                            state: {
                                status: "success",
                                amount: amount,
                                recipient: recipient,
                                method: methodLabel,
                                date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                txnId: data.transactionId
                            }
                        });
                    } else {
                        alert(data.message || "Payment Failed");
                        setIsProcessing(false);
                        setNbStep(4);
                    }
                }, 1000);

            } catch (err) {
                console.error(err);
                alert("Error connecting to OKPAY Backend servers.");
                setIsProcessing(false);
                setNbStep(4);
            }
        }, 1500);
    }

    // Offers removed as requested

    return (
        <div className="min-h-screen bg-[#020817] flex items-center justify-center p-4">
            {/* Main Gateway Container */}
            <div className="w-full max-w-5xl bg-[#0B0F19] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                
                {/* Left Sidebar - Payment Methods */}
                <div className="w-full md:w-1/3 bg-[#121A2F]/80 p-6 border-r border-slate-800/50 overflow-y-auto hidden-scrollbar">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xl mb-1">
                            <ShieldCheck className="w-6 h-6" /> OKPAY Gateway
                        </div>
                        <p className="text-slate-400 text-xs tracking-wider">SECURE CHECKOUT</p>
                    </div>

                    <div className="space-y-2">
                        {tabs.map(tab => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-medium text-sm ${
                                        isActive 
                                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]" 
                                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                                    {tab.label}
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 p-6 md:p-10 bg-[#0B0F19] flex flex-col relative">
                    
                    {/* Header Details */}
                    <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-800">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Paying <span className="text-cyan-400">{recipient}</span></h2>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">₹{amount}</div>
                            <p className="text-emerald-400 text-sm font-medium hover:text-emerald-300 cursor-pointer transition-colors">View Details</p>
                        </div>
                    </div>

                    {/* Dynamic Content based on active tab */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                {/* UPI TAB WITH 6-STEP FLOW */}
                                {activeTab === "upi" && (
                                    <div className="flex flex-col max-w-lg mx-auto w-full pt-4">
                                        <div className="mb-8">
                                            <h3 className="text-xl font-bold text-white">UPI Payment 🔐</h3>
                                            <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Secure encrypted transaction
                                            </p>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {upiStep === 1 && (
                                                <motion.div key="step1" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} className="space-y-6">
                                                    <div>
                                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-2">Choose Contact or Enter UPI</label>
                                                        <input 
                                                            type="text" 
                                                            maxLength={40}
                                                            placeholder="example@okpay or 9999999999" 
                                                            value={upiId}
                                                            onChange={e => {
                                                                let val = e.target.value.toLowerCase().replace(/[^a-z0-9@.]/g, '');
                                                                if (/^\d+$/.test(val) && val.length > 10) val = val.slice(0, 10);
                                                                setUpiId(val);
                                                            }}
                                                            className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500/50 shadow-inner" 
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            if(!upiId || upiId.length < 5) return;
                                                            setIsVerifying(true);
                                                            setTimeout(() => { 
                                                                setUpiReceiver(upiId.split('@')[0].toUpperCase() + " (Verified)");
                                                                setIsVerifying(false); 
                                                                setUpiStep(2);
                                                            }, 1200)
                                                        }}
                                                        disabled={!upiId || isVerifying || upiId.length < 5}
                                                        className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#020817] font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {isVerifying ? <Loader2 className="w-5 h-5 animate-spin"/> : "Continue"}
                                                    </button>
                                                </motion.div>
                                            )}

                                            {upiStep === 2 && (
                                                <motion.div key="step2" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} className="space-y-6">
                                                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Paying To</p>
                                                            <p className="text-lg font-bold text-white flex items-center gap-2">
                                                                {upiReceiver} <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                            </p>
                                                            <p className="text-slate-500 text-xs">{upiId}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button onClick={() => setUpiStep(1)} className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-bold">Back</button>
                                                        <button onClick={() => setUpiStep(5)} className="flex-1 py-4 bg-cyan-500 text-[#020817] rounded-xl font-bold">Confirm</button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {upiStep === 5 && (
                                                <motion.div key="step5" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="space-y-6 text-center pt-4">
                                                    <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                                                        <Lock className="w-8 h-8 text-cyan-400" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white mb-2">Enter UPI PIN</h3>
                                                    <p className="text-sm text-slate-400 mb-6">Securing ₹{amount} to {upiReceiver}</p>
                                                    
                                                    {!isProcessing ? (
                                                    <input
                                                        type="password"
                                                        maxLength={6}
                                                        value={pin}
                                                        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                                        placeholder="••••••"
                                                        className="w-full text-center tracking-[1em] py-4 mb-6 bg-[#0B0F19] border border-slate-700/50 rounded-2xl text-2xl font-bold text-white focus:ring-1 focus:ring-cyan-500/50 transition-all outline-none"
                                                        autoFocus
                                                    />
                                                    ) : (
                                                        <div className="py-8 flex flex-col items-center justify-center space-y-4">
                                                            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                                                            <p className="text-cyan-400 text-sm animate-pulse">{processingStep || "Processing..."}</p>
                                                        </div>
                                                    )}

                                                    {!isProcessing && (
                                                    <div className="flex gap-3">
                                                        <button onClick={() => setUpiStep(2)} className="w-1/3 py-4 bg-slate-800 text-white rounded-xl font-bold">Back</button>
                                                        <button 
                                                            onClick={processUpiPayment}
                                                            disabled={pin.length < 4}
                                                            className="w-2/3 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#020817] rounded-xl font-bold transition-all"
                                                        >
                                                            Confirm
                                                        </button>
                                                    </div>
                                                    )}
                                                </motion.div>
                                            )}

                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* CARDS TAB */}
                                {activeTab === "cards" && (
                                    <div className="space-y-6">
                                        
                                        {/* Saved Cards Section */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-semibold text-white">Saved Cards</h4>
                                                {!savedCardActive && (
                                                    <button onClick={() => setSavedCardActive(true)} className="text-xs text-cyan-400 font-medium hover:underline">Use saved card</button>
                                                )}
                                            </div>

                                            {savedCardActive ? (
                                                <div className="space-y-3">
                                                    <div className="p-4 bg-slate-800/80 border border-cyan-500/50 rounded-xl flex items-center justify-between cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-6 bg-slate-100 rounded text-slate-800 font-bold text-[10px] flex items-center justify-center italic">VISA</div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">Visa **** 4598</p>
                                                                <p className="text-xs text-emerald-400">10% cashback applied!</p>
                                                            </div>
                                                        </div>
                                                        <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                                                    </div>
                                                    <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-500 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-6 bg-orange-500 rounded text-white font-bold text-[10px] flex items-center justify-center">RuPay</div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-300">RuPay **** 7782</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 text-right">
                                                        <button onClick={() => setSavedCardActive(false)} className="text-xs text-slate-400 font-medium hover:text-white transition-colors">← Add new card instead</button>
                                                    </div>
                                                    <div className="mt-4 pt-4 border-t border-slate-800">
                                                        <label className="text-xs text-slate-400 mb-1 block">Enter CVV to confirm</label>
                                                        <input 
                                                            type="password" 
                                                            value={cardCvv}
                                                            onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                                                            placeholder="•••" 
                                                            className="w-24 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" 
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {cardOffer && (
                                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                                                            <Gift className="w-4 h-4 text-emerald-400" />
                                                            <p className="text-xs font-bold text-emerald-400">{cardOffer}</p>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <div className="flex justify-between items-end mb-1">
                                                            <label className="text-xs text-slate-400 block">Card Number</label>
                                                            {cardType && (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-cyan-400 rounded uppercase">{cardType} Detected</span>
                                                            )}
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            value={cardNumber} 
                                                            onChange={(e) => {
                                                                let val = e.target.value.replace(/\D/g, '');
                                                                
                                                                if (val.startsWith("4")) {
                                                                    setCardType("Visa");
                                                                    setCardOffer("Flat ₹50 off on Visa cards");
                                                                } else if (val.startsWith("5") || val.startsWith("2")) {
                                                                    setCardType("Mastercard");
                                                                    setCardOffer("10% cashback up to ₹100");
                                                                } else if (val.startsWith("34") || val.startsWith("37")) {
                                                                    setCardType("Amex");
                                                                    setCardOffer("5X Reward Points on Amex");
                                                                } else if (val.startsWith("60") || val.startsWith("65") || val.startsWith("81")) {
                                                                    setCardType("RuPay");
                                                                    setCardOffer("Zero Convenience Fee on RuPay");
                                                                } else {
                                                                    setCardType("");
                                                                    setCardOffer("");
                                                                }

                                                                if (cardType === "Amex" || val.startsWith("34") || val.startsWith("37")) {
                                                                    val = val.substring(0, 15);
                                                                    let formatted = "";
                                                                    if (val.length > 0) formatted += val.substring(0, 4);
                                                                    if (val.length > 4) formatted += " " + val.substring(4, 10);
                                                                    if (val.length > 10) formatted += " " + val.substring(10, 15);
                                                                    setCardNumber(formatted);
                                                                } else {
                                                                    val = val.substring(0, 16);
                                                                    val = val.replace(/(.{4})/g, '$1 ').trim();
                                                                    setCardNumber(val);
                                                                }
                                                            }} 
                                                            placeholder="0000 0000 0000 0000" 
                                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors tracking-widest text-lg font-mono placeholder:tracking-normal placeholder:font-sans" 
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-xs text-slate-400 mb-1 block">Expiry</label>
                                                            <input 
                                                                type="text" 
                                                                placeholder="MM/YY"
                                                                value={cardExpiry}
                                                                maxLength={5}
                                                                onChange={(e) => {
                                                                    let val = e.target.value.replace(/\D/g, '');
                                                                    if (val.length >= 2 && !val.includes('/')) {
                                                                        val = val.substring(0, 2) + '/' + val.substring(2);
                                                                    }
                                                                    setCardExpiry(val);
                                                                }}
                                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-400 mb-1 block">CVV</label>
                                                            <input 
                                                                type="password" 
                                                                placeholder={cardType === "Amex" ? "••••" : "•••"}
                                                                maxLength={cardType === "Amex" ? 4 : 3}
                                                                value={cardCvv}
                                                                onChange={(e) => {
                                                                    let val = e.target.value.replace(/\D/g, '');
                                                                    setCardCvv(val);
                                                                }}
                                                                className={`w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors ${cardType==="Amex" && cardCvv.length > 0 && cardCvv.length < 4 ? "border-amber-500/50 focus:border-amber-500" : ""} ${cardType !== "Amex" && cardCvv.length > 0 && cardCvv.length < 3 ? "border-amber-500/50 focus:border-amber-500" : ""}`} 
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-400 mb-1 block">Card Holder Name</label>
                                                        <input type="text" placeholder="Name on card" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors" />
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <input type="checkbox" id="saveCard" defaultChecked className="rounded bg-slate-800 border-slate-600 text-cyan-500" />
                                                        <label htmlFor="saveCard" className="text-xs text-slate-300">Securely save card for future payments</label>
                                                    </div>


                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* NET BANKING */}
                                {activeTab === "netbanking" && (
                                    <div className="flex flex-col max-w-lg mx-auto w-full pt-4">
                                        <AnimatePresence mode="wait">
                                            {nbStep === 1 && (
                                                <motion.div key="nb1" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} className="space-y-6">
                                                    <div className="relative">
                                                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                                        <input type="text" placeholder="Search your bank (e.g. HDFC, SBI)" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white" />
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-sm font-semibold text-slate-400">Recent Banks</h4>
                                                            <span className="text-xs text-emerald-400 font-medium">Success Rate: 98.4% • Avg Time: 10 sec</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {['HDFC Bank', 'SBI', 'ICICI Bank'].map(bank => (
                                                                <div 
                                                                    key={bank} 
                                                                    onClick={() => {
                                                                        setSelectedBank(bank);
                                                                        setNbStep(2);
                                                                        setTimeout(() => setNbStep(3), 2500);
                                                                    }}
                                                                    className="p-3 border border-slate-700/50 rounded-xl bg-slate-800/30 text-center hover:border-cyan-500/50 hover:bg-slate-800 cursor-pointer text-sm font-medium text-slate-300 transition-all">
                                                                    {bank}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-slate-400">Popular Banks</h4>
                                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {['Axis Bank', 'Kotak', 'Yes Bank', 'PNB', 'Bank of Baroda', 'IndusInd'].map(bank => (
                                                                <div 
                                                                    key={bank} 
                                                                    onClick={() => {
                                                                        setSelectedBank(bank);
                                                                        setNbStep(2);
                                                                        setTimeout(() => setNbStep(3), 2500);
                                                                    }}
                                                                    className="p-3 border border-slate-700/50 rounded-xl bg-slate-800/30 text-center hover:border-cyan-500/50 hover:bg-slate-800 cursor-pointer text-sm text-slate-300 transition-all">
                                                                    {bank}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Badge label="Retail Banking" />
                                                        <Badge label="Corporate Banking" />
                                                    </div>
                                                </motion.div>
                                            )}

                                            {nbStep === 2 && (
                                                <motion.div key="nb2" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="space-y-6 text-center py-10">
                                                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-4" />
                                                    <h3 className="text-lg font-bold text-white mb-2">Redirecting to {selectedBank}...</h3>
                                                    <p className="text-sm text-slate-400 px-6">Connecting to secure banking portal. Please do not press back or refresh.</p>
                                                    <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto mt-6 overflow-hidden relative">
                                                        <motion.div initial={{width: "0%"}} animate={{width: "100%"}} transition={{duration: 2.5, ease: "easeInOut"}} className="absolute inset-y-0 left-0 bg-cyan-500 rounded-full"></motion.div>
                                                    </div>
                                                    <div className="flex justify-center mt-6">
                                                        <Badge label="256-bit Secure Redirect" icon={ShieldCheck} />
                                                    </div>
                                                </motion.div>
                                            )}

                                            {nbStep === 3 && (
                                                <motion.div key="nb3" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} className="space-y-5">
                                                    <div className="pb-4 border-b border-slate-800 text-center">
                                                        <div className="w-12 h-12 bg-slate-800 rounded-xl mx-auto flex items-center justify-center mb-3">
                                                            <Landmark className="w-6 h-6 text-cyan-400" />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-white">{selectedBank} Secure Login</h3>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="text-xs text-slate-400 mb-1 block">Customer ID / Username</label>
                                                        <input 
                                                            type="text" 
                                                            value={nbCustomerId}
                                                            onChange={e => setNbCustomerId(e.target.value)}
                                                            placeholder="Enter your Customer ID" 
                                                            className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-slate-400 mb-1 block">Password</label>
                                                        <input 
                                                            type="password" 
                                                            value={nbPassword}
                                                            onChange={e => setNbPassword(e.target.value)}
                                                            placeholder="Enter Login Password" 
                                                            className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" 
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 items-end">
                                                        <div>
                                                            <label className="text-xs text-slate-400 mb-1 block">Captcha</label>
                                                            <input type="text" placeholder="Enter characters" className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" />
                                                        </div>
                                                        <div className="bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-center text-slate-400 font-mono tracking-widest text-lg font-bold select-none border border-slate-700 line-through decoration-slate-600">
                                                            G7K2P
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 pt-4">
                                                        <button onClick={() => setNbStep(1)} className="w-1/3 py-3.5 bg-slate-800 text-white rounded-xl font-bold">Cancel</button>
                                                        <button 
                                                            onClick={() => setNbStep(4)} 
                                                            disabled={!nbCustomerId || !nbPassword}
                                                            className="w-2/3 py-3.5 bg-cyan-500 text-[#020817] rounded-xl font-bold disabled:opacity-50"
                                                        >
                                                            Login
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {nbStep === 4 && (
                                                <motion.div key="nb4" initial={{opacity:0, x:10}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-10}} className="space-y-6">
                                                    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 flex justify-between items-center mb-2">
                                                        <div>
                                                            <p className="text-slate-400 text-xs">Payment Amount</p>
                                                            <p className="text-lg font-bold text-white">₹{amount}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-slate-400 text-xs">Merchant</p>
                                                            <p className="text-white font-medium">{recipient}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="text-center pt-2">
                                                        <h3 className="text-lg font-bold text-white mb-2">Transaction Authentication</h3>
                                                        <p className="text-sm text-slate-400 mb-6">Enter OTP sent to your registered mobile number ending in •••• 98</p>
                                                        
                                                        <input 
                                                            type="password" 
                                                            maxLength={6}
                                                            value={nbOtp}
                                                            onChange={e => setNbOtp(e.target.value.replace(/\D/g, ''))}
                                                            placeholder="••••••" 
                                                            className="w-full max-w-[200px] text-center tracking-[0.5em] py-3 mx-auto bg-[#0B0F19] border border-slate-700/50 rounded-xl text-2xl font-bold text-white focus:outline-none focus:border-cyan-500/50 mb-4" 
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex gap-3 mt-4">
                                                        <button onClick={() => setNbStep(3)} className="w-1/3 py-4 bg-slate-800 text-white rounded-xl font-bold">Back</button>
                                                        <button 
                                                            onClick={processNetBankingPayment} 
                                                            disabled={nbOtp.length < 4}
                                                            className="w-2/3 py-4 bg-cyan-500 text-[#020817] rounded-xl font-bold disabled:opacity-50"
                                                        >
                                                            Submit
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                            
                                            {nbStep === 5 && (
                                                <motion.div key="nb5" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0}} className="space-y-6 text-center py-10">
                                                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                                                    <h3 className="text-lg font-bold text-white mb-2">{processingStep || "Authorizing Payment..."}</h3>
                                                    <p className="text-sm text-slate-400">Please do not press back or close the window.</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* WALLETS */}
                                {activeTab === "wallets" && (() => {
                                    const numericAmount = Number(amount.toString().replace(/,/g, ''));
                                    const finalAmount = walletCashback ? numericAmount - 20 : numericAmount;
                                    const isInsufficient = walletBal < finalAmount;
                                    const remainingBalance = walletBal - finalAmount;

                                    return (
                                        <div className="space-y-6">
                                            <div className={`p-5 border rounded-2xl ${isInsufficient ? 'border-amber-500/50 bg-amber-500/10' : 'border-cyan-500/50 bg-cyan-500/10'}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Wallet className={`w-8 h-8 ${isInsufficient ? 'text-amber-400' : 'text-cyan-400'}`} />
                                                        <div>
                                                            <h3 className="text-white font-bold text-lg">OKPAY Wallet</h3>
                                                            {isInsufficient && <p className="text-xs text-amber-400 font-medium">Insufficient balance</p>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-2xl font-bold text-white tracking-widest">
                                                                ₹ {showBal ? walletBal.toLocaleString() : '••••••'}
                                                            </p>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setShowBal(!showBal); }} 
                                                                className="text-slate-400 hover:text-white transition-colors"
                                                            >
                                                                {showBal ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                            </button>
                                                        </div>
                                                        <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80 ${isInsufficient ? 'text-amber-400' : 'text-cyan-400'}`}>Available Balance</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mt-4 pt-4 border-t border-slate-700/50">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-400">Amount to Pay</span>
                                                        <span className="text-white font-medium">₹ {numericAmount.toLocaleString()}</span>
                                                    </div>
                                                    {walletCashback && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-emerald-400 font-medium">Cashback Applied</span>
                                                        <span className="text-emerald-400 font-medium">- ₹ 20</span>
                                                    </div>
                                                    )}
                                                    <div className="flex justify-between text-sm pt-2 border-t border-slate-700/30">
                                                        <span className="text-slate-400">Balance After Payment</span>
                                                        <span className={`font-bold ${isInsufficient ? 'text-amber-400' : 'text-white'}`}>
                                                            {isInsufficient ? 'Needed: ₹ ' + Math.abs(remainingBalance).toLocaleString() : (!showBal ? '₹ ••••••' : '₹ ' + remainingBalance.toLocaleString())}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {isInsufficient && (
                                                <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                                                    <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
                                                        <h4 className="text-sm font-bold text-white mb-2">Add money to continue</h4>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleAddMoney(100)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">₹100</button>
                                                            <button onClick={() => handleAddMoney(500)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">₹500</button>
                                                            <button onClick={() => handleAddMoney(1000)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">₹1000</button>
                                                        </div>
                                                        <div className="mt-3 relative">
                                                            <input type="number" placeholder="Enter custom amount" className="w-full bg-[#0B0F19] border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" onKeyDown={e => {
                                                                if (e.key === 'Enter') {
                                                                    const val = Number(e.currentTarget.value);
                                                                    if (val > 0) {
                                                                        handleAddMoney(val);
                                                                        e.currentTarget.value = '';
                                                                    }
                                                                }
                                                            }} />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Press Enter</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {!isInsufficient && (
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Gift className="w-5 h-5 text-emerald-400" />
                                                            <div>
                                                                <p className="text-sm font-bold text-white">Cashback Available: ₹20</p>
                                                                <p className="text-xs text-slate-400">Reward Points: 150</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => setWalletCashback(!walletCashback)}
                                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${walletCashback ? 'bg-emerald-500 text-[#020817]' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'}`}
                                                        >
                                                            {walletCashback ? 'Applied' : 'Apply ₹20'}
                                                        </button>
                                                    </div>

                                                    <div className="pt-2">
                                                        <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-widest">Recent Wallet Payments</h4>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center text-sm p-2 bg-slate-800/30 rounded-lg">
                                                                <span className="text-slate-300">- ₹55 paid to hi</span>
                                                                <span className="text-slate-500 text-xs text-right">Today</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm p-2 bg-slate-800/30 rounded-lg">
                                                                <span className="text-emerald-400">+ ₹500 added</span>
                                                                <span className="text-slate-500 text-xs text-right">Yesterday</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm p-2 bg-slate-800/30 rounded-lg">
                                                                <span className="text-emerald-400">+ ₹120 cashback received</span>
                                                                <span className="text-slate-500 text-xs text-right">Mar 25</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* BANK TRANSFER */}
                                {activeTab === "bank_transfer" && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex gap-2 w-full">
                                                {[
                                                    { id: 'IMPS', label: 'IMPS', time: 'Instant', info: 'Max ₹5 lakh' },
                                                    { id: 'NEFT', label: 'NEFT', time: '30 mins', info: 'Working hours' },
                                                    { id: 'RTGS', label: 'RTGS', time: 'Instant', info: 'Min ₹2 lakh' }
                                                ].map((type) => (
                                                    <button 
                                                        key={type.id} 
                                                        onClick={() => setBtType(type.id)}
                                                        className={`flex-1 p-2 rounded-xl text-center border transition-all ${btType === type.id ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                                    >
                                                        <div className="text-xs font-bold mb-1">{type.label}</div>
                                                        <div className="text-[10px] leading-tight opacity-80">{type.time}</div>
                                                        <div className="text-[9px] leading-tight opacity-60 mt-0.5">{type.info}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Account Number</label>
                                            <input 
                                                type="password" 
                                                maxLength={18}
                                                value={btAcc}
                                                onChange={e => setBtAcc(e.target.value.replace(/\D/g, ''))}
                                                placeholder="Enter Account Number" 
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 flex justify-between">
                                                <span>Confirm Account</span>
                                                {btAcc && btConf && btAcc !== btConf && (
                                                    <span className="text-amber-400 font-medium">Numbers do not match</span>
                                                )}
                                                {btAcc && btConf && btAcc === btConf && (
                                                    <span className="text-emerald-400 font-medium">Matches</span>
                                                )}
                                            </label>
                                            <input 
                                                type="text" 
                                                maxLength={18}
                                                value={btConf}
                                                onChange={e => setBtConf(e.target.value.replace(/\D/g, ''))}
                                                placeholder="Re-enter Account" 
                                                className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${btAcc && btConf && btAcc !== btConf ? 'border-amber-500/50 focus:border-amber-500' : 'border-slate-700 focus:border-cyan-500/50'}`} 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-slate-400 mb-1 flex justify-between">
                                                    <span>IFSC Code</span>
                                                    {btIfsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(btIfsc) && <span className="text-amber-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis ml-2 max-w-[80px]">Invalid DB Format</span>}
                                                </label>
                                                <input 
                                                    type="text" 
                                                    maxLength={11}
                                                    value={btIfsc}
                                                    onChange={e => setBtIfsc(e.target.value.toUpperCase())}
                                                    placeholder="e.g. SBIN0001234" 
                                                    className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${btIfsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(btIfsc) ? 'border-amber-500/50 focus:border-amber-500' : 'border-slate-700 focus:border-cyan-500/50'}`} 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-400 mb-1 block">Beneficiary Name</label>
                                                {btVerified ? (
                                                    <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-bold text-emerald-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]" title={btName}>{btName || "ATHARV DESAI"}</p>
                                                            <p className="text-[10px] text-emerald-500/80">Verified</p>
                                                        </div>
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            value={btName}
                                                            onChange={e => setBtName(e.target.value)}
                                                            placeholder="Name" 
                                                            className="w-full min-w-0 bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-cyan-500/50" 
                                                        />
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (btIfsc && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(btIfsc) && btAcc === btConf && btAcc.length >= 9) {
                                                                    setBtVerified(true);
                                                                    if (!btName) setBtName("ATHARV DESAI");
                                                                } else {
                                                                    alert("Enter valid Account and IFSC first");
                                                                }
                                                            }}
                                                            className="px-3 shrink-0 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-bold text-white transition-colors"
                                                        >
                                                            Verify
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Remark (Optional)</label>
                                            <input type="text" placeholder="Payment for..." className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50" />
                                        </div>
                                    </div>
                                )}



                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions (Hidden for UPI and NetBanking since they have their own wizards) */}
                    {activeTab !== "upi" && activeTab !== "netbanking" && (() => {
                        const numericAmount = Number(amount.toString().replace(/,/g, ''));
                        const finalAmt = walletCashback && activeTab === 'wallets' ? numericAmount - 20 : numericAmount;
                        const isInsufficient = activeTab === "wallets" && walletBal < finalAmt;
                        return (
                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <button
                                onClick={handlePay}
                                disabled={isProcessing || isInsufficient}
                                className={`w-full flex items-center justify-center gap-2 py-4 font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] ${isInsufficient ? 'bg-slate-700 text-slate-400 shadow-none hover:shadow-none cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#020817]'}`}
                            >
                                <Lock className="w-5 h-5" /> {isInsufficient ? 'Insufficient Balance' : `Pay ₹${finalAmt.toLocaleString()} Securely`}
                            </button>
                        </div>
                        );
                    })()}

                </div>
            </div>



            {/* CARD OTP VERIFICATION MODAL OVERLAY */}
            <AnimatePresence>
                {showCardOtp && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#121A2F]/90 border border-slate-700/50 p-8 rounded-[32px] max-w-sm w-full text-center shadow-2xl">
                            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                                <ShieldCheck className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">OTP Verification</h3>
                            <p className="text-sm text-slate-400 mb-6">Enter OTP sent to ********98</p>
                            
                            <input
                                type="password"
                                maxLength={6}
                                value={cardOtp}
                                onChange={e => setCardOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="_ _ _ _ _ _"
                                disabled={isProcessing}
                                className="w-full text-center tracking-[1em] py-4 mb-2 bg-[#0B0F19] border border-slate-700/50 rounded-2xl text-2xl font-bold text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600 outline-none"
                                autoFocus
                            />

                            <div className="mb-6 flex justify-between items-center px-2">
                                <button 
                                    onClick={() => setCardResendTimer(30)}
                                    disabled={cardResendTimer > 0} 
                                    className="text-xs text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 transition-colors"
                                >
                                    Resend OTP
                                </button>
                                {cardResendTimer > 0 && <span className="text-xs text-slate-400">Resend in {cardResendTimer} sec</span>}
                            </div>

                            <button 
                                onClick={processCardPayment}
                                disabled={cardOtp.length < 4 || isProcessing}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#020817] font-bold rounded-2xl transition-all"
                            >
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing</> : "Verify & Pay"}
                            </button>
                            
                            {isProcessing && (
                                <p className="text-cyan-400 text-xs mt-4 animate-pulse">{processingStep}</p>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PIN VERIFICATION MODAL OVERLAY */}
            <AnimatePresence>
                {showPin && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-[#121A2F]/90 border border-slate-700/50 p-8 rounded-[32px] max-w-sm w-full text-center shadow-2xl">
                            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                                <ShieldCheck className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{activeTab === "wallets" ? "Wallet Authorization" : activeTab === "bank_transfer" ? "Enter OTP / Transaction PIN" : "Security Verification"}</h3>
                            <p className="text-sm text-slate-400 mb-6">{activeTab === "wallets" ? "Enter 4-digit Wallet PIN" : activeTab === "bank_transfer" ? "OTP sent to ********98" : "Enter OKPAY PIN to authorize payment"}</p>
                            
                            <input
                                type="password"
                                maxLength={4}
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••"
                                disabled={isProcessing}
                                className="w-full text-center tracking-[1em] py-4 mb-6 bg-[#0B0F19] border border-slate-700/50 rounded-2xl text-2xl font-bold text-white focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600 outline-none"
                                autoFocus
                            />

                            <button 
                                onClick={processPayment}
                                disabled={pin.length < 4 || isProcessing}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-[#020817] font-bold rounded-2xl transition-all"
                            >
                                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing</> : "Confirm Payment"}
                            </button>
                            
                            {isProcessing && (
                                <p className="text-cyan-400 text-xs mt-4 animate-pulse">{processingStep}</p>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

function Badge({ label, icon: Icon }: { label: string, icon?: any }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/60 border border-slate-700 text-slate-300 text-xs font-medium rounded-full whitespace-nowrap">
            {Icon && <Icon className="w-3 h-3 text-cyan-400" />}
            {label}
        </span>
    )
}
