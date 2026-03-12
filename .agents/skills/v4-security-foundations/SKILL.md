---
name: v4-security-foundations
description: Security-first Uniswap v4 hook development. Use when user mentions "v4 hooks", "hook security", "PoolManager", "beforeSwap", "afterSwap", or asks about V4 hook best practices, vulnerabilities, or audit requirements.
license: MIT
metadata:
  author: uniswap
  version: '1.1.0'
---

# v4 Hook Security Foundations

Security-first guide for building Uniswap v4 hooks. Hook vulnerabilities can drain user funds—understand these concepts before writing any hook code.

## Threat Model

Before writing code, understand the v4 security context:

| Threat Area             | Description                                                | Mitigation                                     |
| ----------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| **Caller Verification** | Only `PoolManager` should invoke hook functions            | Verify `msg.sender == address(poolManager)`    |
| **Sender Identity**     | `msg.sender` always equals PoolManager, never the end user | Use `sender` parameter for user identity       |
| **Router Context**      | The `sender` parameter identifies the router, not the user | Implement router allowlisting                  |
| **State Exposure**      | Hook state is readable during mid-transaction execution    | Avoid storing sensitive data on-chain          |
| **Reentrancy Surface**  | External calls from hooks can enable reentrancy            | Use reentrancy guards; minimize external calls |
| **tx.origin Phishing**  | `tx.origin` exposes the original signer, enabling relay attacks | Never use `tx.origin` for authorization   |

## Permission Flags Risk Matrix

All 14 hook permissions with associated risk levels:

| Permission Flag                   | Risk Level | Description                 | Security Notes                |
| --------------------------------- | ---------- | --------------------------- | ----------------------------- |
| `beforeInitialize`                | LOW        | Called before pool creation | Validate pool parameters      |
| `afterInitialize`                 | LOW        | Called after pool creation  | Safe for state initialization |
| `beforeAddLiquidity`              | MEDIUM     | Before LP deposits          | Can block legitimate LPs      |
| `afterAddLiquidity`               | LOW        | After LP deposits           | Safe for tracking/rewards     |
| `beforeRemoveLiquidity`           | HIGH       | Before LP withdrawals       | Can trap user funds           |
| `afterRemoveLiquidity`            | LOW        | After LP withdrawals        | Safe for tracking             |
| `beforeSwap`                      | HIGH       | Before swap execution       | Can manipulate prices         |
| `afterSwap`                       | MEDIUM     | After swap execution        | Can observe final state       |
| `beforeDonate`                    | LOW        | Before donations            | Access control only           |
| `afterDonate`                     | LOW        | After donations             | Safe for tracking             |
| `beforeSwapReturnDelta`           | CRITICAL   | Returns custom swap amounts | **NoOp attack vector**        |
| `afterSwapReturnDelta`            | HIGH       | Modifies post-swap amounts  | Can extract value             |
| `afterAddLiquidityReturnDelta`    | HIGH       | Modifies LP token amounts   | Can shortchange LPs           |
| `afterRemoveLiquidityReturnDelta` | HIGH       | Modifies withdrawal amounts | Can steal funds               |

### Risk Thresholds

- **LOW**: Unlikely to cause fund loss
- **MEDIUM**: Requires careful implementation
- **HIGH**: Can cause fund loss if misimplemented
- **CRITICAL**: Can enable complete fund theft

## CRITICAL: NoOp Rug Pull Attack

The `BEFORE_SWAP_RETURNS_DELTA` permission (bit 10) is the most dangerous hook permission. A malicious hook can:

1. Return a delta claiming it handled the entire swap
2. PoolManager accepts this and settles the trade
3. Hook keeps all input tokens without providing output
4. User loses entire swap amount

### Attack Pattern

```solidity
function beforeSwap(...) external returns (bytes4, BeforeSwapDelta, uint24) {
    // MALICIOUS: claim we handled the swap without actually doing it
    int128 amountIn = params.amountSpecified;
    return (
        IHooks.beforeSwap.selector,
        toBeforeSwapDelta(amountIn, 0), // steal all input tokens
        0
    );
}
```

### Detection

Red flags in hook code:
- `BEFORE_SWAP_RETURNS_DELTA` flag set without legitimate AMM logic
- Delta returned without corresponding token transfer
- No liquidity pool or pricing mechanism in the hook

### Legitimate Uses

`beforeSwapReturnDelta` is valid for:
- Custom AMM curves (replacing pool liquidity entirely)
- JIT (Just-In-Time) liquidity hooks
- Intent-based trading systems

## Delta Accounting Fundamentals

### Core Invariant

Every token credited must be debited. The PoolManager enforces this at transaction end.

```
credits - debits = 0  (must balance at settlement)
```

### Key Functions

| Function | Direction | Use Case |
|----------|-----------|----------|
| `take()` | Hook receives tokens | Withdraw from pool |
| `settle()` | Hook sends tokens | Deposit to pool |
| `mint()` | Create ERC-6909 claim | Defer settlement |
| `burn()` | Redeem ERC-6909 claim | Settle deferred |

### Settlement Pattern

```solidity
// Correct: take then settle
poolManager.take(currency, address(this), amount);
// ... do something with tokens ...
currency.transfer(address(poolManager), amount);
poolManager.settle();
```

### Common Mistakes

- Taking tokens without settling (reverts at end of lock)
- Settling more than taken (creates bad debt)
- Using `transfer` instead of `settle` for settlement

## Access Control Patterns

### PoolManager Verification

```solidity
modifier onlyPoolManager() {
    require(msg.sender == address(poolManager), "Not PoolManager");
    _;
}

function beforeSwap(
    address sender,
    PoolKey calldata key,
    IPoolManager.SwapParams calldata params,
    bytes calldata hookData
) external onlyPoolManager returns (bytes4, BeforeSwapDelta, uint24) {
    // sender is the ROUTER, not the user
    // ...
}
```

