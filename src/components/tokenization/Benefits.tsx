import { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../hooks/mobile';
import { NFT_BENEFITS } from '../nfts/benefits';

function Benefits() {
  const allBenefits = NFT_BENEFITS;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // ✅ Detectar preferencia de reducción de animaciones
  const shouldReduceMotion = useReducedMotion();

  // 🎬 Batch animations optimization: only animate visible items
  // Show all items - browsers handle animation caching efficiently
  const visibleBenefits = useMemo(() => {
    return allBenefits;
  }, [allBenefits]);

  const benefits = visibleBenefits;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 12 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.35,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-transparent to-transparent">
      <div className="p-2.5 sm:p-3 md:p-4 flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
          className="mb-3 sm:mb-4 md:mb-5 text-center"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
            🌟 Why Create NFTs?
          </h2>
          <p className="text-white/50 text-xs sm:text-sm">
            Unlock the power of digital ownership and passive income
          </p>
        </motion.div>

        {/* Benefits Grid - Now a single column for better readability */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-0 flex-1 overflow-y-auto pr-2 scrollbar-hide"
        >
          <AnimatePresence mode="popLayout">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                layout
                className="group"
              >
                <motion.button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full text-left"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <motion.div 
                    className="relative rounded-lg border border-white/10 bg-gradient-to-r from-white/4 to-white/1 overflow-hidden transition-all duration-300"
                    animate={{
                      borderColor: expandedIndex === index ? `${getColorClass(benefit.color)}` : 'rgba(255, 255, 255, 0.1)',
                      backgroundColor: expandedIndex === index 
                        ? `rgba(168, 85, 247, 0.08)` 
                        : 'rgba(255, 255, 255, 0.02)',
                      boxShadow: expandedIndex === index 
                        ? '0 0 20px rgba(168, 85, 247, 0.15)' 
                        : '0 0 0px rgba(0, 0, 0, 0)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Header - Always Visible */}
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-start gap-3 sm:gap-3.5">
                      {/* Icon */}
                      <motion.span 
                        className="text-xl sm:text-2xl md:text-3xl flex-shrink-0 pt-0.5"
                        animate={{ scale: expandedIndex === index ? 1.15 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {benefit.icon}
                      </motion.span>

                      {/* Title & Short Description */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-sm sm:text-base md:text-lg leading-snug text-left">
                          {benefit.title}
                        </h3>
                        <p className="text-white/50 text-xs sm:text-sm mt-0.5">
                          {benefit.description}
                        </p>
                      </div>

                      {/* Chevron Icon */}
                      <motion.svg
                        animate={{ rotate: expandedIndex === index ? 180 : 0, scale: expandedIndex === index ? 1.2 : 1 }}
                        transition={{ duration: 0.35, type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0 pt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </div>

                    {/* Full Description - Expands Dynamically */}
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedIndex === index ? 'auto' : 0,
                        opacity: expandedIndex === index ? 1 : 0,
                      }}
                      transition={{
                        height: { duration: 0.35, type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.25, delay: expandedIndex === index ? 0.05 : 0 }
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
                          {benefit.fullDescription}
                        </p>

                        {/* Call to action */}
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.25 }}
                          className="mt-2.5 pt-2.5 border-t border-white/5"
                        >
                          <p className="text-purple-300 text-xs font-medium">
                            ✨ Ready to unlock this benefit? Start minting your NFTs today
                          </p>
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    {/* Animated bottom accent line */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500/0 via-purple-400/50 to-pink-400/0"
                      animate={{
                        scaleX: expandedIndex === index ? 1 : 0,
                        opacity: expandedIndex === index ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
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

// Helper function to get color class
function getColorClass(colorGradient: string): string {
  const colorMap: { [key: string]: string } = {
    'from-purple-500': 'rgba(168, 85, 247, 0.4)',
    'from-green-500': 'rgba(34, 197, 94, 0.4)',
    'from-blue-500': 'rgba(59, 130, 246, 0.4)',
    'from-orange-500': 'rgba(249, 115, 22, 0.4)',
    'from-yellow-500': 'rgba(234, 179, 8, 0.4)',
    'from-indigo-500': 'rgba(99, 102, 241, 0.4)',
  };
  
  const color = colorGradient.split(' ')[0];
  return colorMap[color] || 'rgba(168, 85, 247, 0.4)';
}

export default memo(Benefits);