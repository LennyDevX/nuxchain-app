import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import type { SkillData } from '../skills/config';
import { calculateSkillPrice, formatPrice } from './pricing-config';
import { RARITY_NAMES } from '../../types/contracts';
import { useFocusTrap, useModalBackdrop } from '../../hooks/accessibility/useFocusTrap';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';

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
  const { isConnected } = useAccount();
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
      return;
    }

    if (hasInsufficientBalance) {
      setError(`Insufficient balance. You need ${price} POL but only have ${userBalance.toFixed(2)} POL`);
      triggerHaptic('light');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await onPurchase(skill);
      triggerHaptic('medium');
      
      // Show success toast
      toast.success(
        `Skill "${skill.name}" purchased for ${price} POL! 🎉`,
        {
          duration: 6000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '16px 24px',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
          }
        }
      );
      
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase skill';
      setError(errorMessage);
      triggerHaptic('light');
      
      // Show error toast
      toast.error(
        errorMessage,
        {
          duration: 6000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '12px',
            padding: '16px 24px',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
          }
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
          className="card-unified p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 id="purchase-modal-title" className="text-2xl font-bold text-white">
              Purchase Skill
            </h3>
            <button
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close purchase modal"
              className="text-white/60 hover:text-white transition-colors disabled:opacity-50"
            >
              <XIcon />
            </button>
          </div>

          {/* Skill Display */}
          <div id="purchase-modal-description" className="mb-6">
            {/* Skill Card Preview */}
            <div
              className="relative p-6 rounded-xl border-2 mb-4"
              style={{ borderColor: skill.color }}
            >
              {/* Background glow */}
              <div
                className="absolute inset-0 opacity-10 rounded-xl"
                style={{ backgroundColor: skill.color }}
              />

              <div className="relative z-10">
                {/* Icon and Rarity */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl">{skill.icon}</span>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: skill.color }}
                  >
                    {RARITY_NAMES[skill.rarity]}
                  </span>
                </div>

                {/* Name and Effect */}
                <h4 className="text-xl font-bold text-white mb-2">
                  {skill.name.split(' - ')[0]}
                </h4>
                <div
                  className="inline-block px-3 py-2 rounded-lg text-sm font-semibold mb-3"
                  style={{
                    backgroundColor: `${skill.color}33`,
                    border: `1px solid ${skill.color}`,
                    color: skill.color,
                  }}
                >
                  {skill.effectFormatted}
                </div>
                <p className="text-sm text-gray-400">{skill.description}</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="card-unified p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Purchase Price:</span>
                <span className="text-white font-bold text-lg">
                  {price.toFixed(3)} POL
                </span>
              </div>

              <div className="border-t border-gray-700/50 pt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-sm">Renewal Cost (50% off):</span>
                  <span className="text-yellow-400 font-bold">
                    {renewalPrice.toFixed(3)} POL
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">💡 Renew expired skills for half price after 30 days</p>
              </div>

              {!hasInsufficientBalance && (
                <div className="border-t border-gray-700/50 pt-3 flex justify-between items-center text-sm">
                  <span className="text-gray-400">Your Balance:</span>
                  <span className="text-green-400 font-semibold">
                    {userBalance.toFixed(3)} POL
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Alerts */}
          {!isConnected && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4" role="alert">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangleIcon />
                <span>Please connect your wallet to purchase</span>
              </div>
            </div>
          )}

          {hasInsufficientBalance && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4" role="alert">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertTriangleIcon />
                <span>Insufficient balance. You need {price} POL.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4" role="alert">
              <div className="flex items-start gap-2 text-red-400">
                <AlertTriangleIcon />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Transaction Failed</p>
                  <p className="text-xs">{error}</p>
                  <p className="text-xs mt-2 text-red-300">
                    <strong>Common reasons:</strong>
                    <br />• You need 250 POL staked to activate skills
                    <br />• You already have 3 active skills (max limit)
                    <br />• You already have this skill type active
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="space-y-3 mb-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>Purchase now:</strong> Pay {price.toFixed(3)} POL and own this skill.
              </p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-sm text-amber-300">
                ⚡ <strong>To activate staking skills:</strong> You need 250 POL staked in the staking pool.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              disabled={isLoading}
              aria-label="Cancel purchase"
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <motion.button
              onClick={handlePurchase}
              disabled={!isConnected || hasInsufficientBalance || isLoading}
              aria-label={`Purchase ${skill.name} for ${formatPrice(price)}`}
              whileHover={!isConnected || hasInsufficientBalance || isLoading ? {} : { scale: 1.02 }}
              whileTap={!isConnected || hasInsufficientBalance || isLoading ? {} : { scale: 0.98 }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Processing...
                </>
              ) : (
                <>
                  Purchase for {price.toFixed(3)} POL
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
