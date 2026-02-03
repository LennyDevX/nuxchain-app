import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import type { MarketplaceNFT } from '../../types/marketplace';
import { useFocusTrap, useModalBackdrop } from '../../hooks/accessibility/useFocusTrap';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';
import useBuyNFT from '../../hooks/nfts/useBuyNFT';

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

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: MarketplaceNFT | null;
  onBuy: (nft: MarketplaceNFT) => void;
  onSuccess?: (nft: MarketplaceNFT) => void;
}

const BuyModal: React.FC<BuyModalProps> = ({ isOpen, onClose, nft, onBuy, onSuccess }) => {
  const { address: account, isConnected } = useAccount();
  const [localError, setLocalError] = React.useState<string>('');
  const { buyNFT, isLoading, error: hookError, isSuccess } = useBuyNFT();
  
  // ✅ Haptic feedback
  const triggerHaptic = useTapFeedback();
  
  // 🎯 Accessibility: Focus trap and keyboard navigation
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const handleBackdropClick = useModalBackdrop(onClose);

  // Handle success from useBuyNFT hook
  useEffect(() => {
    if (isSuccess && nft) {
      console.log('✅ [BuyModal] Purchase successful, closing modal and refreshing...', {
        tokenId: nft.tokenId,
        nftName: nft.name
      });
      onBuy(nft);
      onSuccess?.(nft);
      onClose();
    }
  }, [isSuccess, nft, onBuy, onSuccess, onClose]);

  if (!isOpen || !nft) return null;

  const handleBuyClick = () => {
    if (!isConnected) {
      setLocalError('You must connect your wallet to purchase');
      triggerHaptic('light');
      return;
    }
    if (account && nft.owner && account.toLowerCase() === nft.owner.toLowerCase()) {
      setLocalError('You cannot buy your own NFT');
      triggerHaptic('light');
      return;
    }
    setLocalError('');
    triggerHaptic('medium');
    
    // Ensure we have valid parameters
    const priceStr = nft.priceInEth?.toString() || '0';
    const seller = (nft.seller || nft.owner || '').toLowerCase();
    
    if (!nft.tokenId || !priceStr || !seller) {
      setLocalError('Missing NFT information. Please refresh and try again.');
      return;
    }
    
    // Call the actual buy function with correct parameters
    buyNFT({
      tokenId: nft.tokenId,
      price: priceStr,
      seller: seller
    });
  };

  const isOwner = account && nft.owner && account.toLowerCase() === nft.owner.toLowerCase();
  const displayError = localError || hookError;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="buy-modal-title"
        aria-describedby="buy-modal-description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          ref={modalRef} 
          className="card-unified border border-white/10 rounded-2xl overflow-hidden w-full max-w-sm sm:max-w-xs flex flex-col"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-3 sm:p-4 border-b border-white/10">
            <h3 id="buy-modal-title" className="text-base sm:text-lg font-bold text-white">Buy NFT</h3>
            <button
              onClick={onClose}
              aria-label="Close purchase modal"
              className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <XIcon />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 sm:p-4 space-y-3">
              {/* Image Container - Square 4:4 Format */}
              <div id="buy-modal-description" className="w-full aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg overflow-hidden flex items-center justify-center">
                {nft.image ? (
                  <img
                    src={nft.image}
                    alt={nft.name || 'NFT'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full flex items-center justify-center" style={{display: nft.image ? 'none' : 'flex'}}>
                  <span className="text-5xl sm:text-6xl opacity-50">🖼️</span>
                </div>
              </div>

              {/* NFT Information */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-semibold text-white line-clamp-1">{nft.name || `NFT #${nft.tokenId || 'Unknown'}`}</h4>
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-md p-2.5 sm:p-3">
                  <p className="text-xs text-white/60 mb-0.5">Price</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-400">
                    {nft.priceInEth ? (nft.priceInEth < 0.01 ? nft.priceInEth.toFixed(6) : nft.priceInEth.toFixed(2)) : '0.10'} POL
                  </p>
                </div>
              </div>

              {/* Alerts */}
              {!isConnected ? (
                <div className="bg-red-500/20 border border-red-500/30 rounded-md p-2" role="alert" aria-live="assertive">
                  <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm">
                    <AlertTriangleIcon />
                    <span>Connect wallet to purchase</span>
                  </div>
                </div>
              ) : isOwner ? (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-md p-2" role="alert" aria-live="polite">
                  <div className="flex items-center gap-2 text-yellow-400 text-xs sm:text-sm">
                    <AlertTriangleIcon />
                    <span>Cannot buy your own NFT</span>
                  </div>
                </div>
              ) : null}

              {displayError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-md p-2" role="alert" aria-live="assertive">
                  <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm">
                    <AlertTriangleIcon />
                    <span>{displayError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Action Buttons */}
          <div className="border-t border-white/10 p-3 sm:p-4 bg-black/20 backdrop-blur-sm space-y-2 sm:space-y-0 sm:flex sm:gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              aria-label="Cancel purchase"
              className="w-full px-3 py-1.5 sm:py-2 btn-secondary"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleBuyClick}
              disabled={!isConnected || Boolean(isOwner) || isLoading}
              aria-label={!isConnected ? 'Connect wallet to buy' : isOwner ? 'Cannot buy your own NFT' : `Buy ${nft.name || 'NFT'} for ${nft.priceInEth || '0.10'} POL`}
              aria-disabled={!isConnected || Boolean(isOwner) || isLoading}
              whileHover={!isConnected || isOwner || isLoading ? {} : { scale: 1.05 }}
              whileTap={!isConnected || isOwner || isLoading ? {} : { scale: 0.95 }}
              className="w-full px-3 py-1.5 sm:py-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Buying...' : 'Buy'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BuyModal;