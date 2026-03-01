---
name: nuxchain-staking
description: Work with NuxChain staking contracts, hooks, and UI components. Use when user says "staking", "stake", "unstake", "claim rewards", "APY", "deposits", "staking pool", "EnhancedSmartStaking", "gamification", or any staking-related feature.
allowed-tools: Read, Write, Edit, Glob, Grep
model: claude-sonnet-4-5
license: MIT
metadata:
  author: nuxchain
  version: '1.0.0'
---

See full skill at: .agents/skills/nuxchain-staking/SKILL.md

# NuxChain Staking — Quick Reference

## Key Files
- ABIs: `src/abi/EnhancedSmartStaking/`, `src/abi/EnhancedSmartStakingGamification/`
- Constants: `src/constants/stakingConstants.ts`
- Components: `src/components/staking/`
- Chain: Polygon (chainId: 137)

## wagmi Read Pattern
```typescript
import { useReadContract } from 'wagmi';
import STAKING_ABI from '../../abi/EnhancedSmartStaking/EnhancedSmartStaking.json';
import { STAKING_CONTRACT_ADDRESS } from '../../constants/stakingConstants';

const { data } = useReadContract({
  address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
  abi: STAKING_ABI,
  functionName: 'getUserDeposits',
  args: [userAddress],
  chainId: 137,
});
```

## wagmi Write Pattern
```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
const { writeContract, data: txHash } = useWriteContract();
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
```
