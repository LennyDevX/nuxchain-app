import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MarketplaceNFT } from '../../types/marketplace';
import { usePOLPrice } from '../../hooks/coingecko/usePOLPriceContext';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useTapFeedback } from '../../hooks/mobile/useTapFeedback';
import { CopyIcon, CheckIcon, XIcon } from '../ui/CustomIcons';

interface NFTDetailsModalProps {
  nft: MarketplaceNFT | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (nft: MarketplaceNFT) => void;
}

export const NFTDetailsModal: React.FC<NFTDetailsModalProps> = ({ nft, isOpen, onClose, onBuy }) => {
  const { convertPOLToUSD, polPrice } = usePOLPrice();
  const isMobile = useIsMobile();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const triggerHaptic = useTapFeedback();

  const handleBuyClick = useCallback(() => {
    if (!nft) return;
    triggerHaptic('medium');
    onBuy(nft);
    onClose();
  }, [nft, onBuy, onClose, triggerHaptic]);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(label);
      triggerHaptic('light');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [triggerHaptic]);

  const formatAddress = (address: string | undefined) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!nft) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.6) 0%, rgba(91, 33, 182, 0.2) 50%, rgba(220, 38, 38, 0.1) 100%)',
              backdropFilter: 'blur(12px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', stiffness: 280, damping: 35 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-lg'} max-h-[90dvh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto backdrop-blur-3xl border border-white/10`}
              style={{
                background: 'linear-gradient(180deg, rgba(26, 26, 26, 0.95) 0%, rgba(91, 33, 182, 0.15) 100%)',
              }}
            >
              {/* Decorative gradient overlay */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)',
                }}
              />

              {/* Header */}
              <motion.div variants={itemVariants} className="relative z-10 flex justify-between items-start p-4 md:p-5 border-b border-white/8">
                <div className="flex-1 min-w-0 pr-3">
                  <h2 className="font-bold text-white text-base md:text-lg line-clamp-1">
                    {nft.name || `NFT #${nft.tokenId}`}
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">Collection • Token #{nft.tokenId}</p>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.85 }}
                  className="flex-shrink-0 p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
                >
                  <XIcon className="w-5 h-5 text-white/70 hover:text-white" />
                </motion.button>
              </motion.div>

              {/* Scrollable Content */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="overflow-y-auto flex-1 relative z-10 custom-scrollbar"
                style={{ maxHeight: isMobile ? 'calc(90dvh - 200px)' : 'calc(90dvh - 220px)' }}
              >
                <div className="divide-y divide-white/8">

                  {/* Description Section */}
                  {nft.description && (
                    <motion.div variants={itemVariants} className="p-3 md:p-4 space-y-1.5">
                      <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Description</p>
                      <p className="text-xs md:text-sm text-white/80 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all">
                        {nft.description}
                      </p>
                    </motion.div>
                  )}

                  {/* Details Section */}
                  <motion.div variants={itemVariants} className="p-3 md:p-4 space-y-2">
                    <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Details</p>
                    <div className="space-y-1.5">
                      {/* Creator */}
                      {nft.creator && (
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="bg-gradient-to-r from-white/6 to-white/3 border border-white/10 rounded-lg p-2.5 backdrop-blur group hover:border-white/20 transition-all duration-200"
                        >
                          <p className="text-xs text-white/50 font-semibold mb-0.5">Creator</p>
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-xs md:text-sm text-white/90 font-mono">{formatAddress(nft.creator)}</code>
                            <motion.button
                              onClick={() => copyToClipboard(nft.creator!, 'creator')}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 bg-white/8 group-hover:bg-white/15 rounded-lg transition-colors"
                            >
                              {copiedAddress === 'creator' ? (
                                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <CopyIcon className="w-3.5 h-3.5 text-white/60" />
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      {/* Owner */}
                      {nft.owner && (
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="bg-gradient-to-r from-white/6 to-white/3 border border-white/10 rounded-lg p-2.5 backdrop-blur group hover:border-white/20 transition-all duration-200"
                        >
                          <p className="text-xs text-white/50 font-semibold mb-0.5">Owner</p>
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-xs md:text-sm text-white/90 font-mono">{formatAddress(nft.owner)}</code>
                            <motion.button
                              onClick={() => copyToClipboard(nft.owner, 'owner')}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 bg-white/8 group-hover:bg-white/15 rounded-lg transition-colors"
                            >
                              {copiedAddress === 'owner' ? (
                                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <CopyIcon className="w-3.5 h-3.5 text-white/60" />
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      {/* Contract */}
                      {nft.contract && (
                        <motion.div
                          whileHover={{ x: 4 }}
                          className="bg-gradient-to-r from-white/6 to-white/3 border border-white/10 rounded-lg p-2.5 backdrop-blur group hover:border-white/20 transition-all duration-200"
                        >
                          <p className="text-xs text-white/50 font-semibold mb-0.5">Contract</p>
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-xs md:text-sm text-white/90 font-mono">{formatAddress(nft.contract)}</code>
                            <motion.button
                              onClick={() => nft.contract && copyToClipboard(nft.contract, 'contract')}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 bg-white/8 group-hover:bg-white/15 rounded-lg transition-colors"
                            >
                              {copiedAddress === 'contract' ? (
                                <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <CopyIcon className="w-3.5 h-3.5 text-white/60" />
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Attributes Section */}
                  {nft.attributes && nft.attributes.length > 0 && (
                    <motion.div variants={itemVariants} className="p-3 md:p-4 space-y-2">
                      <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Attributes</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                        {nft.attributes.slice(0, 6).map((attr, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ y: -2 }}
                            className="bg-gradient-to-br from-white/8 to-white/3 border border-white/12 rounded-lg p-2 text-center backdrop-blur hover:border-white/20 transition-all duration-200"
                          >
                            <p className="text-xs text-white/50 mb-0.5">{attr.trait_type}</p>
                            <p className="text-xs font-semibold text-white/90 truncate">{attr.value}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Footer - Price & Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10 border-t border-white/8 p-3 md:p-4 bg-white/3 backdrop-blur"
              >
                <div className={`${isMobile ? 'flex flex-col gap-2.5' : 'flex items-center justify-between gap-3'}`}>
                  {/* Price */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`${isMobile ? 'w-full' : ''}`}
                  >
                    <p className="text-xs text-white/50 font-semibold uppercase tracking-widest mb-1">Price</p>
                    <div className={`flex ${isMobile ? 'justify-center' : 'items-baseline'} gap-1.5`}>
                      <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {nft.priceInEth ? (nft.priceInEth < 0.01 ? nft.priceInEth.toFixed(6) : nft.priceInEth.toFixed(2)) : '0.10'}
                      </span>
                      <span className="text-sm md:text-base font-semibold text-white/70">POL</span>
                    </div>
                    {polPrice && (
                      <p className="text-xs text-white/40 mt-0.5">
                        ≈ {convertPOLToUSD(nft.priceInEth || 0.1)}
                      </p>
                    )}
                  </motion.div>

                  {/* Buy Button */}
                  <motion.button
                    onClick={handleBuyClick}
                    whileHover={{ scale: 1.08, boxShadow: '0 20px 50px rgba(168, 85, 247, 0.4)' }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative font-semibold rounded-lg transition-all duration-300 ${
                      isMobile
                        ? 'w-full py-2.5 text-sm'
                        : 'px-6 py-2.5 text-sm whitespace-nowrap'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #dc2626 100%)',
                    }}
                  >
                    <span className="text-white font-bold">Buy Now</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NFTDetailsModal;
