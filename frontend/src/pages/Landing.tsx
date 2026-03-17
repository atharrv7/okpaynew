import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
    ArrowRight,
    CreditCard,
    Smartphone,
    Globe,
    Zap,
    ShieldCheck,
    BarChart3,
    Link as LinkIcon,
    LayoutTemplate,
    CheckCircle2,
    Wallet
} from "lucide-react"

const NavLink = ({ children }: { children: React.ReactNode }) => (
    <a href="#" className="text-[15px] font-medium text-slate-400 hover:text-white transition-colors">
        {children}
    </a>
)

const FeatureCard = ({ icon: Icon, title, desc, badge }: { icon: React.ElementType, title: string, desc: string, badge?: string }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-[#121A2F]/50 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl hover:bg-slate-800/40 transition-all group cursor-pointer"
    >
        <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center group-hover:bg-cyan-400/10 transition-colors">
                <Icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
            </div>
            {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge === 'NEW' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                    {badge}
                </span>
            )}
        </div>
        <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-400 transition-colors">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
)

export default function Landing() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const handleGetStarted = () => {
        if (user) {
            navigate("/dashboard")
        } else {
            navigate("/auth")
        }
    }

    return (
        <div className="min-h-screen bg-[#020817] text-white">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-slate-800/50 bg-[#020817]/80 backdrop-blur-lg">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                            <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
                                <span className="text-[#020817] font-bold text-xl">₹</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">OkPay</span>
                        </div>
                        <div className="hidden lg:flex items-center gap-6">
                            <NavLink>Payments</NavLink>
                            <NavLink>Banking+</NavLink>
                            <NavLink>Payroll</NavLink>
                            <NavLink>Resources</NavLink>
                            <NavLink>Pricing</NavLink>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/auth")}
                            className="bg-cyan-400 hover:bg-cyan-300 text-[#020817] px-6 py-2.5 rounded-full font-bold text-[15px] flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95"
                        >
                            Dashboard <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-cyan-400 text-xs font-bold tracking-wider mb-8">
                            <Zap className="w-3 h-3 fill-cyan-400" />
                            INDIA'S #1 PAYMENT GATEWAY
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 tracking-tight">
                            <span className="text-cyan-400">Advanced</span> <br />
                            Payment Solutions <br />
                            <span className="text-slate-400">for India's boldest businesses</span>
                        </h1>
                        <p className="text-slate-400 text-lg mb-10 max-w-lg">
                            100+ Payment Methods | Easy Integration | Powerful Dashboard | Instant Settlements
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleGetStarted}
                                className="px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-[#020817] font-bold rounded-xl text-lg transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                            >
                                Get Started Now
                            </button>
                            <button className="px-8 py-4 bg-transparent border border-slate-800 hover:bg-slate-800/50 text-white font-bold rounded-xl text-lg transition-colors">
                                Contact Sales
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        <FeatureCard icon={CreditCard} title="Payment Gateway" desc="Payments on your Website/App..." />
                        <FeatureCard icon={Smartphone} title="UPI Payments" desc="Discover the complete UPI..." badge="NEW" />
                        <FeatureCard icon={LinkIcon} title="Payment Links" desc="Create & send links to..." />
                        <FeatureCard icon={LayoutTemplate} title="Payment Pages" desc="Multi-feature pages for..." />
                        <FeatureCard icon={Globe} title="International Payments" desc="Accept payments from..." />
                        <FeatureCard icon={BarChart3} title="Smart Analytics" desc="Powerful insights for you..." />
                    </motion.div>
                </div>
            </main>

            {/* Features Section */}
            <section className="py-32 px-6 bg-[#030a1c]">
                <div className="max-w-7xl mx-auto text-center mb-20">
                    <h2 className="text-5xl font-bold mb-4">
                        Accept Payments <span className="text-cyan-400">Everywhere</span>
                    </h2>
                    <p className="text-slate-400 text-lg">Everything you need to accept payments and grow your business</p>
                </div>

                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
                    <FeatureCard icon={Smartphone} title="UPI Payments" desc="Instant UPI transfers with all major apps" badge="POPULAR" />
                    <FeatureCard icon={CreditCard} title="Card Payments" desc="Accept Visa, Mastercard, RuPay cards" />
                    <FeatureCard icon={Wallet} title="Wallets" desc="Paytm, PhonePe, Amazon Pay & more" />
                    <FeatureCard icon={LayoutTemplate} title="Net Banking" desc="All major Indian banks supported" />
                    <FeatureCard icon={Globe} title="International" desc="Accept payments from across the globe" badge="NEW" />
                    <FeatureCard icon={Zap} title="Instant Settlement" desc="Get payments settled faster" />
                </div>
            </section>

            {/* Security Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto bg-[#121A2F]/30 backdrop-blur-md rounded-[32px] border border-slate-800/50 p-12 text-center">
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                            <ShieldCheck className="w-10 h-10 text-cyan-400" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-4">Trusted by Businesses Across India</h2>
                    <p className="text-slate-400 text-lg mb-12">PCI DSS Level 1 compliant | 256-bit encryption | RBI authorized</p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex items-center gap-2 px-6 py-3 bg-slate-800/30 rounded-full border border-slate-800/50 text-slate-300 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PCI DSS
                        </div>
                        <div className="flex items-center gap-2 px-6 py-3 bg-slate-800/30 rounded-full border border-slate-800/50 text-slate-300 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 256-bit SSL
                        </div>
                        <div className="flex items-center gap-2 px-6 py-3 bg-slate-800/30 rounded-full border border-slate-800/50 text-slate-300 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> RBI Compliant
                        </div>
                        <div className="flex items-center gap-2 px-6 py-3 bg-slate-800/30 rounded-full border border-slate-800/50 text-slate-300 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2FA Secured
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-800/50">
                <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-cyan-400 rounded flex items-center justify-center">
                                <span className="text-[#020817] font-bold text-sm">₹</span>
                            </div>
                            <span className="font-bold">OkPay</span>
                        </div>
                        <span className="text-slate-500 text-sm">© 2026 All rights reserved</span>
                    </div>
                    <div className="flex items-center gap-8 text-sm text-slate-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

