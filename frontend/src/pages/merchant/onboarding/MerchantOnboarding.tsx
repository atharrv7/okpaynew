import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle2, ChevronRight, HelpCircle, PenLine, Zap, LogOut } from "lucide-react"
import { useAuth } from "../../../contexts/AuthContext"

// Reusable Input Component for Dark Theme
const OnboardInput = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-400">{label}</label>
        <input
            className="w-full px-4 py-3 bg-[#0B0F19] border border-slate-800/80 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600 shadow-sm"
            {...props}
        />
    </div>
)

const OnboardRadio = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
    <label onClick={onChange} className="flex items-center gap-4 cursor-pointer group py-2">
        <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 transition-colors ${checked ? 'border-cyan-400 bg-transparent' : 'border-[#1E293B] group-hover:border-[#334155]'}`}>
            {checked && <div className="w-[10px] h-[10px] rounded-full bg-cyan-400" />}
        </div>
        <span className="text-slate-200 font-medium">{label}</span>
    </label>
)

export default function MerchantOnboarding() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const [subStep, setSubStep] = useState(0)
    const [showToast, setShowToast] = useState(false)

    // Form State
    const [data, setData] = useState({
        platform: "WhatsApp, SMS, or Email",
        website: "", android: "", ios: "",
        facebook: "", x: "", instagram: "", youtube: "", linkedin: "",
        pan: "", businessName: "", gstin: "", businessType: "",
        aadhaar: "", accHolder: "", accNumber: "", ifsc: ""
    })

    const handleLogout = () => {
        logout()
        navigate("/auth")
    }

    const nextStep = () => {
        if (subStep < 9) {
            setSubStep(prev => prev + 1)
        } else {
            setShowToast(true)
            setTimeout(() => {
                navigate("/dashboard")
            }, 1500)
        }
    }

    const prevStep = () => {
        if (subStep > 0) setSubStep(prev => prev - 1)
    }

    // Determine active main step based on subStep
    // 0,1,2,3 -> Basic Details (1)
    // 4,5,6 -> Business Details (2)
    // 7,8,9 -> KYC Details (3)
    const mainStep = subStep < 4 ? 1 : subStep < 7 ? 2 : 3;

    return (
        <div className="min-h-screen bg-[#070A11] flex text-white font-sans selection:bg-blue-500/30">
            {/* Soft global glow behind sidebar */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Left Sidebar */}
            <div className="w-[300px] bg-[#080B14] border-l-[3px] border-[#00E676] border-r border-slate-800/80 flex flex-col pt-8 pb-4 relative z-10 shrink-0 shadow-2xl">
                {/* Accent line tracking the step */}
                <motion.div
                    animate={{ top: mainStep === 1 ? '160px' : mainStep === 2 ? '216px' : '272px' }}
                    className="absolute left-0 w-[3px] h-12 bg-cyan-400 transition-all duration-300 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                />

                <div className="px-6 mb-8 pt-2 border-b border-slate-800/80 pb-6">
                    <div className="flex items-center gap-3 mb-10 group cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-[#032C30] text-[#00E676] flex items-center justify-center font-bold text-sm">
                            {user?.name ? user.name.charAt(0).toUpperCase() : "O"}
                        </div>
                        <span className="text-sm font-semibold text-white">{user?.name || "okok"}</span>
                    </div>

                    <h1 className="text-xs text-slate-500 mb-1 opacity-80">Onboarding:</h1>
                    <h2 className="text-xl text-white font-bold flex items-center gap-2">
                        OkPay Payments
                    </h2>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {/* Step 1 */}
                    <button onClick={() => { if (subStep > 3) setSubStep(3) }} className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between transition-all ${mainStep === 1 ? 'bg-[#1E293B]/60 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                        <div className="flex items-center gap-3 font-semibold text-[15px]">
                            {mainStep > 1 ? (
                                <CheckCircle2 className="w-[20px] h-[20px] text-emerald-500" />
                            ) : (
                                <span className={`flex items-center justify-center w-5 h-5 border rounded-full text-[10px] ${mainStep === 1 ? 'border-white text-white' : 'border-slate-500'}`}>1</span>
                            )}
                            Basic details
                        </div>
                        {mainStep > 1 && <ChevronRight className="w-4 h-4 text-slate-600" />}
                    </button>

                    {/* Step 2 */}
                    <button disabled={subStep < 4} onClick={() => { if (subStep > 6) setSubStep(6) }} className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between transition-all ${mainStep === 2 ? 'bg-[#1E293B]/60 text-white' : 'text-slate-500'}`}>
                        <div className="flex items-center gap-3 font-semibold text-[15px]">
                            {mainStep > 2 ? (
                                <CheckCircle2 className="w-[20px] h-[20px] text-emerald-500" />
                            ) : (
                                <span className={`flex items-center justify-center w-5 h-5 border rounded-full text-[10px] border-slate-500 ${mainStep === 2 ? 'border-white text-white' : ''}`}>2</span>
                            )}
                            Business details
                        </div>
                        {mainStep > 2 && <ChevronRight className="w-4 h-4 text-slate-600" />}
                    </button>

                    {/* Step 3 */}
                    <button disabled className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all ${mainStep === 3 ? 'bg-[#1E293B]/60 text-white font-semibold' : 'text-slate-500'}`}>
                        <span className={`flex items-center justify-center w-5 h-5 border border-slate-500 rounded-full text-[10px] ${mainStep === 3 ? 'border-white text-white' : ''}`}>3</span>
                        <span className="font-semibold text-[15px]">KYC details</span>
                    </button>
                </nav>

                <div className="px-6 flex items-center justify-between mt-auto pt-6">
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <LogOut className="w-4 h-4 rotate-180" /> Logout
                    </button>
                    <button className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-700 text-slate-400 hover:text-white transition-all">
                        <HelpCircle className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-[#0B0F19] relative flex flex-col min-h-screen">
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

                {/* Header Navbar */}
                <div className="px-8 py-5 border-b border-slate-800/50 flex items-center justify-between bg-[#0B0F19]/50 backdrop-blur-md sticky top-0 z-20">
                    <button onClick={prevStep} className={`flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors ${subStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium tracking-wide">
                        <Zap className="w-4 h-4 text-cyan-500" />
                        OkPay Payments
                    </div>
                </div>

                <div className="max-w-[600px] w-full mx-auto px-8 pt-16 pb-24 flex flex-col h-full overflow-y-auto custom-scrollbar relative z-10">

                    <AnimatePresence mode="wait">

                        {/* ---------------- BASIC DETAILS ---------------- */}
                        {subStep === 0 && (
                            <motion.div key="step0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                                <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Accept Payments on</h1>
                                <p className="text-slate-400 mb-10 pb-8 border-b border-[#1E293B] leading-relaxed text-[15px]">
                                    We require this to verify the platform where you would like to accept payments.
                                </p>
                                <div className="space-y-6">
                                    <OnboardRadio label="Website" checked={data.platform === 'Website'} onChange={() => setData({ ...data, platform: 'Website' })} />
                                    <OnboardRadio label="Android App" checked={data.platform === 'Android App'} onChange={() => setData({ ...data, platform: 'Android App' })} />
                                    <OnboardRadio label="iOS App" checked={data.platform === 'iOS App'} onChange={() => setData({ ...data, platform: 'iOS App' })} />
                                    <OnboardRadio label="WhatsApp, SMS, or Email" checked={data.platform === 'WhatsApp, SMS, or Email'} onChange={() => setData({ ...data, platform: 'WhatsApp, SMS, or Email' })} />
                                    <OnboardRadio label="Social Media (like Facebook, Instagram)" checked={data.platform === 'Social Media'} onChange={() => setData({ ...data, platform: 'Social Media' })} />
                                    <OnboardRadio label="Others" checked={data.platform === 'Others'} onChange={() => setData({ ...data, platform: 'Others' })} />
                                </div>
                            </motion.div>
                        )}

                        {subStep === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                                <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Add your Website and App links</h1>
                                <p className="text-slate-400 mb-10 pb-8 border-b border-[#1E293B] leading-relaxed text-[15px]">
                                    Payment gateway integration requires your website and app links to be verified by us
                                </p>
                                <div className="space-y-8">
                                    <OnboardInput label="Website" placeholder="https://" value={data.website} onChange={e => setData({ ...data, website: e.target.value })} />
                                    <OnboardInput label="Android" placeholder="https://play.google.com/store/apps/details?id=" value={data.android} onChange={e => setData({ ...data, android: e.target.value })} />
                                    <OnboardInput label="iOS" placeholder="https://apps.apple.com/" value={data.ios} onChange={e => setData({ ...data, ios: e.target.value })} />
                                </div>
                            </motion.div>
                        )}

                        {subStep === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 flex flex-col h-full">
                                <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Add your Social Media links</h1>
                                <p className="text-slate-400 mb-8 pb-8 border-b border-[#1E293B] leading-relaxed text-[15px]">
                                    You can add any of the available links now or later.
                                </p>
                                <div className="space-y-8 pr-2">
                                    <OnboardInput label="Facebook" placeholder="https://facebook.com/" value={data.facebook} onChange={e => setData({ ...data, facebook: e.target.value })} />
                                    <OnboardInput label="X" placeholder="https://x.com/" value={data.x} onChange={e => setData({ ...data, x: e.target.value })} />
                                    <OnboardInput label="Instagram" placeholder="https://instagram.com/" value={data.instagram} onChange={e => setData({ ...data, instagram: e.target.value })} />
                                    <OnboardInput label="YouTube" placeholder="https://youtube.com/" value={data.youtube} onChange={e => setData({ ...data, youtube: e.target.value })} />
                                    <OnboardInput label="LinkedIn" placeholder="https://linkedin.com/" value={data.linkedin} onChange={e => setData({ ...data, linkedin: e.target.value })} />
                                </div>
                            </motion.div>
                        )}

                        {subStep === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                                <h1 className="text-4xl font-semibold mb-2 text-white/90 tracking-tight">Review/ Edit</h1>
                                <h2 className="text-4xl font-semibold text-cyan-400 mb-12 tracking-tight">Basic details</h2>
                                <div className="space-y-6 pr-4">
                                    <div className="border-b border-slate-800/60 pb-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1.5">Add your Name</p>
                                                <p className="text-slate-200 font-medium">{user?.name || 'Test User'}</p>
                                            </div>
                                            <button className="text-slate-500 hover:text-white transition-colors"><PenLine className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="border-b border-slate-800/60 pb-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1.5">Accept Payments on</p>
                                                <p className="text-slate-200 font-medium text-sm">{data.platform}</p>
                                            </div>
                                            <button onClick={() => setSubStep(0)} className="text-slate-500 hover:text-white transition-colors"><PenLine className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="border-b border-slate-800/60 pb-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1.5">Add your Website and App links - Website, Android, iOS</p>
                                                <p className="text-slate-500 italic font-medium text-sm">Skipped</p>
                                            </div>
                                            <button onClick={() => setSubStep(1)} className="text-slate-500 hover:text-white transition-colors"><PenLine className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="border-b border-slate-800/60 pb-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1.5">Add your Social Media links - Facebook, X, Instagram, YouTube, LinkedIn</p>
                                                <p className="text-slate-500 italic font-medium text-sm">Skipped</p>
                                            </div>
                                            <button onClick={() => setSubStep(2)} className="text-slate-500 hover:text-white transition-colors"><PenLine className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ---------------- BUSINESS DETAILS ---------------- */}
                        {subStep === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                                <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Add your Personal PAN</h1>
                                <p className="text-slate-400 mb-10 pb-8 border-b border-slate-800/50 leading-relaxed text-[15px]">
                                    We require this to verify your identity. Your details will remain safe.
                                </p>
                                <OnboardInput label="Personal PAN" placeholder="PERSONAL PAN NUMBER" value={data.pan} onChange={e => setData({ ...data, pan: e.target.value.toUpperCase() })} maxLength={10} />
                            </motion.div>
                        )}

                        {subStep === 5 && (
                            <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                                <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Business Information</h1>
                                <p className="text-slate-400 mb-10 pb-8 border-b border-slate-800/50 leading-relaxed text-[15px]">
                                    Tell us a little bit about your registered business entity.
                                </p>
                                <div className="space-y-8">
                                    <OnboardInput label="Business Name" placeholder="e.g. Acme Corporation" value={data.businessName} onChange={e => setData({ ...data, businessName: e.target.value })} />
                                    <OnboardInput label="GSTIN (Optional)" placeholder="29XXXXX0000X1Z5" value={data.gstin} onChange={e => setData({ ...data, gstin: e.target.value.toUpperCase() })} maxLength={15} />
                                    <OnboardInput label="Business Type" placeholder="e.g. Sole Proprietorship, Partnership" value={data.businessType} onChange={e => setData({ ...data, businessType: e.target.value })} />
                                </div>
                            </motion.div>
                        )}

                        {subStep === 6 && (
                            <motion.div key="step6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                                <h1 className="text-4xl font-semibold mb-2 text-white/90 tracking-tight">Review/ Edit</h1>
                                <h2 className="text-4xl font-semibold text-cyan-400 mb-12 tracking-tight">Business details</h2>
                                <div className="space-y-6 pr-4">
                                    <div className="border-b border-slate-800/60 pb-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1.5">Personal PAN</p>
                                                <p className="text-slate-200 font-medium">{data.pan || <span className="text-slate-500 italic">Not provided</span>}</p>
                                            </div>
                                            <button onClick={() => setSubStep(4)} className="text-slate-500 hover:text-white transition-colors"><PenLine className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="border-b border-slate-800/60 pb-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1.5">Business Name</p>
                                                <p className="text-slate-200 font-medium">{data.businessName || <span className="text-slate-500 italic">Not provided</span>}</p>
                                            </div>
                                            <button onClick={() => setSubStep(5)} className="text-slate-500 hover:text-white transition-colors"><PenLine className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ---------------- KYC DETAILS ---------------- */}
                        {subStep === 7 && (
                            <motion.div key="step7" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                                <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Aadhaar Verification</h1>
                                <p className="text-slate-400 mb-10 pb-8 border-b border-slate-800/50 leading-relaxed text-[15px]">
                                    Verify your Aadhaar details for fast-tracked KYC processing.
                                </p>
                                <OnboardInput label="Aadhaar Number" placeholder="XXXX XXXX XXXX" value={data.aadhaar} onChange={e => setData({ ...data, aadhaar: e.target.value })} maxLength={12} />
                            </motion.div>
                        )}

                        {subStep === 8 && (
                            <motion.div key="step8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                                <h1 className="text-3xl font-bold mb-3 text-white tracking-tight">Bank Details</h1>
                                <p className="text-slate-400 mb-10 pb-8 border-b border-slate-800/50 leading-relaxed text-[15px]">
                                    Provide the bank account where you would like to receive settlements.
                                </p>
                                <div className="space-y-8">
                                    <OnboardInput label="Account Holder Name" placeholder="Full Name exactly as per bank" value={data.accHolder} onChange={e => setData({ ...data, accHolder: e.target.value })} />
                                    <OnboardInput label="Account Number" placeholder="Your Bank Account Number" type="password" value={data.accNumber} onChange={e => setData({ ...data, accNumber: e.target.value })} />
                                    <OnboardInput label="IFSC Code" placeholder="e.g. SBIN0001234" value={data.ifsc} onChange={e => setData({ ...data, ifsc: e.target.value.toUpperCase() })} />
                                </div>
                            </motion.div>
                        )}

                        {subStep === 9 && (
                            <motion.div key="step9" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                                <h1 className="text-4xl font-semibold mb-2 text-white/90 tracking-tight">Review/ Edit</h1>
                                <h2 className="text-4xl font-semibold text-cyan-400 mb-12 tracking-tight">KYC details</h2>
                                <div className="space-y-6 pr-4">
                                    <div className="border-b border-slate-800/60 pb-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1.5">Aadhaar Number</p>
                                                <p className="text-slate-200 font-medium tracking-wide">
                                                    {data.aadhaar ? `XXXX XXXX ${data.aadhaar.slice(-4) || '0000'}` : <span className="text-slate-500 italic tracking-normal">Not provided</span>}
                                                </p>
                                            </div>
                                            <button onClick={() => setSubStep(7)} className="text-slate-500 hover:text-white transition-colors"><PenLine className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="border-b border-slate-800/60 pb-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1.5">Account Holder</p>
                                                <p className="text-slate-200 font-medium">{data.accHolder || <span className="text-slate-500 italic">Not provided</span>}</p>
                                            </div>
                                            <button onClick={() => setSubStep(8)} className="text-slate-500 hover:text-white transition-colors"><PenLine className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="border-b border-slate-800/60 pb-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1.5">Account Number</p>
                                                <p className="text-slate-200 font-medium">{data.accNumber ? '••••••••' + data.accNumber.slice(-4) : <span className="text-slate-500 italic">Not provided</span>}</p>
                                            </div>
                                            <button onClick={() => setSubStep(8)} className="text-slate-500 hover:text-white transition-colors"><PenLine className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="border-b border-slate-800/60 pb-5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-400 mb-1.5">IFSC Code</p>
                                                <p className="text-slate-200 font-medium">{data.ifsc || <span className="text-slate-500 italic">Not provided</span>}</p>
                                            </div>
                                            <button onClick={() => setSubStep(8)} className="text-slate-500 hover:text-white transition-colors"><PenLine className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    <div className="mt-8 flex gap-4 relative z-20 pt-4 max-w-[500px]">
                        {(subStep === 1 || subStep === 2) && (
                            <button onClick={nextStep} className="px-8 py-3.5 bg-transparent border border-slate-700 hover:border-slate-500 text-white font-medium rounded-xl transition-all">
                                Add later
                            </button>
                        )}
                        <button onClick={nextStep} className="flex-1 py-3.5 bg-[#3B66FF] hover:bg-[#2A4FD1] text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]">
                            {subStep === 9 ? 'Complete Onboarding' : 'Continue'}
                        </button>
                    </div>

                </div>
            </div>

            {/* Completion Toast */}
            {showToast && (
                <div className="fixed bottom-6 right-6 bg-slate-900 border border-emerald-500/50 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span className="text-[15px] font-medium tracking-wide">Onboarding complete! Welcome to OKPay.</span>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #1e293b; border-radius: 20px; }
            `}} />
        </div>
    )
}
