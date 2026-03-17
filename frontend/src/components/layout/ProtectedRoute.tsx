import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#020817] text-white">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    if (user.role === 'user' && !user.kycComplete && location.pathname !== "/setup/kyc") {
        return <Navigate to="/setup/kyc" replace />;
    }

    return <>{children}</>;
}
