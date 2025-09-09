import React from 'react';
import { useNavigate } from 'react-router-dom';

const TokenizationSection: React.FC = () => {
  const navigate = useNavigate();

  const handleTokenizeClick = () => {
    navigate('/tokenization');
  };

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-6 animate-fade-in-left">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-gradient">
                Tokenization
              </h2>
              <h3 className="text-2xl lg:text-3xl font-semibold text-white">
                Turn Your Images into NFTs
              </h3>
            </div>
            
            <p className="text-lg text-gray-300 leading-relaxed">
              Transform your digital images into unique and irreplaceable tokens. 
              Our tokenization platform allows you to create NFTs in a simple 
              and secure way, giving real value to your digital art.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Simplified tokenization process</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span className="text-gray-300">Blockchain authenticity certification</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span className="text-gray-300">Integrated marketplace for sales</span>
              </div>
            </div>
            
            <button 
              onClick={handleTokenizeClick}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <span className="relative z-10">Tokenize Image</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
          
          {/* Right side - Image */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>
              <div className="relative">
                <img 
                  src="/GiftBoxNFT.webp" 
                  alt="NFT Tokenization" 
                  className="w-96 h-96 object-contain mx-auto animate-float"
                  style={{ animationDuration: '8s', animationDelay: '1s' }}
                />
                {/* Floating particles */}
                <div className="absolute top-10 left-10 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-20 right-16 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-16 left-20 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-10 right-10 w-3 h-3 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
    </section>
  );
};

export default TokenizationSection;