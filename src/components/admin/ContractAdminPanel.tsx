/**
 * ContractAdminPanel
 * Shows admin functions for a selected contract and allows executing them.
 * Functions extracted from on-chain Solidity source.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, isAddress } from 'viem';

// ── Full implementation ABIs (not interfaces) for admin write calls ──
import {
  CollaboratorBadgeRewardsABI,
  DynamicAPYCalculatorABI,
  EnhancedSmartStakingCoreV2ABI,
  EnhancedSmartStakingGamificationABI,
  EnhancedSmartStakingRewardsABI,
  EnhancedSmartStakingSkillsABI,
  GameifiedMarketplaceCoreV1ABI,
  GameifiedMarketplaceQuestsABI,
  GameifiedMarketplaceSkillsNftABI,
  LevelingSystemABI,
  TreasuryManagerABI,
} from '../../lib/export/abis/legacy';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AbiArray = readonly any[];

const ADMIN_ABIS: Record<string, AbiArray> = {
  EnhancedSmartStaking:         (EnhancedSmartStakingCoreV2ABI   as { abi: AbiArray }).abi,
  EnhancedSmartStakingRewards:  (EnhancedSmartStakingRewardsABI  as { abi: AbiArray }).abi,
  EnhancedSmartStakingGamification: (EnhancedSmartStakingGamificationABI as { abi: AbiArray }).abi,
  EnhancedSmartStakingSkills:   (EnhancedSmartStakingSkillsABI   as { abi: AbiArray }).abi,
  DynamicAPYCalculator:         (DynamicAPYCalculatorABI          as { abi: AbiArray }).abi,
  CollaboratorBadgeRewards:     (CollaboratorBadgeRewardsABI      as { abi: AbiArray }).abi,
  GameifiedMarketplaceProxy:    (GameifiedMarketplaceCoreV1ABI    as { abi: AbiArray }).abi,
  GameifiedMarketplaceQuests:   (GameifiedMarketplaceQuestsABI    as { abi: AbiArray }).abi,
  GameifiedMarketplaceSkills:   (GameifiedMarketplaceSkillsNftABI as { abi: AbiArray }).abi,
  TreasuryManager:              (TreasuryManagerABI               as { abi: AbiArray }).abi,
  LevelingSystem:               (LevelingSystemABI                as { abi: AbiArray }).abi,
};

// ─────────────────────────────────────────────
// 1. Types
// ─────────────────────────────────────────────
export interface AdminParam {
  name: string;
  type: 'address' | 'uint256' | 'bool' | 'string' | 'uint8' | 'uint16' | 'ether';
  placeholder?: string;
  hint?: string;
}

export interface AdminFunction {
  name: string;
  label: string;
  description: string;
  params: AdminParam[];
  danger?: boolean;
  abiName: string; // function name as it appears in ABI
}

export interface ContractAdminConfig {
  contractKey: keyof typeof ADMIN_ABIS;
  functions: AdminFunction[];
}

// ─────────────────────────────────────────────
// 2. Admin function definitions per contract
// ─────────────────────────────────────────────
const CONTRACT_ADMIN_FUNCTIONS: Record<string, AdminFunction[]> = {

  // ── Enhanced SmartStaking Core ──────────────
  EnhancedSmartStaking: [
    {
      abiName: 'setRewardsModule', name: 'setRewardsModule', label: 'Set Rewards Module',
      description: 'Replace the Rewards module contract address',
      params: [{ name: '_rewardsModule', type: 'address', placeholder: '0x...', hint: 'New rewards module address' }],
    },
    {
      abiName: 'setSkillsModule', name: 'setSkillsModule', label: 'Set Skills Module',
      description: 'Replace the Skills module contract address',
      params: [{ name: '_skillsModule', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setGamificationModule', name: 'setGamificationModule', label: 'Set Gamification Module',
      description: 'Replace the Gamification module contract address',
      params: [{ name: '_gamificationModule', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setMarketplaceAuthorization', name: 'setMarketplaceAuthorization', label: 'Marketplace Authorization',
      description: 'Grant or revoke marketplace authorization',
      params: [
        { name: '_marketplace', type: 'address', placeholder: '0x...' },
        { name: '_isAuthorized', type: 'bool', placeholder: 'true / false', hint: 'true = authorize, false = revoke' },
      ],
    },
    {
      abiName: 'changeTreasuryAddress', name: 'changeTreasuryAddress', label: 'Change Treasury Address',
      description: 'Change the treasury recipient for commissions',
      params: [{ name: '_newTreasury', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setTreasuryManager', name: 'setTreasuryManager', label: 'Set Treasury Manager',
      description: 'Update the TreasuryManager contract reference',
      params: [{ name: '_treasuryManager', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'pause', name: 'pause', label: 'Pause Contract',
      description: 'Pause all user-facing staking operations',
      params: [], danger: true,
    },
    {
      abiName: 'unpause', name: 'unpause', label: 'Unpause Contract',
      description: 'Resume all user-facing staking operations',
      params: [],
    },
    {
      abiName: 'emergencyWithdraw', name: 'emergencyWithdraw', label: 'Emergency Withdraw',
      description: 'Send contract POL to treasury in an emergency',
      params: [{ name: '_amount', type: 'ether', placeholder: '0.0', hint: 'Amount in POL' }],
      danger: true,
    },
  ],

  // ── Staking Rewards ─────────────────────────
  EnhancedSmartStakingRewards: [
    {
      abiName: 'setSkillsModule', name: 'setSkillsModule', label: 'Set Skills Module',
      description: 'Update Skills module address for the rewards contract',
      params: [{ name: '_skillsModule', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setGamificationModule', name: 'setGamificationModule', label: 'Set Gamification Module',
      description: 'Update Gamification module address',
      params: [{ name: '_gamificationModule', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setTreasuryManager', name: 'setTreasuryManager', label: 'Set Treasury Manager',
      description: 'Update TreasuryManager contract address',
      params: [{ name: '_treasuryManager', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setAPYCalculator', name: 'setAPYCalculator', label: 'Set APY Calculator',
      description: 'Update the DynamicAPYCalculator contract address',
      params: [{ name: '_apyCalculator', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'updateCurrentTVL', name: 'updateCurrentTVL', label: 'Update Current TVL',
      description: 'Update tracked TVL for dynamic APY calculation',
      params: [{ name: '_currentTVL', type: 'ether', placeholder: '0.0', hint: 'TVL in POL (wei converted)' }],
    },
    {
      abiName: 'updateBaseAPY', name: 'updateBaseAPY', label: 'Update Base APY',
      description: 'Set base APY for a lockup period tier (0–4)',
      params: [
        { name: 'lockupPeriodIndex', type: 'uint8', placeholder: '0', hint: 'Lockup tier index 0–4' },
        { name: 'newAPY', type: 'uint256', placeholder: '1000', hint: 'APY in basis points (1000 = 10%)' },
      ],
    },
    {
      abiName: 'emergencyWithdraw', name: 'emergencyWithdraw', label: 'Emergency Withdraw',
      description: 'Withdraw POL from rewards pool to owner',
      params: [{ name: 'amount', type: 'ether', placeholder: '0.0', hint: 'Amount in POL' }],
      danger: true,
    },
  ],

  // ── Staking Gamification ─────────────────────
  EnhancedSmartStakingGamification: [
    {
      abiName: 'setMarketplaceContract', name: 'setMarketplaceContract', label: 'Set Marketplace Contract',
      description: 'Set the authorized marketplace contract address',
      params: [{ name: '_marketplace', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setCoreStakingContract', name: 'setCoreStakingContract', label: 'Set Core Staking Contract',
      description: 'Update the core staking contract reference',
      params: [{ name: '_coreStaking', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setLevelingSystemAddress', name: 'setLevelingSystemAddress', label: 'Set Leveling System',
      description: 'Update the LevelingSystem contract address',
      params: [{ name: '_levelingSystem', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setTreasuryManager', name: 'setTreasuryManager', label: 'Set Treasury Manager',
      description: 'Update TreasuryManager contract address',
      params: [{ name: '_treasuryManager', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setUserXP', name: 'setUserXP', label: 'Set User XP (Admin Override)',
      description: 'Directly override a user\'s XP — use for corrections/migrations',
      params: [
        { name: 'user', type: 'address', placeholder: '0x...' },
        { name: 'xp', type: 'uint256', placeholder: '1000', hint: 'XP amount (raw)' },
      ],
      danger: true,
    },
  ],

  // ── Staking Skills ───────────────────────────
  EnhancedSmartStakingSkills: [
    {
      abiName: 'setMarketplaceContract', name: 'setMarketplaceContract', label: 'Set Marketplace Contract',
      description: 'Update the authorized marketplace address',
      params: [{ name: '_marketplace', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setCoreStakingContract', name: 'setCoreStakingContract', label: 'Set Core Staking',
      description: 'Update the core staking contract reference',
      params: [{ name: '_coreStaking', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'updateSkillBoost', name: 'updateSkillBoost', label: 'Update Skill Boost',
      description: 'Update APY boost % for a skill type (in basis points, max 2500)',
      params: [
        { name: 'skillType', type: 'uint8', placeholder: '0', hint: 'SkillType enum value (0–N)' },
        { name: 'newBoost', type: 'uint16', placeholder: '500', hint: 'Boost in basis points (500 = 5%)' },
      ],
    },
  ],

  // ── Dynamic APY Calculator ───────────────────
  DynamicAPYCalculator: [
    {
      abiName: 'setTargetTVL', name: 'setTargetTVL', label: 'Set Target TVL',
      description: 'Set reference TVL where APY equals the base rate',
      params: [{ name: '_targetTVL', type: 'ether', placeholder: '100', hint: 'Target TVL in POL (min 100, max 100M)' }],
    },
    {
      abiName: 'setAPYMultiplierBounds', name: 'setAPYMultiplierBounds', label: 'Set APY Multiplier Bounds',
      description: 'Set floor and ceiling for the dynamic APY multiplier (basis points)',
      params: [
        { name: '_minMultiplier', type: 'uint256', placeholder: '5000', hint: 'Min in basis points (5000 = 0.5x)' },
        { name: '_maxMultiplier', type: 'uint256', placeholder: '20000', hint: 'Max in basis points (20000 = 2x)' },
      ],
    },
    {
      abiName: 'setDynamicAPYEnabled', name: 'setDynamicAPYEnabled', label: 'Toggle Dynamic APY',
      description: 'Enable or disable dynamic APY (disabled = static base rates)',
      params: [{ name: '_enabled', type: 'bool', placeholder: 'true / false' }],
    },
    {
      abiName: 'setTreasuryManager', name: 'setTreasuryManager', label: 'Set Treasury Manager',
      description: 'Update TreasuryManager for APY compression notifications',
      params: [{ name: '_treasuryManager', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'pause', name: 'pause', label: 'Pause APY Calculator',
      description: 'Pause all APY calculation operations',
      params: [], danger: true,
    },
    {
      abiName: 'unpause', name: 'unpause', label: 'Unpause APY Calculator',
      description: 'Resume APY calculation operations',
      params: [],
    },
  ],

  // ── Collaborator Badge Rewards ───────────────
  CollaboratorBadgeRewards: [
    {
      abiName: 'setTreasuryManager', name: 'setTreasuryManager', label: 'Set Treasury Manager',
      description: 'Update TreasuryManager contract address',
      params: [{ name: '_treasuryManager', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setBadgeManager', name: 'setBadgeManager', label: 'Set Badge Manager',
      description: 'Set the BadgeManager contract for holder validation',
      params: [{ name: '_badgeManager', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setLimits', name: 'setLimits', label: 'Set Reward Limits',
      description: 'Set max reward per quest and max contract balance cap',
      params: [
        { name: '_maxReward', type: 'ether', placeholder: '10', hint: 'Max per-quest reward in POL' },
        { name: '_maxBalance', type: 'ether', placeholder: '1000', hint: 'Max contract balance cap in POL' },
      ],
    },
    {
      abiName: 'setClaimFeePercent', name: 'setClaimFeePercent', label: 'Set Claim Fee',
      description: 'Update claim fee in BPS (max 1000 = 10%)',
      params: [{ name: '_newFeePercent', type: 'uint256', placeholder: '100', hint: 'Fee in BPS (100 = 1%)' }],
    },
    {
      abiName: 'setMaxPendingRewardsPerUser', name: 'setMaxPendingRewardsPerUser', label: 'Set Max Pending Rewards',
      description: 'Max accumulated pending rewards per user',
      params: [{ name: '_newLimit', type: 'ether', placeholder: '50', hint: 'Limit in POL' }],
    },
    {
      abiName: 'setQuestAdmin', name: 'setQuestAdmin', label: 'Set Quest Admin',
      description: 'Grant or revoke quest admin privileges',
      params: [
        { name: '_admin', type: 'address', placeholder: '0x...' },
        { name: '_authorized', type: 'bool', placeholder: 'true / false' },
      ],
    },
    {
      abiName: 'setQuestWallet', name: 'setQuestWallet', label: 'Set Quest Wallet',
      description: 'Update the wallet that funds quest rewards',
      params: [{ name: '_questWallet', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'syncBadgeHolders', name: 'syncBadgeHolders', label: 'Sync Badge Holders',
      description: 'Sync badge holder count from BadgeManager',
      params: [],
    },
    {
      abiName: 'updateBadgeHolderCount', name: 'updateBadgeHolderCount', label: 'Override Badge Holder Count',
      description: 'Manually override the badge holder count',
      params: [{ name: '_count', type: 'uint256', placeholder: '100' }],
      danger: true,
    },
    {
      abiName: 'emergencyWithdraw', name: 'emergencyWithdraw', label: 'Emergency Withdraw',
      description: 'Withdraw contract POL to a designated address',
      params: [
        { name: '_to', type: 'address', placeholder: '0x...' },
        { name: '_amount', type: 'ether', placeholder: '0.0', hint: 'Amount in POL' },
      ],
      danger: true,
    },
  ],

  // ── Marketplace Core ─────────────────────────
  GameifiedMarketplaceProxy: [
    {
      abiName: 'setStatisticsModule', name: 'setStatisticsModule', label: 'Set Statistics Module',
      description: 'Update the statistics aggregation module address',
      params: [{ name: '_statistics', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setViewModule', name: 'setViewModule', label: 'Set View Module',
      description: 'Update the view/query module address',
      params: [{ name: '_view', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setSocialModule', name: 'setSocialModule', label: 'Set Social Module',
      description: 'Update the social interactions module address',
      params: [{ name: '_social', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'updateUserXP', name: 'updateUserXP', label: 'Update User XP',
      description: 'Manually add XP to a user (campaign rewards etc.)',
      params: [
        { name: '_user', type: 'address', placeholder: '0x...' },
        { name: '_amount', type: 'uint256', placeholder: '100', hint: 'XP amount (raw)' },
      ],
      danger: true,
    },
    {
      abiName: 'setSkillsContract', name: 'setSkillsContract', label: 'Set Skills Contract',
      description: 'Update the NFT skills contract address',
      params: [{ name: '_skillsAddress', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setQuestsContract', name: 'setQuestsContract', label: 'Set Quests Contract',
      description: 'Update the marketplace quests contract address',
      params: [{ name: '_questsAddress', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setStakingContract', name: 'setStakingContract', label: 'Set Staking Contract',
      description: 'Update the staking contract address for marketplace',
      params: [{ name: '_stakingAddress', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setCollaboratorRewardsContract', name: 'setCollaboratorRewardsContract', label: 'Set Collaborator Rewards',
      description: 'Update CollaboratorBadgeRewards contract address',
      params: [{ name: '_collaboratorRewards', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setTreasuryManager', name: 'setTreasuryManager', label: 'Set Treasury Manager',
      description: 'Update the TreasuryManager contract address',
      params: [{ name: '_treasuryManager', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setLevelingSystem', name: 'setLevelingSystem', label: 'Set Leveling System',
      description: 'Update the LevelingSystem contract address',
      params: [{ name: '_levelingAddress', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setReferralSystem', name: 'setReferralSystem', label: 'Set Referral System',
      description: 'Update the referral system contract address',
      params: [{ name: '_referralAddress', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'pause', name: 'pause', label: 'Pause Marketplace',
      description: 'Pause all marketplace operations',
      params: [], danger: true,
    },
    {
      abiName: 'unpause', name: 'unpause', label: 'Unpause Marketplace',
      description: 'Resume marketplace operations',
      params: [],
    },
  ],

  // ── Marketplace Quests ───────────────────────
  GameifiedMarketplaceQuests: [
    {
      abiName: 'setCoreContract', name: 'setCoreContract', label: 'Set Core Contract',
      description: 'Update the core marketplace contract address',
      params: [{ name: '_coreAddress', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setStakingContract', name: 'setStakingContract', label: 'Set Staking Contract',
      description: 'Update the staking contract for quest notifications',
      params: [{ name: '_stakingAddress', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setLevelingContract', name: 'setLevelingContract', label: 'Set Leveling Contract',
      description: 'Update the LevelingSystem for XP awards on quest completion',
      params: [{ name: '_levelingAddress', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'recordSocialAction', name: 'recordSocialAction', label: 'Record Social Action',
      description: 'Record a like/comment for a user to progress SOCIAL quests',
      params: [{ name: '_user', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'updateQuestProgress', name: 'updateQuestProgress', label: 'Update Quest Progress',
      description: 'Manually recalculate a user\'s progress on a quest',
      params: [
        { name: '_user', type: 'address', placeholder: '0x...' },
        { name: '_questId', type: 'uint256', placeholder: '1' },
      ],
    },
    {
      abiName: 'pause', name: 'pause', label: 'Pause Quests',
      description: 'Pause all quest completions',
      params: [], danger: true,
    },
    {
      abiName: 'unpause', name: 'unpause', label: 'Unpause Quests',
      description: 'Resume quest completions',
      params: [],
    },
  ],

  // ── Marketplace Skills NFT ───────────────────
  GameifiedMarketplaceSkills: [
    {
      abiName: 'setStakingContract', name: 'setStakingContract', label: 'Set Staking Contract',
      description: 'Update the staking contract address',
      params: [{ name: '_stakingAddress', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'setTreasuryAddress', name: 'setTreasuryAddress', label: 'Set Treasury Address',
      description: 'Update treasury address receiving skill purchase revenue',
      params: [{ name: '_treasuryAddress', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'updateSkillPrice', name: 'updateSkillPrice', label: 'Update Skill Price',
      description: 'Update price for a SkillType + Rarity combination',
      params: [
        { name: '_skillType', type: 'uint8', placeholder: '0', hint: 'SkillType enum (0–N)' },
        { name: '_rarity', type: 'uint8', placeholder: '0', hint: 'Rarity enum: 0=Common 1=Uncommon 2=Rare 3=Epic 4=Legendary' },
        { name: '_newPrice', type: 'ether', placeholder: '0.1', hint: 'New price in POL' },
      ],
    },
    {
      abiName: 'updateStakingSkillsPricing', name: 'updateStakingSkillsPricing', label: 'Bulk Update Staking Prices',
      description: 'Set prices for all 5 rarities of staking skills at once',
      params: [
        { name: '_common', type: 'ether', placeholder: '0.01' },
        { name: '_uncommon', type: 'ether', placeholder: '0.05' },
        { name: '_rare', type: 'ether', placeholder: '0.1' },
        { name: '_epic', type: 'ether', placeholder: '0.5' },
        { name: '_legendary', type: 'ether', placeholder: '1.0' },
      ],
    },
    {
      abiName: 'updateActiveSkillsPricing', name: 'updateActiveSkillsPricing', label: 'Bulk Update Active Prices',
      description: 'Set prices for all 5 rarities of active skills at once',
      params: [
        { name: '_common', type: 'ether', placeholder: '0.01' },
        { name: '_uncommon', type: 'ether', placeholder: '0.05' },
        { name: '_rare', type: 'ether', placeholder: '0.1' },
        { name: '_epic', type: 'ether', placeholder: '0.5' },
        { name: '_legendary', type: 'ether', placeholder: '1.0' },
      ],
    },
    {
      abiName: 'emergencyWithdraw', name: 'emergencyWithdraw', label: 'Emergency Withdraw',
      description: 'Withdraw a specific amount to treasury address',
      params: [{ name: '_amount', type: 'ether', placeholder: '0.0', hint: 'Amount in POL' }],
      danger: true,
    },
    {
      abiName: 'emergencyWithdrawAll', name: 'emergencyWithdrawAll', label: 'Emergency Withdraw All',
      description: 'Drain entire contract POL balance to treasury',
      params: [], danger: true,
    },
    {
      abiName: 'pause', name: 'pause', label: 'Pause Skill Sales',
      description: 'Pause all skill purchase operations',
      params: [], danger: true,
    },
    {
      abiName: 'unpause', name: 'unpause', label: 'Unpause Skill Sales',
      description: 'Resume skill purchase operations',
      params: [],
    },
  ],

  // ── Treasury Manager ─────────────────────────
  TreasuryManager: [
    {
      abiName: 'setAuthorizedSource', name: 'setAuthorizedSource', label: 'Authorize Revenue Source',
      description: 'Grant or revoke revenue-sending permission for a contract',
      params: [
        { name: 'source', type: 'address', placeholder: '0x...' },
        { name: 'authorized', type: 'bool', placeholder: 'true / false' },
      ],
    },
    {
      abiName: 'setAuthorizedRequester', name: 'setAuthorizedRequester', label: 'Authorize Requester',
      description: 'Grant or revoke ability to request reward/emergency funds',
      params: [
        { name: 'requester', type: 'address', placeholder: '0x...' },
        { name: 'authorized', type: 'bool', placeholder: 'true / false' },
      ],
    },
    {
      abiName: 'setAutoDistribution', name: 'setAutoDistribution', label: 'Toggle Auto Distribution',
      description: 'Enable or disable automated weekly distribution cycle',
      params: [{ name: 'enabled', type: 'bool', placeholder: 'true / false' }],
    },
    {
      abiName: 'setReserveAllocation', name: 'setReserveAllocation', label: 'Set Reserve Allocation',
      description: 'Set % of incoming revenue auto-saved to reserve (max 30%)',
      params: [{ name: 'percentage', type: 'uint256', placeholder: '1000', hint: 'In basis points (1000 = 10%)' }],
    },
    {
      abiName: 'setReserveAccumulation', name: 'setReserveAccumulation', label: 'Toggle Reserve Accumulation',
      description: 'Enable or disable automatic reserve fund accumulation',
      params: [{ name: 'enabled', type: 'bool', placeholder: 'true / false' }],
    },
    {
      abiName: 'setProtocolStatus', name: 'setProtocolStatus', label: 'Set Protocol Status',
      description: 'Update a protocol health status (auto triggers emergency on CRITICAL)',
      params: [
        { name: 'protocol', type: 'uint8', placeholder: '0', hint: 'TreasuryType enum: 0=REWARDS 1=STAKING 2=COLLABORATORS 3=DEVELOPMENT 4=MARKETPLACE' },
        { name: 'newStatus', type: 'uint8', placeholder: '0', hint: 'ProtocolStatus enum: 0=ACTIVE 1=WARNING 2=CRITICAL 3=EMERGENCY' },
      ],
    },
    {
      abiName: 'declareEmergency', name: 'declareEmergency', label: 'Declare Emergency',
      description: 'Activate emergency mode enabling reserve drawdowns',
      params: [{ name: 'reason', type: 'string', placeholder: 'Brief reason...' }],
      danger: true,
    },
    {
      abiName: 'endEmergency', name: 'endEmergency', label: 'End Emergency',
      description: 'Deactivate emergency mode, return to normal distribution',
      params: [],
    },
    {
      abiName: 'withdrawFromReserve', name: 'withdrawFromReserve', label: 'Withdraw From Reserve',
      description: 'Withdraw from the reserve fund to a recipient with an audit reason',
      params: [
        { name: 'to', type: 'address', placeholder: '0x...' },
        { name: 'amount', type: 'ether', placeholder: '0.0', hint: 'Amount in POL' },
        { name: 'reason', type: 'string', placeholder: 'Audit reason...' },
      ],
      danger: true,
    },
    {
      abiName: 'emergencyWithdrawAllReserve', name: 'emergencyWithdrawAllReserve', label: 'Drain Entire Reserve',
      description: 'Drain entire reserve fund to a recipient address',
      params: [
        { name: 'to', type: 'address', placeholder: '0x...' },
        { name: 'reason', type: 'string', placeholder: 'Audit reason...' },
      ],
      danger: true,
    },
    {
      abiName: 'emergencyWithdraw', name: 'emergencyWithdraw', label: 'Emergency Withdraw',
      description: 'Withdraw arbitrary amount from total contract balance to recipient',
      params: [
        { name: 'to', type: 'address', placeholder: '0x...' },
        { name: 'amount', type: 'ether', placeholder: '0.0', hint: 'Amount in POL' },
      ],
      danger: true,
    },
  ],

  // ── Leveling System ──────────────────────────
  LevelingSystem: [
    {
      abiName: 'updateUserXP', name: 'updateUserXP', label: 'Add User XP',
      description: 'Add XP to a user and trigger level-up logic if threshold crossed',
      params: [
        { name: 'user', type: 'address', placeholder: '0x...' },
        { name: 'xpAmount', type: 'uint256', placeholder: '100', hint: 'XP amount (raw)' },
        { name: 'reason', type: 'string', placeholder: 'Campaign reward...' },
      ],
    },
    {
      abiName: 'addXP', name: 'addXP', label: 'Add XP (Direct)',
      description: 'Directly add arbitrary XP to a user without a named reason',
      params: [
        { name: 'user', type: 'address', placeholder: '0x...' },
        { name: 'amount', type: 'uint256', placeholder: '100' },
      ],
    },
    {
      abiName: 'recordNFTCreated', name: 'recordNFTCreated', label: 'Record NFT Created',
      description: 'Record a single NFT creation (+10 XP, increments nftsCreated)',
      params: [{ name: 'creator', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'recordNFTSold', name: 'recordNFTSold', label: 'Record NFT Sold',
      description: 'Record an NFT sale (+20 XP, increments nftsSold)',
      params: [{ name: 'seller', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'recordNFTBought', name: 'recordNFTBought', label: 'Record NFT Bought',
      description: 'Record an NFT purchase (+15 XP, increments nftsBought)',
      params: [{ name: 'buyer', type: 'address', placeholder: '0x...' }],
    },
    {
      abiName: 'awardBadge', name: 'awardBadge', label: 'Award Badge',
      description: 'Mint a badge to a user\'s profile with a given ID, name, and description',
      params: [
        { name: 'user', type: 'address', placeholder: '0x...' },
        { name: 'id', type: 'uint256', placeholder: '1' },
        { name: 'name', type: 'string', placeholder: 'Badge Name' },
        { name: 'description', type: 'string', placeholder: 'Badge description...' },
      ],
    },
  ],
};

// Map contract name → ABI key for useWriteContract
const CONTRACT_NAME_TO_ABI_KEY: Record<string, string> = {
  'Enhanced SmartStaking': 'EnhancedSmartStaking',
  'Staking Rewards': 'EnhancedSmartStakingRewards',
  'Staking Gamification': 'EnhancedSmartStakingGamification',
  'Staking Skills': 'EnhancedSmartStakingSkills',
  'Dynamic APY Calculator': 'DynamicAPYCalculator',
  'Collaborator Badges': 'CollaboratorBadgeRewards',
  'Gameified Marketplace': 'GameifiedMarketplaceProxy',
  'Marketplace Quests': 'GameifiedMarketplaceQuests',
  'Marketplace Skills': 'GameifiedMarketplaceSkills',
  'Treasury Manager': 'TreasuryManager',
  'Marketplace Leveling': 'LevelingSystem',
};

// ─────────────────────────────────────────────
// 3. Helper: coerce param string → ABI value
// ─────────────────────────────────────────────
function coerceParam(value: string, type: AdminParam['type']): unknown {
  switch (type) {
    case 'address':
      return value as `0x${string}`;
    case 'ether':
      return parseEther(value || '0');
    case 'uint256':
    case 'uint8':
    case 'uint16':
      return BigInt(value || '0');
    case 'bool':
      return value === 'true' || value === '1';
    case 'string':
      return value;
    default:
      return value;
  }
}

function validateParam(value: string, type: AdminParam['type']): string | null {
  if (!value.trim()) return 'This field is required';
  if (type === 'address' && !isAddress(value)) return 'Invalid address format';
  if ((type === 'uint256' || type === 'uint8' || type === 'uint16') && isNaN(Number(value))) return 'Must be a number';
  if (type === 'ether' && isNaN(parseFloat(value))) return 'Must be a number';
  if (type === 'bool' && value !== 'true' && value !== 'false') return 'Must be true or false';
  return null;
}

// ─────────────────────────────────────────────
// 4. FunctionCard — renders one admin function
// ─────────────────────────────────────────────
interface FunctionCardProps {
  fn: AdminFunction;
  contractAddress: string;
  abiKey: string;
}

function FunctionCard({ fn, contractAddress, abiKey }: FunctionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [paramErrors, setParamErrors] = useState<Record<string, string>>({});
  const [txError, setTxError] = useState('');

  const { writeContract, data: txHash, isPending, isError, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const abi = (ADMIN_ABIS[abiKey] ?? []) as readonly unknown[];

  const execute = () => {
    setTxError('');
    // Validate all params
    const errors: Record<string, string> = {};
    for (const p of fn.params) {
      const err = validateParam(values[p.name] ?? '', p.type);
      if (err) errors[p.name] = err;
    }
    if (Object.keys(errors).length > 0) {
      setParamErrors(errors);
      return;
    }
    setParamErrors({});

    try {
      const args = fn.params.map(p => coerceParam(values[p.name] ?? '', p.type));
      writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: fn.abiName,
        args,
      });
    } catch (e) {
      setTxError(e instanceof Error ? e.message : 'Failed to build transaction');
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <div className={`rounded-xl border transition-all ${
      fn.danger
        ? 'border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.04)]'
        : 'border-[rgba(139,92,246,0.18)] bg-[rgba(139,92,246,0.04)]'
    }`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left group"
      >
        <div className="flex items-center gap-2 min-w-0">
          {fn.danger && (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-400" />
          )}
          <span className={`text-sm font-semibold truncate ${fn.danger ? 'text-red-300' : 'text-white'}`}>
            {fn.label}
          </span>
          {fn.params.length === 0 && (
            <span className="text-[10px] text-slate-500 border border-slate-700 rounded px-1 py-0.5 flex-shrink-0">
              no args
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-slate-400">{fn.description}</p>

              {/* Params */}
              {fn.params.map(p => (
                <div key={p.name}>
                  <label className="block text-xs text-slate-400 mb-1">
                    <span className="font-mono text-slate-300">{p.name}</span>
                    <span className="ml-1 text-slate-500">({p.type})</span>
                    {p.hint && <span className="ml-2 text-slate-600 italic">{p.hint}</span>}
                  </label>
                  <input
                    type="text"
                    value={values[p.name] ?? ''}
                    onChange={e => {
                      setValues(v => ({ ...v, [p.name]: e.target.value }));
                      setParamErrors(v => ({ ...v, [p.name]: '' }));
                    }}
                    placeholder={p.placeholder}
                    className={`w-full px-3 py-1.5 text-sm bg-[#0a0a0a]/60 border rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-1 ${
                      paramErrors[p.name]
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[rgba(139,92,246,0.25)] focus:ring-[#8b5cf6]'
                    }`}
                  />
                  {paramErrors[p.name] && (
                    <p className="text-xs text-red-400 mt-0.5">{paramErrors[p.name]}</p>
                  )}
                </div>
              ))}

              {/* TX status */}
              {(txError || isError) && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  {txError || (error as Error)?.message?.slice(0, 120)}
                </p>
              )}
              {isConfirmed && txHash && (
                <a
                  href={`https://polygonscan.com/tx/${txHash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                >
                  ✓ Confirmed — View on Polygonscan ↗
                </a>
              )}
              {isConfirming && (
                <p className="text-xs text-amber-400 animate-pulse">Waiting for confirmation...</p>
              )}

              {/* Execute button */}
              <button
                onClick={execute}
                disabled={isLoading}
                className={`w-full py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  fn.danger
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 hover:border-red-500/50 disabled:opacity-40'
                    : 'bg-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.3)] text-[#8b5cf6] border border-[rgba(139,92,246,0.3)] hover:border-[rgba(139,92,246,0.5)] disabled:opacity-40'
                }`}
              >
                {isLoading && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                )}
                {isLoading ? 'Sending...' : fn.params.length === 0 ? 'Execute' : 'Send Transaction'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// 5. Main export: ContractAdminPanel
// ─────────────────────────────────────────────
interface ContractAdminPanelProps {
  contractName: string;
  contractAddress: string;
}

export default function ContractAdminPanel({ contractName, contractAddress }: ContractAdminPanelProps) {
  const abiKey = CONTRACT_NAME_TO_ABI_KEY[contractName];
  const functions = abiKey ? CONTRACT_ADMIN_FUNCTIONS[abiKey] : undefined;

  // Debug: log which ABI is being used
  if (abiKey && ADMIN_ABIS[abiKey]) {
    const fnNames = (ADMIN_ABIS[abiKey] as Array<{type:string;name?:string}>)
      .filter(e => e.type === 'function').map(e => e.name);
    console.debug(`[ContractAdminPanel] ${contractName} ABI has ${fnNames.length} functions:`, fnNames);
  }

  const [filter, setFilter] = useState<'all' | 'danger' | 'config'>('all');

  if (!functions || functions.length === 0) {
    return (
      <div className="mt-4 p-4 border border-[rgba(139,92,246,0.15)] rounded-xl bg-[rgba(139,92,246,0.03)]">
        <p className="text-sm text-slate-500 text-center">No admin functions mapped for this contract.</p>
      </div>
    );
  }

  const filtered = functions.filter(f => {
    if (filter === 'danger') return f.danger;
    if (filter === 'config') return !f.danger;
    return true;
  });

  const dangerCount = functions.filter(f => f.danger).length;
  const configCount = functions.filter(f => !f.danger).length;

  return (
    <div className="mt-4 space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Admin Functions
        </h5>
        {/* Filter pills */}
        <div className="flex items-center gap-1 text-xs">
          {(['all', 'config', 'danger'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full border transition-all capitalize ${
                filter === f
                  ? f === 'danger'
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-[rgba(139,92,246,0.2)] text-[#8b5cf6] border-[rgba(139,92,246,0.4)]'
                  : 'text-slate-500 border-slate-700 hover:border-slate-600 hover:text-slate-400'
              }`}
            >
              {f === 'all' ? `All (${functions.length})` : f === 'danger' ? `Danger (${dangerCount})` : `Config (${configCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Function cards */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {filtered.map(fn => (
          <FunctionCard
            key={fn.abiName}
            fn={fn}
            contractAddress={contractAddress}
            abiKey={abiKey}
          />
        ))}
      </div>
    </div>
  );
}
