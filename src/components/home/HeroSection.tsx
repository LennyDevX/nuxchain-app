import { useIsMobile } from '../../hooks/mobile/useIsMobile'



function HeroSection() {
  const isMobile = useIsMobile()
  
  return (
    <div className="text-white relative overflow-hidden">
      {/* Hero Principal */}
      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-16' : 'py-24'}`}>
        <div className="text-center animate-fade-in">
          <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl md:text-7xl'} font-bold mb-6 leading-tight`}>
            {isMobile ? (
              <>
                Your place
                <span className="text-gradient"> TO MINT</span>
              </>
            ) : (
              <>
                Your place
                <span className="text-gradient"> TO MINT</span>
              </>
            )}
          </h1>

          <p className={`${isMobile ? 'text-base mb-8' : 'text-xl md:text-2xl mb-10'} text-blue-100 max-w-4xl mx-auto leading-relaxed`}>
            {isMobile
              ? 'A unified DeFi ecosystem for creators: NFTs, staking, marketplace and airdrops to turn your work into real income.'
              : 'Nuxchain empowers creators and communities. Tokenize your work, monetize with NFTs and marketplace, secure value with staking, and reward followers with airdrops.Freedom, ownership and monetization in one platform.'
            }
          </p>
          
          
        </div>
      </div>
    </div>
  );
}

export default HeroSection