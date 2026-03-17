import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import MerchantDashboard from "./pages/merchant/MerchantDashboard"
import MerchantOnboarding from "./pages/merchant/onboarding/MerchantOnboarding"
import AdminDashboard from "./pages/admin/AdminDashboard"
import { DashboardLayout } from "./components/layout/DashboardLayout"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/layout/ProtectedRoute"
import { BankProvider } from "./contexts/BankContext"
import BankLinking from "./pages/setup/BankLinking"
import UpiSetup from "./pages/setup/UpiSetup"
import SendMoney from "./pages/payment/SendMoney"
import ReceiveMoney from "./pages/payment/ReceiveMoney"
import BankLogin from "./pages/payment/BankLogin"
import BankConfirmation from "./pages/payment/BankConfirmation"
import OtpVerification from "./pages/payment/OtpVerification"
import Processing from "./pages/payment/Processing"
import PinVerification from "./pages/payment/PinVerification"
import Success from "./pages/payment/Success"
import TransactionHistory from "./pages/payment/TransactionHistory"
import PayLink from "./pages/payment/PayLink"
import PaySuccess from "./pages/payment/PaySuccess"
import Landing from "./pages/Landing"
import KycVerification from "./pages/setup/KycVerification"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#020817] text-white font-sans selection:bg-primary/30">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Public Payment Link Routes (no auth needed) */}
            <Route path="/pay/success" element={<PaySuccess />} />
            <Route path="/pay/:linkId" element={<PayLink />} />

            {/* Setup / KYC Routes */}
            <Route path="/setup/kyc" element={
              <ProtectedRoute>
                <KycVerification />
              </ProtectedRoute>
            } />

            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <BankProvider>
                  <DashboardLayout />
                </BankProvider>
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="link-bank" element={<BankLinking />} />
              <Route path="setup-upi" element={<UpiSetup />} />
              <Route path="send" element={<SendMoney />} />
              <Route path="bank-login" element={<BankLogin />} />
              <Route path="bank-confirmation" element={<BankConfirmation />} />
              <Route path="pin" element={<PinVerification />} />
              <Route path="otp" element={<OtpVerification />} />
              <Route path="receive" element={<ReceiveMoney />} />
              <Route path="processing" element={<Processing />} />
              <Route path="success" element={<Success />} />

              <Route path="mobile" element={<div className="p-4"><h1 className="text-2xl font-bold mb-4">Mobile Recharge</h1><p className="text-slate-400">Select Operator...</p></div>} />
              <Route path="dth" element={<div className="p-4"><h1 className="text-2xl font-bold mb-4">DTH Recharge</h1><p className="text-slate-400">Select Provider...</p></div>} />
              <Route path="transactions" element={<TransactionHistory />} />
              <Route path="*" element={<div className="text-center py-20 text-slate-500">Feature Coming Soon</div>} />
            </Route>

            {/* Merchant Routes */}
            <Route path="/merchant/onboarding" element={
              <ProtectedRoute>
                <MerchantOnboarding />
              </ProtectedRoute>
            } />

            <Route path="/merchant" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<MerchantDashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
            </Route>

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
