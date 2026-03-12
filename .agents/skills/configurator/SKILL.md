---
name: configurator
description: Configure CCA (Continuous Clearing Auction) smart contract parameters through an interactive bulk form flow. Use when user says "configure auction", "cca auction", "setup token auction", "auction configuration", "continuous auction", or mentions CCA contracts.
license: MIT
metadata:
  author: uniswap
  version: '1.0.0'
---

# CCA Configuration

Configure Continuous Clearing Auction (CCA) smart contract parameters for fair and transparent token distribution.

> **Runtime Compatibility:** This skill uses `AskUserQuestion` for interactive prompts. If `AskUserQuestion` is not available in your runtime, collect the same parameters through natural language conversation instead.

## Instructions for Claude Code

When the user invokes this skill, guide them through a **bulk interactive form configuration flow** using AskUserQuestion. Collect parameters in batches to minimize user interaction rounds.

### Bulk Interactive Form Rules

1. Ask multiple questions at once using a single `AskUserQuestion` call with a numbered list
2. Parse all answers from a single response
3. Validate after each batch before proceeding
4. Generate the supply schedule using the MCP tool after collecting all parameters
5. Display the complete JSON configuration at the end

### Configuration Flow

**Batch 1 — Task Selection (1 question):**
Ask: "What would you like to do? (1) Configure a new auction, (2) Generate a supply schedule only, (3) Review an existing configuration"

**Batch 2 — Core Parameters (4 questions):**
Ask all at once:
1. Which network? (Ethereum/Unichain/Base/Arbitrum/Sepolia/Unichain Sepolia)
2. Token contract address to auction?
3. Total token supply to distribute (in tokens, not wei)?
4. Currency for bids? (ETH = zero address, or ERC-20 address)

**Batch 3 — Timing & Pricing (4 questions):**
Ask all at once:
1. Auction duration in hours?
2. Prebid period in hours (0 for none)?
3. Floor price in currency units per token (e.g., 0.001 ETH)?
4. Tick spacing as percentage of floor price (e.g., 10 for 10%)?

**Batch 4 — Recipients & Funding (4 questions):**
Ask all at once:
1. Recipient address(es) for proceeds (comma-separated if multiple, with percentages)?
2. Auction start time (Unix timestamp or "now" or ISO date)?
3. Minimum funds required to activate auction (0 for none)?
4. Optional validation hook address (leave blank for none)?

**Batch 5 — Confirmation (1 question):**
Display the complete configuration summary and ask: "Does this look correct? (yes/no)"

### Important Notes

- Always convert token amounts to wei (multiply by 10^18 for standard ERC-20)
- Calculate Q96 pricing from human-readable prices (see Price Calculations section)
- Use the MCP tool `cca-supply-schedule__generate_supply_schedule` to generate the supply schedule
- Validate all parameters before generating the final JSON

### Network-Specific Constants

| Network          | Chain ID | Block Time | RPC URL |
| ---------------- | -------- | ---------- | ------- |
| Ethereum         | 1        | 12s        | `https://eth.llamarpc.com` |
| Unichain         | 130      | 1s         | `https://mainnet.unichain.org` |
| Unichain Sepolia | 1301     | 2s         | `https://sepolia.unichain.org` |
| Base             | 8453     | 2s         | `https://mainnet.base.org` |
| Arbitrum         | 42161    | 2s         | `https://arb1.arbitrum.io/rpc` |
| Sepolia          | 11155111 | 12s        | `https://rpc.sepolia.org` |

## Overview

The CCA (Continuous Clearing Auction) is a fair token distribution mechanism where:
- Tokens are sold continuously over a time period
- Price starts at floor and adjusts based on demand
- Buyers get tokens at the clearing price
- Unsold tokens are returned to the issuer

## Quick Decision Guide

| Scenario | Recommendation |
|----------|---------------|
| Fair launch, no VC | CCA with low floor price |
| Community distribution | CCA with prebid period |
| Price discovery needed | CCA with wide tick spacing |
| Fixed price sale | Consider alternatives |

## Configuration Guide

