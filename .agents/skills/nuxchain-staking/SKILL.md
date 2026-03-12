---
name: nuxchain-staking
description: Work with NuxChain staking contracts, hooks, and UI components. Use when user says "staking", "stake", "unstake", "claim rewards", "APY", "deposits", "staking pool", "EnhancedSmartStaking", "gamification", "quests", "XP", "skills NFT", or any staking-related feature. Provides contract addresses, ABI locations, all custom hooks, wagmi patterns, and context usage.

license: MIT
metadata:
  author: nuxchain
  version: '2.0.0'
---

# NuxChain Staking Skill

Work with NuxChain's Smart Staking v6.2 system.

## Contract Addresses — Polygon Mainnet (chainId 137)

Always read current addresses from:
```
src/abi/abis-by-category.json        ← Organized by category
src/constants/stakingConstants.ts    ← Exported constants  
```

## ABI Files

```
src/abi/
  EnhancedSmartStaking/EnhancedSmartStaking.json
  EnhancedSmartStakingGamification/EnhancedSmartStakingGamification.json  
  EnhancedSmartStakingRewards/EnhancedSmartStakingRewards.json
  DynamicAPYCalculator.sol/DynamicAPYCalculator.json
```

## Custom Hooks — `src/hooks/staking/`

| Hook | Purpose |
|------|---------|
| `useAdvancedStaking` | Main staking operations (deposit, withdraw, compound) |
| `useDepositManagement` | Manage active deposits, partial withdrawal |
| `useQuestManagement` | Gamification quests, XP, completions |
| `useSkillNFTs` | Skill NFT V2 staking, Boost Slots |
| `useSkillsManagement` | General skills management |
| `useStakingAnalytics` | APY stats, TVL, user earnings analysis |
| `useStakingV620` | V6.2 specific features (Boost, modular arch) |
| `useTotalClaimedRewardsV2` | Cumulative claimed rewards |
| `useUserDeposits` | List all user deposits with poolId |
| `useUserStaking` | User's overall staking position |

## StakingContext — Global State

```tsx
import { useStakingContext } from '../../context/useStakingContext'

const {
  deposits,
  totalStaked,
  pendingRewards,
  isLoading,
  refetch,
} = useStakingContext()
```

## wagmi Hook — Read Contract

```typescript
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import STAKING_ABI from '../../abi/EnhancedSmartStaking/EnhancedSmartStaking.json';
import { STAKING_CONTRACT_ADDRESS } from '../../constants/stakingConstants';

// READ
const { data: userDeposits, isLoading } = useReadContract({
  address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
  abi: STAKING_ABI,
  functionName: 'getUserDeposits',
  args: [userAddress],
  chainId: 137,
});

// WRITE
const { writeContract, data: txHash } = useWriteContract();

const handleDeposit = (amount: string) => {
  writeContract({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: STAKING_ABI,
    functionName: 'deposit',
    args: [parseEther(amount), poolId, lockupPeriod],
    chainId: 137,
  });
};

// WAIT FOR RECEIPT
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash: txHash,
});
```

## APY Values (from KB)

| Period | APY |
|--------|-----|
| Flexible | ~9.6% |
| 30 days | ~17.2% |
| 90 days | ~22.7% |
| 180 days | ~30.3% |
| 365 days | ~31.9% |

APY is dynamic via `DynamicAPYCalculator` based on TVL.

## Key UI Components

```
src/components/staking/
  StakingForm.tsx              ← Deposit/stake UI
  DepositsManager.tsx          ← Manage active deposits
  RewardsHub.tsx               ← Claim rewards
  StakingStats.tsx             ← APY, TVL, user stats
  DynamicAPYIndicator.tsx      ← Live APY display
  QuestTracker.tsx             ← Gamification quests
  BadgeGallery.tsx             ← NFT badges earned
  PoolCarousel.tsx             ← Pool selection
  RewardsProjectionChart.tsx   ← Projected earnings
  WithdrawConfirmationModal.tsx ← Withdraw flow
```

## Updating ABIs

```powershell
# After contract redeployment:
node scripts/update-abis-from-export.cjs
# Then verify:
node scripts/verify-view-contract.js
```

## Staking Page — Maintenance Gate

```typescript
// src/config/maintenance.ts — toggle staking maintenance
staking: {
  enabled: true,   // ← set to true to show maintenance page
  estimatedTime: 7200,
  message: '...'
}
// Also works via dev console:
window.__NUX_DEV_OVERRIDES__ = { staking: true }
```


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
