# Skill System Auto-Assignment Documentation

## Overview
When users mint Skill NFTs, the system now implements automatic skill assignment with restrictions to prevent duplicates.

## Key Features

### 1. **First Skill Auto-Assignment**
- When a user creates their **first Skill NFT**, the system automatically assigns **Staking Boost 5%** (skillType = 0)
- This skill is **FREE** and appears as "(FREE - Auto-assigned)"
- The dropdown is **disabled** for the first skill - users cannot change it
- This happens when `nftType` is set to "skill" and the user has no existing skills

### 2. **Duplicate Prevention**
- Users **cannot add the same skill twice** to a single NFT
- Once a skill is added to the form, it becomes unavailable in the dropdown
- The system checks: `skillAlreadyAdded = formData.skills.some((s, idx) => s.skillType === skillConfig.id && idx !== index)`

### 3. **Available Skills Limitation**
- The "Add Skill" button is **only enabled** when:
  - User has fewer than 5 skills (max allowed)
  - There are available skills not yet in the form
  - User hasn't purchased all possible skills

### 4. **User-Level Skill Tracking**
- The `useUserSkills()` hook queries the contract to check which skills the user has already purchased
- Only unpurchased skills can be added to new NFTs
- Once a user purchases a skill for an NFT, they cannot purchase it again

## Implementation Details

### Files Modified

#### 1. `src/hooks/nfts/useUserSkills.ts` (NEW)
- Fetches user's existing skills from the Smart Contract Skills Module
- Calculates available skills by filtering: `allSkills - userSkills`
- Returns:
  - `userSkills`: Array of skill IDs already owned
  - `isFirstSkill`: Boolean if user has no skills yet
  - `availableSkills`: Skills available for purchase
  - `hasSkills`: Boolean if user has any skills

#### 2. `src/components/tokenization/NFTDetails.tsx`
**Changes:**
- Added `useUserSkills()` hook integration
- Auto-assign first skill with `useEffect` when `nftType === 'skill'`
- Disable first skill dropdown: `disabled={index === 0}`
- Filter dropdown options to only show:
  - First skill: Only STAKE_BOOST_I (skillType = 0)
  - Other skills: Only unpurchased and non-duplicate
- Update "Add Skill" button condition:
  ```typescript
  {formData.skills.length < 5 && availableSkills.length > formData.skills.length && (...)}
  ```
- Added messages when all skills are used or max reached

#### 3. `src/pages/Tokenization.tsx`
**Changes:**
- Updated validation to only require skills for **Skill NFTs**, not Standard NFTs
- Condition: `if (formData.nftType === 'skill' && formData.skills.length === 0)`

## User Experience Flow

### Scenario 1: First Skill NFT
1. User selects "Skill NFT"
2. System auto-assigns "Staking Boost 5%" (FREE)
3. Dropdown is disabled - cannot change
4. User can click "Add Skill" to add more
5. Available skills: DESIGN, MARKETING, TRADING, COMMUNITY, WRITING

### Scenario 2: Existing User with Skills
1. User selects "Skill NFT"
2. System auto-assigns same first skill
3. Dropdown is disabled
4. "Add Skill" shows only remaining purchased skills
5. Each skill can only appear once in the form

### Scenario 3: All Skills Purchased
1. "Add Skill" button is disabled
2. Message: "All available skills are already added"
3. User can still modify existing skills or remove/re-add them

## Contract Integration

The system relies on:
- **Skills Module**: `VITE_GAMEIFIED_MARKETPLACE_SKILLS`
- **Function**: `getUserSkills(address)` - Returns array of skill IDs owned by user
- **Constraint**: Each user can own each skill at most once

## Technical Notes

### Type Safety
```typescript
type SkillType = 0 | 1 | 2 | 3 | 4 | 5; // CODING through WRITING
```

### Skills Mapping (0-5)
- 0: STAKE_BOOST_I (5% boost) - First Free Skill
- 1: DESIGN
- 2: MARKETING
- 3: TRADING
- 4: COMMUNITY
- 5: WRITING

### Rarity
- 0: COMMON (1 star) - Free for first skill
- 1: UNCOMMON (2 stars) - 40 POL
- 2: RARE (3 stars) - 60 POL
- 3: EPIC (4 stars) - 80 POL
- 4: LEGENDARY (5 stars) - 100 POL

## Edge Cases Handled

1. **No Skills Available**: Button disabled, message shown
2. **Max Skills (5)**: Button disabled, message shown
3. **Duplicate in Form**: Option hidden in dropdown
4. **User Already Owns Skill**: Option hidden in dropdown
5. **Switching NFT Type**: Skills cleared when switching to Standard

## Testing Checklist

- [ ] First Skill NFT auto-assigns Staking Boost 5%
- [ ] First skill dropdown is disabled
- [ ] Cannot add duplicate skills in same form
- [ ] Cannot add skills user already owns
- [ ] "Add Skill" button disabled when appropriate
- [ ] Messages display correctly for edge cases
- [ ] Standard NFTs don't require skills
- [ ] Switching NFT types clears skills correctly
- [ ] Max 5 skills enforced