### Auction Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | `address` | ERC-20 token being auctioned |
| `totalSupply` | `uint256` | Total tokens to distribute (in wei) |
| `currency` | `address` | Bid currency (zero address = ETH) |
| `startBlock` | `uint256` | Block number when auction starts |
| `endBlock` | `uint256` | Block number when auction ends |
| `floorPrice` | `uint256` | Minimum price in Q96 format |
| `tickSpacing` | `uint256` | Price increment in Q96 format |
| `supplySchedule` | `uint16[]` | Token release curve (MPS values) |

### Configuration File Format

```json
{
  "CHAIN_ID": {
    "token": "0x...",
    "totalSupply": 100000000000000000000000000,
    "currency": "0x0000000000000000000000000000000000000000",
    "startBlock": 24321000,
    "endBlock": 24327001,
    "floorPrice": 7922816251426433759354395000,
    "tickSpacing": 79228162514264337593543950,
    "supplySchedule": [500, 500, 500, ...]
  }
}
```

## Price Calculations (Q96 Format)

The CCA uses Q96 fixed-point math: `price_Q96 = price * 2^96`

### Floor Price Calculation

```python
import math

def price_to_q96(price_in_currency_per_token, token_decimals=18, currency_decimals=18):
    # Adjust for decimal difference
    adjusted_price = price_in_currency_per_token * (10 ** token_decimals) / (10 ** currency_decimals)
    # Convert to Q96
    q96_price = int(adjusted_price * (2 ** 96))
    return q96_price

# Example: 0.001 ETH per token
floor_price_q96 = price_to_q96(0.001)
# Result: 79228162514264337593543950
```

### Tick Spacing Calculation

```python
def tick_spacing_q96(floor_price_q96, tick_percentage):
    # tick_percentage: e.g., 10 for 10%
    return int(floor_price_q96 * tick_percentage / 100)
```

### Rounding Floor Price (CRITICAL)

The floor price **must** be a multiple of tick spacing:

```python
def round_floor_to_tick(floor_price_q96, tick_spacing_q96):
    return (floor_price_q96 // tick_spacing_q96) * tick_spacing_q96
```

## Supply Schedule Configuration

### Understanding MPS (Milli-Basis Points)

The supply schedule defines how tokens are released over time:
- Each entry represents one auction step
- Values are in MPS (milli-basis points): 10000 MPS = 1% of total supply
- All values must sum to 1,000,000 (= 100%)

### Standard Schedule Generator

Use the MCP tool to generate a normalized convex curve:

```
cca-supply-schedule__generate_supply_schedule({
  "steps": 100,
  "curve": "convex",  // "convex", "linear", "concave"
  "total": 1000000
})
```

### Example: 2-day auction on Base

```
Duration: 48 hours
Block time: 2 seconds
Steps: 48 * 3600 / 2 = 86400 blocks
```

### Example: With prebid period

If prebid period is 6 hours on Base:
- Prebid blocks: 6 * 3600 / 2 = 10800
- `startBlock` = currentBlock + 10800
- Auction starts after prebid period

## Getting Current Block Number

```bash
# Fetch current block via RPC
curl -X POST RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  | jq -r '.result' | xargs printf "%d\n"
```

### Available Public RPCs

| Network | RPC |
|---------|-----|
| Ethereum | `https://eth.llamarpc.com` |
| Base | `https://mainnet.base.org` |
| Arbitrum | `https://arb1.arbitrum.io/rpc` |
| Unichain | `https://mainnet.unichain.org` |
| Sepolia | `https://rpc.sepolia.org` |

## Validation Rules

Before generating the final configuration, validate:

1. `token` — valid checksummed address, not zero address
2. `currency` — valid address (zero address for ETH is OK)
3. `totalSupply` — > 0, in wei
4. `startBlock` — > current block
5. `endBlock` — > startBlock
6. `floorPrice` — > 0, multiple of tickSpacing
7. `tickSpacing` — > 0, < floorPrice
8. `supplySchedule` — sum equals 1,000,000
9. Recipients — addresses valid, percentages sum to 100%

## Additional Resources

- [CCA Repository](https://github.com/Uniswap/continuous-clearing-auction)
- [Uniswap CCA Docs](https://docs.uniswap.org/contracts/liquidity-launchpad/CCA)
- [CCA Deployer Skill](../deployer/SKILL.md) — Deploy after configuring
