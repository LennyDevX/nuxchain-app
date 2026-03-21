# NuxP2PEscrow — Solana Anchor Program Deployment Guide

## Recommended: Deploy via GitHub Actions (CI/CD)

The easiest, most reliable deployment path — runs on Linux x86_64 in the cloud.

### Step 1 — Add GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

Add these two secrets:

**`SOLANA_DEPLOYER_KEYPAIR_JSON`** (required) — The deployer keypair that will pay for deployment:
```
[163,151,225,115,2,92,47,250,103,195,168,173,215,57,250,157,220,43,177,238,86,3,195,179,33,106,71,161,205,247,197,181,232,1,246,68,224,35,63,48,115,196,231,210,148,123,51,62,219,127,21,124,251,101,29,82,212,226,112,71,83,183,254,160]
```
> ⚠️ This key is already in `keys/deployer-keypair.json` — this is the same key from `SOLANA_DEPLOYER_PRIVATE_KEY` in `.env`

**`SOLANA_PROGRAM_KEYPAIR_JSON`** (optional) — If you want to reuse the same Program ID on re-deploys. Leave empty on first deploy; after first deploy, save the generated keypair here.

### Step 2 — Trigger the deployment

1. Go to **GitHub → Actions → "Deploy NUX P2P Escrow (Solana)"**
2. Click **"Run workflow"**
3. Choose cluster: `devnet` (test first!) or `mainnet-beta`
4. Click **"Run workflow"**

### Step 3 — After deployment

The workflow will print the Program ID in the summary. Then:

1. Update `declare_id!()` in `programs/nux-p2p-escrow/src/lib.rs`:
   ```rust
   declare_id!("YOUR_REAL_PROGRAM_ID_HERE");
   ```

2. Update `Anchor.toml` — replace the placeholder in `[programs.mainnet-beta]`:
   ```toml
   nux_p2p_escrow = "YOUR_REAL_PROGRAM_ID_HERE"
   ```

3. Add to Vercel environment variables (or `.env`):
   ```
   VITE_P2P_PROGRAM_ID=YOUR_REAL_PROGRAM_ID_HERE
   VITE_P2P_DEPLOYED=true
   ```

4. Run `npm install @coral-xyz/anchor` if not done already.

5. Call `initialize_marketplace` once from the admin wallet (via Admin Dashboard → P2P Market Controls).

---

## Manual Deployment (Linux/macOS only)

### Prerequisites

```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Install Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# 3. Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.30.1
avm use 0.30.1

# 4. Install Node deps for the frontend
npm install @coral-xyz/anchor
```
```

---

## Step 1 — Configure your Solana wallet

```bash
# Create a new local wallet (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Set network to devnet for testing
solana config set --url devnet

# Airdrop some SOL for deployment fees
solana airdrop 2
```

---

## Step 2 — Build the program

```bash
# From the project root
anchor build
```

This generates:
- `target/deploy/nux_p2p_escrow-keypair.json` — program keypair
- `target/idl/nux_p2p_escrow.json` — the IDL (copy to `src/abi/`)
- `target/types/nux_p2p_escrow.ts` — TypeScript types (copy to `src/types/`)

---

## Step 3 — Get and set your Program ID

```bash
solana address -k target/deploy/nux_p2p_escrow-keypair.json
```

Copy the printed address, then:

1. **Update `programs/nux-p2p-escrow/src/lib.rs`**:
   ```rust
   declare_id!("YOUR_ACTUAL_PROGRAM_ID_HERE");
   ```

2. **Update `Anchor.toml`** (all 3 sections: localnet, devnet, mainnet-beta):
   ```toml
   nux_p2p_escrow = "YOUR_ACTUAL_PROGRAM_ID_HERE"
   ```

3. **Update `src/constants/p2p.ts`**:
   ```typescript
   export const P2P_PROGRAM_ID = new PublicKey("YOUR_ACTUAL_PROGRAM_ID_HERE")
   export const IS_P2P_DEPLOYED = true
   ```

4. **Copy the IDL and types**:
   ```bash
   cp target/idl/nux_p2p_escrow.json src/abi/nux-p2p-escrow-idl.json
   ```

5. **Rebuild** after updating the ID:
   ```bash
   anchor build
   ```

---

## Step 4 — Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

---

## Step 5 — Initialize the Marketplace

After deployment, run this **once** from your admin wallet to set up the marketplace state:

```bash
# From the project root, using the Anchor CLI
anchor run initialize-marketplace
# -- OR use the P2PEscrowManager component in the Admin dashboard --
```

**Parameters to set:**
| Parameter | Recommended Value | Description |
|-----------|------------------|-------------|
| `fee_basis_points` | `200` | 2% platform fee |
| `reference_price_lamports` | `25` | 0.000000025 SOL per raw NUX unit |
| `min_ad_amount` | `1000000` | Minimum 1 NUX (6 decimals) |

---

## Step 6 — Deploy to Mainnet

Once tested on devnet:

```bash
solana config set --url mainnet-beta
anchor deploy --provider.cluster mainnet-beta
```

---

## Security Notes

- The admin wallet MUST be a multisig or hardware wallet in production.
- Run a security audit before mainnet deployment.
- The `set_paused` instruction allows emergency stops.
- All fund movements are atomic — no partial state is possible.

---

## Program ID Addresses

| Network | Program ID |
|---------|-----------|
| **Localnet** | `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS` (placeholder) |
| **Devnet** | TBD after deploy |
| **Mainnet** | TBD after audit |
