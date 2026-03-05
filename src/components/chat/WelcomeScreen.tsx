import { motion } from 'framer-motion'

interface WelcomeScreenProps {
  onQuestionSelect: (question: string) => void
}

export default function WelcomeScreen({ onQuestionSelect }: WelcomeScreenProps) {
  
  const quickQuestions = [
    {
      icon: "📈",
      title: "Staking APY",
      question: "How does the Smart Staking compound logic work?"
    },
    {
      icon: "🪙",
      title: "NUX Token",
      question: "Explain the NUX token distribution and total supply"
    },
    {
      icon: "🖼️",
      title: "Skills NFTs",
      question: "What are the benefits of Staking Skills vs Active Skills NFTs?"
    },
    {
      icon: "🚀",
      title: "Launchpad",
      question: "How do I get on the whitelist for the NUX Token Launchpad?"
    }
  ]

  return (
    <div className="flex flex-col items-center justify-center w-full mt-4 md:mt-10">
      <div className="max-w-3xl w-full">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-semibold leading-tight text-gradient tracking-tight jersey-15-regular">
            Hello, User
          </h1>
          <h2 className="text-4xl md:text-6xl font-semibold leading-tight text-white tracking-tight jersey-15-regular">
            How can I help you today?
          </h2>
        </motion.div>

        <div className="flex flex-wrap gap-2 mt-4">
          {quickQuestions.map((item, index) => (
            <motion.button
              key={index}
              onClick={() => onQuestionSelect(item.question)}
              className="bg-[#1e1e24] hover:bg-[#2a2a32] text-white/80 hover:text-white rounded-3xl px-4 py-2.5 flex items-center gap-2 transition-colors border border-white/5 shadow-sm text-[14px] font-medium jersey-20-regular"
              whileHover={{ y: -1 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
            >
              <span className="text-3xl leading-none">
                {item.icon}
              </span>
              <span>
                {item.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}