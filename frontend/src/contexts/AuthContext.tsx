import React, { createContext, useContext, useState } from "react";
import { type User } from "../lib/types";
import { MockBackend } from "../lib/mock-backend";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (e: string, p: string) => Promise<User>;
    loginWithGoogle: () => Promise<User>;
    register: (d: Omit<User, "id" | "createdAt" | "isVerified">) => Promise<User>;
    logout: () => void;
    updateUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("damnpay_session_user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isLoading] = useState(false);

    const login = async (email: string, pass: string) => {
        const user = await MockBackend.login(email, pass);
        setUser(user);
        localStorage.setItem("damnpay_session_user", JSON.stringify(user));
        return user;
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;

        const mappedUser: User = {
            id: fbUser.uid,
            // Match the requested name mapping for screenshot 1:1 clone
            name: (fbUser.displayName && fbUser.displayName !== "null") ? fbUser.displayName.toLowerCase() : "anuroop",
            email: fbUser.email || "ok@gmail.com",
            phone: fbUser.phoneNumber || "0000000000",
            role: "user",
            createdAt: new Date().toISOString(),
            isVerified: true
        };

        const syncedUser = await MockBackend.syncExternalUser(mappedUser);

        setUser(syncedUser);
        localStorage.setItem("damnpay_session_user", JSON.stringify(syncedUser));
        return syncedUser;
    };

    const register = async (data: Omit<User, "id" | "createdAt" | "isVerified">) => {
        const result = await MockBackend.register(data);
        const mappedUser: User = {
            ...result,
            name: data.name ? data.name.toLowerCase() : "anuroop"
        };
        setUser(mappedUser);
        localStorage.setItem("damnpay_session_user", JSON.stringify(mappedUser));
        return mappedUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("damnpay_session_user");
    };

    const updateUser = async (updated: User) => {
        const result = await MockBackend.updateUser(updated.id, updated);
        setUser(result);
        localStorage.setItem("damnpay_session_user", JSON.stringify(result));
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
