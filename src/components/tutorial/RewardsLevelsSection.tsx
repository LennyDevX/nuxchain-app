import { motion } from 'framer-motion'

function RewardsLevelsSection() {

  const levels = [
    {
      level: 'Bronze',
      icon: '🥉',
      minStake: '100 POL',
      benefits: ['5% Fee discount', 'Access to basic airdrops', 'Profile badge'],
      gradient: 'from-amber-700 via-amber-600 to-amber-500'
    },
    {
      level: 'Silver',
      icon: '🥈',
      minStake: '500 POL',
      benefits: ['10% Fee discount', 'Premium airdrops', 'Listing priority', 'Exclusive chat'],
      gradient: 'from-gray-400 via-gray-300 to-gray-200'
    },
    {
      level: 'Gold',
      icon: '🥇',
      minStake: '2,000 POL',
      benefits: ['20% Fee discount', 'VIP airdrops', 'Featured NFTs', 'Priority support', 'Governance voting'],
      gradient: 'from-yellow-600 via-yellow-400 to-yellow-300'
    },
    {
      level: 'Diamond',
      icon: '💎',
      minStake: '10,000 POL',
      benefits: ['30% Fee discount', 'All airdrops', 'Featured marketplace', 'Beta features access', 'Moderator eligible', 'Revenue share'],
      gradient: 'from-cyan-400 via-blue-400 to-purple-500'
    }
  ]

  return (
    <section className="w-full relative py-12 lg:py-24 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header content centered and professional */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-400/10 border border-red-500/30 mb-6">
            <span className="text-xl">🏆</span>
            <span className="text-xs font-black uppercase tracking-widest text-red-100">STAKING TIERS</span>
          </div>

          <h2 className="text-4xl lg:text-7xl font-black text-white leading-tight mb-8">
            Unlock <span className="text-gradient">Premium Benefits</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            The more POL tokens you stake, the higher your status. Scale through our ecosystem tiers to unlock deeper rewards and utility.
          </p>
        </motion.div>

        {/* Levels Grid - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {levels.map((tier, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative h-full"
            >
              {/* Card Container */}
              <div className="relative bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 h-full flex flex-col items-center text-center transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] overflow-hidden min-h-[48px]">
                
                {/* Visual Accent */}
                <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${tier.gradient}`} />
                
                {/* Tier Icon/Emoji */}
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl border border-white/5">
                  {tier.icon}
                </div>

                {/* Tier Name */}
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{tier.level}</h3>
                
                {/* Min Stake Required */}
                <div className="mb-8">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Minimum Stake</p>
                  <p className={`text-xl font-bold bg-gradient-to-r ${tier.gradient} text-transparent bg-clip-text`}>
                    {tier.minStake}
                  </p>
                </div>

                {/* Benefits List */}
                <ul className="w-full space-y-3 pt-8 border-t border-white/5 flex-1">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-left text-sm text-gray-400">
                      <span className="text-white/40 font-bold">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Subtle Backdrop Glow */}
                <div className={`absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-r ${tier.gradient} blur-[120px] opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tip info below */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-3 py-4 px-8 bg-blue-500/5 border border-blue-500/10 rounded-2xl w-fit mx-auto"
        >
          <span className="text-lg">💡</span>
          <p className="text-gray-400 text-sm italic">
            <span className="text-blue-400 font-bold">Pro Tip:</span> Tiers are cumulative. Higher levels include all benefits from previous ones.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default RewardsLevelsSection
