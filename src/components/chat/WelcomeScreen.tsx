import AnimatedAILogo from '../../ui/AnimatedAILogo'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { getMobileOptimizationConfig } from '../../utils/mobile/performanceOptimization'

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
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <AnimatedAILogo size="large" className="w-24 h-24" />
          </div>
          <p className="text-white/70 text-lg">
            Your specialized assistant for blockchain, cryptocurrencies, NFTs and DeFi
          </p>
        </div>

        {/* Quick Questions */}
        <div className="mb-8">
          <h2 className={`font-semibold text-white mb-6 ${
            isMobile ? 'text-lg' : 'text-xl'
          }`}>Quick questions to get started:</h2>
          <div className={`grid gap-3 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 gap-4'
          }`}>
            {quickQuestions.map((item, index) => (
              <button
                key={index}
                onClick={() => onQuestionSelect(item.question)}
                className={`group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-left ${
                  optimizationConfig.reduceAnimations 
                    ? 'transition-colors duration-150' 
                    : 'transition-all duration-200'
                } ${
                  isMobile ? 'p-3' : 'p-4'
                }`}
              >
                <div className={`flex items-start ${
                  isMobile ? 'flex-col space-y-2' : 'space-x-3'
                }`}>
                  <span className={`${
                    isMobile ? 'text-xl self-center' : 'text-2xl'
                  }`}>{item.icon}</span>
                  <div className={isMobile ? 'text-center' : ''}>
                    <h3 className={`font-medium text-white group-hover:text-brand-purple-300 transition-colors ${
                      isMobile ? 'text-sm' : 'text-base'
                    }`}>
                      {item.title}
                    </h3>
                    {!isMobile && (
                      <p className="text-sm text-white/60 mt-1">
                        {item.question}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-white/50 text-sm">
          <p>💡 You can also ask any question about blockchain, DeFi, NFTs or cryptocurrencies</p>
        </div>
      </div>
    </div>
  )
}