import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [name, setName] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    // Auth Context
    const { login, register, loginWithGoogle } = useAuth()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!isLogin && password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)

        try {
            let loggedInUser;
            if (isLogin) {
                loggedInUser = await login(email, password)
            } else {
                loggedInUser = await register({
                    name,
                    email,
                    phone: "0000000000", // Default phone for simple signup
                    password,
                    role: 'user'
                })
            }

            if (loggedInUser.role === 'admin') {
                navigate("/admin")
            } else if (!loggedInUser.kycComplete) {
                navigate("/setup/kyc")
            } else {
                navigate("/dashboard")
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Something went wrong")
            } else {
                setError("Something went wrong")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setError("")
        setLoading(true)
        try {
            const loggedInUser = await loginWithGoogle()
            if (loggedInUser.role === 'admin') {
                navigate("/admin")
            } else if (!loggedInUser.kycComplete) {
                navigate("/setup/kyc")
            } else {
                navigate("/dashboard")
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Failed to sign in with Google")
            } else {
                setError("Failed to sign in with Google")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#020817]">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Error Toast */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center gap-3 mb-6"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 mb-6 group transition-transform hover:scale-110">
                        <Lock className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">OkPay</h1>
                    <p className="text-slate-500 text-sm">Sign in or create an account to continue</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#121A2F]/50 backdrop-blur-xl border border-slate-800/80 p-8 rounded-[32px] shadow-2xl"
                >
                    {/* Toggle Tabs */}
                    <div className="flex p-1 bg-[#060A14] rounded-2xl mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLogin ? 'bg-[#1E293B] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLogin ? 'bg-[#1E293B] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden space-y-5"
                                >
                                    <Input
                                        label="Full Name"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="relative">
                            <Input
                                label={isLogin ? "Password" : "Create Password"}
                                type={showPassword ? "text" : "password"}
                                placeholder={isLogin ? "Enter your password" : "Min. 8 characters"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[42px] text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {!isLogin && (
                            <Input
                                label="Confirm Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Repeat your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        )}

                        {isLogin && (
                            <div className="flex justify-end">
                                <a href="#" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                                    Forgot password?
                                </a>
                            </div>
                        )}

                        <Button className="w-full h-12 mt-2 bg-cyan-400 hover:bg-cyan-300 text-[#020817]" size="lg" loading={loading} type="submit">
                            {isLogin ? "Sign In" : "Create Account"}
                        </Button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                            <span className="bg-[#121A2F] px-4 text-slate-500">or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full h-12 rounded-xl bg-[#0B0F19] border border-white/5 text-white text-sm font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>
                </motion.div>

                <p className="mt-8 text-center text-slate-500 text-sm">
                    © 2026 OkPay. Secure & reliable payments.
                </p>
            </div>
        </div>
    )
}

