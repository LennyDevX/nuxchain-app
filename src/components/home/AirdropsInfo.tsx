

const AirdropsInfo = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Image Section */}
        <div className="md:w-1/2 flex justify-center relative">
          <div className="relative group">
            {/* Animated background elements */}
            <div className="absolute -inset-6 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>
            <div className="relative">
              <img src="/Airdrops-NFts.webp" alt="NFT Airdrops" className="w-96 h-96 object-contain mx-auto animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }} />

              {/* Partículas alrededor de la imagen */}
              <div className="absolute top-10 left-10 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-20 right-16 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-16 left-20 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-10 right-10 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>

          </div>
        </div>

        {/* Text Content Section */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Exclusive <span className="text-gradient">NFT Airdrops</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Discover how Nuxchain rewards active users with unique NFT airdrops, unlocking unparalleled opportunities within our ecosystem. These NFTs provide greater opportunities to grow, sell/exchange assets, gain special utilities, and extra bonuses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-colors duration-300">
              Explore Staking Plans
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-colors duration-300">
              Learn More About NFTs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AirdropsInfo;