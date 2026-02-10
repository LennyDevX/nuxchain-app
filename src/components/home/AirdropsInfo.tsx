import { motion } from 'framer-motion';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { useNavigate } from 'react-router-dom';

const AirdropsInfo = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <section className={`${isMobile ? 'py-12 px-4' : 'py-20'} relative z-10`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'flex flex-col items-center text-center' : 'flex flex-col md:flex-row items-center justify-between'} gap-12`}>
        {/* Text Content Section - Left */}
        <motion.div
          className={`${isMobile ? 'w-full text-center' : 'md:w-1/2 text-center md:text-left'}`}
          initial={{ opacity: 0, x: isMobile ? 0 : -30, y: isMobile ? 20 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <motion.h2
            className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} font-bold text-white mb-6 text-center md:text-left`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Exclusive <span className="text-gradient">NFT Airdrops</span>
          </motion.h2>
          <motion.p
            className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-300 mb-8 text-center md:text-left`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Discover how Nuxchain rewards active users with unique NFT airdrops, unlocking unparalleled opportunities within our ecosystem. These NFTs provide greater opportunities to grow, sell/exchange assets, gain special utilities, and extra bonuses.
          </motion.p>
          <motion.div
            className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 justify-center md:justify-start`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <button
              onClick={() => navigate('/airdrops')}
              className={`bg-white text-purple-600 ${isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'} btn-primary`}
            >
              Explore Airdrops
            </button>
            <button
              onClick={() => navigate('/nfts')}
              className={`border-2 border-white text-white ${isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'} btn-secondary`}
            >
              Learn More About NFTs
            </button>
          </motion.div>
        </motion.div>

        {/* Image Section - Right */}
        {!isMobile && (
          <motion.div
            className="md:w-1/2 flex justify-center relative"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img src="/Airdrops.webp" alt="NFT Airdrops" className="w-92 h-92 object-cover mx-auto" />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AirdropsInfo;