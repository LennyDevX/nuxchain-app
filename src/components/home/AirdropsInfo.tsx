

import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const AirdropsInfo = () => {
  const isMobile = useIsMobile();

  return (
    <section className={`${isMobile ? 'py-12 px-4' : 'py-20'}`}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'flex flex-col items-center text-center' : 'flex flex-col md:flex-row items-center justify-between'} gap-12`}>
        {/* Image Section - Hidden on mobile */}
        {!isMobile && (
          <div className="md:w-1/2 flex justify-center relative">
            <div className="relative">
              <img src="/NFTsImage.png" alt="NFT Airdrops" className="w-96 h-96 object-contain mx-auto" />
            </div>
          </div>
        )}

        {/* Text Content Section */}
        <div className={`${isMobile ? 'w-full text-center' : 'md:w-1/2 text-center md:text-left'}`}>
          <h2 className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-5xl'} font-bold text-white mb-6 text-center`}>
            Exclusive <span className="text-gradient">NFT Airdrops</span>
          </h2>
          <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-300 mb-8 text-center`}>
            Discover how Nuxchain rewards active users with unique NFT airdrops, unlocking unparalleled opportunities within our ecosystem. These NFTs provide greater opportunities to grow, sell/exchange assets, gain special utilities, and extra bonuses.
          </p>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-4 justify-center`}>
            <button className={`bg-white text-purple-600 ${isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'} rounded-xl font-semibold hover:bg-purple-50 transition-colors duration-300`}>
              Explore Staking Plans
            </button>
            <button className={`border-2 border-white text-white ${isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'} rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-colors duration-300`}>
              Learn More About NFTs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AirdropsInfo;