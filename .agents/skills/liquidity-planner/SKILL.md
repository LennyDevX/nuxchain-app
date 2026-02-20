---
name: liquidity-planner
description: This skill should be used when the user asks to "provide liquidity", "create LP position", "add liquidity to pool", "become a liquidity provider", "create v3 position", "create v4 position", "concentrated liquidity", "set price range", or mentions providing liquidity, LP positions, or liquidity pools on Uniswap. Generates deep links to create positions in the Uniswap interface.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(curl:*), Bash(jq:*), Bash(cast:*), Bash(xdg-open:*), Bash(open:*), WebFetch, WebSearch, Task(subagent_type:Explore), AskUserQuestion
model: sonnet
license: MIT
metadata:
  author: uniswap
  version: '0.2.0'
---

# Liquidity Position Planning

Plan and generate deep links for creating liquidity positions on Uniswap v2, v3, and v4.

> **Runtime Compatibility:** This skill uses `AskUserQuestion` for interactive prompts. If `AskUserQuestion` is not available in your runtime, collect the same parameters through natural language conversation instead.

## Overview

Plan liquidity positions by:

1. Gathering LP intent (token pair, amount, version)
2. Checking current pool price and liquidity
3. Suggesting price ranges based on current price
4. Generating a deep link that opens in the Uniswap interface with parameters pre-filled

The generated link opens Uniswap with all parameters ready for position creation.

> **Note:** Browser opening (`xdg-open`/`open`) may fail in SSH, containerized, or headless environments. Always display the URL prominently so users can copy and access it manually if needed.

## Workflow

### Step 1: Gather LP Intent

Collect via `AskUserQuestion` or natural language:

- **Token pair**: e.g., ETH/USDC, WBTC/ETH
- **Chain**: which network
- **Version**: v2, v3, or v4 (default: v3)
- **Fee tier**: 0.01%, 0.05%, 0.30%, 1.00% (or auto-select)
- **Amount**: how much to deposit
- **Price range**: specific range or auto-suggest

### Step 2: Resolve Token Addresses

Map symbols to addresses per chain (same as swap-planner):

| Token | Ethereum | Base | Arbitrum |
|-------|----------|------|----------|
| WETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | `0x4200000000000000000000000000000000000006` | `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1` |
| USDC | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| USDT | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | — | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` |
| DAI  | `0x6B175474E89094C44Da98b954EedeAC495271d0F` | — | `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` |

### Input Validation (Required Before Any Shell Command)

- Validate token addresses are valid checksummed hex (42 chars, starts with `0x`)
- Validate chain is in supported list
- Validate fee tier is one of: 100, 500, 3000, 10000 (basis points)
- Never pass unvalidated user input to shell commands

### Step 3: Discover Available Pools

```bash
# DexScreener pool search
curl "https://api.dexscreener.com/latest/dex/search?q=TOKEN0_SYMBOL%20TOKEN1_SYMBOL" \
  | jq '.pairs[] | select(.chainId == "CHAIN_ID") | {
      fee: .feeTier,
      tvl: .liquidity.usd,
      volume24h: .volume.h24,
      price: .priceUsd,
      pairAddress: .pairAddress
    }'
