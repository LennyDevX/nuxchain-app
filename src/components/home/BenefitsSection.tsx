import { motion } from 'framer-motion'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import React from 'react'

interface EcosystemCard {
  title: string
  shortTitle: string
  description: string
  icon: React.ReactNode
  gradient: string
  accentColor: string
}

const ecosystemCards: EcosystemCard[] = [
  {
    title: 'Nuxchain Protocols',
    shortTitle: 'Protocols',
    description: 'Smart contracts and protocols that power staking, tokenization and decentralized markets',
    icon: (
      <svg className="w-6 h-6 text-blue-400/60 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-blue-500/20 to-cyan-500/20',
    accentColor: 'bg-blue-500/30'
  },
  {
    title: 'NFTs 2.0',
    shortTitle: 'NFTs',
    description: 'Exclusive NFT ecosystem with real utilities, no FOMO or liquidity losses',
    icon: (
      <svg className="w-6 h-6 text-purple-400/60 group-hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    gradient: 'from-purple-500/20 to-pink-500/20',
    accentColor: 'bg-purple-500/30'
  },
  {
    title: 'Nux-Chain',
    shortTitle: 'Blockchain',
    description: 'Built on Polygon and Solana for maximum compatibility and sustainability',
    icon: (
      <svg className="w-6 h-6 text-orange-400/60 group-hover:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: 'from-orange-500/20 to-red-500/20',
    accentColor: 'bg-orange-500/30'
  },
  {
    title: 'Nux-AI',
    shortTitle: 'AI',
    description: 'AI hub with intelligent tools that optimize every aspect of your experience',
    icon: (
      <svg className="w-6 h-6 text-emerald-400/60 group-hover:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    gradient: 'from-emerald-500/20 to-teal-500/20',
    accentColor: 'bg-emerald-500/30'
  },
  {
    title: 'Nuxchain Labs',
    shortTitle: 'Labs',
    description: 'Collaborative R&D laboratory to develop innovative ideas in Web3',
    icon: (
      <svg className="w-6 h-6 text-indigo-400/60 group-hover:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    gradient: 'from-indigo-500/20 to-blue-500/20',
    accentColor: 'bg-indigo-500/30'
  },
  {
    title: 'Nux-Vault',
    shortTitle: 'Vault',
    description: 'Advanced treasury system for investment strategies and secure diversification',
    icon: (
      <svg className="w-6 h-6 text-rose-400/60 group-hover:text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    gradient: 'from-rose-500/20 to-orange-500/20',
    accentColor: 'bg-rose-500/30'
  }
]

function BenefitsSection() {
  const isMobile = useIsMobile()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  return (
    <section className={`${isMobile ? 'py-12' : 'py-24'} relative z-10 overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className={`text-center ${isMobile ? 'mb-10' : 'mb-20'}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm">
            <span className="text-sm font-medium text-white/80">Complete Ecosystem</span>
          </div>
          <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold text-white mb-4 leading-tight`}>
            Nuxchain <span className="text-gradient">Ecosystem</span>
          </h2>
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-white/70 max-w-3xl mx-auto leading-relaxed`}>
            Innovative components designed to revolutionize the Web3 experience and power your DeFi strategy
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {ecosystemCards.map((card, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`card-unified group relative h-full overflow-hidden ${isMobile ? 'p-5' : 'p-7'}`}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full">
                {/* Icon Container */}
                <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 group-hover:bg-white/15 group-hover:scale-110 transition-all duration-300 text-white/80 group-hover:text-white">
                  {card.icon}
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-white mb-2.5 group-hover:text-white transition-colors`}>
                    {isMobile ? card.shortTitle : card.title}
                  </h3>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-white/70 leading-relaxed group-hover:text-white/80 transition-colors`}>
                    {card.description}
                  </p>
                </div>

                {/* Bottom Accent Line */}
                <div className="mt-5 pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                  <div className={`h-0.5 w-0 group-hover:w-8 bg-gradient-to-r ${card.gradient} transition-all duration-300`}></div>
                </div>
              </div>

              {/* Subtle Glow Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-50 blur-xl bg-white/5 pointer-events-none transition-opacity duration-300 rounded-xl"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default BenefitsSection
