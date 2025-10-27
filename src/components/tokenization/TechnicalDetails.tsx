import { memo } from 'react';
import { motion } from 'framer-motion';

interface DetailCard {
  icon: string;
  title: string;
  description: string;
  badge: string;
}

const details: DetailCard[] = [
  {
    icon: '🌐',
    title: 'IPFS Storage',
    description: 'Your NFT data is stored on IPFS (InterPlanetary File System), a decentralized storage network. This ensures your content is permanent, immutable, and accessible even if any single server goes down.',
    badge: 'Decentralized'
  },
  {
    icon: '⚡',
    title: 'Polygon Network',
    description: 'Built on Polygon for low-cost, lightning-fast transactions. Your NFTs inherit Ethereum security while enjoying 100x lower fees. Fully compatible with any Ethereum-based dApp or marketplace.',
    badge: 'Layer 2'
  },
  {
    icon: '💰',
    title: 'Smart Contract Royalties',
    description: 'Royalties are programmed directly into your NFT smart contract. You automatically receive payments on every resale, forever. No middlemen, no delays—pure smart contract automation.',
    badge: 'Automated'
  },
  {
    icon: '🔒',
    title: 'True Ownership',
    description: 'You own your NFTs completely. Transfer to any wallet, sell on any marketplace, or hold indefinitely. Your private keys = your NFTs. No platform lock-in or censorship possible.',
    badge: 'Self-Custody'
  },
  {
    icon: '🔐',
    title: 'ERC-721 Standard',
    description: 'NFTs follow the ERC-721 standard, the most widely adopted NFT standard in Web3. This ensures maximum compatibility and future-proofing across all platforms and exchanges.',
    badge: 'Standard'
  },
  {
    icon: '⚙️',
    title: 'Batch Operations',
    description: 'Mint multiple NFTs in a single transaction to save on gas fees. Perfect for collections or bulk operations. Manage metadata, royalties, and whitelist settings efficiently.',
    badge: 'Efficient'
  }
];

function TechnicalDetails() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-2 sm:mb-2.5 md:mb-3 text-center"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
            🔧 Technical Details
          </h2>
          <p className="text-white/60 text-xs mt-0.5">
            Built on proven blockchain technology
          </p>
        </motion.div>

        {/* Grid Layout - 2x3 on all screens */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 flex-1 mb-2"
        >
          {details.map((detail, index) => (
            <motion.div key={index} variants={cardVariants}>
              <div className="group h-full rounded-lg border border-white/10 bg-gradient-to-br from-white/3 to-white/1 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/5 overflow-hidden">
                {/* Header */}
                <div className="p-2 sm:p-2.5 md:p-3">
                  {/* Icon & Badge */}
                  <div className="flex items-start justify-between mb-1 sm:mb-1.5">
                    <div className="text-xl sm:text-2xl md:text-3xl">{detail.icon}</div>
                    <span className="px-1 py-0.5 text-xs font-semibold bg-white/10 text-white/80 rounded-full group-hover:bg-white/20 transition-colors">
                      {detail.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base mb-0.5">
                    {detail.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/70 text-xs leading-tight line-clamp-3">
                    {detail.description}
                  </p>
                </div>

                {/* Bottom accent bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent origin-left"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Security Info */}
         <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-3 sm:mt-4 p-2 sm:p-2.5 rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-500/8 to-cyan-500/8 backdrop-blur-sm"
        >
          <p className="text-blue-200/80 text-xs sm:text-sm text-center leading-snug">
            💡 <span className="font-semibold">Pro Tip:</span> Ask to{' '}
            <a
              href="/chat"
              className="text-purple-400 font-bold text-base sm:text-lg underline hover:text-purple-500 transition-colors"
              style={{ fontSize: '1.1em' }}
            >
              Nuxbee AI
            </a>{' '}
            for more Info
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default memo(TechnicalDetails);