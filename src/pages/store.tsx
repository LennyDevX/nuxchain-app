import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useBalance } from 'wagmi';
import { toast } from 'react-hot-toast';
import { SKILLS_DATA, SkillCategory } from '../components/skills/config';
import type { SkillData, SkillType } from '../components/skills/config';
import { Rarity } from '../types/contracts';
import { SkillsCatalog } from '../components/store/SkillsCatalog';
import { MySkills } from '../components/store/MySkills';
import GlobalBackground from '../ui/gradientBackground';
import { useSkillsStore } from '../hooks/skills/useSkillsStore';
import { useUserStaking } from '../hooks/staking/useUserStaking';

// Lazy load modal for better performance
const PurchaseSkillModal = lazy(() => import('../components/store/PurchaseSkillModal').then(m => ({ default: m.PurchaseSkillModal })));

type TabType = 'catalog' | 'myskills';

export default function Store() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { purchaseSkill, getUserSkills } = useSkillsStore();
  const { data: balanceData } = useBalance({ address });
  const { totalStakedBigInt } = useUserStaking();
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'ALL'>('ALL');
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  const [isPricingExpanded, setIsPricingExpanded] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Get ETH balance (native currency for individual skills)
  const userBalance = balanceData?.value ? parseFloat(balanceData.formatted) : 0;

  // Memoized skills data
  const allSkills = useMemo(() => SKILLS_DATA, []);
  
  // Get user's purchased skills from localStorage
  const userSkills = useMemo(() => {
    if (!isConnected) return [];
    const purchasedSkills = getUserSkills();
    return purchasedSkills.map(skill => {
      // Find the full skill data from SKILLS_DATA to get all details
      const fullSkill = allSkills.find(s => s.skillType === skill.skillType && s.rarity === skill.rarity);
      
      return {
        skill: fullSkill || {
          id: skill.skillId,
          skillType: skill.skillType as SkillType,
          rarity: skill.rarity as Rarity,
          name: skill.skillName || 'Unknown Skill',
          icon: skill.skillIcon || '❓',
          color: skill.skillColor || '#999999',
          description: skill.skillDescription || '',
          effectLabel: '',
          effectValue: 0,
          effectFormatted: skill.skillEffectFormatted || '',
          category: skill.skillType <= 7 ? SkillCategory.STAKING : SkillCategory.MARKETPLACE,
        },
        isActive: skill.isActive,
        expiresAt: skill.expiresAt,
        purchasedAt: skill.purchasedAt,
      };
    });
  }, [isConnected, getUserSkills, allSkills]);

  // Contador correcto: cantidad total de skills comprados
  const ownedSkillIds = useMemo(() => userSkills.map((_, idx) => idx), [userSkills]);const handleSkillClick = useCallback((skill: SkillData) => {
    setSelectedSkill(skill);
    setIsPurchaseModalOpen(true);
  }, []);

  const handleClosePurchaseModal = useCallback(() => {
    setIsPurchaseModalOpen(false);
    setSelectedSkill(null);
  }, []);

  const handlePurchase = useCallback(async (skill: SkillData) => {
    console.log('Purchasing skill:', skill);
    try {
      await purchaseSkill(skill);
      
      // ✅ FIX: Dispatch event to trigger activities refresh after subgraph indexation delay
      // The subgraph typically takes 2-5 seconds to index new purchases
      setTimeout(() => {
        console.log('🔄 Triggering activities refresh after skill purchase');
        window.dispatchEvent(new CustomEvent('skillPurchased', { 
          detail: { skill, skillId: skill.skillType } 
        }));
      }, 2500);  // 2.5 second delay for subgraph indexation
      
      // Modal closes automatically on success via PurchaseSkillModal
    } catch (error) {
      console.error('Purchase failed:', error);
      // Error handling is done in PurchaseSkillModal
    }
  }, [purchaseSkill]);

  const handleActivate = useCallback(async (skill: SkillData) => {
    if (!address) {
      toast.error('Connect your wallet first');
      return;
    }

    // Validate minimum staking balance: 250 POL
    const MIN_STAKING_REQUIRED = 250n * 10n ** 18n; // 250 POL in wei
    
    if (totalStakedBigInt < MIN_STAKING_REQUIRED) {
      const poRequired = 250;
      const currentAmount = Number(totalStakedBigInt) / 1e18;
      toast.error(
        `❌ You need at least ${poRequired} POL staked to activate skills. Current: ${currentAmount.toFixed(2)} POL`
      );
      return;
    }

    try {
      console.log('Activating skill:', skill);
      // TODO: Implement skill activation with toast feedback
      toast.success(`Activating ${skill.name}...`);
    } catch (error) {
      console.error('Activation failed:', error);
      toast.error(`Failed to activate skill: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [address, totalStakedBigInt]);

  const handleRenew = useCallback((skill: SkillData) => {
    console.log('Renewing skill:', skill);
    // TODO: Call useSkillsStore renewSkill method
  }, []);

  return (
    <GlobalBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Compact Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-black text-white">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Skills Store
                  </span>
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {allSkills.length} skills available
                </p>
              </div>

              {/* Centralized Control Column */}
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                {/* Tabs Navigation */}
                <div className="flex gap-2 bg-gray-800/50 rounded-lg p-1 border border-gray-700">
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap ${
                      activeTab === 'catalog'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🛍️ Catalog
                  </button>
                  <button
                    onClick={() => setActiveTab('myskills')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap ${
                      activeTab === 'myskills'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    💼 My Skills
                  </button>
                  <button
                    onClick={() => navigate('/skills')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg font-semibold transition-all text-sm whitespace-nowrap text-gray-400 hover:text-white"
                  >
                    ℹ️ Skills Info
                  </button>
                </div>

                {/* Wallet Status */}
                {isConnected ? (
                  <div className="flex items-center justify-between gap-2 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-gray-300">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </div>
                    <span className="font-semibold text-white">{userBalance.toFixed(2)} POL</span>
                  </div>
                ) : (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-2 text-xs text-yellow-400">
                    ⚠️ Connect wallet
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-3 flex-wrap">
              <div className="bg-gray-800/30 rounded px-3 py-1.5 border border-gray-700/50 text-xs">
                <span className="text-purple-400 font-bold">{allSkills.length}</span>
                <span className="text-gray-400"> Total</span>
              </div>
              <div className="bg-gray-800/30 rounded px-3 py-1.5 border border-gray-700/50 text-xs">
                <span className="text-green-400 font-bold">{userSkills.length}</span>
                <span className="text-gray-400"> Owned</span>
              </div>
              <div className="bg-gray-800/30 rounded px-3 py-1.5 border border-gray-700/50 text-xs">
                <span className="text-blue-400 font-bold">{allSkills.length - userSkills.length}</span>
                <span className="text-gray-400"> Available</span>
              </div>
            </div>
          </motion.div>

        {/* Mobile Filters - Collapsible (Only on mobile) */}
        {activeTab === 'catalog' && (
          <motion.div
            className="lg:hidden space-y-3 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Pricing Button */}
            <button
              onClick={() => setIsPricingExpanded(!isPricingExpanded)}
              className="w-full flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-purple-500 transition-colors"
            >
              <span className="font-bold text-white text-sm">💰 Pricing</span>
              <span className={`transition-transform ${isPricingExpanded ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Pricing Dropdown */}
            {isPricingExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-2 text-xs overflow-hidden"
              >
                {selectedCategory === 'ALL' || selectedCategory === SkillCategory.STAKING ? (
                  <>
                    <div className="text-xs font-semibold text-gray-300 mb-2">⛓️ Staking Skills:</div>
                    <div className="flex justify-between"><span className="text-gray-400">Common</span><span className="text-green-400 font-semibold">50 POL</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Uncommon</span><span className="text-green-400 font-semibold">80 POL</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Rare</span><span className="text-blue-400 font-semibold">100 POL</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Epic</span><span className="text-purple-400 font-semibold">150 POL</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Legendary</span><span className="text-orange-400 font-semibold">220 POL</span></div>
                  </>
                ) : null}
                
                {selectedCategory === 'ALL' && (
                  <div className="my-2 border-t border-gray-600"></div>
                )}
                
                {selectedCategory === 'ALL' || selectedCategory === SkillCategory.MARKETPLACE ? (
                  <>
                    <div className="text-xs font-semibold text-gray-300 mb-2">🏪 Marketplace Skills:</div>
                    <div className="flex justify-between"><span className="text-gray-400">Common</span><span className="text-gray-400 font-semibold">50 POL</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Uncommon</span><span className="text-green-400 font-semibold">120 POL</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Rare</span><span className="text-blue-400 font-semibold">200 POL</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Epic</span><span className="text-purple-400 font-semibold">420 POL</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Legendary</span><span className="text-orange-400 font-semibold">770 POL</span></div>
                  </>
                ) : null}
                <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                  <p>♻️ Renew: 50% off</p>
                </div>
              </motion.div>
            )}

            {/* Filters Button */}
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="w-full flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-purple-500 transition-colors"
            >
              <span className="font-bold text-white text-sm">🔍 Search & Filters</span>
              <span className={`transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {/* Filters Dropdown */}
            {isFiltersExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 space-y-3 overflow-hidden"
              >
                {/* Search */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-semibold">🔍 Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find skill..."
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-semibold">📂 Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | 'ALL')}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="ALL">All</option>
                    <option value={SkillCategory.STAKING}>🎯 Staking</option>
                    <option value={SkillCategory.MARKETPLACE}>🏪 Marketplace</option>
                  </select>
                </div>

                {/* Rarity Filter */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-semibold">✨ Rarity</label>
                  <div className="space-y-1.5">
                    {[
                      { value: 'ALL', label: 'All', color: 'text-gray-400' },
                      { value: Rarity.COMMON, label: '⚪ Common', color: 'text-gray-300' },
                      { value: Rarity.UNCOMMON, label: '🟢 Uncommon', color: 'text-green-400' },
                      { value: Rarity.RARE, label: '🔵 Rare', color: 'text-blue-400' },
                      { value: Rarity.EPIC, label: '🟣 Epic', color: 'text-purple-400' },
                      { value: Rarity.LEGENDARY, label: '🟠 Legendary', color: 'text-orange-400' },
                    ].map((rarity) => (
                      <label key={rarity.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="rarity"
                          value={rarity.value}
                          checked={selectedRarity === rarity.value}
                          onChange={() => setSelectedRarity(rarity.value === 'ALL' ? 'ALL' : parseInt(rarity.value as string) as Rarity)}
                          className="w-3 h-3"
                        />
                        <span className={`text-xs ${rarity.color} group-hover:brightness-110`}>{rarity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Catalog Tab - Two Column Layout */}
        {activeTab === 'catalog' && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* Left Sidebar - Desktop Only Filters */}
            <div className="lg:col-span-1 hidden lg:block">
              <motion.div 
                className="sticky top-8 space-y-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {/* Pricing Guide - Compact */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-sm font-bold text-white mb-3">💰 Pricing</h3>
                  <div className="space-y-2 text-xs">
                    {selectedCategory === 'ALL' || selectedCategory === SkillCategory.STAKING ? (
                      <>
                        <div className="text-xs font-semibold text-gray-300 mb-2">⛓️ Staking Skills:</div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Common</span>
                          <span className="text-green-400 font-semibold">50 POL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Uncommon</span>
                          <span className="text-green-400 font-semibold">80 POL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rare</span>
                          <span className="text-blue-400 font-semibold">100 POL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Epic</span>
                          <span className="text-purple-400 font-semibold">150 POL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Legendary</span>
                          <span className="text-orange-400 font-semibold">220 POL</span>
                        </div>
                      </>
                    ) : null}
                    
                    {selectedCategory === 'ALL' && (
                      <div className="my-2 border-t border-gray-600"></div>
                    )}
                    
                    {selectedCategory === 'ALL' || selectedCategory === SkillCategory.MARKETPLACE ? (
                      <>
                        <div className="text-xs font-semibold text-gray-300 mb-2">🏪 Marketplace Skills:</div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Common</span>
                          <span className="text-gray-400 font-semibold">50 POL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Uncommon</span>
                          <span className="text-green-400 font-semibold">120 POL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rare</span>
                          <span className="text-blue-400 font-semibold">200 POL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Epic</span>
                          <span className="text-purple-400 font-semibold">420 POL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Legendary</span>
                          <span className="text-orange-400 font-semibold">770 POL</span>
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                    <p>♻️ Renew: 50% off</p>
                  </div>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-semibold">🔍 Search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find skill..."
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-semibold">📂 Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | 'ALL')}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="ALL">All</option>
                    <option value={SkillCategory.STAKING}>🎯 Staking</option>
                    <option value={SkillCategory.MARKETPLACE}>🏪 Marketplace</option>
                  </select>
                </div>

                {/* Rarity Filter */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2 font-semibold">✨ Rarity</label>
                  <div className="space-y-1.5">
                    {[
                      { value: 'ALL', label: 'All', color: 'text-gray-400' },
                      { value: Rarity.COMMON, label: '⚪ Common', color: 'text-gray-300' },
                      { value: Rarity.UNCOMMON, label: '🟢 Uncommon', color: 'text-green-400' },
                      { value: Rarity.RARE, label: '🔵 Rare', color: 'text-blue-400' },
                      { value: Rarity.EPIC, label: '🟣 Epic', color: 'text-purple-400' },
                      { value: Rarity.LEGENDARY, label: '🟠 Legendary', color: 'text-orange-400' },
                    ].map((rarity) => (
                      <label key={rarity.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="rarity"
                          value={rarity.value}
                          checked={selectedRarity === rarity.value}
                          onChange={() => setSelectedRarity(rarity.value === 'ALL' ? 'ALL' : parseInt(rarity.value as string) as Rarity)}
                          className="w-3 h-3"
                        />
                        <span className={`text-xs ${rarity.color} group-hover:brightness-110`}>{rarity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Skills Grid */}
              <SkillsCatalog
                skills={allSkills}
                onSkillClick={handleSkillClick}
                ownedSkillIds={ownedSkillIds}
                selectedCategory={selectedCategory}
                selectedRarity={selectedRarity}
                searchQuery={searchQuery}
              />
            </div>
          </motion.div>
        )}

        {/* My Skills Tab */}
        {activeTab === 'myskills' && (
          <motion.div
            key="myskills"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {!isConnected ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
                <p className="text-gray-400">
                  Please connect your wallet to view your skills
                </p>
              </div>
            ) : (
              <MySkills
                userSkills={userSkills}
                onActivate={handleActivate}
                onRenew={handleRenew}
                onBrowseSkills={() => setActiveTab('catalog')}
                isLoading={false}
              />
            )}
          </motion.div>
        )}

        {/* Purchase Modal */}
        <Suspense fallback={null}>
          <PurchaseSkillModal
            isOpen={isPurchaseModalOpen}
            onClose={handleClosePurchaseModal}
            skill={selectedSkill}
            userBalance={userBalance}
            onPurchase={handlePurchase}
          />
        </Suspense>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center text-gray-500 text-sm"
        >
          <p>
            💡 Staking Skills: 50-220 POL • Marketplace Skills: 50-770 POL • 
            Renew expired skills for 50% off • Maximum 3 active skills • Skills last 30 days
          </p>
        </motion.div>
        </div>
      </div>
    </GlobalBackground>
  );
}
