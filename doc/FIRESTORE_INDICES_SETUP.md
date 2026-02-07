# 🔥 FIRESTORE INDICES CONFIGURATION - REQUIRED FOR AIRDROP SYSTEM

## ⚠️ CRITICAL: Configure these indices BEFORE launching the airdrop

Without these composite indices, queries will be SLOW or FAIL, causing:
- Poor user experience
- Timeout errors
- Potential race conditions
- Duplicate registrations

---

## 📋 Required Composite Indices

### Collection: `nuxchainAirdropRegistrations`

#### Index 1: Email + CreatedAt
```
Field: normalizedEmail (Ascending)
Field: createdAt (Descending)
```
**Why**: Fast duplicate detection for normalized emails

#### Index 2: Wallet + CreatedAt
```
Field: wallet (Ascending)
Field: createdAt (Descending)
```
**Why**: Fast duplicate detection for wallet addresses

#### Index 3: IP Address + CreatedAt
```
Field: ipAddress (Ascending)
Field: createdAt (Descending)
```
**Why**: IP farm detection and rate limiting

#### Index 4: Fingerprint
```
Field: fingerprint (Ascending)
Field: createdAt (Descending)
```
**Why**: Device fingerprint duplicate detection

---

### Collection: `rateLimits` (NEW - for distributed rate limiting)

#### Index 1: ExpiresAt
```
Field: expiresAt (Ascending)
```
**Why**: Cleanup of expired rate limit records

---

### Collection: `auditLogs` (NEW - for security logging)

#### Index 1: EventType + Timestamp
```
Field: eventType (Ascending)
Field: timestamp (Descending)
```
**Why**: Query logs by event type

#### Index 2: Email + Timestamp
```
Field: email (Ascending)
Field: timestamp (Descending)
```
**Why**: Investigation of user-specific events

#### Index 3: Wallet + Timestamp
```
Field: wallet (Ascending)
Field: timestamp (Descending)
```
**Why**: Investigation of wallet-specific events

#### Index 4: IP Address + Timestamp
```
Field: ipAddress (Ascending)
Field: timestamp (Descending)
```
**Why**: Investigation of IP-based attacks

---

## 🚀 How to Create Indices

### Option 1: Firebase Console (Recommended)
1. Go to: https://console.firebase.google.com
2. Select your project: **NuxChain**
3. Navigate to: **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. For each index above:
   - Set Collection ID
   - Add fields with correct order (Ascending/Descending)
   - Click **Create**

### Option 2: Automatic Creation (via error messages)
1. Run the airdrop validation
2. Firestore will show error with link to create missing index
3. Click the link and auto-create

### Option 3: Firebase CLI
```bash
# Deploy from firestore.indexes.json
firebase deploy --only firestore:indexes
```

---

## ✅ Verification Checklist

Before launching airdrop, verify in Firebase Console:

- [ ] `nuxchainAirdropRegistrations` has 4 composite indices
- [ ] `rateLimits` has 1 single-field index
- [ ] `auditLogs` has 4 composite indices
- [ ] All indices show status: **Enabled** (not "Building")
- [ ] Test a registration end-to-end
- [ ] Check console for "missing index" errors (should be NONE)

---

## 📊 Expected Index Build Time

| Collection Size | Build Time |
|----------------|------------|
| 0-1K docs      | 1-2 min    |
| 1K-10K docs    | 5-10 min   |
| 10K-100K docs  | 20-30 min  |

**Important**: Indices must be fully built (status: Enabled) before launch.

---

## 🔍 Testing Indices

Run these queries in Firestore Console to verify:

```javascript
// Test 1: Duplicate email check
db.collection('nuxchainAirdropRegistrations')
  .where('normalizedEmail', '==', 'test@gmail.com')
  .orderBy('createdAt', 'desc')
  .get()

// Test 2: IP farm detection
db.collection('nuxchainAirdropRegistrations')
  .where('ipAddress', '==', '1.2.3.4')
  .orderBy('createdAt', 'desc')
  .get()

// Test 3: Audit log query
db.collection('auditLogs')
  .where('eventType', '==', 'REGISTRATION_SUCCESS')
  .orderBy('timestamp', 'desc')
  .limit(10)
  .get()
```

If any query fails with "missing index" error, create the index immediately.

---

## 🚨 Performance Impact

**Without indices**:
- Query time: 5-30 seconds (timeout at 60s)
- User experience: POOR
- Race conditions: LIKELY
- Duplicate registrations: POSSIBLE

**With indices**:
- Query time: 50-200ms
- User experience: EXCELLENT
- Race conditions: PREVENTED
- Duplicate registrations: BLOCKED

---

## 📝 Notes

- Firestore automatically creates single-field indices
- Only composite/multi-field queries need manual index creation
- Indices are project-wide and persistent
- Building time depends on existing data volume
- You can delete unused indices to save quota

---

**Last Updated**: February 6, 2026
**Status**: ⚠️ REQUIRED BEFORE LAUNCH
