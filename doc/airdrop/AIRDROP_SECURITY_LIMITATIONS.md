# 🛡️ Airdrop Security Limitations & Requirements

**Last Updated:** February 7, 2026  
**Version:** 2.4 SECURE

---

## 📋 Overview

The Nuxchain Airdrop uses **multi-layer security** to prevent bots, farming, and fraud while protecting legitimate users. This document explains the limitations and how they protect you.

---

## ⚙️ Technical Limitations

### Rate Limiting
- **Limit:** 3 validation attempts per minute
- **Purpose:** Prevent brute force attacks
- **User Impact:** If you fail validation 3 times, wait 1 minute to try again
- **Error Message:** "Too many attempts. Please wait a moment before trying again."

### IP-Based Restrictions
- **Limit:** Maximum 3 registrations per IP address
- **Purpose:** Prevent bot farms from registering massively
- **Blocked IPs:** VPN, Proxy, Data Center IPs (AWS, Google Cloud, Azure, etc.)
- **Impact:** If you use a VPN/Proxy, you'll be blocked
- **Solution:** Use a residential/home internet connection

### Email Address Rules
- **Limit:** One registration per email address
- **Accepted Emails:** Legitimate providers only
  - ✅ Gmail, Yahoo, Outlook, Hotmail, AOL
  - ✅ Proton Mail (proton.me, protonmail.com)
  - ✅ Tutanota (tutanota.com, tuta.io)
  - ✅ Mailfence, Riseup, and other legitimate privacy services
  - ❌ Tempmail, Guerrillamail, 10MinuteMail
  - ❌ Yopmail, Maildrop, and other temp email services

- **Purpose:** Prevent account farming with throwaway emails
- **Impact:** You must use a real, verified email address

### Device Fingerprinting
- **Limit:** Maximum 2 registrations per device
- **What We Detect:**
  - Browser type & version (Chrome, Firefox, Safari, Edge)
  - Operating system (Windows, macOS, Linux, iOS, Android)
  - Screen resolution
  - Timezone
  - Language settings
  - Canvas fingerprint (unique browser signature)

- **Purpose:** Prevent multi-account abuse on the same device
- **Impact:** You cannot register twice from the same browser/device

### Form Submission Timing
- **Limit:** Minimum 3 seconds between form load and submission
- **Purpose:** Detect automated bots
- **Impact:** You must wait at least 3 seconds after loading the form before submitting
- **Why:** Real users take time to read and fill out forms; bots submit instantly

---

## 💰 Wallet Requirements

### Balance Requirements
- **Standard Wallets (< 3 days old):** Minimum 0.0005 SOL
- **Legacy Wallets (> 90 days old):** Minimum 0.0001 SOL
- **High Balance Pass (NEW!):** 0.1+ SOL bypasses ALL age requirements ⭐
- **Purpose:** Ensure wallet has real activity, not a fresh throw-away

### Wallet Age Requirements
- **New Wallets (< 3 days):** Allowed if moderately active
  - **Option 1:** 2+ transactions AND ≥ 0.02 SOL balance (Active Wallet Pass)
  - **Option 2:** 0.1+ SOL balance regardless of transactions (High Balance Pass) ⭐
  - **Option 3:** Funded directly from Binance/Coinbase/Kraken (CEX Pass)
- **Established Wallets (3+ days):** Standard requirements apply
- **Legacy Wallets (90+ days):** Lower requirements, higher approval chance

### Transaction History
- **Minimum:** At least 1 transaction must exist
- **Purpose:** Verify the wallet has been actually used
- **Impact:** Brand new wallets with 0 transactions are blocked

### The CEX Pass ⭐
- **What:** Direct funding from a major exchange
- **Exchanges:** Binance, Coinbase, Kraken
- **Benefit:** Instant approval, bypasses age/balance requirements
- **How:** Our security system checks your first on-chain transaction
- **No Action Required:** It's automatic if funded from these exchanges

### The High Balance Pass 💎 (NEW!)
- **What:** Wallets with significant SOL holdings
- **Threshold:** 0.1+ SOL (~$15-20 USD)
- **Benefit:** Instant approval, bypasses ALL age requirements
- **Why:** Users who invest real money are clearly legitimate
- **Works For:** Any wallet regardless of age or transaction count

---

## 🚫 What Gets Blocked?

### Automatically Rejected
1. **Disposable Email Addresses** (tempmail, guerrillamail, 10minutemail, etc.)
2. **Email Aliases from Same Provider** (gmail+alias trick)
   - We normalize emails to detect: user@gmail.com = user+airdrop@gmail.com
