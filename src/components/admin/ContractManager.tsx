/**
 * Contract Manager Tool
 * Dynamic contract management with auto-detection of contract type
 * Paste address → Auto-detect type → Show available tools
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReadContract } from 'wagmi';
import ContractModal from './ContractModal';
import ContractAdminPanel from './ContractAdminPanel';

// Minimal paused() ABI — works for any OpenZeppelin Pausable contract
const PAUSABLE_ABI = [{
  name: 'paused',
  type: 'function',
  stateMutability: 'view',
  inputs: [],
  outputs: [{ name: '', type: 'bool' }],
}] as const;

// Contracts that support paused()
const PAUSABLE_CONTRACTS = new Set([
  'Enhanced SmartStaking',
  'Staking Rewards',
  'Staking Skills',
  'Staking Gamification',
  'Dynamic APY Calculator',
  'Gameified Marketplace',
  'Marketplace Quests',
  'Marketplace Skills',
  'Collaborator Badges',
]);

// Contract Types
export type ContractType = 'staking' | 'marketplace' | 'treasury' | 'system' | 'unknown';

interface Contract {
  name: string;
  address: string;
  category: string;
  receivesFunds?: boolean;
}

const KNOWN_CONTRACTS: Contract[] = [
  // Staking Core & Modules
  { name: 'Enhanced SmartStaking', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS || '', category: 'staking', receivesFunds: true },
  { name: 'Staking Rewards', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_REWARDS_ADDRESS || '', category: 'staking', receivesFunds: true },
  { name: 'Staking Skills', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_SKILLS_ADDRESS || '', category: 'staking', receivesFunds: true },
  { name: 'Staking Gamification', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_GAMIFICATION_ADDRESS || '', category: 'staking', receivesFunds: true },
  { name: 'Staking Viewer', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS || '', category: 'staking' },
  { name: 'Staking View Stats', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWSTATS_ADDRESS || '', category: 'staking' },
  { name: 'Staking View Skills', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWSKILLS_ADDRESS || '', category: 'staking' },
  { name: 'Dynamic APY Calculator', address: import.meta.env.VITE_DYNAMIC_APY_CALCULATOR_ADDRESS || '', category: 'staking' },

  // Marketplace Core & Modules
  { name: 'Gameified Marketplace', address: import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY || '', category: 'marketplace', receivesFunds: true },
  { name: 'Marketplace Leveling', address: import.meta.env.VITE_LEVELING_SYSTEM || '', category: 'marketplace' },
  { name: 'Marketplace Referral', address: import.meta.env.VITE_REFERRAL_SYSTEM || '', category: 'marketplace' },
  { name: 'Marketplace Skills', address: import.meta.env.VITE_GAMEIFIED_MARKETPLACE_SKILLS || '', category: 'marketplace' },
  { name: 'Individual Skills', address: import.meta.env.VITE_INDIVIDUAL_SKILLS || '', category: 'marketplace' },
  { name: 'Marketplace Quests', address: import.meta.env.VITE_GAMEIFIED_MARKETPLACE_QUESTS || '', category: 'marketplace' },
  { name: 'Collaborator Badges', address: import.meta.env.VITE_COLLABORATOR_BADGE_REWARDS_ADDRESS || '', category: 'marketplace', receivesFunds: true },
  { name: 'Marketplace View', address: import.meta.env.VITE_MARKETPLACE_VIEW || '', category: 'marketplace' },
  { name: 'Marketplace Statistics', address: import.meta.env.VITE_MARKETPLACE_STATISTICS || '', category: 'marketplace' },
  { name: 'Marketplace Social', address: import.meta.env.VITE_MARKETPLACE_SOCIAL || '', category: 'marketplace' },

  // Treasury
  { name: 'Treasury Manager', address: import.meta.env.VITE_TREASURY_MANAGER_ADDRESS || '', category: 'treasury', receivesFunds: true },
  { name: 'Treasury', address: import.meta.env.VITE_TREASURY_ADDRESS || '', category: 'treasury', receivesFunds: true },

  // System
  { name: 'Deployer', address: import.meta.env.VITE_DEPLOYER_ADDRESS || '', category: 'system' },
];

interface ContractInfo {
  address: string;
  type: ContractType;
  name: string;
  category: string;
  isPaused?: boolean;
  receivesFunds?: boolean;
}

export default function ContractManager() {
  const [contractAddress, setContractAddress] = useState('');
  const [detectedContract, setDetectedContract] = useState<ContractInfo | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const isPausable = detectedContract ? PAUSABLE_CONTRACTS.has(detectedContract.name) : false;

  const { data: pausedData, isLoading: pausedLoading } = useReadContract({
    address: (detectedContract?.address ?? '0x0000000000000000000000000000000000000000') as `0x${string}`,
    abi: PAUSABLE_ABI,
    functionName: 'paused',
    chainId: 137,
    query: { enabled: isPausable && !!detectedContract?.address },
  });

  // Validate and detect contract type
  const detectContractType = async (addr: string) => {
    setError('');
    
    try {
      // Validate address format
      if (!addr.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Invalid contract address format');
      }

      const lowerAddr = addr.toLowerCase();

      // Check known contract addresses
      const knownContract = KNOWN_CONTRACTS.find(
        contract => contract.address.toLowerCase() === lowerAddr
      );

      // Determine contract type and name
      let type: ContractType = 'unknown';
      let name = 'Unknown Contract';
      let category = 'unknown';
      let receivesFunds = false;
      
      if (knownContract) {
        name = knownContract.name;
        category = knownContract.category;
        receivesFunds = knownContract.receivesFunds || false;
        
        // Map category to ContractType
        switch (knownContract.category) {
          case 'staking':
            type = 'staking';
            break;
          case 'marketplace':
            type = 'marketplace';
            break;
          case 'treasury':
            type = 'treasury';
            break;
          case 'system':
            type = 'system';
            break;
        }
      }

      const contractInfo: ContractInfo = {
        address: addr,
        type,
        name,
        category,
        receivesFunds,
      };
      
      setDetectedContract(contractInfo);
      setSuccess(`Successfully detected ${name}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect contract');
      setDetectedContract(null);
    }
  };

  const handleContractSelect = (address: string) => {
    setContractAddress(address);
    setDetectedContract(null);
    setError('');
    // Auto-detect when contract is selected from dropdown
    setTimeout(() => detectContractType(address), 100);
  };

  return (
    <div className="card-unified rounded-xl p-6 border border-[rgba(139,92,246,0.2)]">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Contract Manager</span>
      </h3>

      {/* Address Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Contract Address
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => {
                setContractAddress(e.target.value);
                setDetectedContract(null);
                setError('');
              }}
              placeholder="0x..."
              className="w-full px-4 py-2 bg-[#0a0a0a]/50 border border-[rgba(139,92,246,0.3)] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>
          <button
            onClick={() => setIsContractModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(139,92,246,0.1)] hover:bg-[rgba(139,92,246,0.2)] text-[#8b5cf6] rounded-lg text-sm font-medium border border-[rgba(139,92,246,0.3)] transition-all hover:scale-105"
            title="Select a contract from list"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Contracts</span>
          </button>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-3 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] rounded-lg text-[#8b5cf6] text-sm"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg text-[#ef4444] text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contract Info Display */}
      <AnimatePresence>
        {detectedContract && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-[#0a0a0a]/40 border border-[rgba(139,92,246,0.25)] rounded-xl"
          >
            {/* ── Contract header ── */}
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="text-base font-bold text-white">{detectedContract.name}</h4>
                  {detectedContract.receivesFunds && (
                    <span className="px-2 py-0.5 bg-[rgba(16,185,129,0.15)] text-[#10b981] text-[10px] font-medium rounded-full border border-[rgba(16,185,129,0.3)]">
                      Receives Funds
                    </span>
                  )}
                </div>
                {/* Full address with copy */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 truncate">
                    {detectedContract.address}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(detectedContract.address)}
                    title="Copy address"
                    className="flex-shrink-0 text-slate-600 hover:text-slate-300 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                  <a
                    href={`https://polygonscan.com/address/${detectedContract.address}`}
                    target="_blank" rel="noopener noreferrer"
                    title="View on Polygonscan"
                    className="flex-shrink-0 text-slate-600 hover:text-[#8b5cf6] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </a>
                </div>
              </div>
              <span className={`flex-shrink-0 px-2 py-1 text-xs rounded-full border font-medium ${
                detectedContract.type === 'staking'     ? 'bg-[rgba(139,92,246,0.15)] text-[#8b5cf6] border-[rgba(139,92,246,0.3)]' :
                detectedContract.type === 'marketplace' ? 'bg-[rgba(59,130,246,0.15)] text-[#3b82f6] border-[rgba(59,130,246,0.3)]' :
                detectedContract.type === 'treasury'    ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981] border-[rgba(16,185,129,0.3)]' :
                detectedContract.type === 'system'      ? 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border-[rgba(239,68,68,0.3)]' :
                'bg-slate-500/15 text-slate-400 border-slate-500/30'
              }`}>
                {detectedContract.type.charAt(0).toUpperCase() + detectedContract.type.slice(1)}
              </span>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-3 gap-3 text-xs mb-1">
              <div className="bg-[#0a0a0a]/40 rounded-lg p-2.5 border border-[rgba(255,255,255,0.05)]">
                <p className="text-slate-500 mb-0.5">Category</p>
                <p className="text-white font-medium capitalize">{detectedContract.category}</p>
              </div>
              <div className="bg-[#0a0a0a]/40 rounded-lg p-2.5 border border-[rgba(255,255,255,0.05)]">
                <p className="text-slate-500 mb-0.5">Status</p>
                {!isPausable ? (
                  <p className="text-slate-400 font-medium">N/A</p>
                ) : pausedLoading ? (
                  <p className="text-slate-400 animate-pulse">Checking...</p>
                ) : pausedData === true ? (
                  <p className="text-red-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"/>
                    Paused
                  </p>
                ) : (
                  <p className="text-[#10b981] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block"/>
                    Active
                  </p>
                )}
              </div>
              <div className="bg-[#0a0a0a]/40 rounded-lg p-2.5 border border-[rgba(255,255,255,0.05)]">
                <p className="text-slate-500 mb-0.5">Network</p>
                <p className="text-white font-medium">Polygon</p>
              </div>
            </div>

            {/* ── Admin functions panel ── */}
            <ContractAdminPanel
              contractName={detectedContract.name}
              contractAddress={detectedContract.address}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contract Modal */}
      <ContractModal 
        isOpen={isContractModalOpen} 
        onClose={() => setIsContractModalOpen(false)}
        onContractSelect={handleContractSelect}
      />
    </div>
  );
}
