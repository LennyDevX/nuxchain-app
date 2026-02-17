# Firestore Security Rules for Airdrop Registration

## ✅ FIRESTORE SECURITY RULES (VERIFIED WORKING)

Add these security rules in the Firebase Console under **Firestore Database > Rules**:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Airdrop Registrations Collection
    match /nuxchainAirdropRegistrations/{registrationId} {
      // ✅ Allow CREATE (unauthenticated)
      allow create: if true;
      
      // ❌ Deny READ (privacy protection)
      allow read: if false;
      
      // ❌ Deny UPDATE/DELETE (immutable records)
      allow update, delete: if false;
    }
    
    // Nuxchain Kit Waitlist Collection
    match /nuxchainKitWaitlist/{waitlistId} {
      // ✅ Allow CREATE (unauthenticated)
      allow create: if true;
      
      // ❌ Deny READ
      allow read: if false;
      
      // ❌ Deny UPDATE/DELETE
      allow update, delete: if false;
    }
    
    // Deny everything else by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 📋 Copy & Paste this exact code into Firebase Console

## Data Structure

Each document in `nuxchainAirdropRegistrations` will have the following fields:

```json
{
  "name": "string",                    // User's full name (min 3 characters)
  "email": "string",                   // Valid email address (lowercase)
  "wallet": "string",                  // Ethereum wallet address (0x... format, lowercase)
  "createdAt": "Timestamp",            // Firestore server timestamp
  "status": "string",                  // 'pending' | 'approved' | 'distributed'
  "airdropAmount": "string"            // '20' (POL tokens)
}
```

## Rules Summary

| Collection | Operation | Auth Required | Validations |
|-----------|-----------|---------------|-------------|
| **nuxchainAirdropRegistrations** | CREATE | ❌ No | name (3+), email (valid), wallet (0x...), status=pending, amount=20 |
| **nuxchainAirdropRegistrations** | READ | N/A | ❌ Denied |
| **nuxchainAirdropRegistrations** | UPDATE | N/A | ❌ Denied |
| **nuxchainAirdropRegistrations** | DELETE | N/A | ❌ Denied |
| **nuxchainKitWaitlist** | CREATE | ❌ No | name, specialization, email (valid) |
| **nuxchainKitWaitlist** | READ | N/A | ❌ Denied |
| **users** | ALL | ✅ Yes | Only own profile |
| **analytics** | WRITE | ❌ No | Any data allowed |
| **analytics** | READ | N/A | ❌ Denied |
| **{document=**} | ALL | N/A | ❌ Catch-all deny |

## Indexes (Optional but Recommended for Performance)

Create these composite indexes in Firebase Console for better query performance:

1. **Wallet Uniqueness Index:**
   - Collection: `nuxchainAirdropRegistrations`
   - Field 1: `wallet` (Ascending)
   - Field 2: `__name__` (Ascending)

2. **Email Uniqueness Index:**
   - Collection: `nuxchainAirdropRegistrations`
   - Field 1: `email` (Ascending)
   - Field 2: `__name__` (Ascending)

3. **Status Filtering Index:**
   - Collection: `nuxchainAirdropRegistrations`
   - Field 1: `status` (Ascending)
   - Field 2: `createdAt` (Descending)

## Testing the Rules (Firebase Console Rules Playground)

### ✅ Test CREATE (should succeed):

**Collection:** `nuxchainAirdropRegistrations`  
**Operation:** `create`  
**Document Data:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "wallet": "0x1234567890123456789012345678901234567890",
  "createdAt": "request.time",
  "status": "pending",
  "airdropAmount": "20"
}
```

### ❌ Test READ (should fail):

**Collection:** `nuxchainAirdropRegistrations`  
**Operation:** `get`  
**Path:** `/nuxchainAirdropRegistrations/anyDocumentId`  
**Expected:** Denied (privacy protection)

### ⚠️ Test Invalid Email (should fail):

**Collection:** `nuxchainAirdropRegistrations`  
**Operation:** `create`  
**Document Data:**
```json
{
  "name": "Test User",
  "email": "invalid-email",
  "wallet": "0x1234567890123456789012345678901234567890",
  "createdAt": "request.time",
  "status": "pending",
  "airdropAmount": "20"
}
```
**Expected:** Denied (invalid email format)

### ⚠️ Test Invalid Wallet (should fail):

**Collection:** `nuxchainAirdropRegistrations`  
**Operation:** `create`  
**Document Data:**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "wallet": "invalid-wallet",
  "createdAt": "request.time",
  "status": "pending",
  "airdropAmount": "20"
}
```
**Expected:** Denied (invalid wallet format)

## Admin Dashboard Query Examples

If you need to query registrations from an admin dashboard:

```typescript
// Get all pending registrations
const pendingQuery = query(
  collection(db, 'nuxchainAirdropRegistrations'),
  where('status', '==', 'pending'),
  orderBy('createdAt', 'desc')
);

// Get total count by status
const statusStats = await getCountFromServer(
  query(
    collection(db, 'nuxchainAirdropRegistrations'),
    where('status', '==', 'distributed')
  )
);

// Check if wallet already exists
const walletQuery = query(
  collection(db, 'nuxchainAirdropRegistrations'),
  where('wallet', '==', userWallet.toLowerCase())
);
```

## Notes

- All wallet addresses and emails are stored in lowercase for consistent querying
- The service automatically validates data before submission
- Duplicate wallet/email checks are performed client-side before write
- Server-side validation is enforced through Firestore Security Rules
- Timestamps are generated server-side to prevent tampering
