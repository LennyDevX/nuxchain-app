/**
 * CollaboratorHelpModal - Comprehensive help modal for the Collaborator Portal
 * Uses React Portal to render outside component DOM
 * Optimized for mobile and desktop with proper scroll handling
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

interface CollaboratorHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Section component for the modal content
const Section: React.FC<{ title: string; children: React.ReactNode; isMobile: boolean }> = ({ title, children, isMobile }) => (
  <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
    <h3 className={`jersey-15-regular font-black text-white uppercase tracking-wide ${isMobile ? 'text-sm mb-3' : 'text-lg mb-4'} border-l-4 border-purple-500 pl-3`}>
      {title}
    </h3>
    {children}
  </div>
);

// Info card component
const InfoCard: React.FC<{ 
  icon: string; 
  title: string; 
  description: string; 
  isMobile: boolean;
  variant?: 'purple' | 'green' | 'blue' | 'orange' | 'pink';
}> = ({ icon, title, description, isMobile, variant = 'purple' }) => {
  const colorClasses = {
    purple: 'from-purple-500/10 border-purple-500/20',
    green: 'from-green-500/10 border-green-500/20',
    blue: 'from-blue-500/10 border-blue-500/20',
    orange: 'from-orange-500/10 border-orange-500/20',
    pink: 'from-pink-500/10 border-pink-500/20',
  };

  return (
    <div className={`p-4 bg-gradient-to-br ${colorClasses[variant]} border rounded-xl ${isMobile ? 'mb-3' : 'mb-4'}`}>
      <div className="flex items-start gap-3">
        <span className={`${isMobile ? 'text-2xl' : 'text-3xl'}`}>{icon}</span>
        <div>
          <h4 className={`jersey-15-regular font-bold text-white ${isMobile ? 'text-sm mb-1' : 'text-base mb-1'}`}>{title}</h4>
          <p className={`jersey-20-regular text-gray-400 ${isMobile ? 'text-xs leading-relaxed' : 'text-sm leading-relaxed'}`}>{description}</p>
        </div>
      </div>
    </div>
  );
};

// Step component for numbered steps
const Step: React.FC<{ 
  number: number; 
  title: string; 
  description: string; 
  isMobile: boolean;
}> = ({ number, title, description, isMobile }) => (
  <div className="flex gap-3 mb-4">
    <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white ${isMobile ? 'text-sm' : 'text-base'}`}>
      {number}
    </div>
    <div className="flex-1">
      <h4 className={`jersey-15-regular font-bold text-white ${isMobile ? 'text-sm mb-1' : 'text-base mb-1'}`}>{title}</h4>
      <p className={`text-gray-400 ${isMobile ? 'text-xs leading-relaxed' : 'text-sm leading-relaxed'}`}>{description}</p>
    </div>
  </div>
);

export function CollaboratorHelpModal({ isOpen, onClose }: CollaboratorHelpModalProps) {
  return createPortal(
    <ModalContent isOpen={isOpen} onClose={onClose} />,
    document.body
  );
}

// Internal component that renders the actual modal content
function ModalContent({ isOpen, onClose }: CollaboratorHelpModalProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('overview');

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'claiming', label: 'Claiming Rewards' },
    { id: 'fees', label: 'Fees & Tiers' },
    { id: 'quests', label: 'Quests' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <Section title="What is the Collaborator Portal?" isMobile={isMobile}>
              <p className={`text-gray-300 ${isMobile ? 'text-xs leading-relaxed mb-4' : 'text-sm leading-relaxed mb-6'}`}>
                The Collaborator Portal is an exclusive rewards system for badge holders in the NuxChain ecosystem. 
                As a collaborator, you earn passive income from the protocol&apos;s revenue and can complete quests for additional rewards.
              </p>
              
              <InfoCard
                icon="💰"
                title="Revenue Sharing"
                description="The contract receives 16% of ALL protocol revenue (after 20% reserve) via TreasuryManager distribution. This creates a sustainable reward pool funded by ecosystem activity."
                variant="green"
                isMobile={isMobile}
              />
              
              <InfoCard
                icon="🎯"
                title="Quest Rewards"
                description="Complete active quests to earn additional POL rewards. Quests have specific durations, requirements, and reward amounts set by quest admins."
                variant="purple"
                isMobile={isMobile}
              />
              
              <InfoCard
                icon="🏆"
                title="Badge Holder Benefits"
                description="Only verified badge holders can participate. Your contribution volume tracks your engagement and unlocks lower fee tiers when claiming rewards."
                variant="blue"
                isMobile={isMobile}
              />
            </Section>

            <Section title="Key Features" isMobile={isMobile}>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-purple-400 font-bold text-sm mb-1">Automatic Distributions</div>
                  <p className="text-gray-400 text-xs">Revenue flows automatically from NFT sales and treasury</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-green-400 font-bold text-sm mb-1">Tiered Fee System</div>
                  <p className="text-gray-400 text-xs">Lower fees (down to 1%) based on your contribution volume</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-blue-400 font-bold text-sm mb-1">Real-time Tracking</div>
                  <p className="text-gray-400 text-xs">Monitor your rewards, volume, and quest progress live</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-orange-400 font-bold text-sm mb-1">Secure Claims</div>
                  <p className="text-gray-400 text-xs">Non-reentrant, audited smart contract with emergency features</p>
                </div>
              </div>
            </Section>
          </div>
        );

      case 'how-it-works':
        return (
          <div>
            <Section title="Revenue Flow" isMobile={isMobile}>
              <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
                <Step
                  number={1}
                  title="Protocol Revenue Generated"
                  description="Every NFT sale in the marketplace generates a 6% platform fee. Other protocol activities also contribute to the revenue pool."
                  isMobile={isMobile}
                />
                <Step
                  number={2}
                  title="Treasury Distribution"
                  description="20% of revenue goes to the reserve fund. Of the remaining 80%, 16% is allocated to the CollaboratorBadgeRewards contract."
                  isMobile={isMobile}
                />
                <Step
                  number={3}
                  title="Reward Pool Growth"
                  description="The contract balance grows from both treasury allocations and direct NFT sale commissions via the receive() function."
                  isMobile={isMobile}
                />
                <Step
                  number={4}
                  title="Badge Holder Claims"
                  description="Eligible badge holders can claim their share of rewards based on quest completions and passive distributions."
                  isMobile={isMobile}
                />
              </div>
            </Section>

            <Section title="Contract Security" isMobile={isMobile}>
              <InfoCard
                icon="🛡️"
                title="Safety Features"
                description="The contract includes maximum reward limits (500 POL per quest), balance caps (10,000 POL), and pending reward limits per user (1,000 POL) to prevent abuse."
                variant="orange"
                isMobile={isMobile}
              />
              
              <InfoCard
                icon="🔒"
                title="Reentrancy Protection"
                description="All withdrawal functions use OpenZeppelin's ReentrancyGuard to prevent reentrancy attacks. Emergency withdrawal is available to the contract owner if needed."
                variant="purple"
                isMobile={isMobile}
              />
            </Section>
          </div>
        );

      case 'claiming':
        return (
          <div>
            <Section title="How to Claim Rewards" isMobile={isMobile}>
              <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
                <Step
                  number={1}
                  title="Check Your Balance"
                  description="View your 'Pending' rewards in the dashboard. This shows your total claimable amount from all completed quests."
                  isMobile={isMobile}
                />
                <Step
                  number={2}
                  title="Review Net Amount"
                  description="The dashboard automatically calculates your net reward after deducting the claim fee (default 2%, lower with tiers)."
                  isMobile={isMobile}
                />
                <Step
                  number={3}
                  title="Click Claim"
                  description="Press the 'Claim Rewards' button. This will initiate a blockchain transaction to transfer your rewards to your wallet."
                  isMobile={isMobile}
                />
                <Step
                  number={4}
                  title="Confirm Transaction"
                  description="Approve the transaction in your wallet. Gas fees apply. Once confirmed, rewards are sent directly to your wallet."
                  isMobile={isMobile}
                />
              </div>
            </Section>

            <Section title="Important Details" isMobile={isMobile}>
              <InfoCard
                icon="⚠️"
                title="Claim Requirements"
                description="You must have a positive pending reward balance. The contract must have sufficient balance to pay you. If funds are low, the contract will attempt to request emergency funds from the TreasuryManager."
                variant="orange"
                isMobile={isMobile}
              />
              
              <InfoCard
                icon="💸"
                title="Fee Breakdown"
                description="When you claim, a fee is deducted and sent to the TreasuryManager. This fee funds ongoing ecosystem development and maintains the reward pool sustainability."
                variant="green"
                isMobile={isMobile}
              />
              
              <InfoCard
                icon="🔄"
                title="Auto-Refresh"
                description="After claiming, your dashboard will automatically refresh to show your updated balance. You can also manually refresh using the 'Refresh Data' button."
                variant="blue"
                isMobile={isMobile}
              />
            </Section>
          </div>
        );

      case 'fees':
        return (
          <div>
            <Section title="Fee Structure" isMobile={isMobile}>
              <p className={`jersey-20-regular text-gray-300 ${isMobile ? 'text-xs leading-relaxed mb-4' : 'text-sm leading-relaxed mb-6'}`}>
                A claim fee is applied when you withdraw your rewards. This fee decreases as your contribution volume increases, 
                incentivizing long-term participation in the ecosystem.
              </p>

              <div className={`${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl mb-6`}>
                <h4 className={`jersey-15-regular text-white ${isMobile ? 'text-sm mb-4' : 'text-base mb-6'} text-center`}>Commission Tiers</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <span className="jersey-20-regular text-gray-300 text-sm">0 - 10 POL Volume</span>
                    </div>
                    <span className="jersey-20-regular text-red-400">2.00% Fee</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="jersey-20-regular text-gray-300 text-sm">10+ POL Volume</span>
                    </div>
                    <span className="jersey-20-regular text-yellow-400">1.50% Fee</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="jersey-20-regular text-gray-300 text-sm">50+ POL Volume</span>
                    </div>
                    <span className="jersey-20-regular text-green-400">1.00% Fee</span>
                  </div>
                </div>
              </div>

              <InfoCard
                icon="📊"
                title="Tracking Your Volume"
                description="Your contribution volume increases every time you complete a quest. The dashboard shows your lifetime volume in the 'Your Volume' card. This volume determines your fee tier."
                variant="blue"
                isMobile={isMobile}
              />

              <InfoCard
                icon="💡"
                title="Fee Optimization Tip"
                description="Higher volume = Lower fees! Completing more quests not only earns you rewards but also reduces your future claim fees. The fee difference can be significant for frequent claimers."
                variant="green"
                isMobile={isMobile}
              />
            </Section>
          </div>
        );

      case 'quests':
        return (
          <div>
            <Section title="Understanding Quests" isMobile={isMobile}>
              <p className={`text-gray-300 ${isMobile ? 'text-xs leading-relaxed mb-4' : 'text-sm leading-relaxed mb-6'}`}>
                Quests are tasks or achievements that badge holders can complete to earn POL rewards. 
                Each quest has specific requirements, a time window, and a reward amount.
              </p>

              <InfoCard
                icon="⏰"
                title="Quest Duration"
                description="Quests have start and end timestamps. You can only complete a quest within its active window. Maximum quest duration is 365 days. Quests can be deactivated by admins if needed."
                variant="purple"
                isMobile={isMobile}
              />

              <InfoCard
                icon="🎁"
                title="Reward Amounts"
                description="Each quest specifies a reward amount in POL. The maximum reward per quest is capped at 500 POL for security. Rewards are paid from the contract's balance."
                variant="green"
                isMobile={isMobile}
              />

              <InfoCard
                icon="👥"
                title="Completion Limits"
                description="Quests can have unlimited completions or a specific maximum. Once the max is reached, no more users can complete it. Each user can only complete a quest once."
                variant="blue"
                isMobile={isMobile}
              />
            </Section>

            <Section title="How Quests Are Completed" isMobile={isMobile}>
              <div className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
                <Step
                  number={1}
                  title="Quest Created"
                  description="Quest admins create quests with descriptions, rewards, durations, and completion limits."
                  isMobile={isMobile}
                />
                <Step
                  number={2}
                  title="User Performs Action"
                  description="You complete the required task off-chain (e.g., create an NFT, make a trade, participate in an event)."
                  isMobile={isMobile}
                />
                <Step
                  number={3}
                  title="Admin Validates"
                  description="Quest admins verify your completion and mark it in the contract using completeQuestForUser() or batchCompleteQuest()."
                  isMobile={isMobile}
                />
                <Step
                  number={4}
                  title="Reward Credited"
                  description="Once validated, the reward amount is added to your pending rewards balance. You can then claim it."
                  isMobile={isMobile}
                />
              </div>
            </Section>

            <Section title="Active Quests Display" isMobile={isMobile}>
              <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} mb-4`}>
                The dashboard shows all currently active quests with:
              </p>
              <ul className={`${isMobile ? 'space-y-2 text-xs' : 'space-y-3 text-sm'} text-gray-300 list-disc list-inside`}>
                <li>Quest description and requirements</li>
                <li>Reward amount in POL</li>
                <li>Duration (start and end dates)</li>
                <li>Completion count vs. maximum</li>
                <li>Active status indicator</li>
              </ul>
            </Section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - full viewport coverage with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Modal Container - centered */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden ${
                isMobile ? 'max-w-full h-[85vh]' : 'max-w-3xl max-h-[80vh]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-white/5 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                      <span className="text-xl">📖</span>
                    </div>
                    <div>
                      <h2 className={`jersey-15-regular text-white uppercase tracking-tight ${isMobile ? 'text-lg' : 'text-xl'}`}>
                        Collaborator Guide
                      </h2>
                      <p className={`jersey-20-regular text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        Everything you need to know
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content Area - use flex-1 to fill remaining height */}
                <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} flex-1 min-h-0 overflow-hidden`}>
                  {/* Sidebar Navigation */}
                  <div className={`${isMobile ? 'p-3 border-b border-white/10 overflow-x-auto flex-shrink-0' : 'w-64 p-4 border-r border-white/10 overflow-y-auto flex-shrink-0'} bg-white/5`}>
                    {isMobile ? (
                      // Mobile: Horizontal scroll tabs
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {tabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold uppercase tracking-wide text-xs transition-all whitespace-nowrap ${
                              activeTab === tab.id
                                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white'
                                : 'bg-white/5 border border-white/10 text-gray-400'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      // Desktop: Vertical sidebar
                      <div className="space-y-2">
                        {tabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-4 py-3 rounded-xl font-bold uppercase tracking-wide text-sm transition-all ${
                              activeTab === tab.id
                                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white'
                                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{tab.label}</span>
                              {activeTab === tab.id && (
                                <span className="text-purple-400">→</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className={`flex-1 overflow-y-auto min-h-0 ${isMobile ? 'p-4' : 'p-8'}`}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {renderContent()}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-white/5 flex-shrink-0">
                  <div className="flex justify-center">
                    <p className="text-gray-500 text-xs">
                      Press ESC or click outside to close
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    );
  };

export default CollaboratorHelpModal;
