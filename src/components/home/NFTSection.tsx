import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { useNavigate } from 'react-router-dom'

function NFTSection() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  
  return (
    <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-12' : 'py-20'}`}>
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 lg:grid-cols-2 gap-12'} items-center`}>
        {/* Información - Izquierda */}
        <div className={`animate-slide-up ${isMobile ? 'text-center' : ''}`}>
          <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold text-white mb-6 ${isMobile ? 'text-center' : ''}`}>
            Unique <span className="text-gradient">NFTs</span>
          </h2>
          
          <p className={`${isMobile ? 'text-base mb-6' : 'text-xl mb-8'} text-white/80 leading-relaxed ${isMobile ? 'text-center' : ''}`}>
            {isMobile 
              ? 'Discover and trade exclusive NFTs with special utilities and rewards.'
              : 'Discover, collect and trade exclusive NFTs on our platform with cutting-edge technology. Each NFT is a unique digital asset with special utilities and rewards.'
            }
          </p>
          
          <div className={`space-y-${isMobile ? '3' : '4'} ${isMobile ? 'flex flex-col items-center' : ''}`}>
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
          </div>
          
          <div className={`${isMobile ? 'flex justify-center' : ''}`}>
            <button 
              onClick={() => navigate('/nfts')}
              className={`${isMobile ? 'mt-6 px-6 py-2 text-sm' : 'mt-8 px-8 py-3'} btn-primary`}
            >
              Explore NFTs
            </button>
          </div>
        </div>
        
        {/* Imagen NFT - Derecha - Solo en desktop */}
      {/* Imagen NFT - Derecha - Solo en desktop */}
      {!isMobile && (
        <div className="flex justify-center">
          <div className="relative rounded-2xl overflow-hidden shadow-lg animate-fade-in-right">
            <img 
              src="/NeoHumanNFT.webp"
              alt="Nuxchain NFT" 
              className="w-92 h-92 object-contain mx-auto"
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default NFTSection;