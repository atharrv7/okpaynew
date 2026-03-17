import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { AtSign, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/Button"
// import { Input } from "../../components/ui/Input"
import { useBank } from "../../contexts/BankContext"

export default function UpiSetup() {
    const navigate = useNavigate()
    const { banks, createUpi } = useBank()

    const [handle, setHandle] = useState("")
    const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id || "")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        if (!selectedBankId) {
            setError("Please link a bank account first")
            setLoading(false)
            return
        }

        try {
            await createUpi(handle + "@damnpay", selectedBankId)
            navigate("/dashboard")
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Failed to create UPI ID")
            } else {
                setError("Failed to create UPI ID")
            }
        } finally {
            setLoading(false)
        }
    }

    if (banks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
                <div className="bg-slate-800 p-4 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">No Bank Account Found</h2>
                <p className="text-slate-400 mb-6 max-w-sm">You need to link a bank account before you can create a UPI ID.</p>
                <Button onClick={() => navigate("/dashboard/link-bank")}>
                    Link Bank Account
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-xl mx-auto py-10">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
                    Create ID
                </h1>
                <p className="text-slate-400">
                    Claim your unique payment identity.
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-3xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Choose your Handle</label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-slate-400">
                                <AtSign className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ""))}
                                placeholder="yourname"
                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-4 pl-10 pr-24 text-lg font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:font-normal"
                                required
                                minLength={3}
                            />
                            <div className="absolute right-4 text-slate-500 font-medium select-none">
                                @damnpay
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 ml-1">Only letters, numbers, and dots allowed.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Link to Bank</label>
                        <div className="grid grid-cols-1 gap-2">
                            {banks.map(bank => (
                                <div
                                    key={bank.id}
                                    onClick={() => setSelectedBankId(bank.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedBankId === bank.id
                                        ? "bg-primary/20 border-primary/50"
                                        : "bg-slate-800/30 border-slate-700 hover:bg-slate-800"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                                            {bank.bankName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{bank.bankName}</p>
                                            <p className="text-xs text-slate-500">•••• {bank.accountNumber.slice(-4)}</p>
                                        </div>
                                    </div>
                                    {selectedBankId === bank.id && (
                                        <CheckCircle2 className="w-5 h-5 text-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <Button size="lg" className="w-full h-12 text-base shadow-xl shadow-primary/20" loading={loading}>
                        Create UPI ID
                    </Button>
                </form>
            </motion.div>
        </div>
    )
}
