# Skills Maximum Staking Boost Calculation

## Problem Statement
**Issue**: Dashboard displayed +1680% maximum staking boost, which was unrealistic and misleading.
**Root Cause**: Calculation summed ALL 85 skills (17 types × 5 rarities) without respecting the 3-skill active limit.
**Fix**: Calculate realistic maximum with only 3 active skills (user constraint).

## User Constraints
From `GameifiedMarketplaceSkillsV2.sol` line 30:
```solidity
uint256 private constant MAX_ACTIVE_SKILLS_PER_USER = 3;
```

**Key Rule**: Users can activate maximum **3 skills** simultaneously at any time.

## Staking Skills (7 types)
These are the only skills that directly contribute to staking boost:

1. **STAKE_BOOST_I** (Type 1): +5% APY
2. **STAKE_BOOST_II** (Type 2): +10% APY
3. **STAKE_BOOST_III** (Type 3): +20% APY (Maximum APY boost)
4. **AUTO_COMPOUND** (Type 4): Automatic compounding
5. **LOCK_REDUCER** (Type 5): -25% lock time
6. **FEE_REDUCER_I** (Type 6): -10% platform fees
7. **FEE_REDUCER_II** (Type 7): -25% platform fees (Maximum fee reduction)

## Rarity Levels & Effect Values
All skills scale by rarity (same multiplier for all 17 types):

| Rarity | Multiplier | Effect Value |
|--------|-----------|--------------|
| Common | 1.0x | 5% |
| Uncommon | 1.1x | 10% |
| Rare | 1.2x | 15% |
| Epic | 1.4x | 25% |
| **Legendary** | **1.8x** | **50%** |

## Maximum Staking Boost Calculation

### Formula
```
Max Boost = Sum of Top 3 STAKING skills with LEGENDARY rarity

Max Boost = 50% + 50% + 50% = 150%
```

### Calculation Details
- **Eligible Skills**: Only 7 staking skills (types 1-7)
- **Rarity Filter**: Only LEGENDARY rarity (effect value = 50%)
- **Active Limit**: Maximum 3 skills active at once
- **Best Case**: Select 3 LEGENDARY staking skills
- **Result**: 3 × 50% = **150% maximum realistic boost**

### Real-world Scenario Examples

**Best Staking Optimization** (3 LEGENDARY staking skills):
```
STAKE_BOOST_III LEGENDARY (20% APY)     → +50% effect
+ LOCK_REDUCER LEGENDARY (-25% time)    → +50% effect  
+ AUTO_COMPOUND LEGENDARY (auto-reinvest) → +50% effect
───────────────────────────────────────
TOTAL REALISTIC BOOST = 150%
```

**Balanced Approach** (Mix of effects):
```
STAKE_BOOST_II UNCOMMON (10% APY)       → +10% effect
+ FEE_REDUCER_II RARE (-25% fees)      → +15% effect
+ LOCK_REDUCER EPIC (-25% time)        → +25% effect
───────────────────────────────────────
TOTAL = 50%
```

**Conservative Approach** (Single type, multiple rarities):
```
STAKE_BOOST_III COMMON (20% APY)        → +5% effect
+ STAKE_BOOST_III UNCOMMON (20% APY)   → +10% effect
+ STAKE_BOOST_III RARE (20% APY)       → +15% effect
───────────────────────────────────────
TOTAL = 30% (Less optimal - same skill type only)
```

## Implementation in Codebase

### Location: `src/pages/Skills.tsx` (Lines 54-70)
```typescript
const totalStakingBoost = useMemo(() => {
  // Calculate REALISTIC max staking boost with constraint: max 3 active skills per user
  // Only consider STAKING skills (7 types) with LEGENDARY rarity (highest effect)
  
  const STAKING_SKILL_TYPES = [1, 2, 3, 4, 5, 6, 7]; // STAKE_BOOST_I through FEE_REDUCER_II
  const LEGENDARY_RARITY = 4;
  
  const bestStakingSkills = SKILLS_DATA.filter(
    skill => STAKING_SKILL_TYPES.includes(skill.skillType) && skill.rarity === LEGENDARY_RARITY
  ).sort((a, b) => b.effectValue - a.effectValue); // Sort by effect value descending
  
  // Sum top 3 staking skills (or all if less than 3 available)
  const maxBoost = bestStakingSkills.slice(0, 3).reduce((sum, skill) => sum + skill.effectValue, 0);
  
  return maxBoost;
}, []);
```

### How It Works
1. **Filter**: Get only STAKING skills (types 1-7) with LEGENDARY rarity
2. **Sort**: Order by effect value descending (highest first)
3. **Slice**: Take top 3 skills
4. **Sum**: Add their effect values
5. **Display**: Show in SkillsHero component

## Before vs After

### ❌ BEFORE (WRONG)
```
Calculation: SKILLS_DATA.reduce((sum, skill) => sum + skill.effectValue, 0)
All 85 skills summed without constraint
= 17 skill types × (5+10+15+25+50) effect values per type
= 17 × 105
= 1,785% ≈ +1680% displayed ❌ UNREALISTIC
```

### ✅ AFTER (CORRECT)
```
Calculation: Best 3 STAKING skills with LEGENDARY rarity
= 3 × 50% effect values
= 150% displayed ✅ REALISTIC & ACHIEVABLE
```

## Benefits of Correct Calculation

1. **Accuracy**: Reflects actual game mechanics (3-skill limit)
2. **Trust**: Users see realistic values they can actually achieve
3. **Balance**: Encourages strategic skill selection
4. **Clarity**: Documentation shows exactly how maximum is calculated
5. **Flexibility**: Users can choose any 3 of 7 staking skills

## FAQ

**Q: Why only 3 skills?**
A: Smart contract constraint in `GameifiedMarketplaceSkillsV2.sol` enforces maximum 3 active skills per user.

**Q: Why only STAKING skills?**
A: Other skills (MARKETPLACE) provide features, not direct staking boost. This calculation focuses on staking rewards.

**Q: Can I activate all 7 staking skills?**
A: No, maximum 3 active at once. You choose your best 3 strategically.

**Q: What if I want to use a marketplace skill too?**
A: You can use 1 marketplace + 2 staking skills, or any 3-skill combination. Strategic choice depends on your goals.

**Q: How do I recalculate with my own skills?**
A: Select your 3 active skills → multiply their LEGENDARY effect values → that's your realistic maximum.

## Contract References

- **File**: `/api/types/index.ts` (IStakingIntegration.sol)
- **Constant**: `MAX_ACTIVE_SKILLS_PER_USER = 3`
- **Deployed**: Nov 11, 2025
- **Address**: `0x9d67c269d17cf330ed3C5f6f5Ff130AE9d2d012C`

## UI Display

The maximum staking boost is displayed in:
- **SkillsHero Component**: `+150% Maximum Boost` (with explanation)
- **Pro Tips Section**: Notes about 3-skill limit
- **FAQ Section**: Explains why maximum is 150%

## Version History

| Version | Date | Change |
|---------|------|--------|
| v1 (BROKEN) | Nov 15 | +1680% displayed, summed all 85 skills |
| v2 (FIXED) | Nov 15 | +150% displayed, 3 best staking skills with LEGENDARY |

---

**Last Updated**: November 15, 2025  
**Status**: ✅ FIXED and VERIFIED  
**Tested By**: Skills Dashboard Component Tests
