import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';

const TokenizationSection: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleTokenizeClick = () => {
    navigate('/tokenization');
  };

  return (
    <section className={`relative ${isMobile ? 'py-12' : 'py-20'} px-4 overflow-hidden`}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'lg:grid-cols-2 gap-12'} items-center`}>
          {/* Left side - Content */}
          <div className={`space-y-6 animate-fade-in-left ${isMobile ? 'text-center' : ''}`}>
            <div className="space-y-4">
              <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl lg:text-5xl'} font-bold text-gradient ${isMobile ? 'text-center' : ''}`}>
                Tokenization
              </h2>
              <h3 className={`${isMobile ? 'text-lg' : 'text-2xl lg:text-3xl'} font-semibold text-white ${isMobile ? 'text-center' : ''}`}>
                Turn Your Images into NFTs
              </h3>
            </div>
            
            <p className={`${isMobile ? 'text-base mb-4' : 'text-lg mb-6'} text-gray-300 leading-relaxed ${isMobile ? 'text-center' : ''}`}>
              {isMobile 
                ? 'Transform your digital images into unique NFTs with our simple and secure platform.'
                : 'Transform your digital images into unique and irreplaceable tokens. Our tokenization platform allows you to create NFTs in a simple and secure way, giving real value to your digital art.'
              }
            </p>
            
            <div className={`space-y-${isMobile ? '3' : '4'} ${isMobile ? 'flex flex-col items-center' : ''}`}>
              <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className={`text-gray-300 ${isMobile ? 'text-sm' : ''}`}>Simplified tokenization process</span>
              </div>
              <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span className={`text-gray-300 ${isMobile ? 'text-sm' : ''}`}>Blockchain authenticity certification</span>
              </div>
              <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span className={`text-gray-300 ${isMobile ? 'text-sm' : ''}`}>Integrated marketplace for sales</span>
              </div>
            </div>
            
            <div className={`${isMobile ? 'flex justify-center' : ''}`}>
              <button 
                onClick={handleTokenizeClick}
                className={`group relative ${isMobile ? 'px-6 py-3 text-sm' : 'px-8 py-4'} btn-primary`}
              >
                <span className="relative z-10">Tokenize Image</span>
              </button>
            </div>
          </div>
          
          {/* Right side - Image - Solo en desktop */}
          {!isMobile && (
            <div className="flex justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-lg animate-fade-in-right">
                <img 
                  src="/tokenization.webp" 
                  alt="NFT Tokenization" 
                  className="w-92 h-92 object-contain mx-auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      

    </section>
  );
};

export default TokenizationSection;