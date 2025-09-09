import AnimatedAILogo from '../../ui/AnimatedAILogo'

interface WelcomeScreenProps {
  onQuestionSelect: (question: string) => void
}

export default function WelcomeScreen({ onQuestionSelect }: WelcomeScreenProps) {
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
          <h2 className="text-xl font-semibold text-white mb-6">Quick questions to get started:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickQuestions.map((item, index) => (
              <button
                key={index}
                onClick={() => onQuestionSelect(item.question)}
                className="group p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 text-left"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-brand-purple-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/60 mt-1">
                      {item.question}
                    </p>
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