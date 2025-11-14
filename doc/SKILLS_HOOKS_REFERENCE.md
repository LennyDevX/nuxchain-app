// ═══════════════════════════════════════════════════════════════════════════════════════════════
// QUICK REFERENCE: Updated Skills Hooks (v0.20)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

// Updated Apollo Client - Now pointing to v0.20 (with corrected contract addresses)
// File: src/lib/apollo-client.ts
// Endpoint: https://api.studio.thegraph.com/query/122195/nuxchain/v0.20

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════════════════════════

// ═══ Example 1: Get skills from localStorage (fastest) ═══
import { useSkillsStore } from '@/hooks/skills/useSkillsStore';

function MySkillsComponent() {
  const { getUserSkills } = useSkillsStore();
  
  // Get skills immediately from localStorage (cached)
  const mySkills = getUserSkills();
  
  return (
    <div>
      {mySkills.map(skill => (
        <div key={skill.skillId}>
          {skill.skillName} - Level {skill.level}
        </div>
      ))}
    </div>
  );
}

// ═══ Example 2: Fetch skills from Subgraph (on-chain truth) ═══
import { useSkillsStore } from '@/hooks/skills/useSkillsStore';
import { useEffect, useState } from 'react';

function MySkillsGraphComponent() {
  const { getUserSkillsFromGraph } = useSkillsStore();
  const { address } = useAccount();
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (address) {
      getUserSkillsFromGraph(address).then(setSkills);
    }
  }, [address]);

  return (
    <div>
      {skills.map(skill => (
        <div key={skill.skillId}>
          {skill.skillName} - Active: {skill.isActive}
        </div>
      ))}
    </div>
  );
}

// ═══ Example 3: Merged data (localStorage + Subgraph) ═══
import { useSkillsStore } from '@/hooks/skills/useSkillsStore';
import { useEffect, useState } from 'react';

function MySkillsMergedComponent() {
  const { getUserSkillsMerged } = useSkillsStore();
  const { address } = useAccount();
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (address) {
      // Gets best of both worlds: fast localStorage + accurate subgraph state
      getUserSkillsMerged(address).then(setSkills);
    }
  }, [address]);

  return (
    <div>
      {skills.map(skill => (
        <div key={skill.skillId}>
          {skill.skillName} - Expires: {new Date(skill.expiresAt * 1000).toLocaleDateString()}
        </div>
      ))}
    </div>
  );
}

// ═══ Example 4: Sync skills with subgraph (refresh) ═══
import { useSkillsStore } from '@/hooks/skills/useSkillsStore';

function RefreshSkillsComponent() {
  const { syncSkillsWithGraph } = useSkillsStore();
  const { address } = useAccount();

  const handleRefresh = async () => {
    if (address) {
      // This fetches from subgraph and updates localStorage
      const updatedSkills = await syncSkillsWithGraph(address);
      console.log('Skills synced:', updatedSkills);
    }
  };

  return <button onClick={handleRefresh}>Refresh Skills</button>;
}

// ═══ Example 5: Purchase skill with toast ═══
import { useSkillsStore } from '@/hooks/skills/useSkillsStore';
import { toast } from 'react-hot-toast';
import { SKILLS_DATA } from '@/components/skills/config';

