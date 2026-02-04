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
    <section className="w-full py-20 px-4 relative">
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="-mx-8 lg:mx-0"
          >
            <ResponsiveImage
              src="/DragonixPol.jpg"
              alt="Staking POL Dragon"
              className="w-full h-auto object-contain scale-210"
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

            <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
              <span className="text-white">Staking with </span>
              <span className="text-gradient">
                Real Rewards
              </span>
            </h2>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Generate passive income while strengthening the Nuxchain network. Our staking system offers 
              competitive rewards and exclusive benefits for committed holders.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {stakingFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300"
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
