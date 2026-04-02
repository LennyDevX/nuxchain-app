import type { Abi } from 'viem';

import {
  CollaboratorBadgeRewards,
  DynamicAPYCalculator,
  Gamification,
  LevelingSystem,
  MarketplaceCore,
  NuxPowerMarketplace,
  NuxPowerMarketplaceImpl,
  NuxPowerNft,
  QuestCore,
  ReferralSystem,
  SmartStakingCore,
  SmartStakingRewards,
  SmartStakingSkills,
  SmartStakingView,
  SmartStakingViewStats,
  TreasuryManager,
} from './index';

type LegacyAbiArtifact = {
  readonly abi: Abi;
};

const wrapLegacyAbi = (abi: readonly unknown[]): LegacyAbiArtifact => ({
  abi: abi as Abi,
});

const Airdrop = [
  {
    inputs: [{ internalType: 'address', name: 'userAddress', type: 'address' }],
    name: 'isRegistered',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'userAddress', type: 'address' }],
    name: 'hasClaimed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'registeredUserCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimedUserCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'registrationEndTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimStartTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimEndTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getContractBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'amountPerUser',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const AirdropFactory = [
  {
    inputs: [
      { internalType: 'uint256', name: 'offset', type: 'uint256' },
      { internalType: 'uint256', name: 'limit', type: 'uint256' },
    ],
    name: 'getActiveAirdrops',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
    name: 'getAirdropInfo',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'airdropContract', type: 'address' },
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'uint256', name: 'deploymentTime', type: 'uint256' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
          { internalType: 'string', name: 'name', type: 'string' },
        ],
        internalType: 'struct AirdropFactory.AirdropInfo',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTotalAirdrops',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'registrationDuration', type: 'uint256' },
      { internalType: 'uint256', name: 'claimDelay', type: 'uint256' },
      { internalType: 'uint256', name: 'claimDuration', type: 'uint256' },
      { internalType: 'string', name: 'name', type: 'string' },
    ],
    name: 'deployAirdrop',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
    name: 'deactivateAirdrop',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const EnhancedSmartStakingCoreV2ABI = wrapLegacyAbi(SmartStakingCore);
export const EnhancedSmartStakingRewardsABI = wrapLegacyAbi(SmartStakingRewards);
export const EnhancedSmartStakingGamificationABI = wrapLegacyAbi(Gamification);
export const EnhancedSmartStakingSkillsABI = wrapLegacyAbi(SmartStakingSkills);
export const EnhancedSmartStakingViewABI = wrapLegacyAbi(SmartStakingView);
export const EnhancedSmartStakingViewStatsABI = wrapLegacyAbi(SmartStakingViewStats);
export const DynamicAPYCalculatorABI = wrapLegacyAbi(DynamicAPYCalculator);
export const CollaboratorBadgeRewardsABI = wrapLegacyAbi(CollaboratorBadgeRewards);
export const GameifiedMarketplaceCoreV1ABI = wrapLegacyAbi(MarketplaceCore);
export const GameifiedMarketplaceQuestsABI = wrapLegacyAbi(QuestCore);
export const GameifiedMarketplaceSkillsNftABI = wrapLegacyAbi(NuxPowerNft);
export const TreasuryManagerABI = wrapLegacyAbi(TreasuryManager);
export const LevelingSystemABI = wrapLegacyAbi(LevelingSystem);
export const ReferralSystemABI = wrapLegacyAbi(ReferralSystem);
export const IndividualSkillsMarketplaceABI = wrapLegacyAbi(NuxPowerMarketplace);
export const IndividualSkillsMarketplaceImplABI = wrapLegacyAbi(NuxPowerMarketplaceImpl);
export const AirdropABI = wrapLegacyAbi(Airdrop);
export const AirdropFactoryABI = wrapLegacyAbi(AirdropFactory);