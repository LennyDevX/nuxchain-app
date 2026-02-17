/**
 * Contract Manager Tool
 * Dynamic contract management with auto-detection of contract type
 * Paste address → Auto-detect type → Show available tools
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContractModal from './ContractModal';

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
  balance?: string;
  receivesFunds?: boolean;
}

export default function ContractManager() {
  const [contractAddress, setContractAddress] = useState('');
  const [detectedContract, setDetectedContract] = useState<ContractInfo | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

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

      // Try to read contract balance
      let balance: string | undefined;
      try {
        const response = await fetch(`https://polygon.llamarpc.com`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [addr, 'latest'],
            id: 1,
          }),
        });
        
        const data = await response.json();
        if (data.result) {
          const balanceBigInt = BigInt(data.result);
          balance = (Number(balanceBigInt) / 1e18).toFixed(4);
        }
      } catch (e) {
        console.warn('Failed to fetch contract balance:', e);
      }

      const contractInfo: ContractInfo = {
        address: addr,
        type,
        name,
        category,
        receivesFunds,
        balance,
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
            className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(139,92,246,0.1)] hover:bg-[rgba(139,92,246,0.2)] text-[#8b5cf6] rounded-lg text-sm font-medium border border-[rgba(139,92,246,0.3)] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
            className="p-4 bg-[#0a0a0a]/30 border border-[rgba(139,92,246,0.2)] rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>{detectedContract.name}</span>
                {detectedContract.receivesFunds && (
                  <span className="px-2 py-1 bg-[rgba(16,185,129,0.2)] text-[#10b981] text-xs rounded-full border border-[rgba(16,185,129,0.3)]">
                    Receives Funds
                  </span>
                )}
              </h4>
              <span className={`px-2 py-1 text-xs rounded-full border ${
                detectedContract.type === 'staking' ? 'bg-[rgba(139,92,246,0.2)] text-[#8b5cf6] border-[rgba(139,92,246,0.3)]' :
                detectedContract.type === 'marketplace' ? 'bg-[rgba(59,130,246,0.2)] text-[#3b82f6] border-[rgba(59,130,246,0.3)]' :
                detectedContract.type === 'treasury' ? 'bg-[rgba(16,185,129,0.2)] text-[#10b981] border-[rgba(16,185,129,0.3)]' :
                detectedContract.type === 'system' ? 'bg-[rgba(239,68,68,0.2)] text-[#ef4444] border-[rgba(239,68,68,0.3)]' :
                'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {detectedContract.type.charAt(0).toUpperCase() + detectedContract.type.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 mb-1">Address</p>
                <p className="text-white font-mono">
                  {detectedContract.address.slice(0, 10)}...{detectedContract.address.slice(-8)}
                </p>
              </div>
              
              <div>
                <p className="text-slate-400 mb-1">Category</p>
                <p className="text-white capitalize">{detectedContract.category}</p>
              </div>

              {detectedContract.balance !== undefined && (
                <div>
                  <p className="text-slate-400 mb-1">Balance</p>
                  <p className="text-white font-semibold">
                    {parseFloat(detectedContract.balance).toFixed(4)} MATIC
                  </p>
                </div>
              )}

              <div>
                <p className="text-slate-400 mb-1">Status</p>
                <p className="text-[#10b981] font-medium">Active</p>
              </div>
            </div>

            {detectedContract.receivesFunds && detectedContract.balance && parseFloat(detectedContract.balance) > 0 && (
              <div className="mt-4 p-3 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] rounded-lg">
                <p className="text-[#10b981] text-sm font-medium">
                  💰 This contract holds {parseFloat(detectedContract.balance).toFixed(4)} MATIC
                </p>
              </div>
            )}
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
