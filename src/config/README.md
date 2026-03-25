# 🔐 Encryption Configuration Guide

## Overview

This directory contains encryption utilities for securely handling sensitive secrets like private keys, API keys, and service credentials.

### Files

- **`encryption.ts`** — Core encryption/decryption service using AES-256-CBC
- **`secrets.ts`** — Helper utilities to load and decrypt secrets from environment
- **`maintenance.ts`** — Maintenance mode configuration
- `../scripts/setup/encrypt-secret.cjs` — CLI tool to encrypt secrets

---

## Quick Start

### 1️⃣ Generate an Encryption Key

Run this once to create a new encryption key:

```bash
node scripts/setup/encrypt-secret.cjs generate-key
```

Output:
```
🔐 New Encryption Key Generated:

Hex format (recommended):
  ENCRYPTION_KEY="a1b2c3d4e5f6..."

⚠️  Save to .env.local (gitignored) or Vercel Secrets
```

### 2️⃣ Add Encryption Key to `.env.local`

Create `.env.local` (gitignored):

```env
# Add the generated key here
ENCRYPTION_KEY="a1b2c3d4e5f6..."
```

### 3️⃣ Encrypt Your Private Keys

```bash
# For Solana
node scripts/setup/encrypt-secret.cjs encrypt "4GhpJTbg5gmBnuLwB8HfAbD1..."

# For Polygon/EVM
node scripts/setup/encrypt-secret.cjs encrypt "0x9886568a906417aaa8b73..."
```

Output:
```
✅ Encrypted Secret Generated:

Add to your .env.local:

  PRIVATE_KEY_SOLANA="3a7f9e2c...:a1b2c3d4..."
```

### 4️⃣ Add Encrypted Secret to `.env.local`

```env
# .env.local
ENCRYPTION_KEY="a1b2c3d4e5f6..."
PRIVATE_KEY_SOLANA="3a7f9e2c...:a1b2c3d4..."
PRIVATE_KEY="1b2c3d4e...:f5f6a7b8..."
```

### 5️⃣ Use in Your Scripts

**For Solana tokens:**
```typescript
import { SolanaSecrets } from '@/config/secrets';

const privateKey = SolanaSecrets.getPrivateKey(); // Auto-decrypts
const rpcUrl = SolanaSecrets.getRpcUrl();

const keypair = Keypair.fromSecretKey(
  Buffer.from(privateKey, 'base58')
);
```

**For Polygon/EVM:**
```typescript
import { PolygonSecrets } from '@/config/secrets';

const privateKey = PolygonSecrets.getPrivateKey(); // Auto-decrypts
const rpcUrl = PolygonSecrets.getRpcUrl();
```

**For custom secrets:**
```typescript
import { getSecret } from '@/config/secrets';

const mySecret = getSecret('MY_ENCRYPTED_SECRET', {
  encrypted: true,
  required: true
});

const publicValue = getSecret('PUBLIC_API_KEY', {
  encrypted: false,  // Not encrypted
  required: false,
  fallback: 'default_value'
});
```

---

## Environment Setup

### Local Development (`.env.local`)

```env
# 🔐 ENCRYPTION KEY - NEVER COMMIT THIS FILE
ENCRYPTION_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"

# ✅ ENCRYPTED SECRETS - Safe to commit if encrypted
PRIVATE_KEY_SOLANA="3a7f9e2c...:a1b2c3d4..."
PRIVATE_KEY="1b2c3d4e...:f5f6a7b8..."

# ℹ️  Public values - Not encrypted
VITE_SOLANA_RPC_QUICKNODE="https://api.quicknode.com/..."
VITE_RPC_URL="https://polygon-rpc.com/"
VITE_DEPLOYER_NUX="0x..."
```

### Production (Vercel Secrets)

```bash
# Set these in Vercel Dashboard:
# Settings → Environment Variables → Add secret

vercel env add ENCRYPTION_KEY
# Paste: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

vercel env add PRIVATE_KEY_SOLANA
# Paste: 3a7f9e2c...:a1b2c3d4...
```

Or via CLI:
```bash
vercel env add ENCRYPTION_KEY "a1b2c3d4e5..."
vercel env add PRIVATE_KEY_SOLANA "3a7f9e2c...:..."
```

---

## Security Best Practices

