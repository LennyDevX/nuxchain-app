import { motion } from 'framer-motion'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { Link } from 'react-router-dom'

const AVATARS = [
  { src: '/AvatarsNFTs/Avatar2.png', name: 'Avatar #002' },
  { src: '/AvatarsNFTs/Avatar3.png', name: 'Avatar #003' },
  { src: '/AvatarsNFTs/Avatar4.png', name: 'Avatar #004' },
  { src: '/AvatarsNFTs/Avatar5.png', name: 'Avatar #005' },
  { src: '/AvatarsNFTs/Avatar6.png', name: 'Avatar #006' },
  { src: '/AvatarsNFTs/Avatar7.png', name: 'Avatar #007' },
  { src: '/AvatarsNFTs/Avatar8.png', name: 'Avatar #008' },
  { src: '/AvatarsNFTs/Avatar9.png', name: 'Avatar #009' },
  { src: '/AvatarsNFTs/Avatar10.png', name: 'Avatar #010' },
  { src: '/AvatarsNFTs/Avatar11.png', name: 'Avatar #011' },
];

function NFTSection() {
  const isMobile = useIsMobile()
  const repeated = [...AVATARS, ...AVATARS, ...AVATARS]

  return (
    <section className={`relative z-10 border-t border-white/5 ${isMobile ? 'py-10' : 'py-24'} overflow-hidden`}>
      {/* Header */}
      <motion.div
        className={`text-center px-4 ${isMobile ? 'mb-6' : 'mb-10'}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <span className="jersey-20-regular text-purple-400 text-lg md:text-xl uppercase tracking-widest">NFT Collections</span>
        <h2 className={`jersey-15-regular text-white mt-2 mb-4 ${isMobile ? 'text-4xl' : 'text-5xl lg:text-7xl'}`}>
          Unique <span className="text-gradient">NFTs</span>
        </h2>
        <p className={`jersey-20-regular text-white/60 max-w-2xl mx-auto ${isMobile ? 'text-lg' : 'text-xl'}`}>
          Collect exclusive Nux-Pass NFTs — each with real utility, staking bonuses, and marketplace integration.
          Premium NFTs that empower you inside and outside the ecosystem.
        </p>
      </motion.div>

      {/* Infinite Scroll Strip */}
      <div className="relative overflow-hidden mb-10">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        <motion.div
          className="flex gap-5 py-3"
          animate={{ x: [0, -2400] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        >
          {repeated.map((avatar, i) => (
            <div
              key={i}
              className="flex-shrink-0 group cursor-pointer"
            >
              <div className={`relative rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-400/60 transition-all duration-300 bg-white/5 ${isMobile ? 'w-32 h-32' : 'w-44 h-44'}`}
                style={{ boxShadow: '0 0 20px rgba(168,85,247,0.1)' }}
              >
                <img
                  src={avatar.src}
                  alt={avatar.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="jersey-20-regular text-white text-sm text-center">{avatar.name}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Feature pills + CTAs */}
      <motion.div
        className="max-w-4xl mx-auto px-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: 0.15 }}
      >
        <div className={`flex flex-wrap justify-center gap-2 mb-6 ${isMobile ? 'gap-2 mb-4' : 'gap-3 mb-8'}`}>
          {['🎫 Access Passes', '📈 Staking Boosts', '🗳️ Governance', '⚡ On-chain Utility', '🌐 Cross-platform'].map(tag => (
            <span key={tag} className="jersey-20-regular text-lg  px-4 py-2 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">{tag}</span>
          ))}
        </div>
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row justify-center'} gap-4`}>
          <Link to="/nfts" className="btn-primary jersey-20-regular text-2xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center">
            🎨 Explore NFTs
          </Link>
          <Link to="/create-my-nfts" className="jersey-20-regular text-2xl px-8 py-4 rounded-xl inline-flex items-center gap-2 justify-center border border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 transition-all">
            ✨ Create Your NFT
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export default NFTSection;