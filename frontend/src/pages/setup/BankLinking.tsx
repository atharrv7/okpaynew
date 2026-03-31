import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Shield } from "lucide-react"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { useBank } from "../../contexts/BankContext"

const POPULAR_BANKS = [
    { id: "sbi", name: "State Bank of India", color: "bg-[#280071]" },
    { id: "hdfc", name: "HDFC Bank", color: "bg-[#004c8f]" },
    { id: "icici", name: "ICICI Bank", color: "bg-[#f37e20]" },
    { id: "axis", name: "Axis Bank", color: "bg-[#97144d]" },
]

export default function BankLinking() {
    const navigate = useNavigate()
    const { addBank } = useBank()

    const [step, setStep] = useState(1)
    const [selectedBank, setSelectedBank] = useState<typeof POPULAR_BANKS[0] | null>(null)
    const [loading, setLoading] = useState(false)

    const [accountNo, setAccountNo] = useState("")
    const [ifsc, setIfsc] = useState("")

    const handleBankSelect = (bank: typeof POPULAR_BANKS[0]) => {
        setSelectedBank(bank)
        setStep(2)
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedBank) return;
        setLoading(true)

        try {
            await addBank({
                bankName: selectedBank.name,
                accountNumber: accountNo,
                ifsc: ifsc,
                isDefault: true
            })
            navigate("/dashboard")
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                    Link Bank Account
                </h1>
                <p className="text-slate-400">
                    Securely link your bank account to start making UPI payments.
                </p>
            </div>

            <div className="glass-card p-6 rounded-2xl">
                {step === 1 ? (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-200 mb-4">Select your Bank</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {POPULAR_BANKS.map((bank) => (
                                <button
                                    key={bank.id}
                                    onClick={() => handleBankSelect(bank)}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-primary hover:bg-slate-800 transition-all group text-left"
                                >
                                    <div className={`w-10 h-10 rounded-full ${bank.color} flex items-center justify-center text-white font-bold text-xs`}>
                                        {bank.id.toUpperCase()}
                                    </div>
                                    <div>
                                        <span className="block font-medium text-slate-200 group-hover:text-white">{bank.name}</span>
                                        <span className="text-xs text-slate-500">Instant Verification</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 ml-auto text-slate-600 group-hover:text-primary" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onSubmit={handleVerify}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg text-indigo-300 text-sm mb-6">
                            <Shield className="w-5 h-5 flex-shrink-0" />
                            Your details are encrypted and verified securely with {selectedBank?.name}.
                        </div>

                        <div className="space-y-4">
                            <Input
                                label="Account Number"
                                placeholder="XXXXXXXXXXXX"
                                value={accountNo}
                                onChange={e => setAccountNo(e.target.value.replace(/\D/g, '').slice(0, 18))}
                                required
                            />
                            <Input
                                label="IFSC Code"
                                placeholder="SBIN000XXXX"
                                value={ifsc}
                                onChange={e => setIfsc(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                                Back
                            </Button>
                            <Button type="submit" className="flex-1" loading={loading}>
                                {loading ? "Verifying..." : "Verify & Link Account"}
                            </Button>
                        </div>
                    </motion.form>
                )}
            </div>
        </div>
    )
}
