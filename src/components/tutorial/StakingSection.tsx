import { motion } from 'framer-motion'
import { ResponsiveImage } from '../ui/ResponsiveImage'

function StakingSection() {
  const stakingFeatures = [
    {
      emoji: '🔒',
      title: 'Lock & Earn',
      description: 'Lock your POL tokens and start earning passive rewards instantly.'
    },
    {
      emoji: '📈',
      title: 'Competitive APY',
      description: 'Get yields over 15% APY with flexible periods.'
    },
    {
      emoji: '🎁',
      title: 'Additional Rewards',
      description: 'Access exclusive airdrops and moderator benefits when staking.'
    },
    {
      emoji: '⚡',
      title: 'Flexible Withdrawal',
      description: 'Unlock your tokens anytime with fast withdrawal periods.'
    }
  ]

  return (
    <section className="w-full py-8 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 relative">
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="-mx-4 sm:-mx-6 md:mx-0 aspect-square md:aspect-auto flex items-center justify-center"
          >
            <ResponsiveImage
              src="/assets/unused/DragonixPol.jpg"
              alt="Staking POL Dragon"
              className="w-full h-auto object-contain md:scale-110 lg:scale-125"
            />
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className=""
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 mb-6">
              <span className="text-2xl">🔐</span>
              <span className="text-sm font-semibold text-purple-200">Staking System</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 leading-tight">
              <span className="text-white">Staking with </span>
              <span className="text-gradient">
                Real Rewards
              </span>
            </h2>

            <p className="text-gray-300 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
              Generate passive income while strengthening the Nuxchain network. Our staking system offers 
              competitive rewards and exclusive benefits for committed holders.
            </p>

            {/* Features Grid - 2x2 desde mobile */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
              {stakingFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 min-h-[48px]"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{feature.emoji}</span>
                    <div>
                      <h3 className="text-white font-bold text-sm mb-1">{feature.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.a
              href="/staking"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="inline-block px-8 py-3 btn-primary rounded-full font-bold text-white shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              Start Staking →
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default StakingSection
