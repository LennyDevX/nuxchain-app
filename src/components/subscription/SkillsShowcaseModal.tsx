/**
 * SkillsShowcaseModal
 * Shows all 9 AI skills with tier info, pricing, and upgrade CTAs.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  SKILLS,
  SUBSCRIPTION_PRICES,
  type SkillId,
} from '../../constants/subscription';

interface SkillsShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const TIER_ORDER: SkillId[] = [
  'nft-listing',
  'risk-analysis',
  'market-alpha',
  'content-moderation',
  'contract-auditor',
  'whale-tracker',
  'portfolio-analyzer',
  'token-research',
  'liquidity-advisor',
];

export function SkillsShowcaseModal({ isOpen, onClose, onSubscribe }: SkillsShowcaseModalProps) {
  const isMobile = useIsMobile();
  const { tier, activeSkills } = useSubscription();

  if (!isOpen) return null;

  const isUnlocked = (skillId: SkillId) => activeSkills.includes(skillId);
  const isProSkill = (skillId: SkillId) => SKILLS[skillId].includedIn.includes('pro');
  const isPremiumOnly = (skillId: SkillId) => !SKILLS[skillId].includedIn.includes('pro');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 pt-24 sm:pt-28"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="bg-[#0a0a14] border border-purple-500/30 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[80vh] mt-4 overflow-y-auto shadow-2xl shadow-purple-900/30 jersey-20-regular"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-3xl jersey-15-regular text-gradient">🔮 AI Skills</h2>
                <p className="jersey-20-regular text-lg text-white/50 mt-1">
                  DeFi Analysis Modules powered by Gemini 3.1
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Plan CTAs */}
              {tier === 'free' && (
                <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {/* Pro CTA */}
                  <motion.button
                    onClick={onSubscribe}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-900/30 to-blue-900/30 text-left hover:border-purple-500/70 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="jersey-15-regular text-white text-lg">⚡ Pro</span>
                      <span className="jersey-15-regular text-purple-400 text-3xl">${SUBSCRIPTION_PRICES.pro.usd}<span className="jersey-20-regular text-base text-white/40">/mo</span></span>
                    </div>
                    <p className="jersey-20-regular text-base text-white/50">3 skills included · Unlimited chat</p>
                    <div className="mt-3 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-center">
                      <span className="jersey-20-regular text-base text-white font-semibold">Subscribe →</span>
                    </div>
                  </motion.button>

                  {/* Premium CTA */}
                  <motion.button
                    onClick={onSubscribe}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 text-left hover:border-yellow-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="jersey-15-regular text-white text-lg">💎 Premium</span>
                      <span className="jersey-15-regular text-yellow-400 text-3xl">${SUBSCRIPTION_PRICES.premium.usd}<span className="jersey-20-regular text-base text-white/40">/mo</span></span>
                    </div>
                    <p className="jersey-20-regular text-base text-white/50">All 9 skills · Maximum power</p>
                    <div className="mt-3 px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 text-center">
                      <span className="jersey-20-regular text-base text-white font-semibold">Subscribe →</span>
                    </div>
                  </motion.button>
                </div>
              )}

              {tier !== 'free' && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl px-4 py-3">
                  <span className="text-2xl">{tier === 'premium' ? '💎' : '⚡'}</span>
                  <div>
                    <p className="jersey-15-regular text-white text-2xl capitalize">Active {tier} Plan</p>
                    <p className="jersey-20-regular text-base text-white/50">
                      {activeSkills.length} skill{activeSkills.length !== 1 ? 's' : ''} unlocked
                      {tier === 'pro' && ' · Upgrade to Premium for all'}
                    </p>
                  </div>
                  {tier === 'pro' && (
                    <button onClick={onSubscribe} className="ml-auto text-sm jersey-20-regular text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-2 rounded-lg transition-colors flex-shrink-0">
                      Upgrade →
                    </button>
                  )}
                </div>
              )}

              {/* Skills grid */}
              <div>
                <p className="jersey-20-regular text-lg text-white/40 uppercase tracking-widest mb-3 font-semibold">All Skills</p>
                <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {TIER_ORDER.map((skillId, index) => {
                    const skill = SKILLS[skillId];
                    const unlocked = isUnlocked(skillId);
                    const proIncluded = isProSkill(skillId);
                    const premiumOnly = isPremiumOnly(skillId);

                    return (
                      <motion.div
                        key={skillId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={`relative p-4 rounded-2xl border transition-all ${
                          unlocked
                            ? 'border-purple-500/40 bg-purple-900/10'
                            : 'border-white/10 bg-white/5 opacity-75'
                        }`}
                      >
                        {/* Tier badge */}
                        <div className="absolute top-3 right-3">
                          {unlocked ? (
                            <span className="text-sm bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full jersey-20-regular">
                              ✓ Active
                            </span>
                          ) : premiumOnly ? (
                            <span className="text-sm bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full jersey-20-regular">
                              💎 Premium
                            </span>
                          ) : (
                            <span className="text-sm bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full jersey-20-regular">
                              ⚡ Pro
                            </span>
                          )}
                        </div>

                        <div className="flex items-start gap-3">
                          <span className={`text-2xl mt-0.5 ${unlocked ? '' : 'grayscale opacity-60'}`}>
                            {skill.icon}
                          </span>
                          <div className="flex-1 min-w-0 pr-14">
                            <p className={`jersey-15-regular text-2xl ${unlocked ? 'text-white' : 'text-white/60'}`}>
                              {skill.label}
                            </p>
                            <p className="jersey-20-regular text-lg text-white/40 mt-1 leading-relaxed">
                              {skill.description}
                            </p>
                            {!unlocked && (
                              <p className="jersey-20-regular text-base text-purple-400/70 mt-2">
                                Included in {proIncluded ? 'Pro & Premium' : 'Premium'}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer CTA */}
              {tier === 'free' && (
                <button
                  onClick={onSubscribe}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-700 hover:via-violet-700 hover:to-blue-700 text-white rounded-2xl jersey-15-regular text-xl transition-all font-bold shadow-lg shadow-purple-900/30"
                >
                  ✨ View Subscription Plans →
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SkillsShowcaseModal;
