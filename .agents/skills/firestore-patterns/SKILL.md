---
name: firestore-patterns
description: Work with Firestore in NuxChain. Use when user says "Firestore", "database", "save user data", "read from DB", "collection", "document", "Firebase", "airdrop data", "user profile", "analytics", or any data persistence task. Provides collection structure, security rules patterns, and query examples.
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Firestore Patterns Skill

Work with Firestore following NuxChain's data structure and security rules.

## Firebase Config Files

```
firebase.json              ← Firebase project config
firestore.rules            ← Security rules (ALWAYS update when adding collections)
firestore.indexes.json     ← Composite indexes for complex queries
```

## Firestore Initialization (Frontend)

```typescript
// src/utils/firebase.ts or similar
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Values from VITE_FIREBASE_* env vars
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

## Firebase Admin (Backend / API endpoints)

```typescript
// In api/ endpoints — uses serviceAccountKey.json or env vars
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const adminApp = initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)),
});
export const adminDb = getFirestore(adminApp);
```

## Collection Structure

```
users/
  {walletAddress}/           ← Document ID = wallet address (lowercase)
    address: string
    createdAt: Timestamp
    lastSeen: Timestamp
    profile: {
      username?: string
      avatar?: string
    }
    stats: {
      totalStaked: number
      totalRewards: number
      nftCount: number
    }

airdrop/
  registrations/
    {walletAddress}/
      address: string
      registeredAt: Timestamp
      eligible: boolean
      amount: number
      claimed: boolean
      claimedAt?: Timestamp

analytics/
  events/
    {eventId}/
      type: string           ← 'page_view' | 'wallet_connect' | 'stake' | etc.
      userId?: string
      timestamp: Timestamp
      metadata: object

chat/
  sessions/
    {sessionId}/
      userId: string
      createdAt: Timestamp
      messages: subcollection

skills/
  {skillId}/
    name: string
    owner: string            ← wallet address
    level: number
    xp: number
```

## CRUD Patterns

### Read a document
```typescript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const getUserData = async (address: string) => {
  const ref = doc(db, 'users', address.toLowerCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
};
```

### Write / Update a document
```typescript
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Create or overwrite
await setDoc(doc(db, 'users', address.toLowerCase()), {
  address: address.toLowerCase(),
  createdAt: serverTimestamp(),
  lastSeen: serverTimestamp(),
}, { merge: true }); // merge: true = don't overwrite existing fields

// Partial update
await updateDoc(doc(db, 'users', address.toLowerCase()), {
  lastSeen: serverTimestamp(),
  'stats.totalStaked': newAmount,
});
```

### Query a collection
```typescript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const getEligibleAirdrops = async () => {
  const q = query(
    collection(db, 'airdrop', 'registrations'),
    where('eligible', '==', true),
    where('claimed', '==', false),
    orderBy('registeredAt', 'desc'),
    limit(100)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
```

### Real-time listener
```typescript
import { onSnapshot, doc } from 'firebase/firestore';

useEffect(() => {
  if (!address) return;
  const unsub = onSnapshot(doc(db, 'users', address.toLowerCase()), (snap) => {
    if (snap.exists()) setUserData(snap.data());
  });
  return () => unsub(); // cleanup
}, [address]);
```

## Security Rules Pattern

When adding a new collection, update `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Airdrop: anyone can register, only admin can update eligibility
    match /airdrop/registrations/{address} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false; // admin only via backend
    }

    // Analytics: write-only from authenticated users
    match /analytics/events/{eventId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }
  }
}
```

## Composite Indexes

When a query uses `where` + `orderBy` on different fields, add to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "registrations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "eligible", "order": "ASCENDING" },
        { "fieldPath": "registeredAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Batch Writes (for bulk operations)

```typescript
import { writeBatch, doc } from 'firebase/firestore';

const batch = writeBatch(db);
addresses.forEach(addr => {
  batch.set(doc(db, 'airdrop/registrations', addr), { eligible: true }, { merge: true });
});
await batch.commit(); // max 500 operations per batch
```

## Environment Variables Required

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT_KEY   ← Backend only (JSON string)
```
