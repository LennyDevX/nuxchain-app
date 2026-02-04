import { motion } from 'framer-motion'
import { ResponsiveImage } from '../ui/ResponsiveImage'

function AirdropSection() {
  const airdropTypes = [
    {
      title: 'Stakers Airdrop',
      emoji: '💰',
      description: 'We distribute additional tokens to all users who maintain active staking.',
      requirements: ['Active stake', 'Minimum 7 days'],
      frequency: 'Monthly'
    },
    {
      title: 'Creators Airdrop',
      emoji: '🎨',
      description: 'Special rewards for artists who mint and sell NFTs on the platform.',
      requirements: ['1+ minted NFT', 'Marketplace activity'],
      frequency: 'Quarterly'
    },
    {
      title: 'Holders Airdrop',
      emoji: '💎',
      description: 'Benefits for loyal users who hold POL tokens long-term.',
      requirements: ['Balance > 100 POL', 'No sell 30+ days'],
      frequency: 'Bimonthly'
    },
    {
      title: 'Community Airdrop',
      emoji: '🌟',
      description: 'Random prizes for active members on social media and Discord.',
      requirements: ['Follow @nuxchain', 'Participate in Discord'],
      frequency: 'Weekly'
    }
  ]

  return (
    <section className="w-full relative py-8 md:py-16 lg:py-24 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left: Image - Focused and fully visible */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 md:order-1 -mx-4 sm:-mx-6 md:mx-0 aspect-square md:aspect-auto flex items-center justify-center"
          >
            <ResponsiveImage
              src="/DragonixPassportCard.jpg"
              alt="Airdrop Passport Card"
              className="w-full h-auto object-contain md:scale-110 lg:scale-125"
            />
          </motion.div>

          {/* Right: Content - Balanced and professional */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
                <span className="text-xl">🎁</span>
                <span className="text-xs font-black uppercase tracking-widest text-red-400">Rewards Program</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4 md:mb-6 tracking-tight">
                <span className="text-gradient">Frequent Free Airdrops</span>
              </h2>

              <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl">
                Join our ecosystem and receive rewards for your activities. We reward loyalty, creativity, and active participation with frequent token distributions.
              </p>
            </div>

            {/* Airdrop Types Grid - 2x2 mobile */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {airdropTypes.slice(0, 4).map((type, index) => (
                <div key={index} className="flex gap-4 p-5 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/30 transition-all group min-h-[48px]">
                  <span className="text-3xl group-hover:scale-110 transition-all duration-500">{type.emoji}</span>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{type.title}</h3>
                    <p className="text-gray-500 text-xs md:text-sm font-black uppercase tracking-wider">{type.frequency}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <motion.a
                href="/airdrop"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-10 py-5 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl shadow-red-500/30 hover:shadow-red-500/50 transition-all"
              >
                Participate Now →
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AirdropSection
