import { useIsMobile } from '../../hooks/mobile';

function HeroSection() {
  const isMobile = useIsMobile();

  return (
    <div className="w-full mb-16">
      {/* Hero Content - Full Width */}
      <div className="text-center space-y-8">
        {/* Main Title */}
        <h1 className="text-5xl lg:text-7xl font-extrabold text-gradient mb-6">
          Exclusive NFT
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">
            Airdrops
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto mb-8">
          Join our exclusive airdrops and get the chance to win unique NFTs from promising projects. 
          Experience the future of digital assets with our carefully curated collection of premium NFTs.
        </p>

        {/* Action Buttons */}
        

        {/* Features - Desktop Grid / Mobile Carousel */}
        {isMobile ? (
          /* Mobile Carousel */
          <div className="w-full px-4">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-4 pb-4">
                {/* Feature 1 */}
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-500/20 flex-shrink-0 w-72">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">🎁</span>
                  </div>
                  <h3 className="text-lg font-semibold text-purple-300 mb-2 text-center">Free Participation</h3>
                  <p className="text-gray-300 text-sm leading-relaxed text-center">
                    Join all airdrops completely free. No hidden fees or requirements beyond wallet connection.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-gradient-to-r from-pink-900/20 to-blue-900/20 rounded-xl p-4 border border-pink-500/20 flex-shrink-0 w-72">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">💎</span>
                  </div>
                  <h3 className="text-lg font-semibold text-pink-300 mb-2 text-center">Premium NFTs</h3>
                  <p className="text-gray-300 text-sm leading-relaxed text-center">
                    High-value NFTs from verified projects with real utility and growth potential.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-blue-500/20 flex-shrink-0 w-72">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">⚡</span>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-2 text-center">Instant Delivery</h3>
                  <p className="text-gray-300 text-sm leading-relaxed text-center">
                    NFTs are delivered directly to your wallet immediately after the airdrop ends.
                  </p>
                </div>
              </div>
            </div>
            {/* Carousel Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
            </div>
          </div>
        ) : (
          /* Desktop Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-500/20">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-semibold text-purple-300 mb-3">Free Participation</h3>
              <p className="text-gray-300 leading-relaxed">
                Join all airdrops completely free. No hidden fees or requirements beyond wallet connection.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-r from-pink-900/20 to-blue-900/20 rounded-xl p-6 border border-pink-500/20">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-xl font-semibold text-pink-300 mb-3">Premium NFTs</h3>
              <p className="text-gray-300 leading-relaxed">
                High-value NFTs from verified projects with real utility and growth potential.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-300 mb-3">Instant Delivery</h3>
              <p className="text-gray-300 leading-relaxed">
                NFTs are delivered directly to your wallet immediately after the airdrop ends.
              </p>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
}

export default HeroSection;