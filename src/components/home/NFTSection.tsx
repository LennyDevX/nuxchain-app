function NFTSection() {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Información - Izquierda */}
        <div className="animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Unique <span className="text-gradient">NFTs</span>
          </h2>
          
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            Discover, collect and trade exclusive NFTs on our platform with cutting-edge technology. 
            Each NFT is a unique digital asset with special utilities and rewards.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white/80">Exclusive collectible designs</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white/80">Special staking bonuses</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white/80">Marketplace integration</span>
            </div>
          </div>
          
          <button className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform duration-200">
            Explore NFTs
          </button>
        </div>
        
        {/* Imagen NFT - Derecha */}
        <div className="relative group">
            <div className="absolute -inset-6 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>
            <div className="relative">
              <img 
                 src="/nft-cryptara.png"
                 alt="Nuxchain NFT" 
                 className="w-96 h-96 object-contain mx-auto animate-float"
                 style={{ animationDuration: '8s', animationDelay: '1s' }}
               />
              {/* Partículas alrededor de la imagen */}
              <div className="absolute top-10 left-10 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
               <div className="absolute top-20 right-16 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
               <div className="absolute bottom-16 left-20 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
               <div className="absolute bottom-10 right-10 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default NFTSection;