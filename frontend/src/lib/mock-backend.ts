import type { BankAccount, MockDatabase, Transaction, UpiId, User } from "./types";

const DB_KEY = 'damnpay_db_v1';

const INITIAL_DB: MockDatabase = {
    users: [],
    bankAccounts: [],
    upiIds: [],
    transactions: []
};

// Helper: Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockBackendService {
    private db: MockDatabase;

    constructor() {
        const stored = localStorage.getItem(DB_KEY);
        this.db = stored ? JSON.parse(stored) : INITIAL_DB;
    }

    private save() {
        localStorage.setItem(DB_KEY, JSON.stringify(this.db));
    }

    // --- AUTH ---
    async login(email: string, password: string): Promise<User> {
        await delay(800);
        const user = this.db.users.find(u => u.email === email && u.password === password);
        if (!user) throw new Error("Invalid credentials");
        return user;
    }

    async register(userData: Omit<User, 'id' | 'createdAt' | 'isVerified'>): Promise<User> {
        await delay(1000);
        if (this.db.users.some(u => u.email === userData.email)) {
            throw new Error("Email already exists");
        }

        const newUser: User = {
            ...userData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            isVerified: false,
            role: 'user' // Default to user
        };

        this.db.users.push(newUser);
        this.save();
        return newUser;
    }

    async syncExternalUser(user: User): Promise<User> {
        const index = this.db.users.findIndex(u => u.id === user.id || u.email === user.email);
        if (index !== -1) {
            return this.db.users[index]; // Return existing user which has kycComplete etc.
        }
        this.db.users.push(user);
        this.save();
        return user;
    }

    async updateUser(userId: string, updates: Partial<User>): Promise<User> {
        await delay(500);
        const index = this.db.users.findIndex(u => u.id === userId);
        if (index === -1) {
            // Might be a Google Auth user, let's add them
            const newUser = { id: userId, ...updates } as User;
            this.db.users.push(newUser);
            this.save();
            return newUser;
        }
        
        const updatedUser = { ...this.db.users[index], ...updates };
        this.db.users[index] = updatedUser;
        this.save();
        return updatedUser;
    }

    // --- BANKING ---
    async addBankAccount(userId: string, bankData: Omit<BankAccount, 'id' | 'userId' | 'balance' | 'isVerified'>): Promise<BankAccount> {
        await delay(1200); // Bank verification delay

        // Simulate balance between 1k and 50k
        const simulatedBalance = Math.floor(Math.random() * 49000) + 1000;

        const newBank: BankAccount = {
            ...bankData,
            id: crypto.randomUUID(),
            userId,
            balance: simulatedBalance,
            isVerified: true, // Auto verify for demo
            isDefault: !this.db.bankAccounts.some(b => b.userId === userId) // First bank is default
        };

        this.db.bankAccounts.push(newBank);
        this.save();
        return newBank;
    }

    async getUserBanks(userId: string): Promise<BankAccount[]> {
        await delay(500);
        return this.db.bankAccounts.filter(b => b.userId === userId);
    }

    // --- UPI ---
    async createUpiId(userId: string, handle: string, bankId: string): Promise<UpiId> {
        await delay(800);

        if (this.db.upiIds.some(u => u.handle === handle)) {
            throw new Error("UPI Handle already taken");
        }

        const newUpi: UpiId = {
            id: crypto.randomUUID(),
            userId,
            handle,
            linkedBankId: bankId,
            isActive: true
        };

        this.db.upiIds.push(newUpi);
        this.save();
        return newUpi;
    }

    // --- TRANSACTIONS ---
    async processPayment(txnData: Omit<Transaction, 'id' | 'timestamp' | 'status'>): Promise<Transaction> {
        await delay(2000); // Payment processing delay

        // Validation (Mock)
        // In a real app we'd check balances here.

        // Random failure chance (5%) for realism
        const isSuccess = Math.random() > 0.05;

        const newTxn: Transaction = {
            ...txnData,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            status: isSuccess ? 'success' : 'failed'
        };

        this.db.transactions.unshift(newTxn);

        if (isSuccess) {
            // Update balances
            // const senderBank = this.db.bankAccounts.find(b => b.userId === txnData.senderId); // simplified logic
            // In full version, we'd need to find specific source bank.
            // For MVP, we just track the record.
        }

        this.save();
        return newTxn;
    }

    async getHistory(userId: string): Promise<Transaction[]> {
        await delay(600);
        return this.db.transactions.filter(t => t.senderId === userId || t.receiverId === userId);
    }

    async getUpiIds(userId: string): Promise<UpiId[]> {
        await delay(400);
        return this.db.upiIds.filter(u => u.userId === userId);
    }
}

export const MockBackend = new MockBackendService();
