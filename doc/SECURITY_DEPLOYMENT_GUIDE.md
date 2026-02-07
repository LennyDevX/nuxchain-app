# 🚀 DEPLOYMENT GUIDE - Enhanced Airdrop Security

## ⚡ Quick Deployment Steps (Pre-Launch Checklist)

### 1️⃣ Deploy Firestore Indices (CRITICAL - Do this FIRST)

```bash
# Deploy indices to Firestore
firebase deploy --only firestore:indexes

# Wait for indices to build (check status in Firebase Console)
# Status must be "Enabled" before proceeding
```

**Estimated time**: 2-5 minutes for empty database

---

### 2️⃣ Deploy Firestore Security Rules

```bash
# Deploy updated security rules
firebase deploy --only firestore:rules
```

**What changed**:
- Added `rateLimits` collection rules
- Added `auditLogs` collection rules
- Secured write access (server-only)

---

### 3️⃣ Set Environment Variables (Vercel)

Ensure these are configured in Vercel Dashboard:

```bash
SOLANA_RPC=https://solana-rpc.publicnode.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

---

### 4️⃣ Deploy to Vercel

```bash
# Build and test locally first
npm run build

# Deploy to production
vercel --prod
```

---

### 5️⃣ Verify Deployment

Run these tests BEFORE opening to users:

#### Test 1: CEX Wallets Endpoint
```bash
curl https://your-domain.vercel.app/api/airdrop/cex-wallets
```
Expected: JSON with wallet list

#### Test 2: Rate Limiting
```bash
# Send 4 requests quickly
for i in {1..4}; do
  curl -X POST https://your-domain.vercel.app/api/airdrop/validate \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","wallet":"invalid","ipAddress":"1.2.3.4"}'
done
```
Expected: 4th request returns 429 (Rate Limited)

#### Test 3: Email Normalization
```bash
# Register with test+alias@gmail.com
# Then try test@gmail.com
# Second should be rejected as duplicate
```

#### Test 4: CORS Headers
```bash
curl -I https://your-domain.vercel.app/api/airdrop/validate \
  -H "Origin: https://nuxchain.com"
```
Expected: `Access-Control-Allow-Origin: https://nuxchain.com`

```bash
curl -I https://your-domain.vercel.app/api/airdrop/validate \
  -H "Origin: https://malicious-site.com"
```
Expected: No CORS header (blocked)

---

### 6️⃣ Monitor Logs

After deployment, monitor these in Vercel Dashboard:

```bash
# Real-time logs
vercel logs --follow

# Check for errors
vercel logs | grep "ERROR"

# Check audit logs in Firestore Console
# Collection: auditLogs
```

---

## 📋 Pre-Launch Verification Checklist

Before opening airdrop to users:

### Infrastructure
- [ ] Firestore indices deployed and **status = Enabled**
- [ ] Firestore rules deployed
- [ ] Vercel deployment successful (production)
- [ ] Environment variables configured
- [ ] Domain CORS whitelist includes production URL

### Security Tests
- [ ] Rate limiting works (429 after 3 requests/minute)
- [ ] Email normalization prevents duplicates
- [ ] CEX wallet endpoint returns valid list
- [ ] CORS blocks unauthorized origins
- [ ] Audit logs are being written to Firestore

### Functional Tests
- [ ] Can register with valid Solana wallet
- [ ] Duplicate email/wallet rejected
- [ ] Disposable email blocked
- [ ] IP farm detection works (3+ from same IP)
- [ ] Device fingerprint duplicate detection works
- [ ] Success message shown after registration
- [ ] Firestore document created correctly

### Monitoring Setup
- [ ] Vercel logs accessible
- [ ] Firestore audit logs queryable
- [ ] Alert for high error rate (optional: set up Sentry/Datadog)

---

## 🛡️ Security Improvements Applied

### 1. Centralized CEX Wallets
- **Before**: Hardcoded in 2 files (desync risk)
- **After**: Single endpoint `/api/airdrop/cex-wallets`
- **Benefit**: Update once, applies everywhere

### 2. Distributed Rate Limiting
- **Before**: In-memory (失效 in serverless)
- **After**: Firestore-based (consistent across all instances)
- **Benefit**: Real rate limiting in production

### 3. Email Normalization
- **Before**: `test+1@gmail.com` ≠ `test@gmail.com` (easy bypass)
- **After**: Both normalized to `test@gmail.com` (duplicate detected)
- **Benefit**: Prevent alias abuse

### 4. Restricted CORS
- **Before**: `Access-Control-Allow-Origin: *` (anyone can call API)
- **After**: Whitelist only `nuxchain.com`, `app.nuxchain.com`
- **Benefit**: Prevent unauthorized API calls

### 5. Generic Error Messages
- **Before**: "Wallet balance too low: 0.00123 SOL" (enumeration attack)
- **After**: "Wallet does not meet requirements" (generic)
- **Benefit**: Prevent reconnaissance

### 6. Audit Logging
- **Before**: console.log only (lost after restart)
- **After**: Firestore `auditLogs` collection (persistent)
- **Benefit**: Fraud investigation and analytics

---

## 🔥 Firestore Collections Structure

### `nuxchainAirdropRegistrations`
Stores validated registrations.

**New field**:
- `normalizedEmail`: For duplicate detection

### `rateLimits` (NEW)
Tracks request counts per client.

```typescript
{
  requests: [timestamp1, timestamp2, ...],
  lastUpdated: timestamp,
  expiresAt: timestamp
}
```

### `auditLogs` (NEW)
Security event logging.

```typescript
{
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL',
  eventType: 'REGISTRATION_SUCCESS' | 'BOT_DETECTED' | ...,
  message: string,
  timestamp: Date,
  ipAddress: string,
  email?: string,
  wallet?: string,
  metadata: {...}
}
```

---

## 📊 Performance Benchmarks

### Expected Performance (with indices):

| Operation | Time | Load |
|-----------|------|------|
| Email duplicate check | 50-100ms | Low |
| Wallet duplicate check | 50-100ms | Low |
| Rate limit check | 100-200ms | Medium |
| Full validation | 300-500ms | Medium |
| Submit registration | 200-400ms | Low |

### Without indices:
- Email/wallet checks: **5-30 seconds** ❌
- Potential timeouts and failures

---

## 🚨 Emergency Rollback

If issues arise:

```bash
# Revert Vercel deployment
vercel rollback

# Revert Firestore rules (manual in console)
# Revert indices (no need, they don't break things)
```

---

## 📞 Support

If errors occur:
1. Check Vercel logs: `vercel logs --follow`
2. Check Firestore Console for errors
3. Query `auditLogs` collection for security events
4. Check index build status (must be "Enabled")

---

**Last Updated**: February 6, 2026  
**Author**: Security Enhancement Team  
**Status**: ✅ READY FOR PRODUCTION
