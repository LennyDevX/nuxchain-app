import { motion } from 'framer-motion'
import { ResponsiveImage } from '../ui/ResponsiveImage'

function ComparisonSection() {

  const platforms = [
    {
      name: 'Nuxchain',
      logo: '/NuxchainLogo.jpg',
      highlight: true,
      features: {
        fees: '< $0.01',
        speed: '~2 sec',
        royalties: 'Up to 10%',
        staking: '✓ 15% APY',
        airdrops: '✓ Frequent',
        levels: '✓ 4 levels',
        blockchain: 'Polygon',
        support: '24/7'
      }
    },
    {
      name: 'OpenSea',
      logo: '/OpenSeaLogo.jpg',
      highlight: false,
      features: {
        fees: '$5-20',
        speed: '~15 sec',
        royalties: 'Up to 10%',
        staking: '✗',
        airdrops: '✗',
        levels: '✗',
        blockchain: 'Ethereum',
        support: 'Email'
      }
    },
    {
      name: 'Rarible',
      logo: '/RaribleLogo.jpg',
      highlight: false,
      features: {
        fees: '$3-15',
        speed: '~10 sec',
        royalties: 'Up to 50%',
        staking: '✓ Variable',
        airdrops: '✗',
        levels: '✗',
        blockchain: 'Multi-chain',
        support: 'Ticket'
      }
    }
  ]

  const advantages = [
    {
      icon: '⚡',
      title: 'Ultra Fast',
      desc: 'Transactions in 2 seconds vs 10-15 sec from competitors'
    },
    {
      icon: '💰',
      title: 'Minimal Fees',
      desc: 'Less than $0.01 per mint vs $5-20 on Ethereum'
    },
    {
      icon: '🎁',
      title: 'Extra Rewards',
      desc: 'Unique system of staking, airdrops and benefit levels'
    },
    {
      icon: '🛡️',
      title: 'Web3 Security',
      desc: 'Audited smart contracts on Polygon, proven and secure network'
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4 md:mb-6">
            <span className="text-xl">⚖️</span>
            <span className="text-xs font-black uppercase tracking-widest text-blue-400">Competitive Edge</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 md:mb-6">
            Nuxchain vs <span className="text-gradient">Marketplaces</span>
          </h2>

          <p className="text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover why Nuxchain is the smartest choice for creators and traders who value speed, low fees, and real rewards.
          </p>
        </motion.div>

        {/* Comparison Table - Responsive: Mobile Table / Desktop Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 md:mb-12 lg:mb-16"
        >
          {/* Mobile Optimized Comparison Table */}
          <div className="block md:hidden">
            <motion.div
              className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-purple-500/30 rounded-2xl p-5 backdrop-blur-sm overflow-hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Mobile Table Header with Platform Logos */}
              <div className="mb-6">
                <div className="flex justify-between items-end gap-2">
                  <div className="flex-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Features</div>
                  {platforms.map((platform, idx) => (
                    <div key={idx} className="text-center flex-1">
                      {platform.highlight && (
                        <div className="text-[10px] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full mb-2 whitespace-nowrap inline-block">
                          ⭐ Best
                        </div>
                      )}
                      <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 overflow-hidden">
                        {typeof platform.logo === 'string' && platform.logo.startsWith('/') ? (
                          <ResponsiveImage
                            src={platform.logo}
                            alt={platform.name}
                            className="w-full h-full rounded-full object-cover"
                            mobileSize="w-12 h-12"
                          />
                        ) : (
                          <div className="text-xl">{platform.logo}</div>
                        )}
                      </div>
                      <div className="text-xs font-bold text-white">{platform.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Table Rows */}
              <div className="space-y-3 border-t border-gray-700/30 pt-4">
                {Object.keys(platforms[0].features).map((featureKey) => (
                  <div key={featureKey} className="grid grid-cols-4 gap-2 items-center py-3 border-b border-gray-700/20 last:border-b-0">
                    <div className="col-span-1 text-xs font-semibold text-gray-300 capitalize">
                      {featureKey.replace('_', ' ')}
                    </div>
                    {platforms.map((platform, idx) => {
                      const value = platform.features[featureKey as keyof typeof platform.features]
                      return (
                        <div
                          key={idx}
                          className={`col-span-1 text-xs font-bold text-center px-2 py-1.5 rounded-lg ${
                            platform.highlight
                              ? value.includes('✓')
                                ? 'text-green-400'
                                : value.includes('✗')
                                ? 'text-red-400'
                                : 'text-purple-300'
                              : value.includes('✓')
                              ? 'text-green-500'
                              : value.includes('✗')
                              ? 'text-red-500'
                              : 'text-gray-300'
                          } ${platform.highlight ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-gray-800/30'}`}
                        >
                          {value}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Mobile CTA */}
              <motion.a
                href="/marketplace"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="block w-full mt-6 px-6 py-3 btn-primary rounded-full font-bold text-white text-center shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-sm min-h-[44px]"
              >
                Explore Marketplace
              </motion.a>
            </motion.div>
          </div>

          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 md:gap-6">
              {platforms.map((platform, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className={`relative ${
                    platform.highlight
                      ? 'bg-neutral-900 border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.15)]'
                      : 'bg-neutral-950/50 border border-white/10'
                  } rounded-2xl md:rounded-3xl p-6 md:p-8 backdrop-blur-sm transition-all duration-500`}
                >
                  {/* Highlight Badge */}
                  {platform.highlight && (
                    <div className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-bold shadow-lg text-center mb-4">
                      ⭐ Best Choice
                    </div>
                  )}

                  {/* Platform Header */}
                  <div className="text-center mb-6">
                    <div className="aspect-square w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 overflow-hidden">
                      {typeof platform.logo === 'string' && platform.logo.startsWith('/') ? (
                        <ResponsiveImage
                          src={platform.logo}
                          alt={platform.name}
                          className="w-full h-full rounded-full object-cover"
                          tabletSize="md:w-24 md:h-24"
                          desktopSize="lg:w-32 lg:h-32"
                        />
                      ) : (
                        <div className="text-3xl md:text-5xl lg:text-6xl">{platform.logo}</div>
                      )}
                    </div>
                    <h3 className={`text-xl md:text-2xl font-black ${platform.highlight ? 'text-purple-300' : 'text-white'}`}>{platform.name}</h3>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    {Object.entries(platform.features).map(([key, value], idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700/30">
                        <span className="text-gray-400 text-sm capitalize">{key.replace('_', ' ')}</span>
                        <span
                          className={`text-sm font-bold ${
                            platform.highlight
                              ? value.includes('✓')
                                ? 'text-green-400'
                                : value.includes('✗')
                                ? 'text-red-400'
                                : 'text-purple-300'
                              : value.includes('✓')
                              ? 'text-green-500'
                              : value.includes('✗')
                              ? 'text-red-500'
                              : 'text-gray-300'
                          }`}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA for Nuxchain */}
                  {platform.highlight && (
                    <motion.a
                      href="/marketplace"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                      className="block mt-6 px-6 py-3 btn-primary rounded-full font-bold text-white text-center shadow-lg hover:shadow-purple-500/50 transition-all duration-300 text-sm md:text-base min-h-[44px]"
                    >
                      Explore Marketplace
                    </motion.a>
                  )}
                </motion.div>
              ))}
            </div>
        </motion.div>

        {/* Advantages Grid - 2x2 mobile */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-xl md:text-2xl font-black text-white text-center mb-6 md:mb-8">
            Why Choose Nuxchain
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {advantages.map((adv, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-4 md:p-6 backdrop-blur-sm text-center hover:border-purple-400/50 transition-all duration-300"
              >
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">{adv.icon}</div>
                <h4 className="text-white font-bold text-sm md:text-base mb-1 md:mb-2">{adv.title}</h4>
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed">{adv.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ComparisonSection
