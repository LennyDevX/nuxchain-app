/**
 * Skills Module Structure - UPDATED v2
 * =====================================
 * 
 * Complete modularized implementation of the Skills Dashboard
 * with NEW rarity-based organization
 * 
 * Directory Structure:
 * src/components/skills/
 * ├── index.ts                      # Barrel export for all components
 * ├── config.ts                     # Configuration, types, and data generation
 * ├── SkillCard.tsx                # Individual skill display card (now supports compact mode)
 * ├── SkillDetailModal.tsx         # Detailed view modal
 * ├── SkillsGrid.tsx               # Original grid layout (kept for backwards compatibility)
 * ├── SkillsGridByRarity.tsx       # ✨ NEW - Organized by Category & Rarity with collapsible sections
 * ├── SkillsHero.tsx               # Hero section with stats
 * ├── SkillsStakingImpact.tsx      # Staking impact visualization
 * ├── SkillsFAQ.tsx                # FAQ section
 * └── SkillsCTA.tsx                # Call-to-action section
 * 
 * src/pages/
 * └── Skills.tsx                    # Parent component (now uses SkillsGridByRarity)
 * 
 * NEW FEATURES (v2):
 * ==================
 * 
 * 1. ✨ Organized by Category & Rarity
 *    - Skills grouped in 2 categories: STAKING, MARKETPLACE
 *    - Each category has 5 rarity sections: COMMON → LEGENDARY
 *    - Total: 17 skill types × 5 rarities = 85 unique combinations
 * 
 * 2. 📦 Collapsible Sections
 *    - Click any rarity header to expand/collapse
 *    - Shows skill count for each rarity
 *    - Smooth animations with AnimatePresence
 *    - Reduces scroll distance from ~5000px to ~200px when collapsed
 * 
 * 3. 🎨 Color-Coded Indicators
 *    - Each rarity has unique color
 *    - Skill count badges in headers
 *    - Visual rarity guide at bottom
 *    - Effect multiplier reference (1.0x → 1.8x)
 * 
 * 4. 📱 Compact Display Mode
 *    - SkillCard now supports isCompact={true}
 *    - Smaller cards (text-sm instead of text-lg)
 *    - Optimal grid for expanded rarity sections
 *    - 3 columns that don't overflow on mobile
 * 
 * 5. 💡 Smart Information Design
 *    - Category descriptions (hover/read)
 *    - Rarity multiplier reference section
 *    - Pro tips box with best practices
 *    - Skill count and effect information inline
 * 
 * Data Structure:
 * ================
 * 
 * 17 Skill Types (from IStakingIntegration.sol):
 * 
 * STAKING SKILLS (7):
 * - STAKE_BOOST_I (1): +5% APY
 * - STAKE_BOOST_II (2): +10% APY  
 * - STAKE_BOOST_III (3): +20% APY (MAX)
 * - AUTO_COMPOUND (4): Auto-reinvest
 * - LOCK_REDUCER (5): -25% lock time
 * - FEE_REDUCER_I (6): -10% fees
 * - FEE_REDUCER_II (7): -25% fees (MAX)
 * 
 * MARKETPLACE SKILLS (10):
 * - PRIORITY_LISTING (8): Featured placement
 * - BATCH_MINTER (9): Multi-mint capability
 * - VERIFIED_CREATOR (10): Creator badge
 * - INFLUENCER (11): 2x social weight
 * - CURATOR (12): Create collections
 * - AMBASSADOR (13): 2x referrals
 * - VIP_ACCESS (14): Exclusive drops
 * - EARLY_ACCESS (15): 24h early access
 * - PRIVATE_AUCTIONS (16): Auction access
 * 
 * Rarity Multipliers (All Rarities):
 * - COMMON: 1.0x (5%)
 * - UNCOMMON: 1.1x (10%)
 * - RARE: 1.2x (15%)
 * - EPIC: 1.4x (25%)
 * - LEGENDARY: 1.8x (50%)
 * 
 * MAXIMUM STAKING BOOST CALCULATION:
 * ==================================
 * Important: Users can ONLY have 3 ACTIVE skills simultaneously (GameifiedMarketplaceSkillsV2.sol)
 * 
 * Previous (WRONG): Summed all 85 skills = ~1680% ❌ Unrealistic
 * Current (CORRECT): Sum of 3 best STAKING skills with LEGENDARY rarity = 150% ✅
 * 
 * Formula:
 * - Only STAKING skills count (7 types: STAKE_BOOST_I/II/III, AUTO_COMPOUND, LOCK_REDUCER, FEE_REDUCER_I/II)
 * - Only LEGENDARY rarity (highest effect = 50% each)
 * - Maximum 3 active skills = 3 × 50% = 150% max realistic boost
 * 
 * Real-world scenarios:
 * - Best case: STAKE_BOOST_III (20%) + LOCK_REDUCER (25%) + FEE_REDUCER_II (25%) = 70% net staking boost
 * - User decision: Choose 3 from 7 staking skills strategically
 * - Effects stack: All chosen skills apply simultaneously
 * 
 * Color Scheme:
 * - COMMON: Gray (#A0AEC0)
 * - UNCOMMON: Green (#48BB78)
 * - RARE: Blue (#4299E1)
 * - EPIC: Purple (#9F7AEA)
 * - LEGENDARY: Orange (#ED8936)
 * 
 * Usage in Parent Component (Skills.tsx):
 * ========================================
 * 
 * import {
 *   SkillDetailModal,
 *   SkillsGridByRarity,    // NEW component
 *   SkillsHero,
 *   SkillsStakingImpact,
 *   SkillsFAQ,
 *   SkillsCTA,
 *   SKILLS_DATA,
 *   type SkillData,
 * } from '../components/skills';
 * 
 * Usage:
 * <SkillsGridByRarity 
 *   skills={SKILLS_DATA}           // 85 total skills
 *   onSkillClick={handleSkillClick}
 * />
 * 
 * Key Improvements:
 * =================
 * 
 * 1. ✅ Better UX for 85+ skills
 *    - No massive scroll on first load
 *    - Click to expand only what you need
 *    - Information architecture clear
 * 
 * 2. ✅ Performance
 *    - Initial render lightweight
 *    - AnimatePresence for efficient DOM updates
 *    - Grouped rendering for skill cards
 * 
 * 3. ✅ Flexibility
 *    - Can switch between SkillsGrid and SkillsGridByRarity
 *    - Both use same SkillCard component
 *    - SkillCard supports both full and compact modes
 * 
 * 4. ✅ Responsive
 *    - Mobile: 1 col in expanded sections
 *    - Tablet: 2 cols
 *    - Desktop: 3 cols
 *    - Headers adapt to screen size
 * 
 * Component Props:
 * ================
 * 
 * SkillsGridByRarity:
 * - skills: SkillData[] (85 total)
 * - onSkillClick: (skill: SkillData) => void
 * 
 * SkillCard (Enhanced):
 * - skill: SkillData
 * - onClick: (skill: SkillData) => void  
 * - isCompact?: boolean (new!)
 * 
 * Animation States:
 * =================
 * - Rarity headers: Expand/collapse with rotate icon
 * - Skill cards: Fade in + scale up when expanded
 * - Pro tips: Slide up on view
 * - Legends: Fade in on scroll
 */

