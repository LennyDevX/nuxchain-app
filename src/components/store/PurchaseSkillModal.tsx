import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import type { SkillData } from '../skills/config';
import { skillToasts } from '../../utils/toasts';
import { useOwnedSkills } from '../../hooks/contracts/useViewFunctions';
import { calculateSkillPrice, formatPrice } from './pricing-config';
import { RARITY_NAMES } from '../../types/contracts';
import { useFocusTrap, useModalBackdrop } from '../../hooks/accessibility/useFocusTrap';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

// SVG Icons
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <path d="M12 9v4"></path>
    <path d="m12 17 .01 0"></path>
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface PurchaseSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillData | null;
  userBalance?: number; // POL balance in ETH format
  onPurchase: (skill: SkillData) => Promise<void>;
}

export const PurchaseSkillModal: React.FC<PurchaseSkillModalProps> = ({
  isOpen,
  onClose,
  skill,
  userBalance = 0,
  onPurchase,
}) => {
  const { isConnected, address } = useAccount();
  const isMobile = useIsMobile();
  const { skillCount } = useOwnedSkills(address);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const triggerHaptic = useTapFeedback();
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const handleBackdropClick = useModalBackdrop(onClose);

  if (!isOpen || !skill) return null;

  // Calculate price in POL for individual skills using contract pricing
  const price = calculateSkillPrice(skill.skillType, skill.rarity, false);
  const renewalPrice = calculateSkillPrice(skill.skillType, skill.rarity, true);
  const hasInsufficientBalance = userBalance < price;

  const handlePurchase = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      triggerHaptic('light');
      skillToasts.error('🔐 Please connect your wallet first');
      return;
    }

    if (hasInsufficientBalance) {
      setError(`Insufficient balance. You need ${price} POL but only have ${userBalance.toFixed(2)} POL`);
      triggerHaptic('light');
      skillToasts.insufficientFunds(price.toFixed(3) + ' POL', userBalance.toFixed(3) + ' POL');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await onPurchase(skill);
      triggerHaptic('medium');
      
      // Show success toast with full context including active skills count
      const totalActive = skillCount + 1; // Include the just purchased skill
      skillToasts.skillPurchased(
        skill.name,
        price.toFixed(3) + ' POL',
        RARITY_NAMES[skill.rarity]
      );
      
      // Show additional info if user has multiple skills
      if (totalActive > 1) {
        setTimeout(() => {
          skillToasts.benefitActivated(
            'Skills Collection',
            `You now have ${totalActive} active skills!`
          );
        }, 2000);
      }
      
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase skill';
      setError(errorMessage);
      triggerHaptic('light');
      
      // Show error toast with context
      skillToasts.error(`⚠️ Purchase Failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-modal-title"
        aria-describedby="purchase-modal-description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          ref={modalRef}
          className={`card-unified w-full max-w-lg rounded-lg overflow-hidden flex flex-col ${
            isMobile 
              ? 'p-4 max-h-[calc(100vh-2rem)] sm:max-h-[85vh]' 
              : 'p-6 max-h-[90vh]'
          }`}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4 sm:mb-6 flex-shrink-0">
            <h3 id="purchase-modal-title" className="text-xl sm:text-2xl font-bold text-white">
              Purchase Skill
            </h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close purchase modal"
              className="text-white/60 hover:text-white transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <XIcon />
            </button>
          </div>

          {/* Skill Display - Scrollable Content */}
          <div id="purchase-modal-description" className="overflow-y-auto flex-1 pr-2 space-y-4">
            {/* Skill Card Preview */}
            <div
              className="relative p-4 sm:p-6 rounded-xl border-2 flex-shrink-0"
              style={{ borderColor: skill.color }}
            >
              {/* Background glow */}
              <div
                className="absolute inset-0 opacity-10 rounded-xl"
                style={{ backgroundColor: skill.color }}
              />

              <div className="relative z-10">
                {/* Icon and Rarity */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <span className="text-4xl sm:text-5xl">{skill.icon}</span>
                  <span
                    className="text-xs font-bold px-2 sm:px-3 py-1 rounded-full text-white whitespace-nowrap ml-2"
                    style={{ backgroundColor: skill.color }}
                  >
                    {RARITY_NAMES[skill.rarity]}
                  </span>
                </div>

                {/* Name and Effect */}
                <h4 className="text-lg sm:text-xl font-bold text-white mb-2">
                  {skill.name.split(' - ')[0]}
                </h4>
                <div
                  className="inline-block px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold mb-2 sm:mb-3"
                  style={{
                    backgroundColor: `${skill.color}33`,
                    border: `1px solid ${skill.color}`,
                    color: skill.color,
                  }}
                >
                  {skill.effectFormatted}
                </div>
                <p className="text-xs sm:text-sm text-gray-400 line-clamp-3">{skill.description}</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="card-unified p-3 sm:p-4 space-y-3 sm:space-y-4 flex-shrink-0">
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-gray-400">Purchase Price:</span>
                <span className="text-white font-bold">
                  {price.toFixed(3)} POL
                </span>
              </div>

              <div className="border-t border-gray-700/50 pt-2 sm:pt-3">
                <div className="flex justify-between items-center mb-1 text-sm sm:text-base">
                  <span className="text-gray-400 text-xs sm:text-sm">Renewal Cost (50% off):</span>
                  <span className="text-yellow-400 font-bold">
                    {renewalPrice.toFixed(3)} POL
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">💡 Renew expired skills for half price after 30 days</p>
              </div>

              {!hasInsufficientBalance && (
                <div className="border-t border-gray-700/50 pt-2 sm:pt-3 flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-400">Your Balance:</span>
                  <span className="text-green-400 font-semibold">
                    {userBalance.toFixed(3)} POL
                  </span>
                </div>
              )}
            </div>

            {/* Alerts */}
            {!isConnected && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex-shrink-0" role="alert">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangleIcon />
                  <span>Please connect your wallet</span>
                </div>
              </div>
            )}

            {hasInsufficientBalance && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 flex-shrink-0" role="alert">
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <AlertTriangleIcon />
                  <span>Insufficient balance. You need {price.toFixed(3)} POL.</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex-shrink-0" role="alert">
                <div className="flex items-start gap-2 text-red-400 text-xs sm:text-sm">
                  <AlertTriangleIcon />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Transaction Failed</p>
                    <p className="text-xs">{error}</p>
                    <p className="text-xs mt-2 text-red-300">
                      <strong>Common reasons:</strong>
                      <br />• 250 POL staked to activate skills
                      <br />• Max 3 active skills
                      <br />• Already have this skill type
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="space-y-2 sm:space-y-3 flex-shrink-0">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-blue-300">
                  💡 <strong>Purchase now:</strong> Pay {price.toFixed(3)} POL.
                </p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-amber-300">
                  ⚡ <strong>To activate:</strong> Need 250 POL staked.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={`flex gap-2 sm:gap-3 flex-shrink-0 mt-4 ${isMobile ? 'flex-col-reverse' : ''}`}>
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              disabled={isLoading}
              aria-label="Cancel purchase"
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Cancel
            </button>
            <motion.button
              onClick={handlePurchase}
              disabled={!isConnected || hasInsufficientBalance || isLoading}
              aria-label={`Purchase ${skill.name} for ${formatPrice(price)}`}
              whileHover={!isConnected || hasInsufficientBalance || isLoading ? {} : { scale: 1.02 }}
              whileTap={!isConnected || hasInsufficientBalance || isLoading ? {} : { scale: 0.98 }}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Purchase {price.toFixed(2)} POL</span>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