```

### Step 4: Assess Pool Liquidity

| TVL | Assessment |
|-----|-----------|
| > $10M | Deep liquidity, low slippage |
| $1M–$10M | Moderate liquidity |
| $100k–$1M | Thin, higher IL risk |
| < $100k | Very thin — warn user |

### Step 5: Fetch Pool Metrics

```bash
# DefiLlama pool APY data
curl "https://yields.llama.fi/pools" | jq '.data[] | select(.project == "uniswap-v3" and .symbol == "TOKEN0-TOKEN1")'
```

Key metrics to present:
- Current APY (7-day average)
- 24h volume
- TVL
- Current price

### Step 6: Suggest Price Ranges

Context-aware range recommendations based on pair type:

| Pair Type | Suggested Range | Notes |
|-----------|----------------|-------|
| Stablecoin/Stablecoin (e.g., USDC/USDT) | ±0.5% from peg | Very tight, high capital efficiency |
| Correlated (e.g., ETH/stETH) | ±5% from current | Tight range, monitor drift |
| Major pair (e.g., ETH/USDC) | ±20–50% from current | Balanced range |
| Volatile/exotic | ±50–100% from current | Wide range, lower IL risk |

For v2: full range only (no price range selection needed).

### Step 7: Determine Fee Tier

| Fee   | Best For                     | Typical APY Range |
| ----- | ---------------------------- | ----------------- |
| 0.01% | Stablecoin pairs             | 1–5%              |
| 0.05% | Correlated pairs (ETH/stETH) | 5–15%             |
| 0.30% | Most pairs (default)         | 10–50%            |
| 1.00% | Exotic/volatile pairs        | 20–100%+          |

Compare fee tiers using APY and volume data from DexScreener/DefiLlama. Recommend the tier with highest volume-to-TVL ratio for the pair.

### Step 8: Generate Deep Link

**v3 Position Deep Link:**
```
https://app.uniswap.org/add/TOKEN0_ADDRESS/TOKEN1_ADDRESS/FEE_TIER?chain=CHAIN&minPrice=MIN&maxPrice=MAX
```

**v2 Position Deep Link:**
```
https://app.uniswap.org/add/v2/TOKEN0_ADDRESS/TOKEN1_ADDRESS?chain=CHAIN
```

**v4 Position Deep Link:**
```
https://app.uniswap.org/add/TOKEN0_ADDRESS/TOKEN1_ADDRESS/FEE_TIER?chain=CHAIN&minPrice=MIN&maxPrice=MAX&version=v4
```

Fee tier values (in basis points): `100` (0.01%), `500` (0.05%), `3000` (0.30%), `10000` (1.00%)

**Example (ETH/USDC 0.30% on Base, range $2000–$4000):**
```
https://app.uniswap.org/add/ETH/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913/3000?chain=base&minPrice=2000&maxPrice=4000
```

### Step 9: Present Output and Open Browser

Present a position summary:

| Field | Value |
|-------|-------|
| Pair | ETH/USDC |
| Version | v3 |
| Fee Tier | 0.30% |
| Chain | Base |
| Price Range | $2,000 – $4,000 |
| Current Price | $3,200 |
| Pool TVL | $45M |
| 7-day APY | ~18% |

Then display the deep link and attempt to open it:

```bash
# macOS
open "DEEP_LINK_URL"

# Linux
xdg-open "DEEP_LINK_URL"
```

Always display the URL as text so users can copy it if auto-open fails.

## Version Selection

| Version | Liquidity Type         | Key Feature                       | When to Use |
| ------- | ---------------------- | --------------------------------- | ----------- |
| v2      | Full range only        | Simplest, lowest gas              | Simple pairs, set-and-forget |
| v3      | Concentrated liquidity | Most common, customizable ranges  | Active management, higher fees |
| v4      | Concentrated + hooks   | Advanced features, limited chains | Hook-enabled pools |

## Important Considerations

### Impermanent Loss (IL)

- IL occurs when the price ratio of the pair changes
- Tighter price ranges = higher IL risk but higher fee capture
- Wider ranges = lower IL risk but lower capital efficiency
- Always warn users about IL for volatile pairs

### Position Management

- v3 positions go out of range when price moves outside the set range
- Out-of-range positions earn no fees
- Users should monitor and rebalance active positions

### Capital Requirements

- v3 positions require both tokens in the correct ratio at the current price
- If current price is outside the range, only one token is needed
- Calculate approximate token amounts based on range and current price

## Supported Chains

| Chain | Chain ID | Uniswap v3 | Uniswap v4 |
|-------|----------|------------|------------|
| Ethereum | 1 | ✅ | ✅ |
| Base | 8453 | ✅ | ✅ |
| Arbitrum | 42161 | ✅ | ✅ |
| Optimism | 10 | ✅ | ✅ |
| Polygon | 137 | ✅ | ✅ |
| BNB Chain | 56 | ✅ | — |
| Avalanche | 43114 | ✅ | — |
| Celo | 42220 | ✅ | — |
| Blast | 81457 | ✅ | — |
| Unichain | 130 | ✅ | ✅ |

## Additional Resources

- [Uniswap Interface](https://app.uniswap.org)
- [DexScreener API](https://docs.dexscreener.com)
- [DefiLlama Yields API](https://defillama.com/docs/api)
- [Uniswap v3 Docs](https://docs.uniswap.org/contracts/v3/overview)
- [Swap Planner Skill](../swap-planner/SKILL.md) — Plan token swaps instead of LP positions

### URL Encoding

When building deep links, URL-encode special characters in token addresses and price values. Use `encodeURIComponent()` in JavaScript or `urllib.parse.quote()` in Python.