✅ **DO:**
- Generate a unique `ENCRYPTION_KEY` for each environment
- Store `ENCRYPTION_KEY` in `.env.local` (gitignored)
- Rotate keys periodically
- Store `ENCRYPTION_KEY` in Vercel Secrets (encrypted at rest)
- Encrypt all sensitive values before saving to `.env.*`

❌ **DON'T:**
- Commit `.env.local` or `.env.keys.local` to git
- Use the same key across environments
- Hardcode encryption keys in code
- Share `.env.local` files
- Store plaintext private keys

---

## .gitignore Configuration

Ensure these lines are in your `.gitignore`:

```gitignore
# Environment variables with secrets
.env.local
.env.*.local
.env.keys.local

# Encryption keys
*.key
*.pem
secrets.json
wallet.json

# Sensitive configs
.env.production
.env.staging
```

#Proximos pasos

# 1. Generar clave una sola vez
node scripts/setup/encrypt-secret.cjs generate-key
# Copia ENCRYPTION_KEY a .env.local

# 2. Encriptar tu private key
node scripts/setup/encrypt-secret.cjs encrypt "4GhpJTbg5gmBnuLwB8HfAb..."

# 3. Guardar en .env.local
# PRIVATE_KEY_SOLANA="3a7f9e2c...:a1b2c3d4..."

# 4. Usar en código
import { SolanaSecrets } from '@/config/secrets';
const key = SolanaSecrets.getPrivateKey(); // Auto-desencriptado

---

## Encryption Details

**Algorithm:** AES-256-CBC (Advanced Encryption Standard)
**Key Size:** 256 bits (32 bytes)
**IV (Initialization Vector):** 128 bits (16 bytes), randomly generated per encryption
**Format:** `{iv_hex}:{ciphertext_hex}`

Example encrypted value:
```
3a7f9e2c4f5e1b2a9d8c7f6e5d4c3b2a:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...
```

**Why this format?**
- Each encryption uses a random IV → no patterns
- Color IV with ciphertext → decryption knows what to do
- Hex encoding → safe in text files

---

## Troubleshooting

### Error: "ENCRYPTION_KEY not set"

```
⚠️  ENCRYPTION_KEY not set. Using random ephemeral key...
```

**Solution:** Generate and save a key to `.env.local`

```bash
node scripts/setup/encrypt-secret.cjs generate-key
# Copy output to .env.local
```

### Error: "Invalid encrypted format"

```
Invalid encrypted format. Expected "iv:ciphertext".
```

**Solution:** Make sure you're using a value from `encrypt-secret.cjs`, not plaintext.

### Error: "Failed to decrypt secret: ENCRYPTION_KEY is wrong"

**Causes:**
- Changed `ENCRYPTION_KEY` in `.env.local`
- Using different key than encryption time
- Encrypted value is corrupted

**Solution:** Re-encrypt with current key:
```bash
node scripts/setup/encrypt-secret.cjs encrypt "your_secret"
```

---

## Testing Encryption

Test the encryption service:

```bash
# Encrypt a test value
node scripts/setup/encrypt-secret.cjs encrypt "test123"

# Use in code
import { decryptSecret } from '@/config/encryption';

const encrypted = "..."; // From above
const decrypted = decryptSecret(encrypted);
console.log(decrypted); // "test123"
```

---

## Migration from Plaintext

If you have existing plaintext secrets, migrate them:

1. **Backup current `.env.local`**
   ```bash
   cp .env.local .env.local.backup
   ```

2. **Generate new encryption key**
   ```bash
   node scripts/setup/encrypt-secret.cjs generate-key
   ```

3. **Encrypt each secret**
   ```bash
   node scripts/setup/encrypt-secret.cjs encrypt "your_current_key"
   ```

4. **Replace in `.env.local`**
   - Keep: `ENCRYPTION_KEY="..."`
   - Replace: Old plaintext keys → encrypted values

5. **Test**
   ```bash
   npm run build
   npm test
   ```

6. **Delete backup**
   ```bash
   rm .env.local.backup
   ```

---

## Related Files

- `ENV_SETUP.md` — Environment variable naming conventions
- `.env.example` — Public template (no secrets)
- `../scripts/` — Deployment and utility scripts
- `../../../vercel.json` — Environment variable references

---

## Support

For issues with encryption:

1. Check that `ENCRYPTION_KEY` is set in `.env.local`
2. Verify the key is 64 hex chars or 44 base64 chars
3. Test with `encrypt-secret.cjs`
4. Check that encrypted value contains `:` separator
