# HOTFIX: Deposit Management - View Contract Reverting

## Problem
The View Contract (`0x86FF715E4804ae223F62A7A6D29915c90d4A15DF`) functions are REVERTING:
- `getUserPortfolio` - ContractFunctionRevertedError
- `getPoolStats` - ContractFunctionRevertedError
- `getDashboardUserSummary` - ContractFunctionRevertedError

## Root Cause
View Contract is not properly linked to the Core Contract or has configuration issues.

## Solution Applied

### 1. Pool Info (FIXED ✅)
- Changed from failing View Contract `getPoolStats` to Core Contract `getContractBalance`
- Now displays: **9.4 POL** contract balance correctly
- File: `src/components/staking/PoolInfo.tsx`

### 2. Deposit Management (IN PROGRESS)
- `useDepositManagement` was calling failing View Contract
- **useUserDeposits** works correctly (uses Core Contract)
- Solution: Make useDepositManagement use useUserDeposits internally

### Files to Modify
1. ✅ `src/components/staking/PoolInfo.tsx` - Use Core Contract
2. 🔄 `src/hooks/staking/useDepositManagement.ts` - Delegate to useUserDeposits   
3. 🔄 Remove `src/components/debug/ContractDiagnostics.tsx` - temporary debug component

## Alternative Approach (Simpler)
Since useUserDeposits already works, we can:
1. Modify DepositsManager to use useUserDeposits directly
2. Keep useDepositManagement for backward compatibility but delegate to useUserDeposits
3. Return mock data for parts we can't get from Core Contract

## Next Steps
1. Comment out failing View Contract multicalls in useDepositManagement
2. Map coreDeposits from useUserDeposits to DepositDetail format
3. Test deposits display in "My Deposits" tab
4. Deploy subgraph v0.41 (separate task)
