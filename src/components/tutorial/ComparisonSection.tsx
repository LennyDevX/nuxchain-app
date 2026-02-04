import { motion } from 'framer-motion'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'

function ComparisonSection() {
  const isMobile = useIsMobile()

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
    <section className="w-full relative py-12 lg:py-24 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 mb-6">
            <span className="text-xl">⚖️</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Competitive Edge</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6">
            Nuxchain vs <span className="text-gradient">Marketplaces</span>
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover why Nuxchain is the smartest choice for creators and traders who value speed, low fees, and real rewards.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="overflow-x-auto pb-8 -mx-4 px-4 lg:mx-0 lg:px-0"
        >
          <div className="inline-block min-w-[900px] lg:min-w-full lg:w-full">
            <div className="grid grid-cols-3 gap-6">
              {platforms.map((platform, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className={`relative ${
                    platform.highlight
                      ? 'bg-neutral-900 border-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.15)]'
                      : 'bg-neutral-950/50 border border-white/10'
                  } rounded-3xl p-8 backdrop-blur-sm transition-all duration-500`}
                >
                  {/* ... same content ... */}

                  {/* Highlight Badge */}
                  {platform.highlight && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-bold shadow-lg">
                      ⭐ Best Choice
                    </div>
                  )}

                  {/* Platform Header */}
                  <div className="text-center mb-6 mt-2">
                    <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50">
                      {typeof platform.logo === 'string' && platform.logo.startsWith('/') ? (
                        <img
                          src={platform.logo}
                          alt={platform.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="text-5xl">{platform.logo}</div>
                      )}
                    </div>
                    <h3 className={`text-2xl font-black ${platform.highlight ? 'text-purple-300' : 'text-white'}`}>
                      {platform.name}
                    </h3>
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
                      className="block mt-6 px-6 py-2.5 btn-primary rounded-full font-bold text-white text-center shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                    >
                      Explore Marketplace
                    </motion.a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Advantages Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3 className="text-2xl font-black text-white text-center mb-8">
            Why Choose Nuxchain
          </h3>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'} gap-6`}>
            {advantages.map((adv, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm text-center hover:border-purple-400/50 transition-all duration-300"
              >
                <div className="text-4xl mb-3">{adv.icon}</div>
                <h4 className="text-white font-bold text-base mb-2">{adv.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{adv.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ComparisonSection
