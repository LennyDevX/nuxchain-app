import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/mobile/useIsMobile';
import { ResponsiveImage } from '../ui/ResponsiveImage';

const TokenizationSection: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleTokenizeClick = () => {
    navigate('/tokenization');
  };

  return (
    <section className={`relative z-10 ${isMobile ? 'py-12' : 'py-20'} px-4 overflow-hidden`}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'lg:grid-cols-2 gap-12'} items-center`}>
          {/* Left side - Content */}
          <motion.div
            className={`space-y-6 animate-fade-in-left ${isMobile ? 'text-center' : ''}`}
            initial={{ opacity: 0, x: isMobile ? 0 : -30, y: isMobile ? 20 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className={`${isMobile ? 'text-2xl' : 'text-4xl lg:text-5xl'} font-bold text-gradient ${isMobile ? 'text-center' : ''}`}>
                Tokenization
              </h2>
              <h3 className={`${isMobile ? 'text-lg' : 'text-2xl lg:text-3xl'} font-semibold text-white ${isMobile ? 'text-center' : ''}`}>
                Turn Your Images into NFTs
              </h3>
            </motion.div>

            <motion.p
              className={`${isMobile ? 'text-base mb-4' : 'text-lg mb-6'} text-gray-300 leading-relaxed ${isMobile ? 'text-center' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              {isMobile
                ? 'Transform your digital images into unique NFTs with our simple and secure platform.'
                : 'Transform your digital images into unique and irreplaceable tokens. Our tokenization platform allows you to create NFTs in a simple and secure way, giving real value to your digital art.'
              }
            </motion.p>

            <motion.div
              className={`space-y-${isMobile ? '3' : '4'} ${isMobile ? 'flex flex-col items-center' : ''}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className={`text-gray-300 ${isMobile ? 'text-sm' : ''}`}>Simplified tokenization process</span>
              </div>
              <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className={`text-gray-300 ${isMobile ? 'text-sm' : ''}`}>Blockchain authenticity certification</span>
              </div>
              <div className={`flex items-center space-x-3 ${isMobile ? 'justify-center' : ''}`}>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span className={`text-gray-300 ${isMobile ? 'text-sm' : ''}`}>Integrated marketplace for sales</span>
              </div>
            </motion.div>

            <motion.div
              className={`${isMobile ? 'flex justify-center' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <button
                onClick={handleTokenizeClick}
                className={`group relative ${isMobile ? 'px-6 py-3 text-sm' : 'px-8 py-4'} btn-primary`}
              >
                <span className="relative z-10">Tokenize Image</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right side - Image - Solo en desktop */}
          {!isMobile && (
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <ResponsiveImage
                src="/tokenization.webp"
                alt="NFT Tokenization"
                mobileSize="w-92 h-92"
                tabletSize="md:w-92 md:h-92"
                desktopSize="lg:w-92 lg:h-92"
                className="rounded-2xl shadow-lg"
                objectFit="contain"
                priority
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TokenizationSection;