---
name: deployer
description: Deploy CCA (Continuous Clearing Auction) smart contracts using the Factory pattern. Use when user says "deploy auction", "deploy cca", "factory deployment", or wants to deploy a configured auction.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(forge:*), Bash(cast:*), Bash(curl:*), AskUserQuestion
model: opus
license: MIT
metadata:
  author: uniswap
  version: '1.0.0'
---

# CCA Deployment

Deploy Continuous Clearing Auction (CCA) smart contracts using the `ContinuousClearingAuctionFactory` with CREATE2 for consistent addresses across chains.

> **Runtime Compatibility:** This skill uses `AskUserQuestion` for interactive prompts. If `AskUserQuestion` is not available in your runtime, collect the same parameters through natural language conversation instead.

## Instructions for Claude Code

When the user invokes this skill, guide them through the CCA deployment process with appropriate safety warnings and validation.

### Pre-Deployment Requirements

1. Foundry installed (`forge` and `cast` available)
2. CCA repository cloned locally
3. Configuration JSON from the configurator skill (or manually created)
4. Sufficient ETH/native token for gas
5. Token contract deployed and supply minted

### Deployment Workflow

1. **Show disclaimer** — Educational use warning (required)
2. **Load configuration** — Read and parse the JSON config file
3. **Validate parameters** — Run full validation checklist
4. **Display deployment plan** — Summary of what will be deployed
5. **Request confirmation** — Explicit user approval via AskUserQuestion
6. **Provide Foundry commands** — `forge script` commands with security guidance
7. **Post-deployment steps** — Call `onTokensReceived()` to activate

## ⚠️ Educational Use Disclaimer

**Always display this before any deployment steps:**

> This skill provides educational guidance for deploying CCA smart contracts. Smart contract deployment involves real financial risk. Always:
> - Test on testnet first (Sepolia or Base Sepolia)
> - Audit your configuration before mainnet deployment
> - Never share or expose your private key
> - Understand that deployed contracts may be immutable

Ask the user to acknowledge before proceeding.

## 🔐 Private Key Security

### ⚠️ Never Do These

```bash
# NEVER — exposes key in shell history
forge script ... --private-key 0xYOUR_PRIVATE_KEY

# NEVER — key visible in process list
PRIVATE_KEY=0x... forge script ...
```

### ✅ Recommended Practices

**Option 1: Hardware wallet (Ledger) — Most Secure**
```bash
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --ledger \
  --broadcast
```

**Option 2: Encrypted keystore**
```bash
# Import key once
cast wallet import deployer --interactive

# Use in scripts
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --account deployer \
  --broadcast
```

**Option 3: Environment variable (testing only)**
```bash
# In .env file (never commit to git)
PRIVATE_KEY=0x...

# Load and use
source .env
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Testnet First

Always deploy to testnet before mainnet:

| Mainnet | Testnet |
|---------|---------|
| Ethereum | Sepolia |
| Base | Base Sepolia |
| Arbitrum | Arbitrum Sepolia |
| Unichain | Unichain Sepolia |

## Deployment Guide

### Factory Deployment

The CCA Factory is already deployed at a canonical address. You do **not** need to deploy the factory.

| Property | Value |
|----------|-------|
| Factory Version | v1.1.0 |
| Factory Address | `0xCCccCcCAE7503Cac057829BF2811De42E16e0bD5` |
| Deployment Method | CREATE2 (deterministic addresses) |

The factory is deployed on: Ethereum, Base, Arbitrum, Unichain, Sepolia, Unichain Sepolia.

### Deploying an Auction Instance

**Step 1: Clone the CCA repository**
```bash
git clone https://github.com/Uniswap/continuous-clearing-auction
cd continuous-clearing-auction
forge install
```

**Step 2: Set environment variables**
```bash
# .env
RPC_URL=https://mainnet.base.org
FACTORY_ADDRESS=0xCCccCcCAE7503Cac057829BF2811De42E16e0bD5
TOKEN_ADDRESS=0x...
CURRENCY_ADDRESS=0x0000000000000000000000000000000000000000
TOTAL_SUPPLY=100000000000000000000000000
START_BLOCK=24321000
END_BLOCK=24327001
FLOOR_PRICE=7922816251426433759354395000
TICK_SPACING=79228162514264337593543950
```

**Step 3: Deploy via forge script**
```bash
forge script script/DeployAuction.s.sol \
  --rpc-url $RPC_URL \
  --account deployer \
  --broadcast \
  --verify
```

**Step 4: Verify deployment**
```bash
# Check auction was created
cast call $FACTORY_ADDRESS \
  "getAuction(address)(address)" \
  $TOKEN_ADDRESS \
  --rpc-url $RPC_URL
