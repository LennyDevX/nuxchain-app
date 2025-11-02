import { useIsMobile } from '../../hooks/mobile/useIsMobile'

function BenefitsSection() {
  const isMobile = useIsMobile()
  
  return (
    <div className={`${isMobile ? 'py-12' : 'py-24'} relative z-10`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center ${isMobile ? 'mb-8' : 'mb-20'} animate-fade-in`}>
          <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold text-white mb-6`}>
            Nuxchain{' '}
            <span className="text-gradient">Ecosystem</span>
          </h2>
          <p className={`${isMobile ? 'text-base' : 'text-xl'} text-white/80 max-w-4xl mx-auto leading-relaxed`}>
            {isMobile 
              ? 'Innovative Web3 ecosystem components designed to revolutionize DeFi'
              : 'Discover the innovative components that make up our comprehensive Web3 ecosystem, designed to revolutionize the DeFi experience'
            }
          </p>
        </div>
        
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
          <div className="card-interactive text-center group relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-red-500 to-purple-600 opacity-60 group-hover:h-2 group-hover:opacity-80 transition-all duration-300"></div>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white mb-6`}>
              {isMobile ? 'Protocols' : 'Nuxchain Protocols'}
            </h3>
            <p className={`text-white/80 leading-relaxed mb-4 ${isMobile ? 'text-sm' : ''}`}>
              {isMobile 
                ? 'Smart contracts and protocols for staking, tokenization, and marketplaces'
                : 'Comprehensive library of smart contracts and on-chain/off-chain protocols that facilitate interaction with microservices such as smart staking, tokenization, and marketplaces'
              }
            </p>
          </div>
          
          <div className="card-interactive text-center hover:-translate-y-3 group relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-red-500 to-purple-600 opacity-60 group-hover:h-2 group-hover:opacity-80 transition-all duration-300"></div>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white mb-6`}>
              NFTs 2.0
            </h3>
            <p className={`text-white/80 leading-relaxed mb-4 ${isMobile ? 'text-sm' : ''}`}>
              {isMobile 
                ? 'Exclusive NFT ecosystem avoiding FOMO with real utilities'
                : 'Exclusive ecosystem for NFTs that avoids FOMO and liquidity exit losses, increasing perceived value and offering digital assets with real utilities'
              }
            </p>
          </div>
          
          <div className="card-interactive text-center hover:-translate-y-3 group relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-red-500 to-purple-600 opacity-60 group-hover:h-2 group-hover:opacity-80 transition-all duration-300"></div>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white mb-6`}>
              {isMobile ? 'Blockchain' : 'Nux-chain'}
            </h3>
            <p className={`text-white/80 leading-relaxed mb-4 ${isMobile ? 'text-sm' : ''}`}>
              {isMobile 
                ? 'Built on Polygon and Ethereum for maximum compatibility'
                : 'We use Polygon and Ethereum as primary bases, avoiding fragmentation, while developing innovations around these established blockchains'
              }
            </p>
          </div>
          
          <div className="card-interactive text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 group relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-red-500 to-purple-600 opacity-60 group-hover:h-2 group-hover:opacity-80 transition-all duration-300"></div>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white mb-6`}>
              Nux-AI
            </h3>
            <p className={`text-white/80 leading-relaxed mb-4 ${isMobile ? 'text-sm' : ''}`}>
              {isMobile 
                ? 'AI-powered tools and services for optimal user experience'
                : 'AI hub, a fundamental part of the Nuxchain core, where we develop AI-based tools and services to optimize the user experience'
              }
            </p>
          </div>
          
          <div className="card-interactive text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 group relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-red-500 to-purple-600 opacity-60 group-hover:h-2 group-hover:opacity-80 transition-all duration-300"></div>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white mb-6`}>
              {isMobile ? 'Labs' : 'Nuxchain Labs'}
            </h3>
            <p className={`text-white/80 leading-relaxed mb-4 ${isMobile ? 'text-sm' : ''}`}>
              {isMobile 
                ? 'R&D lab for innovative Web3 development and collaboration'
                : 'R&D lab to attract talent, collaborate with exceptional teams, and develop innovative and experimental ideas in the Web3 ecosystem'
              }
            </p>
          </div>
          
          <div className="card-interactive text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 group relative overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-red-500 to-purple-600 opacity-60 group-hover:h-2 group-hover:opacity-80 transition-all duration-300"></div>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white mb-6`}>
              {isMobile ? 'Vault' : 'Nux-Vault'}
            </h3>
            <p className={`text-white/80 leading-relaxed mb-4 ${isMobile ? 'text-sm' : ''}`}>
              {isMobile 
                ? 'Advanced security and treasury management system'
                : 'Advanced security system focused on tracking, investment strategies, and diversification, functioning as a treasury to manage platform resources'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BenefitsSection