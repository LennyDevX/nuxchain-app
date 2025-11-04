import { memo, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/mobile';

interface FAQItem {
  icon: string;
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    icon: '⚡',
    question: 'What are Skill NFTs?',
    answer: 'Skill NFTs are special NFTs with built-in staking abilities and power-ups. Instead of just being static digital art, they have actual skills that boost your staking rewards, automate compounding, reduce lock times, or minimize withdrawal fees. These skills make your NFTs more valuable and exponentially increase staking yields.',
    category: 'Skills'
  },
  {
    icon: '🎯',
    question: 'How do Skills work?',
    answer: 'Each Skill NFT can have up to 5 different skills from 7 types: 📈 Stake Boost I/II/III (+5/+10/+20% ROI), 🔄 Auto Compound (reinvests rewards every 24h), � Lock Reducer (-25% lock time), 💰 Fee Reducer I (-10% withdrawal fee), or 💸 Fee Reducer II (-25% withdrawal fee). Each skill has an Effect Value (1-100) and Rarity (1★-5★). You need minimum 200 POL staked to create Skill NFTs.',
    category: 'Skills'
  },
  {
    icon: '💵',
    question: 'What does it cost to add Skills?',
    answer: 'First skill is FREE! Additional skills cost POL tokens based on rarity: Common (1★) = 25 POL, Uncommon (2★) = 40 POL, Rare (3★) = 60 POL, Epic (4★) = 80 POL, Legendary (5★) = 100 POL. Example: NFT with 3 skills (first free + 2 paid) = ~90 POL total. Costs are paid from your staked POL balance.',
    category: 'Skills'
  },
  {
    icon: '📈',
    question: 'Do Skills increase NFT value?',
    answer: 'Absolutely! Skill NFTs are worth significantly more than standard NFTs. The more skills and higher rarities you add, the more valuable your NFT becomes. Buyers specifically seek out Skill NFTs for their utility and rarity. Your resale potential increases dramatically.',
    category: 'Skills'
  },
  {
    icon: '🏆',
    question: 'Can I change Skills after minting?',
    answer: 'No, skills are immutable once minted. This ensures authenticity and prevents manipulation. Always configure your skills carefully before minting. You can always mint new NFTs with different skill combinations, but you cannot modify skills on existing NFTs.',
    category: 'Skills'
  },
  {
    icon: '⏳',
    question: 'Why does my NFT show "Unknown" initially?',
    answer: 'This is completely normal! IPFS (decentralized storage) needs a few moments to fetch and cache metadata from the network. Your NFT is safely stored on the blockchain, and the image will appear within 2-5 minutes. You can refresh to check sooner.',
    category: 'NFT Display'
  },
  {
    icon: '🔒',
    question: 'Can I edit my NFT after creation?',
    answer: 'NFTs are immutable once created—this is by design and ensures authenticity and prevents fraud. This is what makes NFTs valuable and trustworthy. Always double-check all details (name, description, image, royalties, skills) before minting.',
    category: 'NFT Properties'
  },
  {
    icon: '🌐',
    question: 'What if IPFS goes down? Will I lose my NFT?',
    answer: 'No, your NFT is safe. IPFS is decentralized with thousands of independent nodes worldwide. Even if one node fails, your content is replicated across multiple nodes. Additionally, the blockchain stores your NFT permanently regardless of storage status.',
    category: 'Security'
  },
  {
    icon: '💰',
    question: 'How do royalties work?',
    answer: 'Set a royalty percentage (0-10%) during creation. Every time your NFT is resold, you automatically receive that percentage of the sale price. Royalties are enforced by the smart contract, so you earn passively on all future sales forever. Works with both Standard and Skill NFTs.',
    category: 'Monetization'
  },
  {
    icon: '🔷',
    question: 'Why use Polygon instead of Ethereum?',
    answer: 'Polygon offers the same security as Ethereum but with 100x lower gas fees and 10x faster transactions. Your NFTs are 100% Ethereum-compatible and tradeable on any marketplace supporting Polygon. Perfect for creators who want to minimize costs, especially when adding Skills.',
    category: 'Blockchain'
  },
  {
    icon: '🔑',
    question: 'Can I transfer my NFT to another wallet?',
    answer: 'Yes! You have full ownership of both Standard and Skill NFTs. Transfer to any Ethereum-compatible wallet, sell on any marketplace supporting Polygon, or hold indefinitely. You control your NFTs completely—no platform lock-in. Skills transfer with the NFT.',
    category: 'Ownership'
  }
];

function FAQ() {
  const allFaqItems = faqItems;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  // ✅ Detectar preferencia de reducción de animaciones
  const shouldReduceMotion = useReducedMotion();

  // 🎬 Batch animations optimization: render all items
  // Browsers handle animation caching efficiently
  const visibleFaqItems = useMemo(() => {
    return allFaqItems;
  }, [allFaqItems]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : -8 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3 },
    },
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-transparent to-transparent">
      <div className="p-2.5 sm:p-3 md:p-4 flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-3 sm:mb-4 md:mb-5 text-center"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
        ❓ Frequently Asked Questions
          </h2>
          <p className="text-white/50 text-xs sm:text-sm">
        Everything you need to know about NFT creation
          </p>
        </motion.div>

        {/* FAQ Accordion - Single Column */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-0 flex-1 overflow-y-auto pr-2 scrollbar-hide"
        >
          {visibleFaqItems.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="group"
        >
          <motion.button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full text-left"
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <motion.div 
          className="relative rounded-lg border border-white/10 bg-gradient-to-r from-white/5 to-white/2 overflow-hidden transition-all duration-300"
          animate={{
                    borderColor: openIndex === index ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: openIndex === index 
                      ? 'rgba(168, 85, 247, 0.08)' 
                      : 'rgba(255, 255, 255, 0.02)',
                    boxShadow: openIndex === index 
                      ? '0 0 20px rgba(168, 85, 247, 0.15)' 
                      : '0 0 0px rgba(0, 0, 0, 0)'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header - Compact */}
                  <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-3.5">
                    {/* Icon */}
                    <motion.span 
                      className="text-lg sm:text-xl md:text-2xl flex-shrink-0"
                      animate={{ scale: openIndex === index ? 1.1 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.icon}
                    </motion.span>

                    {/* Question & Category */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm sm:text-base leading-snug text-left">
                        {item.question}
                      </h3>
                      <motion.p 
                        className="text-white/40 text-xs mt-0.5"
                        animate={{ opacity: openIndex === index ? 0.5 : 0.4 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.category}
                      </motion.p>
                    </div>

                    {/* Chevron Icon */}
                    <motion.svg
                      animate={{ rotate: openIndex === index ? 180 : 0, scale: openIndex === index ? 1.15 : 1 }}
                      transition={{ duration: 0.35, type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>

                  {/* Answer - Dynamic Content */}
                  <motion.div
                    initial={false}
                    animate={{
                      height: openIndex === index ? 'auto' : 0,
                      opacity: openIndex === index ? 1 : 0,
                    }}
                    transition={{
                      height: { duration: 0.35, type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.25, delay: openIndex === index ? 0.05 : 0 }
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div 
                      className="px-3 sm:px-4 pb-3 sm:pb-3.5 border-t border-white/5 pt-2.5 sm:pt-3"
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  </motion.div>

                  {/* Animated bottom accent line */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/0 via-purple-400/50 to-pink-400/0"
                    animate={{
                      scaleX: openIndex === index ? 1 : 0,
                      opacity: openIndex === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Banner */}
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

export default memo(FAQ);