import { useIsMobile } from '../../hooks/mobile/useIsMobile'



function HeroSection() {
  const isMobile = useIsMobile()
  
  return (
    <div className="text-white relative overflow-hidden">
      {/* Hero Principal */}
      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-16' : 'py-24'}`}>
        <div className="text-center animate-fade-in">
          <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl md:text-7xl'} font-bold mb-6 leading-tight`}>
            Welcome to{' '}
            <span className="text-gradient">
              Nuxchain
            </span>
          </h1>
          
          <p className={`${isMobile ? 'text-base mb-8' : 'text-xl md:text-2xl mb-10'} text-blue-100 max-w-4xl mx-auto leading-relaxed`}>
            {isMobile 
              ? 'The definitive Web3 platform for staking, NFTs, marketplace and airdrops.'
              : 'The definitive Web3 platform for staking, NFTs, marketplace, airdrops and decentralized chat. Join the decentralized financial revolution.'
            }
          </p>
          
          
        </div>
      </div>
    </div>
  );
}

export default HeroSection