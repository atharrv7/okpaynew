export type UserRole = 'user' | 'merchant' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string; // stored for mock auth only
    role: UserRole;
    createdAt: string;
    isVerified: boolean;
    kycComplete?: boolean;
    avatar?: string;
}

export interface BankAccount {
    id: string;
    userId: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    balance: number;
    isDefault: boolean;
    isVerified: boolean;
}

export interface UpiId {
    id: string;
    userId: string;
    handle: string; // e.g., atharv@damnpay
    linkedBankId: string;
    isActive: boolean;
}

export type TransactionStatus = 'success' | 'failed' | 'pending' | 'refunded';
export type TransactionType = 'send' | 'request' | 'bill' | 'recharge' | 'merchant';

export interface Transaction {
    id: string;
    senderId: string;
    receiverId: string;
    amount: number;
    note?: string;
    status: TransactionStatus;
    type: TransactionType;
    timestamp: string;
    metadata?: Record<string, unknown>; // For bills, recharge details etc.
}

export interface MockDatabase {
    users: User[];
    bankAccounts: BankAccount[];
    upiIds: UpiId[];
    transactions: Transaction[];
}
