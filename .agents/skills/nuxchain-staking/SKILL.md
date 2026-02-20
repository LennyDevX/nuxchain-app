---
name: nuxchain-staking
description: Work with NuxChain staking contracts, hooks, and UI components. Use when user says "staking", "stake", "unstake", "claim rewards", "APY", "deposits", "staking pool", "EnhancedSmartStaking", "gamification", or any staking-related feature. Provides contract addresses, ABI locations, wagmi hook patterns, and component structure.
allowed-tools: Read, Write, Edit, Glob, Grep
model: claude-sonnet-4-5
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

# NuxChain Staking Skill

Work with NuxChain's staking system: contracts, hooks, and UI components.

## Contract Addresses (Polygon Mainnet — chainId 137)

| Contract | Address | Purpose |
|----------|---------|---------|
| `EnhancedSmartStaking` | See `src/abi/` | Core staking: deposit, withdraw, claim |
| `EnhancedSmartStakingGamification` | See `src/abi/` | Quests, badges, XP |
| `EnhancedSmartStakingRewards` | See `src/abi/` | Rewards distribution |
| `DynamicAPYCalculator` | See `src/abi/` | APY calculation |

**Always read the current addresses from:**
```
src/abi/abis-by-category.json   ← Organized by category
src/constants/stakingConstants.ts ← Exported constants
```

## ABI Locations

```
src/abi/
  EnhancedSmartStaking/
    EnhancedSmartStaking.json
  EnhancedSmartStakingGamification/
    EnhancedSmartStakingGamification.json
  EnhancedSmartStakingRewards/
    EnhancedSmartStakingRewards.json
  DynamicAPYCalculator.sol/
    DynamicAPYCalculator.json
```

## Key Staking Components

```
src/components/staking/
  StakingForm.tsx          ← Deposit/stake UI
  DepositsManager.tsx      ← Manage active deposits
  RewardsHub.tsx           ← Claim rewards
  StakingStats.tsx         ← APY, TVL, user stats
  DynamicAPYIndicator.tsx  ← Live APY display
  QuestTracker.tsx         ← Gamification quests
  BadgeGallery.tsx         ← NFT badges earned
  PoolCarousel.tsx         ← Pool selection
  PoolInfo.tsx             ← Pool details
  RewardsProjectionChart.tsx ← Projected earnings
  WithdrawConfirmationModal.tsx ← Withdraw flow
```

## wagmi Hook Pattern for Contract Reads

```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import STAKING_ABI from '../../abi/EnhancedSmartStaking/EnhancedSmartStaking.json';
import { STAKING_CONTRACT_ADDRESS } from '../../constants/stakingConstants';

// Read contract data
const { data: userDeposits, isLoading } = useReadContract({
  address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
  abi: STAKING_ABI,
  functionName: 'getUserDeposits',
  args: [userAddress],
  chainId: 137, // Polygon
});

// Write (transaction)
const { writeContract, data: txHash } = useWriteContract();

const handleStake = () => {
  writeContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'deposit',
    args: [poolId, parseEther(amount)],
  });
};

// Wait for confirmation
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash: txHash,
});
```

## Wallet Connection Pattern

```typescript
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

const { address, isConnected } = useAccount();
const chainId = useChainId();
const { switchChain } = useSwitchChain();

// Ensure user is on Polygon
if (chainId !== 137) {
  switchChain({ chainId: 137 });
}
```

## Subgraph Queries (The Graph)

Subgraph sources in `subgraph/src/`:
- `enhanced-smart-staking.ts` — Deposit/withdraw events
- `staking-gamification.ts` — XP, quests, badges
- `staking-rewards.ts` — Reward distributions
- `staking-skills.ts` — Skill NFT staking

```typescript
import { useQuery, gql } from '@apollo/client';

const GET_USER_DEPOSITS = gql`
  query GetUserDeposits($user: String!) {
    deposits(where: { user: $user, active: true }) {
      id
      amount
      poolId
      timestamp
      apy
    }
  }
`;

const { data, loading } = useQuery(GET_USER_DEPOSITS, {
  variables: { user: address?.toLowerCase() },
  skip: !address,
});
```

## APY Display Pattern

```typescript
// Format APY from contract (basis points → percentage)
const formatAPY = (bps: bigint): string => {
  return `${(Number(bps) / 100).toFixed(2)}%`;
};

// Dynamic APY color
const getAPYColor = (apy: number) => {
  if (apy >= 20) return 'text-emerald-400';
  if (apy >= 10) return 'text-green-400';
  if (apy >= 5) return 'text-yellow-400';
  return 'text-slate-400';
};
```

## Transaction State UI Pattern

```tsx
{isConfirming && (
  <div className="flex items-center gap-2 text-amber-400 jersey-20-regular">
    <span className="animate-spin">⟳</span>
    <span>Confirming transaction...</span>
  </div>
)}
{isSuccess && (
  <div className="text-emerald-400 jersey-20-regular">✓ Transaction confirmed!</div>
)}
```

## Staking Constants File

Always check `src/constants/stakingConstants.ts` for:
- Contract addresses
- Pool IDs
- Lock periods
- Min/max deposit amounts
- Fee percentages
