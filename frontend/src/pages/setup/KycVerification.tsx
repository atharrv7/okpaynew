import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { ShieldCheck, User, CreditCard, Camera, CheckCircle2, ArrowRight, Loader2 } from "lucide-react"

const steps = [
    { id: 1, label: "Personal Info", icon: User },
    { id: 2, label: "Identity", icon: CreditCard },
    { id: 3, label: "Selfie", icon: Camera },
]

export default function KycVerification() {
    const navigate = useNavigate()
    const { user, updateUser } = useAuth()

    const [step, setStep] = useState(1)
    const [isVerifying, setIsVerifying] = useState(false)
    const [verified, setVerified] = useState(false)

    // Form states
    const [fullName, setFullName] = useState(user?.name || "")
    const [dob, setDob] = useState("")
    const [gender, setGender] = useState("")
    const [address, setAddress] = useState("")
    const [aadhaar, setAadhaar] = useState("")
    const [pan, setPan] = useState("")

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1)
        } else {
            // Final step - verify
            setIsVerifying(true)
            setTimeout(() => {
                setIsVerifying(false)
                setVerified(true)

                // Mark KYC complete in user data
                if (user) {
                    updateUser({ ...user, kycComplete: true })
                }

                // Navigate to dashboard after 2 seconds
                setTimeout(() => {
                    navigate("/dashboard")
                }, 2000)
            }, 2500)
        }
    }

    const isStepValid = () => {
        if (step === 1) return fullName.trim() && dob && gender && address.trim()
        if (step === 2) return aadhaar.replace(/\s/g, '').length === 12 && pan.trim().length >= 10
        if (step === 3) return true // Selfie is simulated 
        return false
    }

    if (verified) {
        return (
            <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)]"
                    >
                        <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-3">KYC Verified!</h2>
                    <p className="text-slate-400 mb-2">Your identity has been successfully verified.</p>
                    <p className="text-slate-500 text-sm">Redirecting to dashboard...</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Complete KYC</h1>
                    <p className="text-slate-400 text-sm">Verify your identity to start using OKPAY</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                step > s.id 
                                    ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                                    : step === s.id 
                                        ? "bg-cyan-500 text-[#020817] shadow-[0_0_12px_rgba(6,182,212,0.4)]" 
                                        : "bg-slate-800 text-slate-500 border border-slate-700"
                            }`}>
                                {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-12 h-0.5 rounded ${step > s.id ? "bg-emerald-500" : "bg-slate-700"}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#121A2F]/80 backdrop-blur-xl border border-slate-700/50 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

                    <AnimatePresence mode="wait">
                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5 relative z-10"
                            >
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-cyan-400" /> Personal Information
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder="Enter your full legal name"
                                        className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={dob}
                                            onChange={e => setDob(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Gender</label>
                                        <select
                                            value={gender}
                                            onChange={e => setGender(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50"
                                        >
                                            <option value="">Select</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        placeholder="Enter your residential address"
                                        className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Identity Verification */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-5 relative z-10"
                            >
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-cyan-400" /> Identity Verification
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Aadhaar Number</label>
                                    <input
                                        type="text"
                                        value={aadhaar}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()
                                            setAadhaar(val.slice(0, 14))
                                        }}
                                        placeholder="0000 0000 0000"
                                        className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50 tracking-wider"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">PAN Number</label>
                                    <input
                                        type="text"
                                        value={pan}
                                        onChange={e => setPan(e.target.value.toUpperCase().slice(0, 10))}
                                        placeholder="ABCDE1234F"
                                        className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-700/50 rounded-xl text-white focus:ring-1 focus:ring-cyan-500/50 tracking-wider uppercase"
                                    />
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
                                    💡 Your documents are encrypted and securely stored as per RBI guidelines.
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Selfie Verification */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 relative z-10 text-center"
                            >
                                <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                                    <Camera className="w-5 h-5 text-cyan-400" /> Selfie Verification
                                </h3>

                                <div className="w-40 h-40 rounded-full bg-[#0B0F19] border-2 border-dashed border-slate-600 flex items-center justify-center mx-auto">
                                    <div className="text-center">
                                        <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                                        <span className="text-xs text-slate-500">Take a selfie</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {/* Simulated selfie capture */}}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors border border-slate-700 mx-auto flex items-center gap-2"
                                >
                                    <Camera className="w-4 h-4" /> Capture Selfie
                                </button>

                                <p className="text-slate-500 text-xs">
                                    Position your face within the circle and click capture. This is simulated for demo purposes.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-700/50 relative z-10">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-5 py-3 text-slate-400 hover:text-white font-medium transition-colors rounded-xl hover:bg-slate-800"
                            >
                                ← Back
                            </button>
                        ) : (
                            <div />
                        )}

                        <button
                            onClick={handleNext}
                            disabled={!isStepValid() || isVerifying}
                            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#020817] rounded-xl font-bold transition-all"
                        >
                            {isVerifying ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                            ) : step === 3 ? (
                                <>Complete KYC <CheckCircle2 className="w-5 h-5" /></>
                            ) : (
                                <>Next <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Skip for now */}
                <p className="text-center mt-6">
                    <button
                        onClick={() => {
                            if (user) updateUser({ ...user, kycComplete: true })
                            navigate("/dashboard")
                        }}
                        className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
                    >
                        Skip for now →
                    </button>
                </p>
            </div>
        </div>
    )
}
