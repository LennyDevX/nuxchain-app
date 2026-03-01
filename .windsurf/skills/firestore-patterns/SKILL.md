---
name: firestore-patterns
description: Work with Firestore in NuxChain. Use when user says "Firestore", "database", "save user data", "read from DB", "collection", "document", "Firebase", "airdrop data", "user profile", "analytics", or any data persistence task.
allowed-tools: Read, Write, Edit, Glob, Grep
model: claude-sonnet-4-5
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

See full skill at: .agents/skills/firestore-patterns/SKILL.md

# Firestore Patterns — Quick Reference

## Key Files
- Rules: `firestore.rules` (update when adding collections)
- Indexes: `firestore.indexes.json`
- Config: `firebase.json`

## Collections
- `users/{walletAddress}` — user profiles
- `airdrop/registrations/{address}` — airdrop registrations
- `analytics/events/{eventId}` — event tracking
- `chat/sessions/{sessionId}` — chat history
- `skills/{skillId}` — skill NFT data

## Read Pattern
```typescript
import { doc, getDoc } from 'firebase/firestore';
const snap = await getDoc(doc(db, 'users', address.toLowerCase()));
if (snap.exists()) return snap.data();
```

## Write Pattern
```typescript
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
await setDoc(doc(db, 'users', address.toLowerCase()), {
  address: address.toLowerCase(),
  lastSeen: serverTimestamp(),
}, { merge: true });
```

## Query Pattern
```typescript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
const q = query(collection(db, 'airdrop/registrations'), where('eligible', '==', true), limit(100));
const snap = await getDocs(q);
```
