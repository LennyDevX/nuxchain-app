/**
 * Contract Dropdown - Dropdown component for contract addresses
 * Shows all available contracts with copy functionality
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Contract {
  name: string;
  address: string;
  category: string;
  receivesFunds?: boolean;
}

const CONTRACTS: Contract[] = [
  // Staking Core & Modules - Reciben fondos
  { name: 'Enhanced SmartStaking', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS || '', category: 'Staking', receivesFunds: true },
  { name: 'Staking Rewards', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_REWARDS_ADDRESS || '', category: 'Staking', receivesFunds: true },
  { name: 'Staking Skills', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_SKILLS_ADDRESS || '', category: 'Staking', receivesFunds: true },
  { name: 'Staking Gamification', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_GAMIFICATION_ADDRESS || '', category: 'Staking', receivesFunds: true },
  { name: 'Staking Viewer', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS || '', category: 'Staking' },
  { name: 'Staking View Stats', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWSTATS_ADDRESS || '', category: 'Staking' },
  { name: 'Staking View Skills', address: import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWSKILLS_ADDRESS || '', category: 'Staking' },
  { name: 'Dynamic APY Calculator', address: import.meta.env.VITE_DYNAMIC_APY_CALCULATOR_ADDRESS || '', category: 'Staking' },

  // Marketplace Core & Modules - Reciben fondos
  { name: 'Gameified Marketplace', address: import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY || '', category: 'Marketplace', receivesFunds: true },
  { name: 'Marketplace Leveling', address: import.meta.env.VITE_LEVELING_SYSTEM || '', category: 'Marketplace' },
  { name: 'Marketplace Referral', address: import.meta.env.VITE_REFERRAL_SYSTEM || '', category: 'Marketplace' },
  { name: 'Marketplace Skills', address: import.meta.env.VITE_GAMEIFIED_MARKETPLACE_SKILLS || '', category: 'Marketplace' },
  { name: 'Individual Skills', address: import.meta.env.VITE_INDIVIDUAL_SKILLS || '', category: 'Marketplace' },
  { name: 'Marketplace Quests', address: import.meta.env.VITE_GAMEIFIED_MARKETPLACE_QUESTS || '', category: 'Marketplace' },
  { name: 'Collaborator Badges', address: import.meta.env.VITE_COLLABORATOR_BADGE_REWARDS_ADDRESS || '', category: 'Marketplace', receivesFunds: true },
  { name: 'Marketplace View', address: import.meta.env.VITE_MARKETPLACE_VIEW || '', category: 'Marketplace' },
  { name: 'Marketplace Statistics', address: import.meta.env.VITE_MARKETPLACE_STATISTICS || '', category: 'Marketplace' },
  { name: 'Marketplace Social', address: import.meta.env.VITE_MARKETPLACE_SOCIAL || '', category: 'Marketplace' },

  // Treasury - Recibe fondos
  { name: 'Treasury Manager', address: import.meta.env.VITE_TREASURY_MANAGER_ADDRESS || '', category: 'Treasury', receivesFunds: true },
  { name: 'Treasury', address: import.meta.env.VITE_TREASURY_ADDRESS || '', category: 'Treasury', receivesFunds: true },

  // Deployer
  { name: 'Deployer', address: import.meta.env.VITE_DEPLOYER_ADDRESS || '', category: 'System' },
];

export default function ContractDropdown({ onContractSelect }: { onContractSelect?: (address: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const openPolygonscan = (address: string) => {
    window.open(`https://polygonscan.com/address/${address}`, '_blank');
  };

  const groupedContracts = CONTRACTS.reduce((acc, contract) => {
    if (!acc[contract.category]) {
      acc[contract.category] = [];
    }
    acc[contract.category].push(contract);
    return acc;
  }, {} as Record<string, Contract[]>);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(139,92,246,0.1)] hover:bg-[rgba(139,92,246,0.2)] text-[#8b5cf6] rounded-lg text-sm font-medium border border-[rgba(139,92,246,0.3)] transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <span>Contracts</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-80 bg-[#0a0a0a]/95 backdrop-blur-xl border border-[rgba(139,92,246,0.3)] rounded-xl shadow-2xl z-[9999] max-h-96 overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              {Object.entries(groupedContracts).map(([category, contracts]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wider mb-2">
                    {category}
                  </h4>
                  <div className="space-y-1">
                    {contracts.map((contract) => (
                      <div
                        key={contract.address}
                        className={`flex items-center justify-between p-2 rounded-lg hover:bg-[rgba(139,92,246,0.1)] transition-colors group ${
                          contract.receivesFunds ? 'bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)]' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">
                              {contract.name}
                            </p>
                            {contract.receivesFunds && (
                              <span className="px-1.5 py-0.5 bg-[rgba(16,185,129,0.2)] text-[#10b981] text-xs rounded-full">
                                Funds
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-mono truncate">
                            {contract.address.slice(0, 4)}...{contract.address.slice(-4)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => openPolygonscan(contract.address)}
                            className="p-1.5 rounded hover:bg-[rgba(139,92,246,0.2)] transition-colors"
                            title="View on Polygonscan"
                          >
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-[#8b5cf6] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                          {onContractSelect && (
                            <button
                              onClick={() => {
                                onContractSelect(contract.address);
                                setIsOpen(false);
                              }}
                              className="p-1.5 rounded hover:bg-[rgba(139,92,246,0.2)] transition-colors"
                              title="Use in Contract Manager"
                            >
                              <svg className="w-4 h-4 text-slate-400 group-hover:text-[#8b5cf6] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
