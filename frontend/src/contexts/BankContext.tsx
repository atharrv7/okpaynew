import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { BankAccount, UpiId } from "../lib/types";
import { MockBackend } from "../lib/mock-backend";
import { useAuth } from "./AuthContext";

interface BankContextType {
    banks: BankAccount[];
    upiIds: UpiId[];
    isLoading: boolean;
    addBank: (data: Omit<BankAccount, "id" | "userId" | "balance" | "isVerified">) => Promise<void>;
    createUpi: (handle: string, bankId: string) => Promise<void>;
    refreshData: () => Promise<void>;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export function BankProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [upiIds, setUpiIds] = useState<UpiId[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshData = useCallback(async () => {
        if (!user) {
            setBanks([]);
            setUpiIds([]);
            return;
        }
        setIsLoading(true);
        try {
            const [userBanks, userUpiIds] = await Promise.all([
                MockBackend.getUserBanks(user.id),
                MockBackend.getUpiIds(user.id)
            ]);
            setBanks(userBanks);
            setUpiIds(userUpiIds);
        } catch (error) {
            console.error("Failed to fetch bank data", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const addBank = async (data: Omit<BankAccount, "id" | "userId" | "balance" | "isVerified">) => {
        if (!user) return;
        await MockBackend.addBankAccount(user.id, data);
        await refreshData();
    };

    const createUpi = async (handle: string, bankId: string) => {
        if (!user) return;
        await MockBackend.createUpiId(user.id, handle, bankId);
        await refreshData();
    };

    return (
        <BankContext.Provider value={{ banks, upiIds, isLoading, addBank, createUpi, refreshData }}>
            {children}
        </BankContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBank = () => {
    const context = useContext(BankContext);
    if (!context) throw new Error("useBank must be used within BankProvider");
    return context;
};
