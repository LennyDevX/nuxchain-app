import { motion } from 'framer-motion'

interface WelcomeScreenProps {
  onQuestionSelect: (question: string) => void
}

// Module-level constant — avoids new array allocation on every render
const quickQuestions = [
  {
    icon: "📈",
    title: "Staking APY",
    description: "Smart Staking",
    question: "How does the Smart Staking compound logic work?"
  },
  {
    icon: "🪙",
    title: "NUX Token",
    description: "Distribution",
    question: "Explain the NUX token distribution and total supply"
  },
  {
    icon: "🖼️",
    title: "Skills NFTs",
    description: "NFT Benefits",
    question: "What are the benefits of Staking Skills vs Active Skills NFTs?"
  },
  {
    icon: "🚀",
    title: "Launchpad",
    description: "Whitelist",
    question: "How do I get on the whitelist for the NUX Token Launchpad?"
  },
  {
    icon: "💼",
    title: "Marketplace",
    description: "NFT Trading",
    question: "Show me active NFT listings and floor prices on the marketplace"
  },
  {
    icon: "⚠️",
    title: "Risk Analysis",
    description: "Portfolio Risk",
    question: "Analyze the risks in my portfolio and provide recommendations"
  },
  {
    icon: "🔍",
    title: "Market Alpha",
    description: "Trading Trends",
    question: "What are the latest market trends and trading opportunities?"
  },
  {
    icon: "🪙",
    title: "Token Research",
    description: "Token Analysis",
    question: "Research a specific token and tell me about its fundamentals"
  },
  {
    icon: "💧",
    title: "Liquidity",
    description: "LP Strategies",
    question: "How do I provide liquidity on Uniswap and optimize returns?"
  }
]

export default function WelcomeScreen({ onQuestionSelect }: WelcomeScreenProps) {

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 gap-6 pb-4">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="text-center space-y-4 mb-2"
      >
        <h1 className="text-6xl md:text-[5.5rem]  tracking-tight text-white leading-[1.1]">
          Hello, User
        </h1>
        <h2 className="text-4xl md:text-6xl  text-gradient tracking-tight text-white/90 leading-tight">
          How can I help you today?
        </h2>
      </motion.div>

      {/* Quick suggestion grid — 2x2 (4 items) on mobile, 4 items horizontal/centered on desktop */}
      <div className="w-full flex flex-col items-center">
        {/* Mobile: Show only first 4 cards in 2x2 grid */}
        <div className="grid grid-cols-2 gap-2 w-full md:hidden max-w-sm mx-auto">
          {quickQuestions.slice(0, 4).map((item, index) => (
            <motion.button
              key={index}
              onClick={() => onQuestionSelect(item.question)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.10] active:bg-white/[0.14] border border-white/[0.1] transition-all text-white/90 hover:text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index + 0.15, duration: 0.28, ease: 'easeOut' }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 flex-shrink-0 text-xl">
                {item.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className=" text-sm tracking-tight truncate">{item.title}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Desktop: Centered row with 4 items, larger text, minimal container */}
        <div className="hidden md:flex flex-wrap justify-center gap-3 w-full max-w-5xl">
          {quickQuestions.slice(0, 4).map((item, index) => (
            <motion.button
              key={index}
              onClick={() => onQuestionSelect(item.question)}
              className="flex items-center gap-3.5 px-5 py-3 rounded-full bg-black/40 hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.12] transition-all text-white/95 hover:text-white group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index + 0.15, duration: 0.28, ease: 'easeOut' }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 flex-shrink-0 text-2xl group-hover:bg-white/10 transition-colors shadow-lg">
                {item.icon}
              </div>
              <div className="flex flex-col pr-2">
                <span className=" text-lg tracking-tight leading-none mb-1">{item.title}</span>
                <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">{item.description}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}