async function handleBuySkill(skillType: number) {
  const { purchaseSkill } = useSkillsStore();
  const skill = SKILLS_DATA.find(s => s.skillType === skillType);
  
  if (skill) {
    try {
      await purchaseSkill(skill, 1, 'Purchased from store');
      // Toast handled automatically in purchaseSkill
    } catch (error) {
      toast.error(`Failed to purchase: ${error.message}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// NEW HOOK: useSkillsGraph
// ═══════════════════════════════════════════════════════════════════════════════════════════════

// File: src/hooks/skills/useSkillsGraph.ts
// Purpose: Query IndividualSkillsMarketplace events from The Graph Subgraph v0.20

import { useSkillsGraph } from '@/hooks/skills/useSkillsGraph';

function SkillsGraphExample() {
  const {
    skills,           // Latest fetched skills array
    activations,      // Latest fetched activation events
    isLoading,        // Boolean loading state
    error,            // Error message if any
    
    // Methods
    getUserSkills,                // Fetch user's purchases
    getUserSkillActivations,      // Fetch user's activations
    getUserSkillsComprehensive,   // Fetch purchases + activations + deactivations
    getSkillsByCategory,          // Filter staking vs active
    getActiveSkills,              // Filter non-expired
    getExpiredSkills,             // Filter expired
  } = useSkillsGraph();

  // Fetch skills from subgraph
  const fetchMySkills = async (userAddress: string) => {
    const purchases = await getUserSkills(userAddress);
    
    // Filter by category
    const { staking, active } = getSkillsByCategory(purchases);
    
    // Get only non-expired
    const activeOnly = getActiveSkills(purchases);
    
    console.log('Staking skills:', staking);
    console.log('Active skills:', active);
    console.log('Non-expired:', activeOnly);
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// APOLLO CLIENT UPDATE
// ═══════════════════════════════════════════════════════════════════════════════════════════════

// Before: v0.19
// SUBGRAPH_URL = "https://api.studio.thegraph.com/query/122195/nuxchain/v0.19"

// After: v0.20 (with corrected contract addresses)
// SUBGRAPH_URL = "https://api.studio.thegraph.com/query/122195/nuxchain/v0.20"

// Contract Addresses (all synchronized across .env, frontend, and subgraph):
// - VITE_GAMEIFIED_MARKETPLACE_PROXY=0x3b0111517f7D622f9e011A726616627F5Fa4DFD8
// - VITE_INDIVIDUAL_SKILLS=0x8B2a87A05a7703426b1Ad3D733c61Dd4B40fF538
// - VITE_ENHANCED_SMARTSTAKING_ADDRESS=0x1E005153769F73327c4a74Ef3Dc03d53BDeB4DCe

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// READING SKILLS IN FRONTEND
// ═══════════════════════════════════════════════════════════════════════════════════════════════

// Strategy 1: Use localStorage for instant display (after purchase)
// - Fast (no network)
// - Persists across sessions
// - Available immediately after purchaseSkill()

// Strategy 2: Use Subgraph for on-chain verification
// - Indexed events from IndividualSkillsMarketplace contract
// - Accessible across devices
// - May have slight delay (typically 10-30s after transaction)

// Strategy 3: Use merged approach (recommended)
// - Combines localStorage (fast) + Subgraph (accurate)
// - Deduplicates by skillId
// - Automatically syncs when subgraph updates

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// FILES UPDATED
// ═══════════════════════════════════════════════════════════════════════════════════════════════

// 1. src/lib/apollo-client.ts
//    - Updated endpoint: v0.19 → v0.20
//    - Comment updated

// 2. src/hooks/skills/useSkillsStore.ts
//    - Added: useSkillsGraph integration
//    - Added: getUserSkillsFromGraph() - fetch from subgraph
//    - Added: getUserSkillsMerged() - localStorage + subgraph
//    - Added: syncSkillsWithGraph() - refresh and sync
//    - Existing: getUserSkills() - localStorage only (unchanged)

// 3. src/hooks/skills/useSkillsGraph.ts (NEW FILE)
//    - Full GraphQL query system for skills
//    - Queries: GET_USER_SKILLS, GET_USER_SKILL_ACTIVATIONS, GET_USER_SKILLS_COMPREHENSIVE
//    - Filters: getSkillsByCategory(), getActiveSkills(), getExpiredSkills()

// ═══════════════════════════════════════════════════════════════════════════════════════════════
// SUBGRAPH DATA SOURCES (v0.20)
// ═══════════════════════════════════════════════════════════════════════════════════════════════

// Events indexed by Subgraph:
// 1. SkillPurchased
//    - skillId, skillType, rarity, level, price, timestamp, user, transactionHash, metadata
//    - Available after purchase confirmation

// 2. SkillActivated
//    - skillId, user, timestamp, transactionHash
//    - Available after activation

// 3. SkillDeactivated
//    - skillId, user, timestamp, transactionHash

// 4. SkillExpired
//    - skillId, user, timestamp

// 5. SkillRenewed
//    - skillId, price, timestamp

// ═══════════════════════════════════════════════════════════════════════════════════════════════
