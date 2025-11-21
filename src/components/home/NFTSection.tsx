import { motion } from 'framer-motion'
import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { Link } from 'react-router-dom'
import { ResponsiveImage } from '../ui/ResponsiveImage'

function NFTSection() {
  const isMobile = useIsMobile()

  return (
    <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 lg:grid-cols-2 gap-12'} items-center`}>
        {/* Información - Izquierda */}
        <motion.div
          className={`animate-slide-up ${isMobile ? 'text-center' : ''}`}
          initial={{ opacity: 0, x: isMobile ? 0 : -30, y: isMobile ? 20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <motion.h2
            className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold text-white mb-6 ${isMobile ? 'text-center' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Unique <span className="text-gradient">NFTs</span>
          </motion.h2>

          <motion.p
            className={`${isMobile ? 'text-base mb-6' : 'text-xl mb-8'} text-white/80 leading-relaxed ${isMobile ? 'text-center' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            {isMobile
              ? 'Discover and trade exclusive NFTs with special utilities and rewards.'
              : 'Discover, collect and trade exclusive NFTs on our platform with cutting-edge technology. Each NFT is a unique digital asset with special utilities and rewards.'
            }
          </motion.p>

          <motion.div
            className={`space-y-${isMobile ? '3' : '4'} ${isMobile ? 'flex flex-col items-center' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className={`text-white/80 ${isMobile ? 'text-sm' : ''}`}>Exclusive collectible designs</span>
            </div>
            <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className={`text-white/80 ${isMobile ? 'text-sm' : ''}`}>Special staking bonuses</span>
            </div>
            <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className={`text-white/80 ${isMobile ? 'text-sm' : ''}`}>Marketplace integration</span>
            </div>
          </motion.div>

          <motion.div
            className={`${isMobile ? 'flex justify-center' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <Link
              to="/nfts"
              className={`${isMobile ? 'mt-6 px-6 py-2 text-sm' : 'mt-8 px-8 py-3'} btn-primary inline-block text-center`}
            >
              Explore NFTs
            </Link>
          </motion.div>
        </motion.div>

        {/* Imagen NFT - Derecha - Solo en desktop */}
        {/* Imagen NFT - Derecha - Solo en desktop */}
        {!isMobile && (
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, x: 30, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <ResponsiveImage
              src="/NeoHumanNFT.webp"
              alt="Nuxchain NFT"
              mobileSize="w-92 h-92"
              tabletSize="md:w-92 md:h-92"
              desktopSize="lg:w-92 lg:h-92"
              className="rounded-2xl shadow-lg"
              objectFit="contain"
              priority
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default NFTSection;