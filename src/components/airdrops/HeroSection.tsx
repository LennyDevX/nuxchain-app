import { useIsMobile } from '../../hooks/mobile';
import { getMobileOptimizationConfig } from '../../utils/mobile';

function HeroSection() {
  const isMobile = useIsMobile();
  const optimizationConfig = getMobileOptimizationConfig();

  return (
    <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2'} gap-12 mb-16`}>
      {/* Image on the left - Hidden on mobile */}
      {!isMobile && (
        <div className="flex justify-center items-center">
          <div className="relative">
            <img 
              src="/Airdrops-NFts.webp" 
              alt="Exclusive NFT Airdrops" 
              className={`w-full max-w-md rounded-2xl shadow-2xl border border-purple-500/30 hover:border-purple-400/50 ${
                optimizationConfig.reduceAnimations ? '' : 'transition-all duration-300'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      )}
      
      {/* Text and title on the right */}
      <div className="flex flex-col justify-center space-y-6">
        <h1 className="text-4xl lg:text-6xl font-extrabold text-gradient">
          Exclusive NFT Airdrops
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed mb-4">
          Join our exclusive airdrops and get the chance to win unique NFTs from promising projects. 
          Experience the future of digital assets with our carefully curated collection of premium NFTs.
        </p>
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/20">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">🚀 Why Choose Our Airdrops?</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            We partner with top-tier NFT projects to bring you the most valuable and exclusive digital collectibles. 
            Our rigorous vetting process ensures you only receive high-quality NFTs with real utility and potential for growth.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-300">Free participation for all registered users</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
            <span className="text-gray-300">High-value NFTs from verified projects</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">Instant delivery to your wallet</span>
          </div>
        </div>
        <div className={`flex flex-col ${isMobile ? 'space-y-3' : 'sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4'}`}>
          <button className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg ${
            optimizationConfig.reduceAnimations ? '' : 'transition-all duration-300 transform hover:scale-105'
          }`}>
            Explore Airdrops
          </button>
          <button className={`border border-purple-500/50 text-purple-300 hover:bg-purple-500/10 font-bold py-3 px-8 rounded-lg ${
            optimizationConfig.reduceAnimations ? '' : 'transition-all duration-300'
          } hover:border-purple-400`}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;