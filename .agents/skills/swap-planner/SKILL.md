---
name: swap-planner
description: This skill should be used when the user asks to "swap tokens", "trade ETH for USDC", "exchange tokens on Uniswap", "buy tokens", "sell tokens", "convert ETH to stablecoins", "find memecoins", "discover tokens", "research tokens", "tokens to buy", "find tokens to swap", "what should I buy", or mentions swapping, trading, researching, discovering, buying, or exchanging tokens on any Uniswap-supported chain. Supports both known token swaps and token discovery workflows (discovery uses keyword search and web search — there is no live "trending" feed). Generates deep links to execute swaps in the Uniswap interface.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(curl:*), Bash(jq:*), Bash(cast:*), Bash(xdg-open:*), Bash(open:*), WebFetch, WebSearch, Task(subagent_type:Explore), AskUserQuestion
model: sonnet
license: MIT
metadata:
  author: uniswap
  version: '0.2.1'
---

# Swap Planning

Plan and generate deep links for token swaps on Uniswap across all supported chains.

> **Runtime Compatibility:** This skill uses `AskUserQuestion` for interactive prompts. If `AskUserQuestion` is not available in your runtime, collect the same parameters through natural language conversation instead.

## Overview

Plan token swaps by:

1. Gathering swap intent (tokens, amounts, chain)
2. Verifying token contracts on-chain
3. Researching tokens via web search when needed
4. Generating a deep link that opens in the Uniswap interface with parameters pre-filled

The generated link opens Uniswap with all parameters ready for execution.

> **Note:** Browser opening (`xdg-open`/`open`) may fail in SSH, containerized, or headless environments. Always display the URL prominently so users can copy and access it manually if needed.

## Workflow

### Step 0: Token Discovery (When Needed)

For exploratory requests like "find me a memecoin on Base" or "what tokens should I buy":

1. **Keyword search** via DexScreener API — search for tokens by name/symbol
2. **Promoted token lookup** for boosted/trending tokens on DexScreener
3. **Web search** for broader discovery and research
4. **Risk assessment** based on market cap, pool TVL, volume, and contract age

```bash
# DexScreener keyword search
curl "https://api.dexscreener.com/latest/dex/search?q=KEYWORD" | jq '.pairs[] | select(.chainId == "base") | {name: .baseToken.name, address: .baseToken.address, volume: .volume.h24}'
```

> **Important:** There is no live "trending" feed. Use keyword search and web search for discovery.

### Step 1: Gather Swap Intent

Collect via `AskUserQuestion` or natural language:

- **Input token**: symbol or address (e.g., ETH, USDC, 0x...)
- **Output token**: symbol or address
- **Amount**: how much to swap
- **Chain**: which network (default: Ethereum mainnet)

### Step 2: Resolve Token Addresses

Map well-known symbols to addresses per chain:

| Token | Ethereum | Base | Arbitrum |
|-------|----------|------|----------|
| ETH (native) | Use `NATIVE` | Use `NATIVE` | Use `NATIVE` |
| WETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | `0x4200000000000000000000000000000000000006` | `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1` |
| USDC | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| USDT | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | — | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` |
| DAI  | `0x6B175474E89094C44Da98b954EedeAC495271d0F` | — | `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1` |

For unknown tokens, use DexScreener to find the address:

```bash
curl "https://api.dexscreener.com/latest/dex/search?q=TOKEN_SYMBOL" | jq '.pairs[0] | {address: .baseToken.address, name: .baseToken.name}'
```

### Step 3: Verify Token Contracts (Basic)

```bash
# Verify contract exists via cast
cast code TOKEN_ADDRESS --rpc-url https://eth.llamarpc.com
# Non-empty result = valid contract
```

### Step 4: Research (If Needed)

For unfamiliar tokens, fetch price and pool data:

```bash
# DexScreener token info
curl "https://api.dexscreener.com/latest/dex/tokens/TOKEN_ADDRESS" | jq '{
  name: .pairs[0].baseToken.name,
  price: .pairs[0].priceUsd,
  volume24h: .pairs[0].volume.h24,
  liquidity: .pairs[0].liquidity.usd,
  fdv: .pairs[0].fdv
}'
```

### Step 5: Fetch Price Data

```bash
# DefiLlama price (fallback for limited DexScreener coverage)
curl "https://coins.llama.fi/prices/current/ethereum:TOKEN_ADDRESS" | jq '.coins'
```

**DexScreener coverage varies by chain:**
- Deep coverage: Ethereum, Base, Arbitrum
- Limited coverage: Celo, Blast, Zora, World Chain — use DefiLlama as fallback

### Step 6: Generate Deep Link

Uniswap deep link format:

```
https://app.uniswap.org/swap?inputCurrency=INPUT&outputCurrency=OUTPUT&exactAmount=AMOUNT&exactField=input&chain=CHAIN
```

Chain name values: `ethereum`, `base`, `arbitrum`, `optimism`, `polygon`, `bnb`, `avalanche`, `celo`, `blast`, `zora`, `worldchain`, `unichain`

For native ETH, use `ETH` as the currency value (not WETH address).

**Example:**
```
https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&exactAmount=1&exactField=input&chain=ethereum
```

### Step 7: Present Output and Open Browser

Present a summary table:

| Field | Value |
|-------|-------|
| Swap | 1 ETH → USDC |
| Chain | Ethereum |
| Current Price | ~$3,200/ETH |
| Pool Liquidity | $45M |
| Estimated Output | ~3,180 USDC |

Then display the deep link prominently and attempt to open it:

```bash
# macOS
open "DEEP_LINK_URL"

# Linux
xdg-open "DEEP_LINK_URL"
```

Always display the URL as text so users can copy it if auto-open fails.

## Important Considerations

### Slippage

- Default slippage: 0.5% for stable pairs, 1–3% for volatile pairs
- Add `&slippage=PERCENT` to the deep link if needed

### Token Verification

- Always verify contract addresses before generating links
- Warn users about tokens with low liquidity (< $100k TVL)
- Flag tokens with no audit history or very recent deployment

### Price Impact

- Warn if swap amount is > 1% of pool liquidity
- Suggest splitting large swaps

### Risk Assessment for Unknown Tokens

| Signal | Risk Level |
|--------|-----------|
| Market cap < $1M | HIGH |
| Pool TVL < $50k | HIGH |
| Contract age < 7 days | HIGH |
| No audit | MEDIUM |
| Low 24h volume | MEDIUM |

## Supported Chains

| Chain | Chain ID | DexScreener ID |
|-------|----------|----------------|
| Ethereum | 1 | `ethereum` |
| Base | 8453 | `base` |
| Arbitrum | 42161 | `arbitrum` |
| Optimism | 10 | `optimism` |
| Polygon | 137 | `polygon` |
| BNB Chain | 56 | `bsc` |
| Avalanche | 43114 | `avalanche` |
| Celo | 42220 | `celo` |
| Blast | 81457 | `blast` |
| Zora | 7777777 | `zora` |
| World Chain | 480 | `worldchain` |
| Unichain | 130 | `unichain` |

## Additional Resources

- [Uniswap Interface](https://app.uniswap.org)
- [DexScreener API](https://docs.dexscreener.com)
- [DefiLlama Prices API](https://defillama.com/docs/api)
- [Liquidity Planner Skill](../liquidity-planner/SKILL.md) — Plan LP positions instead of swaps
