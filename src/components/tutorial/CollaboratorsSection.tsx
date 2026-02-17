import { motion } from 'framer-motion'

function CollaboratorsSection() {

  const roles = [
    {
      title: 'Community Moderator',
      emoji: '🛡️',
      rewards: [
        'Monthly POL tokens',
        'Builder NFT (access all features)',
        'Private channel access',
        'Verified badge'
      ],
      requirements: ['Gold level', 'Moderation exp.', '10h/week'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Brand Ambassador',
      emoji: '📣',
      rewards: [
        '2% revenue share',
        'Ambassador NFT (exclusive perks)',
        'Merchandise & swag',
        'Early access'
      ],
      requirements: ['Social presence', 'Content creation', 'Web3 passion'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Technical Validator',
      emoji: '⚙️',
      rewards: [
        'Validation rewards',
        'Validator NFT (governance)',
        'Infrastructure access',
        'Tech support priority'
      ],
      requirements: ['Tech knowledge', 'Own infra', '5K POL min'],
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'Content Creator',
      emoji: '🎬',
      rewards: [
        'Payment per content',
        'Creator NFT (monetization)',
        'Featured placement',
        'Collaborations'
      ],
      requirements: ['Content portfolio', 'High quality', 'NFT knowledge'],
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const nftBenefits = [
    { 
      title: 'Builder NFT Program',
      desc: 'Own your role with exclusive NFTs',
      features: ['Unlock program features', 'Governance rights', 'Revenue sharing', 'Transferable rewards']
    },
    { 
      title: 'NFT Utilities',
      desc: 'Maximize your earnings',
      features: ['Reward multipliers', 'Exclusive perks', 'Community status', 'Early access']
    },
    { 
      title: 'Income Streams',
      desc: 'Diversify your Web3 earnings',
      features: ['Token rewards', 'NFT royalties', 'Revenue share', 'Bonus programs']
    },
    { 
      title: 'Growth Path',
      desc: 'Level up as Builder',
      features: ['Tier progression', 'Skill development', 'Leadership roles', 'Equity potential']
    }
  ]

  return (
    <section className="w-full relative py-8 md:py-16 lg:py-24 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
            <span className="text-xl">🎫</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Builder NFT Program</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 md:mb-4">
            Build Nuxchain, <span className="text-gradient">Own Your Role</span>
          </h2>

          <p className="text-sm md:text-base max-w-3xl mx-auto leading-relaxed mb-2">
            Purchase a <span className="font-bold text-purple-300">Builder NFT</span> to unlock exclusive access to our Collaborators Program. Get compensated in POL tokens, earn revenue shares, and grow your Web3 career with verified marketplace rewards.
          </p>
          <p className="text-xs md:text-sm text-purple-400 font-semibold">Every Builder NFT grants entry to one of these exclusive roles with real income potential.</p>
        </motion.div>

        {/* Roles Grid - Compact & Transparent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12 lg:mb-16">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02, y: -4 }}
              className="builders-card group"
            >
              {/* Icon & Title */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    {role.emoji}
                  </div>
                  <h3 className="text-lg font-bold text-white">{role.title}</h3>
                </div>
              </div>

              {/* Compact Rewards & Requirements */}
              <div className="space-y-3 text-sm">
                {/* Rewards */}
                <div>
                  <p className="text-xs font-bold text-purple-300 mb-2 uppercase tracking-widest">Rewards</p>
                  <ul className="space-y-1">
                    {role.rewards.map((reward, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-300 text-xs">
                        <span className="text-purple-400 font-bold">✦</span>
                        {reward}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Requirements</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.requirements.map((req, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-md text-xs text-gray-300 font-medium hover:bg-purple-900/40 transition-colors"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>


        {/* NFT Benefits - Grid 2x2 with CTA */}
        <div className="relative z-10 p-0 mb-8 md:mb-16 lg:mb-20">
          <div className="flex flex-col lg:flex-row gap-8 md:gap-12 lg:gap-20 items-center">
            {/* Left side - Title & Grid 2x2 */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <div className="flex items-center gap-2 mb-6 md:mb-8">
                <span className="text-3xl md:text-4xl">🎫</span>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">
                  Why Own a <span className="text-gradient">Builder NFT?</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4 w-full lg:w-fit">
                {nftBenefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ y: -4 }}
                    className="nft-benefit-card"
                  >
                    <h4 className="font-bold text-purple-300 text-sm md:text-base mb-1 md:mb-2">{benefit.title}</h4>
                    <p className="text-gray-300 text-xs mb-2 md:mb-3 leading-relaxed">{benefit.desc}</p>
                    <ul className="space-y-1">
                      {benefit.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-purple-400 flex-shrink-0 mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right side - CTA Buttons */}
            <div className="flex flex-col justify-center items-center gap-6 md:gap-8 flex-1 lg:flex-initial lg:w-96">
              <div className="space-y-3 md:space-y-4 text-center">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">Ready to Join the Builders?</h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">Purchase your Builder NFT on our marketplace and start earning real income. Get verified, access exclusive features, and grow with Nuxchain.</p>
              </div>
              
              <div className="flex flex-col gap-3 md:gap-4 w-full">
                <button
                  disabled
                  className="px-6 py-3 md:px-10 md:py-4 bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-white font-bold rounded-xl cursor-not-allowed opacity-60 whitespace-nowrap text-center text-base md:text-lg min-h-[44px]"
                >
                  🎫 Builder NFTs Coming Soon
                </button>
              </div>
              
              <p className="text-gray-500 text-xs uppercase tracking-widest font-bold text-center leading-relaxed">
                Available soon on marketplace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CollaboratorsSection
