/**
 * Contract Modal - Modal component for contract addresses
 * Shows all available contracts with copy functionality
 */

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

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContractSelect?: (address: string) => void;
}

export default function ContractModal({ isOpen, onClose }: ContractModalProps) {
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[99998] flex items-center justify-center p-4"
          >
            {/* Modal content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a]/95 backdrop-blur-xl border border-[rgba(139,92,246,0.3)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[rgba(139,92,246,0.2)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[rgba(139,92,246,0.2)] rounded-xl flex items-center justify-center border border-[rgba(139,92,246,0.3)]">
                    <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Contract Manager</h2>
                    <p className="text-sm text-slate-400">All protocol contracts</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg bg-[rgba(239,68,68,0.1)] hover:bg-[rgba(239,68,68,0.2)] text-[#ef4444] transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-6 space-y-6">
                {Object.entries(groupedContracts).map(([category, contracts]) => (
                  <div key={category}>
                    <h4 className="text-sm font-bold text-[#8b5cf6] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#8b5cf6] rounded-full"></div>
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {contracts.map((contract) => (
                        <div
                          key={contract.address}
                          className={`p-4 rounded-xl hover:bg-[rgba(139,92,246,0.1)] transition-all group border ${
                            contract.receivesFunds 
                              ? 'bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)]' 
                              : 'border-[rgba(139,92,246,0.15)]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-sm font-semibold text-white truncate">
                                  {contract.name}
                                </p>
                                {contract.receivesFunds && (
                                  <span className="px-2 py-0.5 bg-[rgba(16,185,129,0.2)] text-[#10b981] text-xs rounded-full font-medium">
                                    Funds
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 font-mono break-all">
                                {contract.address ? `${contract.address.substring(0, 10)}...${contract.address.substring(contract.address.length - 8)}` : 'Not configured'}
                              </p>
                            </div>
                            <button
                              onClick={() => openPolygonscan(contract.address)}
                              disabled={!contract.address}
                              className="flex-shrink-0 p-2 rounded-lg bg-[rgba(139,92,246,0.1)] hover:bg-[rgba(139,92,246,0.2)] text-[#8b5cf6] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title="View on PolygonScan"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
