import { motion } from 'framer-motion'
import { ResponsiveImage } from '../ui/ResponsiveImage'

function NFTMintingSection() {
  const steps = [
    { number: '1', title: 'Connect Wallet', description: 'Link your Web3 wallet to the platform' },
    { number: '2', title: 'Create NFT', description: 'Upload your artwork or digital asset' },
    { number: '3', title: 'Set Metadata', description: 'Add name, description, and attributes' },
    { number: '4', title: 'Mint on Polygon', description: 'Deploy your NFT to the blockchain' },
    { number: '5', title: 'List & Earn', description: 'Sell on marketplace and earn royalties' }
  ]

  const advantages = [
    { icon: '⚡', label: 'Minimal Fees', value: '< $0.01' },
    { icon: '🚀', label: 'Ultra Fast', value: '~2 sec' },
    { icon: '👑', label: 'Royalties', value: 'Up to 10%' },
    { icon: '🎨', label: 'All Formats', value: 'Art & Media' }
  ]

  return (
    <section className="w-full relative py-12 lg:py-24 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-18 items-center">
          {/* Left: Content - Balanced and professional */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 mb-6">
                <span className="text-xl">🎨</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Creator Studio</span>
              </div>

              <h2 className="text-4xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-white via-pink-200 to-purple-300 text-transparent bg-clip-text">Mint NFTs in 5 Simple Steps</span>
              </h2>

              <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                Transform your digital assets into unique collectibles. Our streamlined process makes minting accessible to everyone, with minimal fees.
              </p>
            </div>

            {/* Steps Timeline Style */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 items-center group">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-xs font-black text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all">
                    {step.number}
                  </div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">{step.title}</h3>
                </div>
              ))}
            </div>

            {/* Stats/Advantages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {advantages.map((adv, index) => (
                <div key={index} className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-sm font-black text-white mb-1">{adv.value}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold">{adv.label}</div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <motion.a
                href="/mint"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-10 py-5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl shadow-pink-500/30 hover:shadow-pink-500/50 transition-all"
              >
                Launch Creator Studio →
              </motion.a>
            </div>
          </motion.div>

          {/* Right: Image - Focused and fully visible */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 -mx-8 lg:mx-0"
          >
            <ResponsiveImage
              src="/DragonixCardNFTs.png"
              alt="NFT Minting Dragon"
              className="w-full h-auto object-contain scale-150"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default NFTMintingSection
