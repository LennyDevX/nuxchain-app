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
    icon: '⚡',
    title: 'Skill NFT System',
    description: 'Mint NFTs with up to 5 embedded staking-focused skills',
    badge: 'Gamified'
  },
  {
    icon: '📈',
    title: 'Stake Boost Skills',
    description: 'Three tiers of ROI boosters: Stake Boost I (+5%), II (+10%), III (+20%). Compound your staking rewards and unlock higher yields. Works with your POL staking position to amplify earnings.',
    badge: 'Staking'
  },
  {
    icon: '🔄',
    title: 'Auto Compound',
    description: 'Automatically reinvest staking rewards every 24 hours. Maximizes APY through compounding without manual intervention. One of the most valuable skills for long-term yield farming.',
    badge: 'Automated'
  },
  {
    icon: '🔓',
    title: 'Lock Reducer',
    description: 'Reduce lock-up time by 25%, gaining flexibility to withdraw sooner. Perfect for traders who need liquidity while still earning staking rewards. Balances yield with accessibility.',
    badge: 'Flexibility'
  },
  {
    icon: '💰',
    title: 'Fee Reducers',
    description: 'Two levels: Fee Reducer I reduces withdrawal fees by 10%, Fee Reducer II by 25%. Minimize costs when claiming rewards. Every percentage point saved compounds over time.',
    badge: 'Savings'
  },
  {
    icon: '🌐',
    title: 'IPFS Storage',
    description: 'Your NFT data and skills metadata are stored on IPFS (InterPlanetary File System), a decentralized storage network. This ensures your content is permanent, immutable, and accessible even if any single server goes down.',
    badge: 'Decentralized'
  },
  {
    icon: '🔷',
    title: 'Polygon Network',
    description: 'Built on Polygon for low-cost, lightning-fast transactions. Your NFTs inherit Ethereum security while enjoying 100x lower fees. Fully compatible with any Ethereum-based dApp or marketplace.',
    badge: 'Layer 2'
  },
  {
    icon: '💰',
    title: 'Smart Contract Royalties',
    description: 'Royalties are programmed directly into your NFT smart contract. You automatically receive payments on every resale, forever. No middlemen, no delays—pure smart contract automation. Works with both Standard and Skill NFTs.',
    badge: 'Automated'
  },
  {
    icon: '🔒',
    title: 'True Ownership',
    description: 'You own your NFTs and their skills completely. Transfer to any wallet, sell on any marketplace, or hold indefinitely. Your private keys = your NFTs. No platform lock-in or censorship possible. Skills are immutable.',
    badge: 'Self-Custody'
  },
  {
    icon: '🏆',
    title: 'POL Staking Integration',
    description: 'Skill NFT creation integrates with POL staking. Stake 200+ POL to unlock skill minting. First skill is FREE, additional skills cost POL based on rarity. Passive staking rewards without sacrificing liquidity.',
    badge: 'Integrated'
  },
  {
    icon: '🔐',
    title: 'ERC-721 Standard',
    description: 'NFTs follow the ERC-721 standard, the most widely adopted NFT standard in Web3. Skill data extends this with custom contract functions. Ensures maximum compatibility and future-proofing across all platforms and exchanges.',
    badge: 'Standard'
  },
  {
    icon: '⚙️',
    title: 'Batch Operations',
    description: 'Mint multiple NFTs in a single transaction to save on gas fees. Configure skills and metadata efficiently. Perfect for collections or bulk operations with granular skill control.',
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
      transition: { duration: 0.25, ease: 'easeOut' as const },
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
          <h2 className="jersey-15-regular text-3xl md:text-5xl font-bold text-white">
            🔧 Technical Details
          </h2>
          <p className="jersey-20-regular text-white/60 text-xl mt-0.5">
            Built on proven blockchain technology
          </p>
        </motion.div>

        {/* Grid Layout - Responsive 2-3 columns */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 flex-1 mb-2"
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
                  <h3 className="jersey-15-regular text-white font-semibold text-xl mb-0.5">
                    {detail.title}
                  </h3>

                  {/* Description */}
                  <p className="jersey-20-regular text-white/70 text-lg leading-tight line-clamp-3">
                    {detail.description}
                  </p>
                </div>

                {/* Bottom accent bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
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
          <p className="jersey-20-regular text-blue-200/80 text-lg text-center leading-snug">
            💡 <span className="font-semibold">Pro Tip:</span> Ask to{' '}
            <a
              href="/chat"
              className="jersey-20-regular text-purple-400 font-bold text-2xl underline hover:text-purple-500 transition-colors"
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