### Why This Matters

In v4, `msg.sender` in hook callbacks is **always** the PoolManager. The `sender` parameter is the router (e.g., UniversalRouter). The actual user is identified via `hookData` or `tx.origin` (avoid `tx.origin`).

## Router Verification Patterns

### Allowlisting Pattern

```solidity
mapping(address => bool) public allowedRouters;

function beforeSwap(address sender, ...) external onlyPoolManager {
    require(allowedRouters[sender], "Router not allowed");
    // sender is the router
}
```

### User Identity via hookData

```solidity
function beforeSwap(address sender, PoolKey calldata key,
    IPoolManager.SwapParams calldata params, bytes calldata hookData
) external onlyPoolManager returns (bytes4, BeforeSwapDelta, uint24) {
    address user = abi.decode(hookData, (address));
    // verify user identity from hookData
}
```

### msg.sender Trap

```solidity
// WRONG: msg.sender is PoolManager, not the user
require(msg.sender == trustedUser, "Not authorized"); // always fails or wrong

// CORRECT: use sender parameter for router, hookData for user
require(allowedRouters[sender], "Router not allowed");
```

## Token Handling Hazards

| Token Type | Risk | Mitigation |
|------------|------|------------|
| Fee-on-transfer | Balance less than expected | Use balance checks, not amounts |
| Rebasing | Balance changes unexpectedly | Snapshot balances before/after |
| ERC-777 | Reentrancy via hooks | Reentrancy guard required |
| Pausable | Transfers can be blocked | Handle transfer failures |
| Low-decimal | Precision loss in math | Use scaled arithmetic |

### Safe Balance Check Pattern

```solidity
uint256 balanceBefore = token.balanceOf(address(this));
token.transferFrom(user, address(this), amount);
uint256 actualAmount = token.balanceOf(address(this)) - balanceBefore;
// use actualAmount, not amount
```

## Base Hook Template

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/base/hooks/BaseHook.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";

contract SecureHook is BaseHook {
    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: false,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false, // CRITICAL: only enable if implementing custom AMM
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    function beforeSwap(
        address sender,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata params,
        bytes calldata hookData
    ) external override onlyPoolManager returns (bytes4, BeforeSwapDelta, uint24) {
        // sender = router (not user)
        // implement logic here
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }
}
```

## Security Checklist

Pre-deployment checklist (13 points):

1. [ ] `msg.sender == address(poolManager)` verified in all callbacks
2. [ ] `beforeSwapReturnDelta` NOT enabled unless implementing custom AMM
3. [ ] All deltas balance (credits == debits) at settlement
4. [ ] No `tx.origin` used for authorization
5. [ ] Reentrancy guard on all external calls
6. [ ] Token balance checks use `balanceOf` snapshots for fee-on-transfer tokens
7. [ ] Router allowlist implemented if restricting access
8. [ ] User identity passed via `hookData`, not assumed from `sender`
9. [ ] No sensitive state readable mid-transaction
10. [ ] Gas limits respected in callbacks (see Gas Budget Guidelines)
11. [ ] Testnet deployment and testing completed
12. [ ] Formal audit completed for HIGH/CRITICAL permission flags
13. [ ] Emergency pause mechanism implemented for upgradeable hooks

## Gas Budget Guidelines

### Gas Budgets by Callback

| Callback | Recommended Budget | Notes |
|----------|-------------------|-------|
| `beforeSwap` | < 50,000 gas | Called on every swap |
| `afterSwap` | < 50,000 gas | Called on every swap |
| `beforeAddLiquidity` | < 30,000 gas | Called on LP deposits |
| `afterAddLiquidity` | < 50,000 gas | May include reward logic |
| `beforeRemoveLiquidity` | < 30,000 gas | Called on LP withdrawals |
| `afterRemoveLiquidity` | < 50,000 gas | May include reward logic |

### Common Gas Pitfalls

- Storage reads/writes in hot paths (use transient storage)
- External calls to unoptimized contracts
- Large array iterations
- Redundant balance checks

## Risk Scoring System

Calculate your hook's risk score (0–33):

| Permission | Points |
|------------|--------|
| `beforeSwapReturnDelta` | 10 |
| `beforeRemoveLiquidity` | 5 |
| `afterRemoveLiquidityReturnDelta` | 5 |
| `afterAddLiquidityReturnDelta` | 4 |
| `afterSwapReturnDelta` | 4 |
| `beforeSwap` | 3 |
| `beforeAddLiquidity` | 2 |
| `afterSwap` | 2 |
| All LOW permissions | 0 |

### Audit Tier Recommendations

| Score | Tier | Recommendation |
|-------|------|----------------|
| 0–3   | LOW  | Self-audit + peer review |
| 4–9   | MEDIUM | Professional audit recommended |
| 10–19 | HIGH | Professional audit required |
| 20+   | CRITICAL | Multiple audits + formal verification |

## Absolute Prohibitions

Never do these in hook code:

- Use `tx.origin` for authorization
- Enable `beforeSwapReturnDelta` without implementing a complete custom AMM
- Make external calls without reentrancy protection
- Store user funds in hook contract without withdrawal mechanism
- Skip PoolManager caller verification

## External Resources

- [Uniswap v4 Docs](https://docs.uniswap.org/contracts/v4/overview)
- [v4-core Repository](https://github.com/Uniswap/v4-core)
- [Hook Permissions Guide](https://docs.uniswap.org/contracts/v4/concepts/hooks)
- [v4-periphery BaseHook](https://github.com/Uniswap/v4-periphery)