```

### Alternative: Deploy via Constructor

For direct deployment without the factory:

```solidity
ContinuousClearingAuction auction = new ContinuousClearingAuction(
    token,
    totalSupply,
    currency,
    startBlock,
    endBlock,
    floorPrice,
    tickSpacing,
    supplySchedule,
    recipients
);
```

### Verification on Block Explorers

```bash
# Verify on Etherscan/Basescan
forge verify-contract \
  $AUCTION_ADDRESS \
  src/ContinuousClearingAuction.sol:ContinuousClearingAuction \
  --chain-id CHAIN_ID \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

## Post-Deployment: Activate the Auction

After deployment, the token issuer must transfer tokens to the auction contract:

```bash
# Transfer tokens to auction contract
cast send $TOKEN_ADDRESS \
  "transfer(address,uint256)" \
  $AUCTION_ADDRESS \
  $TOTAL_SUPPLY \
  --rpc-url $RPC_URL \
  --account deployer
```

The auction activates automatically when tokens are received (via `onTokensReceived()` callback).

## Validation Rules

Run this checklist before deployment:

1. [ ] `startBlock` > current block number
2. [ ] `endBlock` > `startBlock`
3. [ ] `endBlock - startBlock` == `supplySchedule.length`
4. [ ] `floorPrice` > 0
5. [ ] `floorPrice` is a multiple of `tickSpacing`
6. [ ] `tickSpacing` > 0 and < `floorPrice`
7. [ ] `totalSupply` > 0 (in wei)
8. [ ] `token` is a valid ERC-20 contract
9. [ ] `currency` is zero address (ETH) or valid ERC-20
10. [ ] Recipient addresses are valid and non-zero
11. [ ] Recipient percentages sum to 100%
12. [ ] Deployer has enough ETH for gas
13. [ ] Token supply is minted and available for transfer

## Technical Overview

### Q96 Fixed-Point Math

All prices use Q96 format: `value = human_price * 2^96`

```python
Q96 = 2 ** 96  # = 79228162514264337593543950336

# Convert human price to Q96
q96_price = int(human_price * Q96)

# Convert Q96 back to human price
human_price = q96_price / Q96
```

### Auction Steps (Supply Issuance)

Each block in `[startBlock, endBlock)` is one auction step. The supply schedule determines what fraction of `totalSupply` is available at each step.

### Key Contract Functions

| Function | Description |
|----------|-------------|
| `initializeDistribution(token, amount, params, salt)` | Factory: deploy new auction |
| `onTokensReceived(operator, from, amount, data)` | Activate auction after token transfer |
| `bid(amount)` | Place a bid in the auction |
| `claim()` | Claim tokens after auction ends |
| `withdraw()` | Withdraw unsold tokens (issuer only) |

## Supported Chains

| Network | Chain ID | Factory Address |
|---------|----------|----------------|
| Ethereum | 1 | `0xCCccCcCAE7503Cac057829BF2811De42E16e0bD5` |
| Base | 8453 | `0xCCccCcCAE7503Cac057829BF2811De42E16e0bD5` |
| Arbitrum | 42161 | `0xCCccCcCAE7503Cac057829BF2811De42E16e0bD5` |
| Unichain | 130 | `0xCCccCcCAE7503Cac057829BF2811De42E16e0bD5` |
| Sepolia | 11155111 | `0xCCccCcCAE7503Cac057829BF2811De42E16e0bD5` |
| Unichain Sepolia | 1301 | `0xCCccCcCAE7503Cac057829BF2811De42E16e0bD5` |

## Troubleshooting

### Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `InvalidBlockRange` | `endBlock <= startBlock` | Recalculate blocks |
| `InvalidFloorPrice` | Floor not multiple of tick | Round floor to tick |
| `InvalidSupplySchedule` | Sum != 1,000,000 | Regenerate schedule |
| `InsufficientGas` | Not enough ETH | Add more ETH to deployer |
| `TokenTransferFailed` | Token not approved | Approve factory first |

### Validation Checklist

Before broadcasting, always simulate first:

```bash
forge script script/DeployAuction.s.sol \
  --rpc-url $RPC_URL \
  --account deployer
  # No --broadcast flag = simulation only
```

## Additional Resources

- [CCA Repository](https://github.com/Uniswap/continuous-clearing-auction)
- [Uniswap CCA Docs](https://docs.uniswap.org/contracts/liquidity-launchpad/CCA)
- [CCA Configurator Skill](../configurator/SKILL.md) — Configure parameters before deploying
- [Foundry Book](https://book.getfoundry.sh) — Forge and cast documentation
