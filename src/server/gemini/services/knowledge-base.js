const knowledgeBase = [
  // === GENERAL INFORMATION ===
  {
    content: "Nuxchain is a comprehensive decentralized platform that combines staking, NFT marketplace, airdrops and tokenization. It's a complete ecosystem for digital asset management and passive income generation. The platform includes EnhancedSmartStaking v4.0 contracts with gamification features (XP, levels, quests, achievements), GameifiedMarketplace v3.0 with Skills NFT system, AI-powered chat (Nuxbee AI 1.0 with upcoming dedicated platform), Developer Hub with Web3 infrastructure tools, and tokenization tools. Built with React 19, Vite 7.1, TypeScript 5.7, TailwindCSS 4.0, Wagmi v2 and Viem 2.38 for blockchain interactions.",
    metadata: { type: "general", category: "platform", topic: "overview" },
    commands: ['Nuxchain', 'Nuxchain platform', 'Nuxchain general', 'what is Nuxchain']
  },
  {
    content: "Nuxchain Vision: To develop innovative services and products using cutting-edge technologies like blockchain, AI, and dApps. Our mission is to bring the power of security and decentralization to the masses in all possible forms, driving a powerful economy guided by user sentiment and dedication.",
    metadata: { type: "general", category: "company", topic: "vision-mission" },
    commands: ['Nuxchain vision', 'Nuxchain mission', 'Nuxchain philosophy']
  },
  {
    content: "Nuxchain differentiates itself by not having a traditional token or cryptocurrency. Instead, we focus on NFTs 2.0 - digital art representations with unique and powerful benefits that gamify the user experience both within and outside the Nuxchain ecosystem. This approach creates sustainable value through utility rather than speculation, driving a powerful economy guided by user sentiment and dedication. The platform uses POL (Polygon's native token) for all transactions and gas fees.",
    metadata: { type: "general", category: "strategy", topic: "differentiation" },
    commands: ['Nuxchain differentiation', 'Nuxchain no token', 'Nuxchain NFTs focus', 'Nuxchain user economy', 'Nuxchain POL']
  },

  // === SMART STAKING CONTRACT ===
  {
    content: "Nuxchain SmartStaking contract allows users to deposit POL tokens and earn automatic rewards. Main functions include: deposit() for staking tokens, withdraw() for partial withdrawals, withdrawAll() for complete withdrawal, calculateRewards() for checking pending rewards, claimRewards() for claiming only rewards, compound() for reinvesting rewards, and emergencyWithdraw() for emergency situations.",
    metadata: { type: "smart-contract", category: "staking", topic: "overview" },
    commands: ['Nuxchain smart contract', 'Nuxchain SmartStaking', 'Nuxchain functions']
  },
  {
    content: "Nuxchain SmartStaking has deposit limits: minimum 5 POL and maximum 10000 POL per deposit. Maximum 300 deposits per user. Daily withdrawal limit is 1000 POL for security. The contract includes custom errors like AlreadyMigrated, DailyWithdrawalLimitExceeded, NoRewardsAvailable for better error handling.",
    metadata: { type: "smart-contract", category: "staking", topic: "limits" },
    commands: ['Nuxchain limits', 'Nuxchain deposit minimum', 'Nuxchain errors']
  },
  {
    content: "Nuxchain SmartStaking reward calculation: Uses base hourly ROI with lockup bonuses. Lockup periods offer different rates: Flexible (no lockup): 0.005% per hour (43.8% APY), 30 days: 0.010% per hour (87.6% APY), 90 days: 0.014% per hour (122.64% APY), 180 days: 0.017% per hour (149.28% APY), 365 days: 0.025% per hour (219% APY). Rewards are calculated in real-time and can be claimed or compounded at any time. Daily withdrawal limit is 1000 POL for security. Commission rate is 6% on rewards.",
    metadata: { type: "smart-contract", category: "staking", topic: "rewards-calculation" },
    commands: ['Nuxchain rewards calculation', 'Nuxchain ROI', 'Nuxchain compound', 'Nuxchain lockup']
  },

  // === STAKING INFORMATION ===
  {
    content: "Nuxchain staking allows depositing POL tokens in the SmartStaking contract to earn automatic rewards. Rewards are calculated based on time held and lockup period selected.",
    metadata: { type: "staking", category: "guide", topic: "basics" },
    commands: ['Nuxchain staking', 'Nuxchain rewards']
  },
  {
    content: "How to stake in Nuxchain: 1) Connect wallet with POL tokens, 2) Go to Staking section, 3) Enter amount (min 5 POL), 4) Select lockup period (0, 30, 90, 180, or 365 days), 5) Confirm transaction. Rewards calculated automatically based on your lockup period.",
    metadata: { type: "staking", category: "tutorial", topic: "how-to" },
    commands: ['Nuxchain how to stake']
  },
  {
    content: "Claiming rewards in Nuxchain: Use claimRewards() to withdraw only rewards or withdrawAll() to withdraw capital + rewards. Funds are locked during the lockup period. After lockup expires, you can withdraw anytime without penalties.",
    metadata: { type: "staking", category: "tutorial", topic: "claiming" },
    commands: ['Nuxchain claim rewards']
  },
  {
    content: "Nuxchain Lockup Periods Explained: When you stake POL tokens, you can choose a lockup period that determines your reward rate. Flexible (0 days): 0.005% per hour, withdraw anytime. 30 days lockup: 0.010% per hour, double the flexible rewards, funds locked for 30 days. 90 days lockup: 0.014% per hour, 2.8x the flexible rewards, funds locked for 90 days. 180 days lockup: 0.017% per hour, 3.4x the flexible rewards, funds locked for 180 days. 365 days lockup: 0.025% per hour, 5x the flexible rewards, funds locked for 365 days. The longer you lock your tokens, the higher your hourly rewards. All rewards are calculated and accumulated automatically every hour.",
    metadata: { type: "staking", category: "rewards", topic: "lockup-periods" },
    commands: ['Nuxchain lockup periods', 'Nuxchain staking periods', 'Nuxchain lock duration', 'Nuxchain lockup options']
  },
  {
    content: "Nuxchain APY base is 0.005% per hour with flexible (no lockup) option, which equals approximately 43.8% APY annually. This is the fundamental return a user can expect when depositing POL tokens in the SmartStaking contract without any lockup period. The base APY is calculated hourly and accumulates automatically, allowing users to see their rewards grow in real-time. This is the minimum return, and it can be significantly increased by choosing longer lockup periods.",
    metadata: { type: "staking", category: "rewards", topic: "apy-base" },
    commands: ['Nuxchain APY base', 'Nuxchain base return', 'Nuxchain base rate', 'APY no lockup']
  },
  {
    content: "Nuxchain APY tiers based on lockup periods: Flexible: 0.005% per hour (43.8% APY), 30 days lockup: 0.010% per hour (87.6% APY), 90 days lockup: 0.014% per hour (122.64% APY), 180 days lockup: 0.017% per hour (149.28% APY), 365 days lockup: 0.025% per hour (219% APY). Commission rate is 6% on rewards. Daily withdrawal limit is 1000 POL.",
    metadata: { type: "staking", category: "rewards", topic: "apy-tiers" },
    commands: ['Nuxchain APY', 'Nuxchain rates', 'Nuxchain lockup rates']
  },
  {
    content: "Compound feature in Nuxchain SmartStaking: The compound() function allows you to reinvest your accumulated rewards back into staking without withdrawing. When you compound, your rewards are automatically converted into a new deposit, and you can choose a new lockup period for the compounded amount. This creates a powerful compounding effect: your original deposit continues earning at its rate, while your rewards start earning additional rewards. Example: If you have 100 POL staked with 10 POL in rewards, compounding creates a new 10 POL deposit, so you'll now be earning rewards on 110 POL total. You can compound as often as you like, and each compounded amount can have its own lockup period.",
    metadata: { type: "staking", category: "advanced", topic: "compounding" },
    commands: ['Nuxchain compound', 'Nuxchain compounding', 'Nuxchain reinvest rewards']
  },
  {
    content: "Staking risks in Nuxchain: Smart contract risk (mitigated by audits), lockup period restrictions (funds locked for chosen duration), market volatility of POL token. Platform has emergency functions for security. During lockup period, you cannot withdraw your principal amount until the period expires.",
    metadata: { type: "staking", category: "guide", topic: "risks" },
    commands: ['Nuxchain risks']
  },

  // === ENHANCED SMART STAKING V4.0 - GAMIFICATION ===
  {
    content: "EnhancedSmartStaking v4.0 includes advanced gamification features that reward user engagement and participation. The system includes: XP (Experience Points) system where users earn points for staking activities, deposits, and quest completion. Level System with 100 levels where users level up by accumulating XP (e.g., Level 1 requires 100 XP, Level 10 requires 10,000 XP). Quest System with different quest types (STAKE_POL, COMPOUND_REWARDS, ACTIVATE_SKILL, etc.) that reward users with XP and POL bonuses. Achievement System tracking milestones like 'First Deposit', 'Level 10 Reached', '1000 POL Staked'. Badge System displaying earned achievements. Auto-Compound feature allowing automatic reinvestment of rewards. Integration with GameifiedMarketplace for cross-platform progression.",
    metadata: { type: "staking", category: "gamification", topic: "features" },
    commands: ['Nuxchain gamification', 'Nuxchain XP', 'Nuxchain levels', 'Nuxchain quests', 'Nuxchain achievements', 'staking gamification']
  },
  {
    content: "Nuxchain XP (Experience Points) System: Users earn XP through various platform activities. XP is awarded for: staking deposits (proportional to amount staked), completing quests (varies by quest difficulty), claiming rewards, compounding rewards, activating skills, reaching staking milestones, maintaining active stakes, and participating in community governance. XP accumulates over time and determines user level. Higher levels unlock special perks, increased quest rewards, achievement milestones, and platform status. Level calculation: Level = sqrt(totalXP / 100), meaning Level 1 requires 100 XP, Level 10 requires 10,000 XP, Level 50 requires 250,000 XP. XP never decreases and persists across deposits. Each level-up awards bonus POL rewards to the user.",
    metadata: { type: "staking", category: "gamification", topic: "xp-system" },
    commands: ['Nuxchain XP', 'experience points', 'how to earn XP', 'XP system', 'level up']
  },
  {
    content: "Nuxchain Quest System: Quests are challenges users can complete to earn XP and POL rewards. Quest types include: STAKE_POL (stake a specific amount), COMPOUND_REWARDS (compound your rewards), ACTIVATE_SKILL (activate a Skill NFT), REACH_LEVEL (achieve a certain level), HOLD_STAKE (maintain stake for duration), CLAIM_REWARDS (claim rewards X times), REFER_USER (invite friends), and COMPLETE_ACHIEVEMENT (earn specific achievements). Each quest has: unique ID, name and description, required action and target amount, XP reward (e.g., 500 XP), POL bonus reward (optional), active status (can be deactivated by admins), completion tracking per user. Users can track quest progress in their profile dashboard. Completing quests contributes to XP accumulation and leveling up. Quest rewards are claimable through the staking interface.",
    metadata: { type: "staking", category: "gamification", topic: "quest-system" },
    commands: ['Nuxchain quests', 'quest system', 'how to complete quests', 'quest rewards', 'quest types']
  },
  {
    content: "Nuxchain Achievement System: Achievements are milestones that recognize user accomplishments on the platform. Achievement categories include: First Steps (First Deposit, First Claim, First Compound), Staking Milestones (100 POL Staked, 1000 POL Staked, 10,000 POL Staked), Level Milestones (Reach Level 5, Level 10, Level 25, Level 50, Level 100), Quest Completion (Complete 5 Quests, 10 Quests, 50 Quests), Skill Master (Activate First Skill, Activate 3 Skills), Time-Based (30-Day Streak, 90-Day Streak, 365-Day Streak), and Community (Refer 5 Users, Refer 20 Users). Each achievement awards: XP bonus, optional POL reward, collectible badge displayed on profile, exclusive user status. Achievements unlock progressively and are permanently recorded on-chain. Badge collection showcases user dedication and activity level.",
    metadata: { type: "staking", category: "gamification", topic: "achievement-system" },
    commands: ['Nuxchain achievements', 'achievement system', 'badges', 'milestones', 'how to earn achievements']
  },
  {
    content: "Nuxchain Auto-Compound Feature: Integrated in EnhancedSmartStaking v4.0, allows users to automate reward reinvestment. Users can enable auto-compound in their staking settings with configuration options: minimum amount threshold (e.g., only compound when rewards >= 10 POL), compound frequency (daily, weekly, or when threshold met), lockup period for compounded amount (flexible or match original deposit). Benefits include: maximize compound interest effect, reduce gas costs by batching, hands-free portfolio growth, optimal reinvestment timing. Auto-compound triggers when conditions are met and executes compound() function automatically. Users maintain full control and can disable anytime. Compounded amounts start earning immediately based on selected lockup period. This feature is especially powerful when combined with high APY tiers and long-term staking strategies.",
    metadata: { type: "staking", category: "advanced", topic: "auto-compound" },
    commands: ['Nuxchain auto compound', 'auto compounding', 'automated reinvestment', 'compound automation']
  },

  // === SKILLS NFT SYSTEM ===
  {
    content: "Nuxchain Skills NFT System powered by GameifiedMarketplaceSkillsV2: Revolutionary NFT system where skills provide real utility for staking and marketplace activities. Skills are divided into two categories: STAKING SKILLS (Types 1-7) that enhance staking rewards and reduce fees, and ACTIVE SKILLS (Types 8-16) that unlock platform features. Each skill has a rarity (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY) affecting its power and price. Skills have 30-day duration and can be renewed at 50% discount. Users can have maximum 3 active skills simultaneously. Minimum 250 POL staking required to activate any skill. Skills can be purchased, gifted, transferred, and traded as NFTs on the marketplace.",
    metadata: { type: "skills", category: "nft", topic: "overview" },
    commands: ['Nuxchain skills', 'Skills NFT', 'skill system', 'what are skills', 'NFT skills']
  },
  {
    content: "Nuxchain Staking Skills (Types 1-7): These skills enhance your staking performance and rewards. STAKE_BOOST_I (Type 1): Increases staking APY by 5-20% based on rarity. STAKE_BOOST_II (Type 2): Increases staking APY by 8-25% based on rarity. STAKE_BOOST_III (Type 3): Increases staking APY by 10-30% based on rarity. AUTO_COMPOUND (Type 4): Enables automatic reward compounding at optimal intervals. LOCK_REDUCER (Type 5): Reduces lockup period by 10-40% while maintaining same APY tier. FEE_REDUCER_I (Type 6): Reduces staking commission fees by 1-3% based on rarity. FEE_REDUCER_II (Type 7): Reduces staking commission fees by 2-5% based on rarity. Prices for staking skills: COMMON 50 POL, UNCOMMON 80 POL, RARE 100 POL, EPIC 150 POL, LEGENDARY 220 POL. Higher rarity provides stronger effects. Skills stack with base APY rates for maximum returns.",
    metadata: { type: "skills", category: "staking", topic: "staking-skills" },
    commands: ['staking skills', 'skill types', 'stake boost', 'auto compound skill', 'fee reducer', 'lock reducer']
  },
  {
    content: "Nuxchain Active Skills (Types 8-16): Platform feature skills that unlock advanced marketplace capabilities. PRIORITY_LISTING (Type 8): NFT listings appear at top of marketplace, increasing visibility. BATCH_MINTER (Type 9): Mint multiple NFTs in single transaction, saving gas fees. VERIFIED_CREATOR (Type 10): Verified badge on profile, building trust and credibility. ANALYTICS_ACCESS (Type 11): Access advanced marketplace analytics and insights. CUSTOM_ROYALTY (Type 12): Set custom royalty rates on NFT sales. BULK_TRANSFER (Type 13): Transfer multiple NFTs at once, reducing transaction costs. FEATURED_COLLECTION (Type 14): Collection featured prominently on homepage. EARLY_ACCESS (Type 15): Get early access to new features and drops. DISCOUNT_MASTER (Type 16): Receive marketplace fee discounts (2-10% based on rarity). Active Skills pricing: 30% markup over staking skills - COMMON 65 POL, UNCOMMON 104 POL, RARE 130 POL, EPIC 195 POL, LEGENDARY 286 POL. These skills enhance marketplace experience and provide competitive advantages.",
    metadata: { type: "skills", category: "marketplace", topic: "active-skills" },
    commands: ['active skills', 'marketplace skills', 'priority listing', 'verified creator', 'batch minter', 'analytics access']
  },
  {
    content: "Skills NFT Purchase and Renewal System: Skills can be purchased from the Nuxchain Store as NFTs. Purchase process: 1) Browse skills by category (Staking/Active) or rarity, 2) Select desired skill and rarity tier, 3) Pay price in POL (prices vary by type and rarity), 4) Receive Skill NFT in wallet, 5) Activate skill in staking dashboard (requires min 250 POL staked). Skill Duration: 30 days from activation. Renewal System: After 30 days, skills expire and become inactive. Renewal cost: 50% of original purchase price (e.g., RARE Stake Boost originally 100 POL, renewal 50 POL). Renewal extends skill for another 30 days. Users can renew anytime after expiration. Max Active Skills: 3 skills total can be active simultaneously per user. Skills can be deactivated and reactivated (deactivation requires 25% fee). Unopened/unactivated skills can be transferred or gifted to other users.",
    metadata: { type: "skills", category: "purchase", topic: "buying-renewal" },
    commands: ['buy skills', 'purchase skills', 'skill renewal', 'renew skill', 'skill expiration', 'skill activation']
  },
  {
    content: "Skills NFT Rarities and Power Levels: Each skill comes in 5 rarity tiers affecting its effectiveness and price. COMMON (Rarity 0): Base effect, most affordable. Example: Stake Boost I +5% APY, costs 50 POL for staking skills or 65 POL for active skills. UNCOMMON (Rarity 1): Enhanced effect, moderate price. Example: Stake Boost I +10% APY, costs 80 POL staking / 104 POL active. RARE (Rarity 2): Strong effect, premium price. Example: Stake Boost I +15% APY, costs 100 POL staking / 130 POL active. EPIC (Rarity 3): Very strong effect, high price. Example: Stake Boost I +18% APY, costs 150 POL staking / 195 POL active. LEGENDARY (Rarity 4): Maximum effect, highest price. Example: Stake Boost I +20% APY, costs 220 POL staking / 286 POL active. Rarity affects skill effectiveness proportionally - higher rarity = more powerful effect. Choose rarity based on budget and desired impact on staking/marketplace performance.",
    metadata: { type: "skills", category: "rarity", topic: "power-tiers" },
    commands: ['skill rarity', 'skill tiers', 'legendary skills', 'epic skills', 'common skills', 'skill power']
  },

  // === MARKETPLACE ===
  {
    content: "Nuxchain NFT marketplace allows users to buy, sell and trade NFTs using POL tokens. Supports ERC-721 tokens with metadata display, filtering options, and advanced search. Features include: listing NFTs for sale, purchasing NFTs with POL tokens, viewing detailed NFT information with rarity and traits, marketplace statistics and analytics, collection browsing, and price history tracking. The marketplace integrates with Alchemy and Moralis APIs for comprehensive NFT data.",
    metadata: { type: "marketplace", category: "nft", topic: "overview" },
    commands: ['Nuxchain marketplace', 'Nuxchain NFT', 'Nuxchain buy NFT', 'Nuxchain sell NFT']
  },
  {
    content: "Nuxchain marketplace features advanced filtering and search capabilities. Users can filter NFTs by: collection, price range, rarity, traits/attributes, listing status (for sale, sold, not listed), and creation date. The marketplace dashboard shows real-time statistics including total volume, floor prices, trending collections, and recent sales. Caching system ensures fast loading of NFT metadata and images. Future marketplace enhancements (Q1 2026) include advanced search and filtering system, bulk listing/delisting capabilities, auction system implementation, offer/bid management, collection verification badges, and improved image loading and caching.",
    metadata: { type: "marketplace", category: "nft", topic: "features" },
    commands: ['Nuxchain marketplace filters', 'Nuxchain NFT search', 'Nuxchain marketplace stats']
  },
  {
    content: "Nuxchain marketplace offers system includes: createOffer(), acceptOffer(), rejectOffer(), cancelOffer(). Offers have expiration date and require POL deposit.",
    metadata: { type: "marketplace", category: "offers", topic: "system" },
    commands: ['Nuxchain marketplace', 'Nuxchain offers']
  },

  // === NFT INFORMATION ===
  {
    content: "Nuxchain NFTs 2.0 represent a revolutionary approach to digital art and utility. Unlike traditional NFTs, our NFTs 2.0 create an exclusive ecosystem that avoids FOMO and liquidity exit losses, increasing perceived value through real utilities. They serve as digital art representations with unique and powerful benefits that gamify the user experience both within and outside the Nuxchain ecosystem. All NFT transactions use POL as the payment and gas token.",
    metadata: { type: "nft", category: "concept", topic: "nfts-2.0" },
    commands: ['Nuxchain NFTs 2.0', 'Nuxchain digital art', 'Nuxchain NFT ecosystem']
  },
  {
    content: "NFT utility in Nuxchain includes: Governance voting rights, staking bonuses (enhanced APY for NFT holders), exclusive access to features, marketplace fee discounts, participation in special airdrops, gamification rewards, and cross-platform benefits. NFT holders may receive enhanced staking rates on their POL deposits, reduced marketplace fees, and priority access to new features. These utilities make NFTs functional assets rather than just collectibles, providing ongoing value to holders and creating a sustainable ecosystem.",
    metadata: { type: "nft", category: "utility", topic: "benefits" },
    commands: ['Nuxchain NFT', 'Nuxchain NFT utility', 'Nuxchain NFT benefits']
  },

  // === AIRDROPS ===
  {
    content: "Nuxchain airdrops reward early adopters and active users with POL tokens and exclusive NFTs. Eligibility based on wallet activity, staking participation, platform engagement, and holding specific NFTs. Current upcoming airdrops include: POL Token rewards for early platform users with enhanced staking rewards, and Governance NFT airdrop for active community members with voting rights and exclusive access. Registration is required through the Airdrops Dashboard.",
    metadata: { type: "airdrops", category: "rewards", topic: "eligibility" },
    commands: ['Nuxchain airdrop', 'Nuxchain rewards', 'Nuxchain POL airdrop', 'Nuxchain governance NFT']
  },
  {
    content: "Nuxchain airdrop system includes multiple distribution mechanisms: automatic airdrops for eligible users, manual claim processes through the dashboard, and time-limited campaigns. The Airdrop contract handles secure token distribution with functions like claimAirdrop(), checkEligibility(), and getAirdropInfo(). Users can track their airdrop history and upcoming eligibility through their profile dashboard.",
    metadata: { type: "airdrops", category: "process", topic: "distribution" },
    commands: ['Nuxchain airdrop claim', 'Nuxchain airdrop contract', 'Nuxchain airdrop history']
  },
  {
    content: "To participate in Nuxchain airdrops: 1) Keep POL in staking, 2) Participate in community, 3) Own Nuxchain NFTs, 4) Keep wallet connected during snapshots.",
    metadata: { type: "airdrops", category: "tutorial", topic: "participation" },
    commands: ['Nuxchain participate airdrop']
  },
  {
    content: "Nuxchain airdrops are announced on Discord, Twitter and the platform. Snapshots are taken on specific dates and tokens are distributed automatically.",
    metadata: { type: "airdrops", category: "process", topic: "distribution" },
    commands: ['Nuxchain airdrop announcements']
  },

  // === NUXBEE AI 1.0 ===
  {
    content: "Nuxbee AI 1.0 is Nuxchain's advanced intelligent assistant powered by cutting-edge language models. Provides real-time information about the ecosystem, helps with transactions, answers questions, and offers personalized recommendations. Nuxbee will have its own dedicated platform where users can access advanced features and capabilities beyond the basic chat interface.",
    metadata: { type: "ai", category: "nuxbee", topic: "overview" },
    commands: ['Nuxbee AI', 'AI assistant', 'Nuxbee platform']
  },
  {
    content: "Nuxbee AI capabilities: Natural language processing, multimodal input (text and images), web content analysis, real-time data integration, personalized responses, transaction assistance, and ecosystem guidance. Available 24/7 in multiple languages. The upcoming Nuxbee platform will offer advanced tools, automation features, and comprehensive AI-powered analysis for power users.",
    metadata: { type: "ai", category: "capabilities", topic: "features" },
    commands: ['AI capabilities', 'what can Nuxbee do', 'Nuxbee features']
  },
  {
    content: "How to use Nuxbee AI: 1) Navigate to Chat page, 2) Type your question or upload image, 3) AI processes and provides contextual response, 4) Follow up with additional questions, 5) Use suggested commands for quick actions. No registration required beyond wallet connection. Advanced users can access the dedicated Nuxbee platform for more sophisticated features and tools.",
    metadata: { type: "ai", category: "guide", topic: "usage" },
    commands: ['how to use AI', 'AI guide', 'how to use Nuxbee']
  },

  // === TOKENIZATION TOOLS ===
  {
    content: "Nuxchain provides comprehensive tokenization tools for creating and managing digital assets. Features include: ERC-20 token creation with customizable parameters, ERC-721 NFT minting with metadata management, batch minting capabilities, royalty settings for creators, and whitelist management for exclusive launches. The tokenization section offers step-by-step guides and templates for different token types. Integration with IPFS for decentralized metadata storage. All tokenization transactions require POL for gas fees.",
    metadata: { type: "tokenization", category: "tools", topic: "overview" },
    commands: ['Nuxchain tokenization', 'Nuxchain create token', 'Nuxchain mint NFT', 'Nuxchain whitelist']
  },

  // === SMART CONTRACTS V4.0  ===
  {
    content: "Nuxchain Smart Contracts Architecture v4.0: The platform uses a modular architecture with multiple specialized contracts. EnhancedSmartStaking v4.0 consists of 4 modules: Core (deposits, withdrawals), Rewards (reward calculations, claims), Skills (NFT skill integration), and Gamification (XP, quests, achievements). GameifiedMarketplace v3.0 includes: Core (NFT minting, listing, buying), Quests (quest management), Skills V2 (skill NFT system), and Leveling (level progression). All contracts are deployed on Polygon network, verified on Polygonscan, and use OpenZeppelin libraries for security (AccessControl, ReentrancyGuard, Pausable). Contract addresses and ABIs are publicly available. Contracts interact through interfaces (IStakingIntegration, IGameifiedMarketplaceCore) enabling cross-contract communication and synchronized gamification features.",
    metadata: { type: "smart-contract", category: "architecture", topic: "contracts-v4" },
    commands: ['Nuxchain contracts', 'smart contracts v4', 'contract architecture', 'modular contracts', 'contract modules']
  },
  {
    content: "EnhancedSmartStaking v2.0 Contract Details: Address on Polygon: [deployed address]. This is the main staking contract with 4 specialized modules. Core Module handles: deposit() for staking with lockup selection, withdraw() for partial withdrawals respecting lockup, withdrawAll() for complete withdrawal, emergencyWithdraw() for emergencies, and contract migration. Rewards Module handles: calculateRewards() for real-time calculation, claimRewards() for reward claims, compound() for reinvestment, getRewardsInfo() for user reward data. Skills Module handles: activateSkill() to activate owned skill NFTs, deactivateSkill() to deactivate skills, getActiveSkills() to query user's active skills, applySkillBoost() to calculate boosted APY. Gamification Module handles: updateXP() for XP awards, completeQuest() for quest completion, claimQuestReward() for claiming quest rewards, checkAutoCompound() for automation. Key Features: Multi-lockup support (flexible, 30, 90, 180, 365 days), skill-boosted APY, XP and level progression, quest integration, achievement tracking, auto-compound capability.",
    metadata: { type: "smart-contract", category: "staking", topic: "enhanced-staking-v4" },
    commands: ['EnhancedSmartStaking', 'staking contract', 'staking v4', 'staking modules', 'contract functions']
  },
  {
    content: "GameifiedMarketplace v2.0 Contract Details: Comprehensive marketplace system with gamification. Core Module (GameifiedMarketplaceCoreV1) handles: createNFT() for minting new NFTs, listNFT() for listing NFTs for sale, buyNFT() for purchasing listed NFTs, unlistNFT() for removing listings, createOffer() and acceptOffer() for offer system, updateUserXP() for awarding XP on marketplace activities. Quests Module (GameifiedMarketplaceQuests) handles: createQuest() for quest creation by admins, updateQuestProgress() tracking user progress, completeQuest() for quest completion, getQuestInfo() for quest details, getUserQuests() for user's quest history. Skills V2 Module (GameifiedMarketplaceSkillsV2) handles: purchaseSkill() to buy skill NFTs, renewSkill() to renew expired skills, activateSkill() to activate owned skills, transferSkill() to gift/transfer skills, getSkillInfo() for skill details, getUserSkills() for user's skill collection. All marketplace transactions are in POL. Marketplace fee: 2.5%. Creator royalties supported via ERC-2981.",
    metadata: { type: "smart-contract", category: "marketplace", topic: "gamified-marketplace-v3" },
    commands: ['GameifiedMarketplace', 'marketplace contract', 'marketplace v3', 'NFT contract', 'marketplace modules']
  },
  {
    content: "Nuxchain Subgraph - The Graph Integration: Nuxchain uses The Graph protocol for efficient blockchain data indexing and querying. The subgraph indexes events from all Nuxchain contracts (EnhancedSmartStaking, GameifiedMarketplace, Skills, Quests, Leveling) and makes data available via GraphQL API. Indexed Entities include: User (address, totalXP, level, totalStaked, nftsOwned), Stake (id, user, amount, lockupDuration, startTime, APY, activeSkills), NFT (tokenId, owner, creator, price, isListed, rarity, metadata), Quest (id, questType, name, xpReward, polReward, isActive), Achievement (id, user, achievementType, timestamp, rewardClaimed), Activity (user, activityType, timestamp, details). Subgraph provides real-time data synchronization, historical data queries, aggregated statistics, efficient pagination, and reduced RPC calls. Access via Apollo Client in frontend with GraphQL queries. Subgraph deployed on The Graph Network with public endpoint.",
    metadata: { type: "technical", category: "subgraph", topic: "the-graph-integration" },
    commands: ['Nuxchain subgraph', 'The Graph', 'GraphQL', 'blockchain indexing', 'subgraph queries']
  },
  {
    content: "Nuxchain Subgraph GraphQL Query Examples: Users can query blockchain data efficiently using GraphQL. Example queries: 1) Get user stakes: query GetUserStakes($user: Bytes!) { stakes(where: {user: $user}, orderBy: timestamp, orderDirection: desc) { id amount lockupDuration startTime apy activeSkills { skillType rarity } } }. 2) Get user quests: query GetUserQuests($user: Bytes!) { questCompletions(where: {user: $user}) { quest { name questType xpReward polReward } completionTime rewardClaimed } }. 3) Get marketplace NFTs: query GetMarketplaceNFTs($limit: Int!, $skip: Int!) { nfts(where: {isListed: true}, first: $limit, skip: $skip, orderBy: listingTime, orderDirection: desc) { tokenId owner price rarity metadata } }. 4) Get user achievements: query GetAchievements($user: Bytes!) { achievements(where: {user: $user}) { achievementType timestamp rewardAmount rewardClaimed } }. Subgraph enables complex queries, filtering, sorting, and pagination without heavy RPC calls.",
    metadata: { type: "technical", category: "subgraph", topic: "graphql-queries" },
    commands: ['GraphQL queries', 'subgraph examples', 'query blockchain', 'how to query subgraph']
  },

  // === TECHNICAL INFORMATION ===
  {
    content: "Nuxchain platform supports wallets: MetaMask, Trust Wallet, WalletConnect, Coinbase Wallet. Make sure to have POL tokens for gas fees in all transactions. The platform operates on Polygon network (Chain ID: 137) and uses POL as the native gas token. All staking deposits, marketplace purchases, and contract interactions require POL. The platform uses secure RPC endpoints and implements best practices for wallet security including transaction signing and approval flows. ENS (Ethereum Name Service) is supported for user-friendly addresses.",
    metadata: { type: "technical", category: "wallets", topic: "compatibility" },
    commands: ['Nuxchain wallets', 'Nuxchain ENS', 'Nuxchain POL']
  },
  {
    content: "Gas fees in Nuxchain are paid in POL on Polygon network with average transaction costs under $0.01. Fees vary according to network congestion: ~1-30 gwei for normal transactions. The platform implements gas optimization techniques including batch transactions and efficient contract calls. Use tools like Polygon Gas Station to monitor current rates. Emergency functions may have higher gas costs due to additional security checks. Always ensure you have sufficient POL in your wallet for gas fees before attempting any transaction.",
    metadata: { type: "technical", category: "transactions", topic: "gas-fees" },
    commands: ['Nuxchain gas fees', 'Nuxchain gas optimization', 'Nuxchain POL gas']
  },
  {
    content: "Nuxchain uses smart contracts on Polygon with the following features: ReentrancyGuard, Pausable, AccessControl, ERC721, ERC2981 for maximum security.",
    metadata: { type: "technical", category: "security", topic: "smart-contracts" },
    commands: ['Nuxchain technical']
  },
  {
    content: "Nuxchain contracts are verified on Polygonscan for full transparency. SmartStaking handles deposits/withdrawals with automatic reward calculations, Marketplace handles NFT trading with offer systems. Both contracts include emergency functions and are protected with ReentrancyGuard, Pausable, and AccessControl patterns. Contract addresses and ABIs are publicly available for developers.",
    metadata: { type: "technical", category: "contracts", topic: "verification" },
    commands: ['Nuxchain Polygonscan', 'Nuxchain contract addresses', 'Nuxchain ABI']
  },
  {
    content: "Nuxchain integrates with multiple external APIs and services: Alchemy API for comprehensive NFT data and metadata, Moralis API for blockchain analytics, IPFS for decentralized storage of NFT metadata and images, Google Gemini AI for intelligent chat responses, and Polygon Gas Station for real-time gas price optimization. The platform uses caching mechanisms to ensure fast response times and reduce API costs.",
    metadata: { type: "technical", category: "integrations", topic: "external-apis" },
    commands: ['Nuxchain APIs', 'Nuxchain integrations', 'Nuxchain IPFS', 'Nuxchain Alchemy']
  },
  {
    content: "Asset tokenization in Nuxchain: NFTs allows tokenizing real-world assets like real estate, art, commodities. Each token represents a fraction of the underlying asset.",
    metadata: { type: "tokenization", category: "assets", topic: "real-world-assets" },
    commands: ['Nuxchain tokenization']
  },
  {
    content: "NFTs token utility in Nuxchain: Governance (voting on proposals), staking (generating rewards), fees (transaction discounts), premium access to features.",
    metadata: { type: "tokenization", category: "utility", topic: "token-use-cases" },
    commands: ['Nuxchain token utility']
  },
  {
    content: "NFT fractionalization in Nuxchain: High-value NFTs can be fractionalized into multiple ERC-20 tokens, enabling shared ownership and greater liquidity.",
    metadata: { type: "tokenization", category: "nft", topic: "fractionalization" },
    commands: ['Nuxchain fractionalization']
  },

  // === SECURITY ===
  {
    content: "Security audits in Nuxchain: All contracts have been audited by recognized firms. Reports available in official documentation.",
    metadata: { type: "security", category: "audits", topic: "smart-contract-security" },
    commands: ['Nuxchain audits']
  },
  {
    content: "Security best practices in Nuxchain: Use hardware wallets, verify contract addresses, don't share private keys, keep software updated.",
    metadata: { type: "security", category: "best-practices", topic: "user-security" },
    commands: ['Nuxchain security best practices']
  },
  {
    content: "MEV protection in Nuxchain: We implement protections against Maximum Extractable Value to protect users from front-running and sandwich attacks.",
    metadata: { type: "security", category: "mev-protection", topic: "transaction-security" },
    commands: ['Nuxchain MEV protection']
  },

  // === ROADMAP ===
  {
    content: "Nuxchain Roadmap Overview: Nuxchain has a comprehensive development roadmap spanning from Q4 2024 to Q4 2027, organized in 3 strategic phases. Current Progress: 36% complete with 5 achieved milestones out of 14 total. Phase 1 (Foundation & Core Features) is completed, Phase 2 (Advanced Features & Governance) is in progress from Q4 2025 to Q1 2026, and Phase 3 (Innovation & Expansion) is planned from Q2 2026 to Q4 2027. The roadmap includes 29 total GitHub issues covering categories like NFT & Analytics, AI & Chat Platform, Gaming & Gamification, Mobile Development, Governance & DAO, Physical NFT Brand, Smart Contracts, Platform & Infrastructure, Security, Documentation, UI/UX, Testing, and Analytics.",
    metadata: { type: "general", category: "roadmap", topic: "overview" },
    commands: ['Nuxchain roadmap', 'Nuxchain timeline', 'Nuxchain future plans', 'roadmap overview', 'Nuxchain phases']
  },
  {
    content: "Nuxchain Roadmap Timeline 2024-2027: The complete timeline spans 3+ years with major milestones. 2024: Q4 - Project Inception and Beta Platform Launch. 2025: Q1 - Smart Contracts v1.0, Q2 - AI Integration, Q3 - Beta Platform Launch and Roadmap Visualization (COMPLETED), Q4 - NFT Analytics Dashboard (IN PROGRESS). 2026: Q1 - Nuxbee AI Platform 2.0 (IN PROGRESS), Q2 - Physical NFT Clothing Brand and Advanced Security, Q3 - Staking Pools v2.0, Q4 - DAO Governance. 2027: Q1 - Web Platform Public Launch and Global Expansion, Q2-Q3 - Gaming Platform and Gamification, Q4 - Mobile Apps (iOS/Android) and Enterprise Solutions. Total of 14 milestones with 5 already achieved.",
    metadata: { type: "general", category: "roadmap", topic: "timeline-complete" },
    commands: ['Nuxchain roadmap timeline', 'Nuxchain 2024 2025 2026 2027', 'roadmap years', 'Nuxchain complete roadmap']
  },
  {
    content: "Nuxchain Phase 1: Foundation & Core Features (COMPLETED - Q4 2024 to Q3 2025). This phase established the fundamental infrastructure of the Nuxchain ecosystem. Completed features: 1) Nuxchain Platform Beta - Fully operational platform with SmartStaking contract and NFT Marketplace, users can stake tokens and trade NFTs. 2) Profile Page & Dashboard - Personalized user profiles with comprehensive stats, NFT collections, staking overview, and real-time rewards tracking. 3) AI Staking Analysis - Advanced AI-powered analysis engine that optimizes staking strategies and provides personalized recommendations based on market conditions. 4) Nuxbee AI 1.0 - Initial release of Nuxbee AI assistant with advanced features and capabilities. 5) Roadmap Visualization - Interactive roadmap interface with comprehensive components showing development phases, milestones, and timeline visualization. All Phase 1 features are now live and operational.",
    metadata: { type: "roadmap", category: "phase-1", topic: "completed" },
    commands: ['Nuxchain Phase 1', 'Nuxchain foundation', 'Phase 1 completed', 'Nuxchain core features']
  },
  {
    content: "Nuxchain Phase 2: Advanced Features & Governance (IN PROGRESS - Q4 2025 to Q1 2026). This phase expands capabilities with advanced analytics, community governance, and enhanced AI integration. Current features in development: 1) NFT Analytics Dashboard (IN PROGRESS, Q4 2025) - Comprehensive analytics platform for NFT collections with trend prediction, market analysis, and AI-powered investment optimization tools. Real-time NFT collection tracking and price trend visualization are already implemented. 2) Governance DAO (IN PROGRESS, Q4 2026) - Decentralized autonomous organization enabling community-driven governance. Planning phase for governance token is complete. Will include proposal creation, voting mechanism, delegation, treasury management, and execution automation. 3) Nuxbee AI Platform 2.0 (IN PROGRESS, Q1 2026) - Launch of dedicated Nuxbee AI platform with advanced features, deep integration throughout Nuxchain, providing contextual help, automation, and sophisticated tools. Already has real-time chat, AI-powered responses, context-aware conversations, and code generation. 4) Update Smart Contracts (IN PROGRESS, Q3-Q4 2025) - Update and optimize existing smart contracts for better performance, security, and gas efficiency. Security audit completed, gas optimization achieved, upgraded to latest Solidity version.",
    metadata: { type: "roadmap", category: "phase-2", topic: "in-progress" },
    commands: ['Nuxchain Phase 2', 'Phase 2 in progress', 'Nuxchain advanced features', 'Nuxchain governance']
  },
  {
    content: "Nuxchain Phase 3: Innovation & Expansion (PLANNED - Q2 2026 to Q4 2027). This phase pioneers new frontiers with physical-digital integration, gamification, and revolutionary blockchain solutions. Planned features: 1) Physical NFT Clothing Brand (Q2 2026) - Revolutionary clothing line where each physical item comes with a unique NFT, unlocking exclusive benefits, utilities, and experiences on the platform. Includes e-commerce integration, QR code/NFC chip integration, and authenticity verification. 2) New Smart Contracts (Q1-Q2 2026) - Development of innovative smart contract solutions including yield farming contracts, liquidity pools, token swap functionality, lending/borrowing protocol, and oracle integration. 3) Mini Game & Gamification (Q2-Q3 2027) - Interactive gaming experience that gamifies user engagement, connecting NFTs, staking, and daily tasks for rewards. Includes daily quest system, achievement/badge system, leaderboard, NFT integration in games, and reward distribution. 4) Advanced Security Features (Q2 2026) - Enhanced security protocols, multi-signature wallets, 2FA/MFA authentication, hardware wallet support, and advanced encryption to protect user assets.",
    metadata: { type: "roadmap", category: "phase-3", topic: "planned" },
    commands: ['Nuxchain Phase 3', 'Phase 3 planned', 'Nuxchain innovation', 'Nuxchain expansion', 'Nuxchain future']
  },
  {
    content: "Nuxchain Achieved Milestones (5 completed as of Q3 2025): 1) Project Inception (Q4 2024) - Started development of Nuxchain platform with initial architecture and core features. 2) Smart Contracts v1.0 (Q1 2025) - Development of innovative smart contract solutions to expand blockchain capabilities and create new DeFi products. 3) AI Integration (Q2 2025) - Successfully integrated AI-powered staking analysis and recommendations. 4) Beta Platform Launch (Q3 2025) - Internal beta launch of Nuxchain platform with core staking and marketplace features. 5) Roadmap Visualization (Q3 2025) - Comprehensive roadmap interface with interactive components showing development phases, milestones, and timeline visualization. These milestones represent 36% completion of the overall roadmap.",
    metadata: { type: "roadmap", category: "milestones", topic: "achieved" },
    commands: ['Nuxchain achievements', 'Nuxchain completed milestones', 'Nuxchain achieved', 'what has been completed']
  },
  {
    content: "Nuxchain Upcoming Milestones (9 planned from Q4 2025 to Q4 2027): 1) NFT Analytics (Q4 2025) - Release of comprehensive NFT analytics and prediction dashboard. 2) Nuxbee AI Platform (Q1 2026) - Advanced AI-powered platform with generative AI capabilities and comprehensive toolset hub. 3) Physical Branding NFTs (Q2 2026) - Launch of physical NFT clothing brand with digital integration. 4) Staking Pools v2.0 (Q3 2026) - Advanced staking pools with dynamic rewards and flexible lock periods. 5) DAO Governance (Q4 2026) - Launch of decentralized autonomous organization with full community governance. 6) Global Expansion & Web Launch (Q1 2027) - Official public launch of web platform with expansion to new markets and partnerships. 7) Gaming Platform (Q2-Q3 2027) - Release of gamification features and mini-game ecosystem. 8) Mobile App Launch (Q4 2027) - Release of native mobile applications for iOS and Android platforms. 9) Enterprise Solutions (Q4 2027) - Launch of enterprise-grade blockchain solutions for institutional clients.",
    metadata: { type: "roadmap", category: "milestones", topic: "upcoming" },
    commands: ['Nuxchain upcoming', 'Nuxchain future milestones', 'what is coming', 'Nuxchain next features']
  },
  {
    content: "Nuxchain 2025 Roadmap Details: Q1 2025 - Smart Contracts v1.0 deployment and development of innovative smart contract solutions (COMPLETED). Q2 2025 - AI Integration with AI-powered staking analysis and recommendations (COMPLETED). Q3 2025 - Beta Platform Launch with core staking and marketplace features, plus Roadmap Visualization with interactive components (COMPLETED). Q4 2025 - NFT Analytics Dashboard development with trend prediction, market analysis, and AI-powered investment optimization tools (IN PROGRESS). Also continuing Smart Contract Updates & Optimization with security audits and gas optimization (IN PROGRESS). By end of 2025, Nuxchain will have completed Phase 1 entirely and be well into Phase 2 development.",
    metadata: { type: "roadmap", category: "year-2025", topic: "detailed" },
    commands: ['Nuxchain 2025', 'roadmap 2025', 'Nuxchain this year', '2025 plans']
  },
  {
    content: "Nuxchain 2026 Roadmap Details: Q1 2026 - Nuxbee AI Platform 2.0 launch with advanced features and deep Nuxchain integration (IN PROGRESS), NFT Marketplace Enhancements with advanced filtering and bulk operations, Developer Documentation Portal creation, Mobile-First Responsive Redesign. Q2 2026 - Physical NFT Clothing Brand Launch with e-commerce integration and NFC/QR verification, AI Staking Optimizer Enhancement with advanced risk assessment, Advanced Security Features with multi-signature wallets and 2FA/MFA, Community & Support Platform with forums and knowledge base, Advanced Analytics Dashboard. Q3 2026 - Staking Pools v2.0 with dynamic rewards and flexible lock periods, Physical NFT Utilities & Benefits for exclusive holder perks. Q4 2026 - DAO Governance System launch with community-driven governance, proposal creation, voting mechanisms, and treasury management. 2026 is the year of innovation and security enhancement for Nuxchain.",
    metadata: { type: "roadmap", category: "year-2026", topic: "detailed" },
    commands: ['Nuxchain 2026', 'roadmap 2026', '2026 plans', 'Nuxchain next year']
  },
  {
    content: "Nuxchain 2027 Roadmap Details: Q1 2027 - Web Platform Public Launch with full functionality, performance optimization (Lighthouse score 90+), SEO optimization, multi-language support, and legal compliance (GDPR). Global Expansion & Partnerships with multi-currency support, regional payment methods, localization for key markets, and cross-chain bridge implementation. Governance Dashboard UI for DAO participation. Q2-Q3 2027 - Gaming Platform Development with mini-game engine, daily quest system, achievement/badge system, leaderboard, NFT integration in games, and multiplayer capabilities. Gamification Rewards System with daily login rewards, task completion tracking, streak bonuses, referral rewards, and seasonal events. Q4 2027 - iOS Mobile App Development and Android Mobile App Development with full platform functionality, wallet integration, push notifications, biometric authentication, and offline mode capabilities. Enterprise Solutions Platform launch with white-label solutions, custom smart contract deployment, and enterprise API access. 2027 marks the global expansion and mobile accessibility of Nuxchain.",
    metadata: { type: "roadmap", category: "year-2027", topic: "detailed" },
    commands: ['Nuxchain 2027', 'roadmap 2027', '2027 plans', 'Nuxchain long term']
  },
  {
    content: "Nuxchain GitHub Issues Summary: The roadmap is tracked through 29 GitHub issues organized by priority. Critical Priority (5 issues): Platform Beta Features Phase 1 (COMPLETED), DAO Governance System (IN PROGRESS), Smart Contract Updates & Optimization (IN PROGRESS), Web Platform Public Launch, Advanced Security Features. High Priority (11 issues): Roadmap Visualization & UI Components (COMPLETED), NFT Analytics Dashboard (IN PROGRESS), Nuxbee AI Platform v2.0 (IN PROGRESS), Gaming Platform Development, iOS Mobile App Development, Android Mobile App Development, Staking Pools v2.0, Global Expansion & Partnerships, Monitoring & Observability, Automated Testing Infrastructure, Legacy System Migration (IN PROGRESS). Medium Priority (12 issues): NFT Marketplace Enhancements, AI Staking Optimizer Enhancement, Gamification Rewards System, Governance Dashboard UI, Physical NFT Clothing Brand Launch, New DeFi Smart Contracts, Enterprise Solutions Platform, Developer Documentation Portal, Community & Support Platform, Design System & Component Library, Mobile-First Responsive Redesign, Advanced Analytics Dashboard. Low Priority (1 issue): Physical NFT Utilities & Benefits.",
    metadata: { type: "roadmap", category: "github-issues", topic: "summary" },
    commands: ['Nuxchain issues', 'GitHub roadmap', 'roadmap priorities', 'Nuxchain development status']
  },
  {
    content: "Nuxchain Roadmap Progress Statistics: Total Milestones: 14 (5 achieved, 9 upcoming). Total Features: 13 (5 in Phase 1, 4 in Phase 2, 4 in Phase 3). Total GitHub Issues: 29 (2 completed, 5 in progress, 22 planned). Overall Progress: 36% complete. Phase 1 Status: 100% completed (5/5 features). Phase 2 Status: In Progress (4/4 features active, 0% to 50% completion range). Phase 3 Status: Planned (4/4 features, 0% completion). Timeline: 3 years, 3 months (Q4 2024 to Q4 2027). Current Position: Q4 2025, transitioning from Phase 1 to Phase 2. Categories Covered: 13 major categories including NFT & Analytics, AI & Chat, Gaming, Mobile, Governance, Physical NFT, Smart Contracts, Platform Infrastructure, Security, Documentation, UI/UX, Testing, and Analytics.",
    metadata: { type: "roadmap", category: "statistics", topic: "progress" },
    commands: ['Nuxchain progress', 'roadmap statistics', 'how much completed', 'Nuxchain percentage']
  },
  {
    content: "Nuxchain Mobile Development Plans (Q4 2027): iOS Mobile App Development - React Native or Swift implementation with wallet integration (MetaMask, WalletConnect), push notifications, biometric authentication, offline mode capabilities, App Store compliance, deep linking support, and QR code scanning. Requires iOS 14+ support, TestFlight beta testing, and performance optimization for mobile devices. Android Mobile App Development - React Native or Kotlin implementation with wallet integration, push notifications (FCM), biometric authentication, offline mode capabilities, Google Play compliance, deep linking support, and QR code scanning. Requires Android 8.0+ support, Google Play beta testing, and performance optimization for various devices. Both mobile apps will have full platform functionality including staking, NFT marketplace access, profile management, and AI chat integration.",
    metadata: { type: "roadmap", category: "mobile", topic: "development" },
    commands: ['Nuxchain mobile', 'mobile app', 'iOS Android', 'Nuxchain mobile plans']
  },
  {
    content: "Nuxchain Gaming & Gamification Plans (Q2-Q3 2027): Gaming Platform Development - Release of gamification features and mini-game ecosystem that connects NFTs, staking, and daily tasks for rewards. Features include mini-game engine development using Phaser.js or similar, daily quest system, achievement/badge system, leaderboard functionality, NFT integration in games, reward distribution system via smart contracts, game state persistence, multiplayer capabilities, and anti-cheat mechanisms. Mobile-optimized controls for accessibility. Gamification Rewards System - Comprehensive rewards system that incentivizes user engagement through daily login rewards, task completion tracking, streak bonuses, referral rewards, social sharing incentives, and seasonal events and challenges. This creates a fun and engaging experience that rewards active participation in the Nuxchain ecosystem.",
    metadata: { type: "roadmap", category: "gaming", topic: "gamification" },
    commands: ['Nuxchain gaming', 'gamification', 'games', 'Nuxchain mini games', 'rewards system']
  },
  {
    content: "Nuxchain DAO Governance Plans (Q4 2026): Launch of decentralized autonomous organization with community governance to transition to a fully decentralized platform. Features include governance token implementation (planning phase complete), proposal creation system for community suggestions, on-chain voting mechanism, delegation functionality to allow token holders to delegate voting power, timelock for proposal execution to ensure security, treasury management for community funds, quorum requirements for vote validity, vote weight calculation based on token holdings, proposal discussion forum for community debate, and execution automation for approved proposals. Technical requirements include smart contracts using Governor pattern, token voting power calculation, Snapshot integration for off-chain voting, multi-sig wallet for treasury, and governance dashboard UI. This empowers the Nuxchain community to shape the platform's future direction.",
    metadata: { type: "roadmap", category: "governance", topic: "dao" },
    commands: ['Nuxchain DAO', 'governance', 'community governance', 'Nuxchain voting', 'decentralized governance']
  },
  {
    content: "Nuxchain Physical NFT Brand Plans (Q2 2026): Launch of physical NFT clothing brand with digital integration where each physical item comes with a unique NFT. Features include e-commerce integration with Shopify/WooCommerce, NFT minting for physical items, QR code/NFC chip integration for authenticity, authenticity verification system, exclusive holder benefits, redemption system for physical products, inventory management, shipping integration, and returns/exchange policy. Technical requirements include smart contracts for physical NFT claims, NFC/QR verification system, and supply chain tracking. Physical NFT Utilities & Benefits (Q3 2026) include exclusive event access, discount system for holders, early access to new drops, community perks, and staking bonuses for holders. This creates a revolutionary bridge between physical fashion and digital ownership.",
    metadata: { type: "roadmap", category: "physical-nft", topic: "brand" },
    commands: ['Nuxchain physical NFT', 'NFT clothing', 'physical brand', 'Nuxchain merchandise', 'NFT utilities']
  },
  {
    content: "Nuxchain Enterprise Solutions Plans (Q4 2027): Launch of enterprise-grade blockchain solutions for institutional clients. Features include white-label solution for businesses to deploy their own branded platforms, custom smart contract deployment tailored to specific business needs, enterprise API access for integration with existing systems, SLA guarantees for uptime and performance, dedicated support for enterprise customers, advanced analytics and reporting for business intelligence, compliance tools for regulatory requirements, and bulk operations support for high-volume transactions. This opens Nuxchain technology to institutional adoption and B2B markets, creating new revenue streams and expanding the ecosystem's reach.",
    metadata: { type: "roadmap", category: "enterprise", topic: "solutions" },
    commands: ['Nuxchain enterprise', 'business solutions', 'institutional', 'white label', 'B2B']
  },
  {
    content: "Nuxchain Security & Infrastructure Plans (Q2 2026 and ongoing): Advanced Security Features include multi-signature wallet implementation for enhanced security, 2FA/MFA authentication for user accounts, hardware wallet support (Ledger, Trezor) for cold storage, session management improvements, rate limiting and DDoS protection, encrypted data storage for sensitive information, security audit completion by third-party firms, bug bounty program launch to incentivize security researchers, penetration testing for vulnerability assessment, and incident response plan for security events. Technical requirements include multi-sig smart contracts, OAuth 2.0 / JWT implementation, Redis for session management, WAF (Web Application Firewall), and regular security audits. Monitoring & Observability (Q4 2025) includes application performance monitoring (APM), error tracking and alerting, log aggregation, uptime monitoring, smart contract event monitoring, user analytics, and custom dashboards for real-time platform health visibility.",
    metadata: { type: "roadmap", category: "security", topic: "infrastructure" },
    commands: ['Nuxchain security', 'security features', 'infrastructure', 'monitoring', 'Nuxchain safety']
  },
  {
    content: "Nuxchain Testing & Quality Assurance Plans (Q3 2025): Automated Testing Infrastructure implementation includes unit test coverage (80%+ target), integration tests for component interactions, E2E tests using Playwright or Cypress for full user flow testing, smart contract tests using Hardhat for blockchain code verification, performance testing for load and stress scenarios, CI/CD pipeline integration for automated testing on every commit, and automated visual regression testing to catch UI changes. This ensures high code quality, reduces bugs, and accelerates development velocity. Design System & Component Library (Q4 2025) includes design tokens (colors, typography, spacing), component library using Storybook for documentation, accessibility compliance (WCAG 2.1 AA standards), dark/light theme support, responsive design patterns, animation guidelines, and icon library for consistent UI/UX across the platform.",
    metadata: { type: "roadmap", category: "testing", topic: "quality-assurance" },
    commands: ['Nuxchain testing', 'quality assurance', 'automated testing', 'CI/CD', 'test coverage']
  },

  // === FAQ ===
  {
    content: "FAQ - Transaction Issues: If your transaction is stuck, check gas fees and network congestion. Use higher gas prices during peak times. For failed transactions, verify wallet balance and contract approvals. Contact support if issues persist. Common solutions: increase gas limit, check network status, verify contract addresses, ensure sufficient POL balance.",
    metadata: { type: "faq", category: "transactions", topic: "issues" },
    commands: ['Nuxchain transaction help', 'Nuxchain stuck transaction', 'Nuxchain gas issues']
  },
  {
    content: "FAQ - Staking Rewards: Rewards are calculated automatically based on your staking amount, duration, and lockup period. Check your dashboard for real-time calculations. Rewards can be claimed after lockup period expires. APY varies by lockup tier: no lockup (87.6%), 30 days (105.1%), 90 days (140.2%), 180 days (175.2%), 365 days (262.8%). Compound rewards regularly for maximum returns by reinvesting your rewards into new deposits. During lockup period, you cannot withdraw principal but rewards continue to accumulate. Emergency withdrawal available when contract is paused.",
    metadata: { type: "faq", category: "staking", topic: "rewards" },
    commands: ['Nuxchain staking rewards', 'Nuxchain APY calculation', 'Nuxchain compound rewards']
  },
  {
    content: "FAQ - POL Token: POL is Polygon's native token used for all transactions on Nuxchain. You need POL for: gas fees on all transactions, staking deposits to earn rewards, purchasing NFTs in the marketplace, paying marketplace fees. You can acquire POL from exchanges like Binance, Coinbase, or KuCoin, then bridge it to Polygon network. Always keep some POL in your wallet for gas fees. Minimum staking amount is 5 POL, maximum is 10,000 POL per deposit.",
    metadata: { type: "faq", category: "token", topic: "pol-usage" },
    commands: ['Nuxchain POL', 'Nuxchain Polygon token', 'What is POL', 'How to get POL']
  },
  {
    content: "FAQ - NFT Trading: To trade NFTs, connect your wallet and browse the marketplace. All NFT prices are listed in POL. You can buy instantly or make offers. Sellers can accept, reject, or counter offers. All transactions are secured by smart contracts and require POL for gas fees. Check NFT history and authenticity before purchasing. Use filters to find specific collections or price ranges. Marketplace fee is 2.5% paid in POL.",
    metadata: { type: "faq", category: "nft", topic: "trading" },
    commands: ['Nuxchain NFT trading', 'Nuxchain marketplace help', 'Nuxchain NFT offers']
  },
  {
    content: "FAQ - Wallet Connection: Nuxchain supports MetaMask, Trust Wallet, WalletConnect, and Coinbase Wallet. Ensure you're on Polygon network (Chain ID: 137). If connection fails, try refreshing the page, clearing browser cache, or switching networks manually. For mobile, use WalletConnect for best compatibility. Always verify you're on the official Nuxchain domain.",
    metadata: { type: "faq", category: "wallet", topic: "connection" },
    commands: ['Nuxchain wallet connection', 'Nuxchain Polygon network', 'Nuxchain WalletConnect']
  },
  {
    content: "FAQ - Airdrops: To participate in airdrops, connect your wallet and check eligibility requirements. Some airdrops require staking, NFT ownership, or community participation. Distribution is automatic for eligible wallets. Check the airdrops page regularly for new opportunities. Past participation may increase future eligibility.",
    metadata: { type: "faq", category: "airdrops", topic: "participation" },
    commands: ['Nuxchain airdrop participation', 'Nuxchain airdrop eligibility', 'Nuxchain airdrop requirements']
  },

  // === ADVANCED USE CASES ===
  {
    content: "Advanced Nuxchain strategies: 1) Portfolio diversification - combine staking, NFT investments, and airdrop participation, 2) Yield optimization - time compound operations with gas costs, 3) NFT flipping - use marketplace analytics to identify undervalued assets, 4) Community engagement - participate in governance discussions for future airdrops, 5) Cross-platform integration - use APIs for external portfolio tracking.",
    metadata: { type: "advanced", category: "strategies", topic: "optimization" },
    commands: ['Nuxchain advanced strategies', 'Nuxchain portfolio optimization']
  },
  {
    content: "Nuxchain developer resources: Smart contract ABIs available for SmartStaking.json, Marketplace.json, and Airdrop.json. Integration examples include Web3 connection, transaction handling, event listening, and error management. The platform supports custom dApp integrations and provides comprehensive documentation for developers building on top of Nuxchain infrastructure.",
    metadata: { type: "developer", category: "resources", topic: "integration" },
    commands: ['Nuxchain developers', 'Nuxchain API documentation', 'Nuxchain integration']
  },

  // === TECHNICAL ARCHITECTURE ===
  {
    content: "Nuxchain App Technical Stack (Beta 7.0 - November 2025): Built with cutting-edge technologies for performance, security, and scalability. Frontend: React 19 with latest concurrent features, Vite 7.1 as ultra-fast build tool with hot module replacement, TypeScript 5.7 for full type safety, TailwindCSS 4.0 for utility-first responsive design, Framer Motion for smooth animations, React Query 5.90 for intelligent server state management and caching. Web3 & Blockchain: Wagmi v2 for React hooks for Ethereum with optimized performance, Viem 2.38 as TypeScript-first Ethereum library replacing ethers.js, WalletConnect for multi-wallet connection support, The Graph for blockchain data indexing via subgraph. Backend & AI: Express 5 as API server deployed on Vercel Serverless, Google Gemini API v2.5 Flash Lite for AI integration with streaming responses, Node.js 20+ runtime. Development: ESLint & Prettier for code quality, Lighthouse CI for performance audits (target 90+ score), TypeScript compiler for strict type checking.",
    metadata: { type: "technical", category: "architecture", topic: "tech-stack" },
    commands: ['Nuxchain architecture', 'Nuxchain tech stack', 'Nuxchain React', 'Nuxchain Vite', 'tech stack', 'technologies used']
  },
  {
    content: "Nuxchain Frontend Architecture - React 19 & Modern Patterns: Component-based architecture with functional components and React hooks. Main pages include: Home (landing with ecosystem overview), Staking (deposit/withdraw with gamification dashboard), Marketplace (NFT browse/buy/sell with advanced filters), NFTs (personal collection management), Profile (user stats, XP, levels, achievements, active skills), Chat (Nuxbee AI assistant), Tokenization (NFT/token creation tools), Store (Skills NFT shop), DevHub (developer tools), Labs (AI innovation hub). Components organized by functionality in /src/components with reusable UI components in /components/ui. Custom hooks in /src/hooks organized by category (staking, marketplace, nfts, cache, performance, mobile, accessibility). Services for APIs and blockchain interactions. Centralized routing with React Router and lazy loading for code splitting. State management: React Query for server state, Zustand for UI state, Context API for global app state.",
    metadata: { type: "technical", category: "architecture", topic: "frontend-structure" },
    commands: ['Nuxchain frontend', 'React architecture', 'component structure', 'frontend organization']
  },
  {
    content: "Nuxchain development configuration: npm scripts for development (dev, dev:server, dev:full with concurrently), build for production, linting with ESLint, preview for local testing. Environment variables for different environments (development vs production), automatic API configuration based on environment, support for localhost and production domains. Hot reload and fast refresh enabled for efficient development.",
    metadata: { type: "technical", category: "development", topic: "configuration" },
    commands: ['Nuxchain development', 'Nuxchain npm scripts', 'Nuxchain environment']
  },

  // === PAGE FUNCTIONALITIES ===
  {
    content: "Nuxchain Home page: Hero section with platform introduction, AI section highlighting Nuxbee AI 1.0, staking information with real-time statistics, NFT marketplace preview, airdrops section with upcoming events, tokenization information, ecosystem benefits section, and footer with important links. Responsive design optimized for conversion. Nuxbee will have its own dedicated platform for advanced features.",
    metadata: { type: "technical", category: "pages", topic: "home" },
    commands: ['Nuxchain home page', 'Nuxchain landing']
  },
  {
    content: "Nuxchain Staking page: Staking form with real-time validation, pool information with current APY, user statistics (balance, rewards, deposits), contract information with verified addresses, informative carousel about benefits, staking bonds for different periods, and position management dashboard. Complete integration with SmartStaking contract.",
    metadata: { type: "technical", category: "pages", topic: "staking" },
    commands: ['Nuxchain staking page', 'Nuxchain staking interface']
  },
  {
    content: "Nuxchain Marketplace page: NFT grid with infinite scroll, advanced filters by collection/price/rarity, real-time marketplace statistics, purchase modal with confirmation, offer system, integration with Alchemy and Moralis APIs, optimized cache for metadata, and support for multiple NFT formats. Design optimized for navigation and discovery.",
    metadata: { type: "technical", category: "pages", topic: "marketplace" },
    commands: ['Nuxchain marketplace page', 'Nuxchain NFT marketplace']
  },
  {
    content: "Nuxchain Chat page with Nuxbee AI: Real-time chat interface with streaming, multimodal support (text and images), automatic URL processing with web scraping, embedding system for persistent context, welcome screen with suggestions, input area with autocomplete, and complete integration with Google Gemini AI. Optimized for fast responses and relevant context. Nuxbee will have its own dedicated platform for advanced features.",
    metadata: { type: "technical", category: "pages", topic: "chat" },
    commands: ['Nuxchain chat page', 'Nuxchain Nuxbee AI interface', 'Nuxbee chat']
  },
  {
    content: "Nuxchain NFTs page: Infinite grid of user's NFTs, filters by collection and status, personal NFT statistics, listing modal for sale, management of received offers, transaction history, and wallet integration to show owned NFTs. Design optimized for personal collection management.",
    metadata: { type: "technical", category: "pages", topic: "nfts" },
    commands: ['Nuxchain NFTs page', 'Nuxchain my NFTs']
  },
  {
    content: "Nuxchain Airdrops page: Available airdrops dashboard, participation form, airdrop statistics, time counter for upcoming events, participation history, automatic eligibility verification, and notification system. Integration with airdrop contracts for automatic distribution.",
    metadata: { type: "technical", category: "pages", topic: "airdrops" },
    commands: ['Nuxchain airdrops page', 'Nuxchain airdrop dashboard']
  },
  {
    content: "Nuxchain Tokenization page: Tools to create ERC-20 tokens and ERC-721 NFTs, file upload to IPFS, metadata configuration, royalty management, whitelist management, batch minting, progress indicator, technical token details, tokenization FAQ, and process benefits. Step-by-step interface to facilitate creation.",
    metadata: { type: "technical", category: "pages", topic: "tokenization" },
    commands: ['Nuxchain tokenization page', 'Nuxchain create tokens']
  },

  // === EXTERNAL INTEGRATIONS ===
  {
    content: "Nuxchain Alchemy API integration: Complete NFT metadata retrieval, collection information, transaction history, ownership verification, rarity and traits data, and real-time blockchain synchronization. Optimized cache to reduce API calls and improve performance. Support for multiple blockchain networks.",
    metadata: { type: "technical", category: "integrations", topic: "alchemy" },
    commands: ['Nuxchain Alchemy integration', 'Nuxchain NFT metadata']
  },
  {
    content: "Nuxchain Moralis API integration: Advanced blockchain analytics, portfolio tracking, real-time price data, market statistics, liquidity information, and DeFi metrics. Used for analytics dashboard and ecosystem performance reports.",
    metadata: { type: "technical", category: "integrations", topic: "moralis" },
    commands: ['Nuxchain Moralis integration', 'Nuxchain analytics']
  },
  {
    content: "Nuxchain IPFS integration: Decentralized storage of NFT metadata, images and multimedia files, automatic pinning for permanent availability, IPFS hash management, and content loading optimization. Used in tokenization and marketplace to ensure complete decentralization.",
    metadata: { type: "technical", category: "integrations", topic: "ipfs" },
    commands: ['Nuxchain IPFS', 'Nuxchain decentralized storage']
  },
  {
    content: "Nuxchain Google Gemini AI integration: Natural language processing for Nuxbee AI 1.0, web content analysis, contextual response generation, multimodal support for text and images, real-time response streaming, and embedding system for persistent memory. Optimized for fast and accurate responses about the Nuxchain ecosystem. Powers the Nuxbee AI assistant and its upcoming dedicated platform.",
    metadata: { type: "technical", category: "integrations", topic: "gemini-ai" },
    commands: ['Nuxchain Gemini AI', 'Nuxchain AI integration', 'Nuxbee integration']
  },

  // === WEB3 AUTHENTICATION ===
  {
    content: "Nuxchain Web3 Authentication System: Integration with Wagmi and Viem for wallet connection, support for MetaMask, WalletConnect, Coinbase Wallet, and Rainbow Wallet, persistent session management, digital signature verification, and multi-blockchain network handling. Includes custom hooks for connection state and automatic network switching.",
    metadata: { type: "technical", category: "authentication", topic: "web3" },
    commands: ['Nuxchain wallet connection', 'Nuxchain Web3 auth']
  },
  {
    content: "Supported Wallets in Nuxchain: MetaMask (main recommended wallet), WalletConnect (for mobile wallets), Coinbase Wallet (native integration), Rainbow Wallet (full support), and compatibility with any wallet implementing EIP-1193. Automatic detection of installed wallets, fallback to WalletConnect for undetected wallets, and connection error handling.",
    metadata: { type: "technical", category: "authentication", topic: "wallets" },
    commands: ['Nuxchain supported wallets', 'Nuxchain wallet compatibility']
  },

  // === DEVELOPMENT AND CONFIGURATION ===
  {
    content: "Nuxchain Local Development Guide: Installation with 'npm install', development with 'npm run dev' (frontend) and 'npm run dev:full' (fullstack), environment variables configuration (.env.local), local database setup, external APIs configuration (Alchemy, Moralis), and testing with 'npm test'. Includes hot reload, debugging tools, and development with mock data.",
    metadata: { type: "developer", category: "development", topic: "local-setup" },
    commands: ['Nuxchain local development', 'Nuxchain dev setup']
  },
  {
    content: "Nuxchain Environment Configuration: Environment variables for development (.env.local) and production (.env), API configuration (ALCHEMY_API_KEY, MORALIS_API_KEY, GOOGLE_AI_API_KEY), endpoint URLs by environment, database configuration, and authentication secrets. Automatic environment detection (localhost vs Vercel), and fallbacks for development without external APIs.",
    metadata: { type: "developer", category: "development", topic: "environment" },
    commands: ['Nuxchain environment config', 'Nuxchain env variables']
  },
  {
    content: "Nuxchain Build and Deploy Scripts: 'npm run build' for production build, 'npm run preview' for local build preview, 'npm run lint' for code linting, 'npm run type-check' for TypeScript verification, and automatic deploy on Vercel with GitHub integration. Bundle optimizations, tree shaking, and automatic code splitting for better performance.",
    metadata: { type: "developer", category: "development", topic: "build-deploy" },
    commands: ['Nuxchain build process', 'Nuxchain deploy']
  },
  {
    content: "Vercel Deployment for Nuxchain: Automatic configuration with GitHub integration, environment variables in Vercel dashboard, optimized build commands, edge functions for APIs, and global CDN for static assets. Includes preview deployments for pull requests, automatic rollback on errors, and real-time performance monitoring.",
    metadata: { type: "developer", category: "deployment", topic: "vercel" },
    commands: ['Nuxchain Vercel deployment', 'Nuxchain production deploy']
  },

  // === ADVANCED COMPONENTS AND FEATURES ===
  {
    content: "Nuxchain Layout and Navigation: Responsive sidebar with main navigation, header with wallet connection and user profile, footer with important links, and optimized mobile navigation. Includes breadcrumbs, active page indicators, and smooth transitions between sections. Support for dark mode and theme customization.",
    metadata: { type: "technical", category: "components", topic: "layout" },
    commands: ['Nuxchain layout', 'Nuxchain navigation']
  },
  {
    content: "Nuxchain Firebase Integration: User authentication, Firestore database for user data, storage for files and images, analytics for event tracking, and hosting for static assets. Includes security rules, automatic backup, and real-time data synchronization.",
    metadata: { type: "technical", category: "integrations", topic: "firebase" },
    commands: ['Nuxchain Firebase', 'Nuxchain database']
  },
  {
    content: "Nuxchain Performance Optimization: Component lazy loading, automatic code splitting, image optimization with Next.js Image, data caching with SWR, and critical route preloading. Includes bundle analysis, tree shaking, and asset compression for minimal loading times.",
    metadata: { type: "technical", category: "performance", topic: "optimization" },
    commands: ['Nuxchain performance', 'Nuxchain optimization']
  },
  {
    content: "Nuxchain Notification System: Toast notifications for user actions, push notifications for important events, blockchain transaction alerts, and NFT activity notifications. Includes preference configuration, notification history, and integration with external services.",
    metadata: { type: "technical", category: "features", topic: "notifications" },
    commands: ['Nuxchain notifications', 'Nuxchain alerts']
  },
  {
    content: "Nuxchain State Management: Context API for global state, Zustand for application state, local state with useState and useReducer, and persistence with localStorage. Includes middleware for logging, devtools integration, and re-render optimization with memoization.",
    metadata: { type: "technical", category: "architecture", topic: "state" },
    commands: ['Nuxchain state management', 'Nuxchain context']
  },
  {
    content: "Nuxchain Security: Input validation, data sanitization, CSRF protection, security headers, and API rate limiting. Includes blockchain transaction validation, smart contract verification, and continuous security auditing.",
    metadata: { type: "technical", category: "security", topic: "protection" },
    commands: ['Nuxchain security', 'Nuxchain validation']
  },

  // === AVAILABLE COMMANDS ===
  {
    content: "Available Nuxchain commands: 'Nuxchain help' (general help), 'Nuxchain staking' (staking information), 'Nuxchain NFT' (NFT marketplace), 'Nuxchain wallet' (wallet connection), 'Nuxchain tokenization' (asset tokenization), 'Nuxchain airdrops' (airdrop information), 'Nuxchain chat' (AI assistant), 'Nuxchain roadmap' (roadmap), 'Nuxchain security' (security), 'Nuxchain development' (development).",
    metadata: { type: "help", category: "commands", topic: "available" },
    commands: ['Nuxchain commands', 'available commands']
  },

  // === TECHNICAL FAQ ===
  {
    content: "Common transaction issues in Nuxchain: 1) Insufficient gas - increase gas limit, 2) Low gas price - increase gas price, 3) Incorrect nonce - wait for pending transactions confirmation, 4) High slippage - adjust slippage tolerance, 5) Contract paused - verify contract status.",
    metadata: { type: "faq", category: "technical", topic: "transactions" },
    commands: ['transaction failed', 'gas issues', 'Nuxchain troubleshooting']
  },
  {
    content: "Staking rewards not showing: 1) Verify active lock period, 2) Confirm stake transaction was successful, 3) Wait at least 1 block for update, 4) Refresh page or reconnect wallet, 5) Check Etherscan for pending rewards. Rewards update every block.",
    metadata: { type: "faq", category: "staking", topic: "rewards-issues" },
    commands: ['staking rewards missing', 'rewards not showing']
  },
  {
    content: "NFT not showing in marketplace: 1) Verify NFT is in connected wallet, 2) Confirm it's ERC-721 or ERC-1155 standard, 3) Wait for metadata sync (up to 10 minutes), 4) Verify collection is verified, 5) Contact support if issue persists.",
    metadata: { type: "faq", category: "marketplace", topic: "nft-visibility" },
    commands: ['NFT not showing', 'marketplace sync issues']
  },
  {
    content: "NFT offers not working: 1) Verify sufficient balance for offer, 2) Approve tokens for marketplace contract, 3) Confirm offer hasn't expired, 4) Verify NFT is still available, 5) Check slippage settings. Offers automatically expire after 7 days.",
    metadata: { type: "faq", category: "marketplace", topic: "offers" },
    commands: ['offer failed', 'NFT offer issues']
  },
  {
    content: "Incorrect NFT royalties: 1) Verify royalty configuration in metadata, 2) Confirm contract supports EIP-2981, 3) Verify creator configured royalties correctly, 4) Contact creator for metadata update, 5) Report issue if royalties exceed 10%.",
    metadata: { type: "faq", category: "marketplace", topic: "royalties" },
    commands: ['royalty issues', 'incorrect royalties']
  },
  {
    content: "Nuxchain platform limits: Minimum staking 100 NFTs, maximum 1,000,000 NFTs per transaction. NFT maximum 50 MB per file, supported formats: JPG, PNG, GIF, MP4, MP3. Offers maximum 7 days duration. Recommended gas limit: 300,000 for staking, 150,000 for NFT transfers.",
    metadata: { type: "faq", category: "general", topic: "limits" },
    commands: ['platform limits', 'Nuxchain restrictions']
  },

  // === NUXCHAIN LABS - AI INNOVATION HUB ===
  {
    content: "Nuxchain Labs is the innovation hub where cutting-edge AI technology meets blockchain. Labs explores the limits of blockchain with artificial intelligence to optimize staking strategies, NFTs, and maximize earnings. The platform features AI-powered tools including Nuxbee AI Chat for intelligent assistance with its own dedicated platform for advanced features, AI Strategist for personalized staking recommendations, comprehensive Staking & NFT Analytics dashboards, and high-speed processing with automations for claims, compounding, and knowledge base searches. Labs showcases innovative projects currently in development that will revolutionize the blockchain ecosystem.",
    metadata: { type: "labs", category: "innovation", topic: "overview" },
    commands: ['Nuxchain Labs', 'Labs innovation', 'AI innovation hub', 'Nuxchain AI technology', 'Nuxbee platform']
  },
  {
    content: "Nuxchain Labs AI Features: 1) Nuxbee AI Chat - Advanced intelligent assistant where users can ask questions, get help, and receive real-time recommendations about all Nuxchain features. Nuxbee will have its own dedicated platform for advanced capabilities. 2) AI Strategist & Insights - Advanced analysis that generates personalized staking strategies and recommended actions based on user profile and market conditions. 3) Staking & NFT Analytics - Comprehensive dashboards and metrics to understand performance, APY, and health of positions and NFT collections. 4) Processing Speed & Automations - Optimized processing and automations to accelerate common tasks like claims, compounding, and knowledge base searches. All features are powered by Google Gemini AI with real-time data integration.",
    metadata: { type: "labs", category: "ai-features", topic: "capabilities" },
    commands: ['Labs AI features', 'Nuxbee Chat', 'AI Strategist', 'Labs analytics', 'Labs automations', 'Nuxbee platform']
  },
  {
    content: "Nuxchain Labs Innovation Projects: 1) NuxAI Strategist (90% complete) - Intelligent assistant that analyzes market and recommends personalized investment strategies. 2) SmartStaking Optimizer (85% complete) - Tool that calculates best staking and lockup periods according to risk profile. 3) NFT Analytics Dashboard (70% complete) - Platform that analyzes NFT collections, predicts market trends, and identifies investment opportunities. 4) Blockchain Governance AI (60% complete) - Automated voting and proposal system for decentralized governance. 5) Nuxchain Game (30% complete) - Blockchain-based game combining play-to-earn mechanics with strategic gameplay. 6) CryptoInfluence Marketing Hub (45% complete) - Platform connecting influencers with crypto projects for monetization and audience engagement.",
    metadata: { type: "labs", category: "projects", topic: "innovation-showcase" },
    commands: ['Labs projects', 'NuxAI Strategist', 'SmartStaking Optimizer', 'NFT Analytics', 'Blockchain Governance AI', 'Nuxchain Game', 'CryptoInfluence']
  },
  {
    content: "Nuxchain Labs Impact Metrics: The AI technology has delivered measurable results - 42% profitability optimization with users reporting higher earnings using AI recommendations, 500,000+ investment simulations analyzed monthly, 98% recommendation accuracy with high user satisfaction rate, and 12 predictive models providing advanced analysis tools. Labs demonstrates real impact on investors' performance through cutting-edge AI and blockchain integration.",
    metadata: { type: "labs", category: "metrics", topic: "impact" },
    commands: ['Labs impact', 'Labs metrics', 'Labs results', 'AI performance']
  },

  // === DEVELOPER HUB - WEB3 INFRASTRUCTURE ===
  {
    content: "Nuxchain Developer Hub (DevHub) is a comprehensive Web3 infrastructure platform for developers, startups, and product builders. DevHub provides production-ready tools and APIs to build Web3 solutions faster than ever. The hub offers complete developer toolkits including Staking Infrastructure, NFT Marketplace solutions, Token Creation Suite, and Nuxbee AI Assistant integration. All tools are designed to be integration-ready with minimal code required, allowing developers to focus on building innovative applications rather than reinventing blockchain infrastructure.",
    metadata: { type: "devhub", category: "platform", topic: "overview" },
    commands: ['Developer Hub', 'DevHub', 'Nuxchain developers', 'Web3 infrastructure', 'developer tools']
  },
  {
    content: "DevHub Staking Infrastructure: Deploy secure staking contracts with flexible lock periods and auto-compound rewards for your community. Features include: Pre-audited smart contracts ready to deploy on any EVM chain, flexible reward distribution mechanisms with customizable parameters, built-in admin dashboard for managing staking pools and monitoring metrics, automatic reward calculation and distribution system, support for multiple lock periods with bonus multipliers, and integration-ready APIs for frontend applications. Tech stack: Solidity, Hardhat, OpenZeppelin, Polygon. Offers custom APY configuration, multi-token support, and real-time analytics dashboard.",
    metadata: { type: "devhub", category: "tools", topic: "staking-infrastructure" },
    commands: ['DevHub staking', 'staking infrastructure', 'deploy staking contracts', 'staking API']
  },
  {
    content: "DevHub NFT Marketplace: Launch your own NFT marketplace with customizable royalties, auctions, and decentralized trading. Features include: Complete marketplace infrastructure with buy, sell, and auction functionality, lazy minting technology to reduce gas costs for creators, automatic royalty distribution to original creators on secondary sales, support for ERC-721 and ERC-1155 standards, IPFS integration for decentralized metadata storage, and customizable marketplace fees and commission structures. Tech stack: ERC-721, ERC-1155, IPFS, The Graph. Offers lazy minting (zero gas), royalty management, and auction & fixed price options.",
    metadata: { type: "devhub", category: "tools", topic: "nft-marketplace" },
    commands: ['DevHub NFT', 'NFT marketplace', 'deploy marketplace', 'NFT infrastructure']
  },
  {
    content: "DevHub Token Creation Suite: Create and manage digital assets with no-code tokenization platform for any use case. Features include: No-code token creation wizard for ERC-20 and ERC-721 tokens, configurable token economics (supply, decimals, burnable, mintable), built-in vesting schedules and token locks for team allocations, airdrop tools for community distribution campaigns, token gating features for exclusive access control, and comprehensive token analytics and holder tracking. Tech stack: ERC-20, ERC-721, Vesting, Merkle Trees. Supports ERC-20/721 standards, instant deployment, and token utility builder.",
    metadata: { type: "devhub", category: "tools", topic: "token-creation" },
    commands: ['DevHub tokens', 'token creation', 'create ERC-20', 'tokenization tools']
  },
  {
    content: "DevHub Nuxbee AI Integration: Integrate AI-powered chat for customer support, community engagement, and user onboarding. Features include: Embeddable AI chat widget for your dApp or website, train on your project documentation and smart contract details, automatic response to common Web3 questions (gas, wallets, transactions), real-time blockchain data integration for transaction status, customizable personality and tone to match your brand, and analytics dashboard to track user interactions and improve responses. Tech stack: Gemini AI, RAG, Vector DB, WebSocket. Offers context-aware responses, custom knowledge base, and multi-language support. Powered by Nuxbee AI technology.",
    metadata: { type: "devhub", category: "tools", topic: "ai-integration" },
    commands: ['DevHub AI', 'Nuxbee integration', 'AI chat widget', 'AI assistant API', 'Nuxbee API']
  },
  {
    content: "Nuxchain Kit - Coming Soon: A comprehensive developer toolkit and API platform launching soon. Nuxchain Kit will provide RESTful API with simple HTTP endpoints for all core functionality, SDK Libraries for JavaScript, TypeScript, and Python, secure authentication with API keys and OAuth 2.0 support, real-time webhooks for event notifications on blockchain activities, sandbox environment to test integrations on testnets, and comprehensive interactive API documentation and guides. Developers will be able to: deploy staking contracts with custom parameters via API, create and manage NFT collections programmatically, integrate marketplace functionality into dApps, query blockchain data with simplified GraphQL endpoints, automate token distributions and airdrops, and access AI-powered analytics and insights. Join the waitlist for early access and exclusive developer benefits.",
    metadata: { type: "devhub", category: "nuxchain-kit", topic: "api-platform" },
    commands: ['Nuxchain Kit', 'API platform', 'developer API', 'SDK', 'DevHub waitlist']
  },

  // === ROADMAP - DEVELOPMENT TIMELINE ===
  {
    content: "Nuxchain Roadmap 2024-2027: Comprehensive development timeline spanning three major phases with 31% current completion. The roadmap includes 4 achieved milestones and 9 upcoming goals across multiple categories including Launch, Technology, Features, Innovation, Gaming, DeFi, Governance, and Business. Timeline covers 2024-2027 with detailed quarterly milestones and progress tracking. The platform is currently in Phase 2 (Advanced Features & Governance) with active development on NFT Analytics Dashboard, DAO Governance System, Nuxbee AI Platform 2.0 Integration, and Smart Contract Updates.",
    metadata: { type: "roadmap", category: "overview", topic: "timeline" },
    commands: ['Nuxchain roadmap', 'roadmap timeline', 'development phases', 'roadmap 2024-2027']
  },
  {
    content: "Roadmap Phase 1 - Foundation & Core Features (Completed): Establishing fundamental infrastructure and core functionalities. Achievements include: 1) Nuxchain Platform Beta - Fully operational platform with SmartStaking contract and NFT Marketplace where users can stake tokens, trade NFTs, and interact seamlessly with the ecosystem. 2) Profile Page & Dashboard - Personalized user profiles with comprehensive stats, NFT collections, staking overview, and real-time rewards tracking. 3) AI Staking Analysis - Advanced AI-powered analysis engine that optimizes staking strategies and provides personalized recommendations based on market conditions. 4) Nuxbee AI 1.0 - Initial release of Nuxbee AI assistant with advanced features and capabilities for user assistance and ecosystem guidance, with plans for a dedicated platform.",
    metadata: { type: "roadmap", category: "phase-1", topic: "completed" },
    commands: ['Phase 1', 'roadmap phase 1', 'completed milestones', 'foundation phase']
  },
  {
    content: "Roadmap Phase 2 - Advanced Features & Governance (In Progress): Expanding capabilities with advanced analytics, community governance, and enhanced AI integration. Current development includes: 1) NFT Analytics Dashboard (Q4 2025) - Comprehensive analytics platform for NFT collections with trend prediction, market analysis, and investment optimization tools powered by AI. 2) Governance DAO (Q4 2026) - Decentralized autonomous organization enabling community-driven governance to vote on proposals, submit ideas, and shape the future of Nuxchain. 3) Nuxbee AI Platform 2.0 (Q1 2026) - Launch of dedicated Nuxbee AI platform with advanced features, deep integration throughout Nuxchain, providing contextual help, automation, intelligent recommendations, and sophisticated tools for power users. 4) Smart Contract Updates - Continuous updates and optimizations for better performance and security.",
    metadata: { type: "roadmap", category: "phase-2", topic: "in-progress" },
    commands: ['Phase 2', 'roadmap phase 2', 'current development', 'in progress', 'Nuxbee platform']
  },
  {
    content: "Roadmap Phase 3 - Innovation & Expansion (Planned): Pioneering new frontiers with physical-digital integration, gamification, and revolutionary blockchain solutions. Planned features include: 1) Physical NFT Clothing Brand (Q2 2026) - Revolutionary clothing line where each physical item comes with a unique NFT, unlocking exclusive benefits, utilities, and experiences on the platform. 2) New Smart Contracts (Q1 2025) - Development of innovative smart contract solutions to expand blockchain capabilities, create new DeFi products, and enhance platform functionality. 3) Mini Game & Gamification (Q2-Q3 2027) - Interactive gaming experience that gamifies user engagement, connecting NFTs, staking, and daily tasks for rewards and enhanced platform interaction. 4) Advanced Security Features - Enhanced security protocols, multi-signature wallets, and advanced encryption to protect user assets and ensure platform integrity.",
    metadata: { type: "roadmap", category: "phase-3", topic: "planned" },
    commands: ['Phase 3', 'roadmap phase 3', 'future plans', 'innovation expansion']
  },
  {
    content: "Roadmap Key Milestones Achieved: 1) Project Inception (Q4 2024) - Started development of Nuxchain platform with initial architecture and core features. 2) Smart Contracts v1.0 (Q1 2025) - Development of innovative smart contract solutions to expand blockchain capabilities. 3) AI Integration (Q2 2025) - Successfully integrated AI-powered staking analysis and recommendations. 4) Beta Platform Launch (Q3 2025) - Internal beta launch of Nuxchain platform with core staking and marketplace features. These milestones represent 31% completion of the overall roadmap with strong foundation for future development.",
    metadata: { type: "roadmap", category: "milestones", topic: "achieved" },
    commands: ['achieved milestones', 'completed roadmap', 'roadmap progress']
  },
  {
    content: "Roadmap Upcoming Milestones: 1) NFT Analytics (Q4 2025) - Release of comprehensive NFT analytics and prediction dashboard. 2) Nuxbee AI Platform (Q1 2026) - Launch of dedicated Nuxbee AI platform with advanced AI-powered capabilities, generative AI features, comprehensive toolset hub, and sophisticated automation tools for power users. 3) Physical Branding NFTs (Q2 2026) - Launch of physical NFT clothing brand with digital integration. 4) Staking Pools v2.0 (Q3 2026) - Advanced staking pools with dynamic rewards and flexible lock periods. 5) DAO Governance (Q4 2026) - Transition to fully decentralized platform with community governance. 6) Global Web Launch (Q1 2027) - Official public launch and expansion to new markets. 7) Gaming Platform (Q2-Q3 2027) - Release of gamification features and mini-game ecosystem. 8) Mobile Apps (Q4 2027) - Native mobile applications for iOS and Android. 9) Enterprise Solutions (Q4 2027) - Enterprise-grade blockchain solutions for institutional clients.",
    metadata: { type: "roadmap", category: "milestones", topic: "upcoming" },
    commands: ['upcoming milestones', 'future roadmap', 'planned features', 'roadmap goals', 'Nuxbee platform launch']
  },
  {
    content: "Roadmap Progress Statistics: Overall roadmap completion is 31% with 4 milestones achieved out of 13 total milestones. The development spans 3 major phases over a 2024-2027 timeline. Current focus is on Phase 2 with 4 features in active development. The roadmap covers 9 different categories: Launch, Technology, Features, Innovation, Gaming, DeFi, Governance, and Business. Progress is tracked through detailed quarterly milestones with transparent status updates. The platform maintains a balance between innovation and stability, ensuring each phase builds upon previous achievements while introducing groundbreaking new features.",
    metadata: { type: "roadmap", category: "progress", topic: "statistics" },
    commands: ['roadmap progress', 'completion percentage', 'roadmap stats', 'development status']
  },

  // === NFT MARKETPLACE ===
  {
    content: "Nuxchain NFT Marketplace Overview: The NFT Marketplace is a core feature of the Nuxchain platform enabling users to buy, sell, and trade NFTs seamlessly. The marketplace is built on the Polygon network using smart contracts for secure transactions. Features include browsing and filtering NFTs by collection, price range, rarity, and attributes. All prices are displayed in POL tokens. The marketplace supports multiple NFT collections including Nuxchain-native collections and integrated external collections. Average transaction time is 10-30 seconds on Polygon network.",
    metadata: { type: "marketplace", category: "nft", topic: "overview" },
    commands: ['Nuxchain marketplace', 'NFT marketplace', 'NFT trading', 'marketplace features']
  },
  {
    content: "How to Buy NFTs on Nuxchain Marketplace: 1) Connect your wallet (MetaMask, Trust Wallet, or WalletConnect) to the platform. 2) Navigate to the Marketplace section. 3) Browse or search for NFTs by collection or filter by price and attributes. 4) Click on an NFT to view details including rarity score, transaction history, and current bids. 5) Click 'Buy Now' if listed at fixed price. 6) Approve the transaction in your wallet and confirm purchase. 7) NFT will appear in your wallet and profile after transaction is confirmed (10-30 seconds on Polygon). Marketplace fee is 2.5% paid in POL. Ensure your wallet has sufficient POL for the purchase price plus gas fees.",
    metadata: { type: "marketplace", category: "nft", topic: "buying-guide" },
    commands: ['how to buy NFT', 'buy NFT marketplace', 'NFT purchase tutorial']
  },
  {
    content: "How to Sell NFTs on Nuxchain Marketplace: 1) Connect your wallet and navigate to your Profile/Dashboard. 2) Select 'My NFTs' to view your collection. 3) Choose the NFT you want to sell and click 'List for Sale'. 4) Enter your desired price in POL tokens. 5) Set listing duration (7, 30, or 90 days). 6) Review details and confirm transaction in your wallet. 7) NFT is now listed on the marketplace and visible to buyers. You can cancel listing anytime before it sells. After 24 hours of listing, you can also create collection offers for buyers to bid on multiple NFTs at once. Transaction appears in your profile history.",
    metadata: { type: "marketplace", category: "nft", topic: "selling-guide" },
    commands: ['how to sell NFT', 'sell NFT marketplace', 'NFT listing tutorial']
  },
  {
    content: "NFT Marketplace Advanced Features: 1) Make Offers - Buyers can make offers below asking price, sellers can accept/reject/counter. 2) Collection Filters - Filter by collection, price range, rarity score, attributes, and listing status. 3) Analytics - View floor price, trading volume, rarity rankings, and price history for each collection. 4) Bidding System - For valuable NFTs, bidding wars can occur over 24-48 hours. 5) Favorites - Save NFTs to your favorites list for future reference. 6) Bulk Operations - Coming soon: list/delist multiple NFTs at once, batch transfers. 7) Transaction History - View all buy/sell transactions for transparent trading record. 8) Verification - NFT authenticity verified through blockchain immutability.",
    metadata: { type: "marketplace", category: "nft", topic: "advanced-features" },
    commands: ['marketplace features', 'NFT offers', 'NFT bidding', 'marketplace analytics']
  },
  {
    content: "Nuxchain Marketplace Fees & Economics: Marketplace Fee: 2.5% of transaction value paid in POL by seller. Creator Royalties: Variable by collection (typically 2-5%), paid to original creator on secondary sales. Gas Fees: Paid by buyer or seller depending on transaction type, typically 0.1-0.5 POL per transaction. Price Suggestions: Marketplace provides AI-powered price suggestions based on similar NFT sales. Bulk Discounts: Coming soon - reduce fees for high-volume traders. Fee Distribution: 70% to Nuxchain treasury, 30% to community governance. Total cost to buyer: NFT price + 2.5% marketplace fee + creator royalties + gas fees. Estimate before confirming transactions.",
    metadata: { type: "marketplace", category: "nft", topic: "fees-economics" },
    commands: ['marketplace fees', 'NFT fees', 'royalties', 'gas fees']
  },
  {
    content: "Nuxchain Marketplace Popular Collections: Nuxchain Genesis Collection - Original 10,000 NFTs with governance utility and staking bonuses. Prime Collection - 5,000 limited edition NFTs with exclusive benefits and marketplace features. Founder's Collection - 1,000 ultra-rare founder NFTs with lifetime benefits. Community Drops - Regular limited drops from community artists and projects. Marketplace also features integrated collections from partner projects. New collections can be created through governance proposals. Floor prices range from 10 POL to 5,000+ POL depending on collection and rarity.",
    metadata: { type: "marketplace", category: "nft", topic: "collections" },
    commands: ['Nuxchain collections', 'NFT collections', 'popular NFTs', 'genesis NFT']
  },

  // === AIRDROPS ===
  {
    content: "Nuxchain Airdrops Complete Guide: Airdrops are periodic distributions of tokens or NFTs to community members. Nuxchain runs multiple airdrops throughout the year to reward community participation and loyalty. Airdrop eligibility is based on various criteria including staking amount, NFT holdings, community participation, wallet age, and snapshot time. To participate: 1) Connect your eligible wallet to Nuxchain. 2) Check your eligibility status on the Airdrops page. 3) Ensure wallet remains connected during snapshot time (usually 24 hours). 4) After snapshot, tokens are automatically distributed to eligible wallets. 5) View airdrop history in your dashboard. Announcements are made on Discord, Twitter, and the platform.",
    metadata: { type: "airdrops", category: "airdrops", topic: "overview" },
    commands: ['Nuxchain airdrops', 'airdrop guide', 'airdrop participation', 'airdrop eligibility']
  },
  {
    content: "Nuxchain Airdrop Eligibility Requirements: Requirements vary by airdrop but commonly include: 1) Staking Requirement - Minimum 50 POL staked during snapshot period (higher stakes = higher rewards). 2) NFT Ownership - Hold at least one Nuxchain NFT (some airdrops require specific collections). 3) Community Participation - Active in Discord or governance voting (verified by activity logs). 4) Wallet Age - Account must exist for minimum 30 days prior to snapshot. 5) Geographic - Available in most regions except restricted jurisdictions. 6) KYC Requirements - Some airdrops may require basic verification. 7) Previous Participation - Past airdrops may increase future allocation. Higher eligibility scores result in larger airdrop amounts. Allocation amounts typically range from 100 to 10,000 tokens depending on tier and airdrop size.",
    metadata: { type: "airdrops", category: "airdrops", topic: "eligibility" },
    commands: ['airdrop eligibility', 'airdrop requirements', 'how to qualify airdrop', 'airdrop conditions']
  },
  {
    content: "Nuxchain Historical Airdrops: Airdrop #1 (Q4 2024) - Genesis Airdrop: 50,000 tokens distributed to 1,000 early supporters. Average: 50 tokens per wallet. Airdrop #2 (Q1 2025) - Staking Rewards Airdrop: 100,000 tokens to active stakers. Average: 150 tokens per wallet. Airdrop #3 (Q2 2025) - Community Airdrop: 75,000 tokens to Discord members. Average: 100 tokens per wallet. Airdrop #4 (Q3 2025) - NFT Holder Airdrop: 50,000 tokens to NFT owners. Average: 200 tokens per wallet. Total Distributed: 275,000 tokens across all airdrops. Snapshot Distribution: Airdrops taken at random times to prevent gaming. All distributions verified via blockchain and transparent in contract events.",
    metadata: { type: "airdrops", category: "airdrops", topic: "history" },
    commands: ['airdrop history', 'past airdrops', 'airdrop distributions', 'airdrop statistics']
  },
  {
    content: "Upcoming Nuxchain Airdrops (Q4 2025-Q1 2026): Q4 2025 - Milestone Airdrop: 100,000 tokens for users who complete specific milestones (staking, marketplace trades, AI chat usage). Q1 2026 - Platform Launch Bonus: 150,000 tokens for all active platform users. Features governance participation as eligibility criterion. Estimated allocation: 200-500 tokens per wallet depending on engagement level. All upcoming airdrops will be announced 2 weeks in advance with full eligibility criteria. Community governance will help decide airdrop mechanics and distribution methods. Historical data shows Nuxchain commits 500,000+ tokens annually to airdrops. Holders are encouraged to stake and participate in governance to maximize airdrop rewards.",
    metadata: { type: "airdrops", category: "airdrops", topic: "upcoming" },
    commands: ['upcoming airdrops', 'future airdrops', 'next airdrop', 'Q4 2025 airdrop']
  }
];

