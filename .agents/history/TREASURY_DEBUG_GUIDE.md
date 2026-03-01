# Treasury Manager - Debug & Troubleshooting Guide

## Issue: Reserve Balance Shows 0.00 POL After Staking Deposits

### Problem Summary
After making staking deposits, the Treasury Pool chart shows:
- ❌ Reserve Balance: 0.00 POL (should accumulate 6% commission from deposits)
- ❌ Percentages showing as 2000% instead of 20% (FIXED - was due to order of allocations)

### Recent Fixes Applied
✅ **Allocation Order**: Fixed getAllAllocations() to use correct order from ABI:
   - Position 0: rewardsAlloc
   - Position 1: stakingAlloc  
   - Position 2: collaboratorsAlloc (NOT marketplace!)
   - Position 3: developmentAlloc
   - Position 4: marketplaceAlloc

✅ **Percentage Formatting**: Added division by 100 to convert raw percentages (2000 = 20%)

✅ **Label**: Changed "Marketplace" to "Collaborators" in items array

## How to Debug

### 1. Check Console Logs (Browser DevTools)

Open your browser's Developer Tools (F12) and check the Console tab for logs like:

```
[useTreasuryStats] Treasury contract address: 0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9
[TreasuryPoolChart] Treasury Data: {
  allocations: {
    rewards: 20,
    staking: 25,
    collaborators: 15,
    development: 20,
    marketplace: 20,
    items: [...]
  },
  reserve: {
    currentBalance: "0.00",
    healthLevel: "Critical",
    ...
  }
}
```

### 2. Check if Treasury Manager is Receiving Funds

**Scenario 1: You made 2 deposits of 18.80 POL each**
- Total deposited: 37.60 POL
- Expected 6% commission: ~2.26 POL to Treasury Manager
- **Check**: Go to Admin panel → Treasury Manager contract → View Balance

**Scenario 2: Reserve shows 0.00 POL**
Possible causes:
1. ❌ SmartStaking contract is NOT sending commissions to Treasury Manager
2. ❌ Treasury Manager address is wrong in SmartStaking
3. ❌ Commission withdrawal is happening automatically
4. ❌ Reserve allocation is 0% in TreasuryManager
5. ⚠️  Contract functions returning incorrect data

### 3. Verify Configuration

Check that these environment variables match:

```bash
# .env file
VITE_TREASURY_MANAGER_ADDRESS=0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9
VITE_ENHANCED_SMARTSTAKING_ADDRESS=<your staking contract>
```

### 4. Verify SmartStaking → Treasury Integration

You need to check the **SmartStaking contract code** to verify:

1. **Deposit function sends 6% commission**:
   ```solidity
   uint256 commissionAmount = amount * 6 / 100; // 6% commission
   treasuryManager.receiveCommission(commissionAmount); // Send to treasury
   ```

2. **Treasury Manager address is correct** in SmartStaking

### 5. Contract Method Calls to Test

Use a contract interaction tool (Etherscan, Hardhat console, etc.):

```javascript
// Test Treasury Manager functions
treasuryManager.getBalance()        // Should show accumulated POL
treasuryManager.getStats()          // Total received, distributed, current balance
treasuryManager.getReserveStats()   // Reserve info
treasuryManager.getAllAllocations() // Allocation percentages
```

Expected returns for getAllAllocations():
```
[2000, 2500, 1500, 2000, 2000]  // = [20%, 25%, 15%, 20%, 20%]
```

## Next Steps if Balance is Still 0.00

1. **Check SmartStaking deployment**:
   - Verify the correct staking contract address
   - Check if commission withdrawal is enabled
   - Confirm Treasury Manager address stored in SmartStaking

2. **Check Treasury Manager state**:
   - Is reserve allocation > 0%?
   - Is auto-distribution enabled?
   - Are there any transaction failures in logs?

3. **Check transaction history**:
   - View deposits on Etherscan
   - Look for Treasury Manager transfers
   - Search for commission events

## Files Modified
- `src/hooks/treasury/useTreasuryStats.ts` - Fixed allocation order & percentage formatting
- `src/components/staking/TreasuryPoolChart.tsx` - Added debug logging

## Support Information

Treasury Manager Contract: `0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9`

Enable browser console logging to see detailed treasury data.
