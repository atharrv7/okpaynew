# OKPay Firestore Database Schema

## Collections

### `users`
- `uid` (string) - Unique identifier (Firebase Auth)
- `email` (string) - User email
- `phoneNumber` (string)
- `name` (string)
- `kycStatus` (string) - "pending", "approved", "rejected"
- `kycDetails` (object) - PAN, Bank Details
- `balance` (number) - Wallet or primary balance
- `role` (string) - "user", "merchant", "admin"
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### `transactions`
- `transactionId` (string) - Unique TXN id (e.g. TXN1234)
- `senderId` (string) - Reference to users collection
- `receiverId` (string) - Reference to users collection or merchant
- `amount` (number)
- `type` (string) - "send", "receive", "add_money", "withdrawal"
- `paymentMethod` (string) - "upi", "debit_card", "credit_card", "netbanking", "wallet"
- `status` (string) - "pending", "success", "failed"
- `description` (string) - Product/Order description
- `errorMessage` (string) - If failed
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### `payments`
- `paymentId` (string)
- `gatewayTxnId` (string) - ID from external payment gateway (if any)
- `transactionId` (string) - Reference to internal transactions collection
- `amount` (number)
- `fee` (number) - Processing fee
- `status` (string)
- `createdAt` (timestamp)

### `notifications`
- `notificationId` (string)
- `userId` (string) - Reference to users collection
- `title` (string)
- `message` (string)
- `type` (string) - "transaction", "system", "security"
- `read` (boolean)
- `createdAt` (timestamp)

### `audit_logs`
- `logId` (string)
- `action` (string) - "login", "kyc_update", "password_change"
- `userId` (string)
- `ipAddress` (string)
- `userAgent` (string)
- `createdAt` (timestamp)
- `metadata` (object)
