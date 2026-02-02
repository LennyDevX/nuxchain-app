# 🚀 Bot Purge Analysis Report

## 📊 Initial State
- **Total Registrations in Firebase:** 10,039
- **Risk Analysis Loaded:** 10,032 wallets

## 🗑️ Deletion Breakdown

| Category | Count | Reason |
|----------|-------|--------|
| **Suspicious/Bot (score 65+)** | 2 | Highest risk - multiple bot indicators |
| **Likely Bot (score 45+)** | 1,206 | High risk - clear bot patterns |
| **IP Farm (>5 registrations)** | 4,517 | Multiple registrations from same IP |
| **Invalid Wallets** | 5 | Malformed wallet addresses |
| **EVM Addresses** | 0 | Non-Solana wallets |
| **Disposable Email** | 0 | Temporary email services |
| **Other** | 0 | No transactions + zero balance |
| | |
| **💥 TOTAL TO DELETE** | **5,730** |
| **✅ KEEP (Real Users)** | **4,309** |

## 📈 Impact

```
Before:  10,039 registrations (Mixed bots + real users)
After:   4,309 registrations (Filtered real, active users)

Removal Rate: 57% (5,730 bots removed)
Retention Rate: 43% (4,309 legitimate users kept)
```

## 🎯 Safety Measures

✅ **Dry Run Mode Active**: Script won't delete anything until explicitly confirmed
✅ **Risk Score Based**: Uses comprehensive analysis from `bulk-wallet-analysis.cjs`
✅ **Multi-Factor Detection**: Combines risk score, IP farming, and wallet validation
✅ **Batch Operations**: Deletes in chunks of 400 to respect Firebase limits

## ⚠️ What Gets Deleted

### 1. **Suspicious/Bot (Risk 65+)** - 2 wallets
- **Example:** Rew, Ali
- Indicators: Non-existent wallet + zero balance + no transactions + massive IP farming

### 2. **Likely Bot (Risk 45+)** - 1,206 wallets
- **Example:** Deo, Mim, Roy, etc.
- Indicators: Risk score in 45-64 range, IP farming, zero token accounts

### 3. **IP Farm (>5 from same IP)** - 4,517 wallets
- **Example:** 147 registrations from IP 42.117.202.61
- Indicators: Coordinated registration attempts from single IP/datacenter
- Top offenders:
  - `unknown` IP: 1,342 registrations
  - `42.117.202.61`: 147 registrations  
  - `102.91.105.101`: 74 registrations

## ✅ What Gets Kept (4,309 users)

- Valid Solana wallet addresses
- Risk score **below 45**
- **NOT** part of IP farm (≤5 from same IP)
- Real email domains
- On-chain presence (can exist + have tokens/transactions)

## 🚀 Next Steps

To **ACTUALLY DELETE** the bots and purify your database:

```bash
# In PowerShell:
$env:DRY_RUN = 'false'
node scripts/wipe-bots.cjs
```

Or in one command:
```bash
DRY_RUN=false node scripts/wipe-bots.cjs
```

## ⏱️ Expected Duration

- Script execution: ~2-3 minutes (4,309 records kept + 5,730 deleted)
- Firestore batch operations: ~15 batches of 400 records each
- Total time: ~5-10 minutes

## 📌 Important Notes

1. **This is irreversible** - Deleted records cannot be recovered from Firestore
2. **Backup first** - Consider exporting data before running (if backup hasn't been done)
3. **Post-purge validation** - Run `bulk-wallet-analysis.cjs` again to verify quality
4. **Real users remain** - 4,309 legitimate registrations kept for airdrop

---

**Generated:** 2026-02-02  
**Analysis Period:** Full 10,033-record dataset