// Function to search the knowledge base - Optimized for intelligent searches
function searchKnowledgeBase(query, limit = 5, docs = knowledgeBase) {
  console.log('Knowledge base loaded with', docs.length, 'items');
  const queryLower = query.toLowerCase();
  
  // Preprocess query to remove stop words
  const stopWords = ['this', 'that', 'these', 'those', 'the', 'a', 'an', 'and', 'or', 'is', 'are', 'in', 'on', 'at', 'for', 'with'];
  const queryWords = queryLower.split(/\s+/) 
    .filter(word => !stopWords.includes(word) && word.length > 2)
    .map(word => word.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);
  
  // Determine query categories
  const categories = {
    staking: queryLower.includes('staking') || queryLower.includes('apy') || queryLower.includes('lockup'),
    nft: queryLower.includes('nft') || queryLower.includes('marketplace') || queryLower.includes('collection'),
    airdrop: queryLower.includes('airdrop') || queryLower.includes('reward'),
    labs: queryLower.includes('labs') || queryLower.includes('innovation') || queryLower.includes('ai features'),
    devhub: queryLower.includes('devhub') || queryLower.includes('developer') || queryLower.includes('api') || queryLower.includes('infrastructure'),
    roadmap: queryLower.includes('roadmap') || queryLower.includes('milestone') || queryLower.includes('phase'),
    general: !queryWords.length || (queryWords.length === 1 && queryWords[0].length < 5)
  };
  
  // Search for exact matches in commands
  const exactMatches = docs.filter(item => 
    (item.commands && item.commands.some(cmd => cmd.toLowerCase() === queryLower)) ||
    (item.metadata?.category && queryLower.includes(item.metadata.category.toLowerCase())) ||
    (item.metadata?.topic && queryLower.includes(item.metadata.topic.toLowerCase()))
  );
  
  // Search for matches in content using improved scoring algorithm
  const scoredMatches = docs
    .filter(item => !exactMatches.includes(item))
    .map(item => {
      const contentLower = item.content.toLowerCase();
      let score = 0;
      
      // Score for direct match
      if (contentLower.includes(queryLower)) {
        score += 0.5;
      }
      
      // Score for query keywords
      queryWords.forEach(word => {
        if (contentLower.includes(word)) {
          // Higher score for longer words
          score += (word.length / 100) * 3;
        }
      });
      
      // Score for matching category
      if (categories.staking && ['staking', 'smart-contract'].includes(item.metadata?.type)) {
        score += 0.2;
      } else if (categories.nft && ['nft', 'marketplace'].includes(item.metadata?.type)) {
        score += 0.2;
      } else if (categories.airdrop && ['airdrops'].includes(item.metadata?.type)) {
        score += 0.2;
      } else if (categories.labs && ['labs'].includes(item.metadata?.type)) {
        score += 0.2;
      } else if (categories.devhub && ['devhub'].includes(item.metadata?.type)) {
        score += 0.2;
      } else if (categories.roadmap && ['roadmap'].includes(item.metadata?.type)) {
        score += 0.2;
      } else if (categories.general && ['general'].includes(item.metadata?.type)) {
        score += 0.1;
      }
      
      return { ...item, score };
    })
    .filter(item => item.score > 0.1) // Filter results with minimum score
    .sort((a, b) => b.score - a.score); // Sort by descending score
  
  // Combine exact and scored results
  const combinedResults = [...exactMatches, ...scoredMatches.slice(0, limit - exactMatches.length)];
  
  // Ensure limit is not exceeded
  return combinedResults.slice(0, limit);
}

// Function to get relevant context
function getRelevantContext(query) {
  console.log('Searching context for query:', query);
  const results = searchKnowledgeBase(query, 3);
  console.log('Results found:', results.length);
  const context = results.map(item => item.content).join('\n\n');
  console.log('Generated context (first 300 chars):', context.substring(0, 300));
  return context;
}

export {
  knowledgeBase,
  searchKnowledgeBase,
  getRelevantContext
};