3. **Duplicate Email Registrations** (one email = one registration)
4. **Duplicate Wallet Registrations** (one wallet = one registration)
5. **VPN/Proxy IPs** (detected via IP analysis)
6. **Data Center IPs** (AWS, Google Cloud, Azure)
7. **Freshly Created Solana Wallets** (unless CEX-funded)
8. **Wallets with No Transaction History**
9. **Wallets Below Minimum Balance**
10. **Same Device (Brand New Browser)** (after 2 registrations)

### Manual Review Triggers
- Suspicious device fingerprint patterns
- Multiple registration attempts from same IP
- Wallet on blacklist (known bot/scammer wallets)
- Unusual geographic location patterns

---

## 🟢 How to Get Approved

### Best Practice Steps
1. **Use a Real Email**
   - Personal Gmail, Yahoo, Outlook, or Proton Mail
   - NOT a throwaway temp email
   - Never use email aliases (gmail+airdrop trick won't work)

2. **Use a Legitimate Wallet**
   - Phantom, Solflare, Trust Wallet, OKX, Ledger, or Magic Eden
   - **Option A:** Wallet 3+ days old (standard approval)
   - **Option B:** New wallet with 0.1+ SOL (High Balance Pass - instant!) ⭐
   - **Option C:** New wallet with 2+ txs + 0.02 SOL (Active Wallet Pass)
   - **Option D:** Funded from Binance/Coinbase/Kraken (CEX Pass - instant!)
   - Minimum balance: 0.0005 SOL
   - Should have at least 1 transaction

3. **Register from Home Internet**
   - Residential connection (not VPN/Proxy)
   - From a single device/browser
   - Complete the form naturally (take your time, don't rush)

4. **Verify You're Human**
   - Fill form carefully (no bot behavior)
   - Wait at least 3 seconds before submitting
   - Only 3 attempts per minute
   - If blocked: wait 1 minute and retry

---

## ❓ FAQ

### Q: Why was my email rejected?
**A:** Likely using a disposable email service. Use Gmail, Proton Mail, Yahoo, Outlook, or Tutanota instead.

### Q: Why was my wallet rejected?
**A:** Possible reasons:
- Too new (< 3 days) without qualifying for any exception
- Balance too low (< 0.0005 SOL)
- No transaction history
- On a blacklist (scammer/bot wallet)

**Solution Options:** Use ONE of these:
1. **Wait 3 days** - Standard approval for established wallets
2. **Add 0.1 SOL** - High Balance Pass (instant approval) ⭐
3. **Make 2+ transactions + have 0.02 SOL** - Active Wallet Pass
4. **Fund from Binance/Coinbase/Kraken** - CEX Pass (instant approval)

### Q: Can I use a VPN?
**A:** No. VPN/Proxy IPs are blocked for fairness. Use your home internet connection.

### Q: Can I register twice from different devices?
**A:** Yes, but only if using different emails AND different IPs. Maximum 3 registrations per IP address total.

### Q: Why do I get "body stream already read" error?
**A:** This was a server-side bug that's been fixed. Try registering again. If it persists, clear your browser cache and try again.

### Q: What if I didn't get my allocation?
**A:** Check:
1. Did the "Success Modal" appear? (Green checkmark)
2. Was registration stored in Firestore? (Backend logs)
3. Did you reach IP/Email/Device limits?

---

## 📊 Statistics

- **Total Registration Pool:** 10,000 users
- **Tokens per User:** 6,000 NUX
- **Total Airdrop:** 60,000,000 NUX
- **Security Checks:** 8+ layers
- **False Positive Rate:** < 2% (we're lenient with real users)

---

## 🔐 Your Privacy

- **No KYC:** We don't require identity verification
- **No Personal Data:** Only email, wallet, and device info
- **Audit Logging:** All attempts logged for fraud detection
- **GDPR Compliant:** Data retained per privacy policy
- **No Third-Party Sharing:** Your data stays with Nuxchain

---

## 🎯 Bottom Line

**The rules are simple:**
- Use a **real email** (not temp mail)
- Use a **real wallet** (3+ days old, or CEX-funded)
- Register from your **home internet** (no VPN)
- Be **human** (take at least 3 seconds)
- Do it **once** (one email, one wallet)

That's it! Honest users have no trouble. Bots and farmers are blocked immediately.

---

**Questions?** Contact support@nuxchain.com
