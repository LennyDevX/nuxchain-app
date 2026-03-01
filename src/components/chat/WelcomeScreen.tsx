import AnimatedAILogo from '../../ui/AnimatedAILogo'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { getMobileOptimizationConfig } from '../../utils/mobile/performanceOptimization'
import { motion } from 'framer-motion'

interface WelcomeScreenProps {
  onQuestionSelect: (question: string) => void
}

export default function WelcomeScreen({ onQuestionSelect }: WelcomeScreenProps) {
  const isMobile = useIsMobile()
  const optimizationConfig = getMobileOptimizationConfig()
  
  const quickQuestions = [
    {
      icon: "🚀",
      title: "What is Nuxchain?",
      question: "What is Nuxchain and what are its main features?"
    },
    {
      icon: "💰",
      title: "Smart Staking",
      question: "How does the Smart Staking system work in Nuxchain?"
    },
    {
      icon: "🎨",
      title: "NFT Marketplace",
      question: "How can I buy and sell NFTs on the Nuxchain marketplace?"
    },
    {
      icon: "🎁",
      title: "Airdrops",
      question: "How can I participate in Nuxchain airdrops?"
    }
  ]

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-8">
      <div className="max-w-2xl w-full text-center">
        {/* Welcome Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.1
          }}
        >
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.2
            }}
          >
            <AnimatedAILogo size="large" className="w-24 h-24" />
          </motion.div>
          <motion.p 
            className="jersey-20-regular text-white/70 text-lg md:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Your specialized assistant for blockchain, cryptocurrencies, NFTs and DeFi
          </motion.p>
        </motion.div>

        {/* Quick Questions */}
        <div className="mb-8">
          <motion.h2 
            className={`jersey-15-regular text-white mb-6 ${
              isMobile ? 'text-xl' : 'text-2xl md:text-3xl'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Quick questions to get started:
          </motion.h2>
          <motion.div
            className={`grid gap-3 ${
              isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 gap-4'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.08, delayChildren: 0.3 }}
          >
            {quickQuestions.map((item, index) => (
              <motion.button
                key={index}
                onClick={() => onQuestionSelect(item.question)}
                className={`group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-left active:scale-95 ${
                  optimizationConfig.reduceAnimations 
                    ? 'transition-colors duration-150' 
                    : 'transition-all duration-200'
                } ${
                  isMobile ? 'p-3' : 'p-4'
                }`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: index * 0.08
                }}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: "rgba(255, 255, 255, 0.08)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className={`flex items-start ${
                    isMobile ? 'flex-col space-y-2 justify-center' : 'space-x-3'
                  }`}
                  layout
                >
                  <motion.span 
                    className={`${
                      isMobile ? 'text-2xl mx-auto' : 'text-3xl flex-shrink-0'
                    }`}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  >
                    {item.icon}
                  </motion.span>
                  <div className={isMobile ? 'text-center w-full' : ''}>
                    <motion.h3 
                      className={`jersey-15-regular text-white group-hover:text-brand-purple-300 transition-colors ${
                        isMobile ? 'text-base' : 'text-lg md:text-xl'
                      }`}
                      animate={{ opacity: [0.9, 1, 0.9] }}
                      transition={{ 
                        duration: 2.5,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    >
                      {item.title}
                    </motion.h3>
                    {!isMobile && (
                      <motion.p 
                        className="jersey-20-regular text-base text-white/60 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        {item.question}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div 
          className="text-white/50 jersey-20-regular text-base md:text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p>💡 You can also ask any question about blockchain, DeFi, NFTs or cryptocurrencies</p>
        </motion.div>
      </div>
    </div>
  )
}