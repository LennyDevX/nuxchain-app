import { useIsMobile } from '../../hooks/mobile/useIsMobile'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ResponsiveImage } from '../ui/ResponsiveImage'

function HeroSection() {
  const isMobile = useIsMobile()
  
  return (
    <div className="text-white relative overflow-hidden py-12 lg:py-16 flex items-center">
      {/* Global Background - Same as GlobalBackground component */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep space base background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 50%, #000000 100%)'
          }}
        ></div>
        
        {/* Background nebula */}
        <div 
          className="absolute inset-0 opacity-30" 
          style={{ 
            background: 'radial-gradient(circle at 20% 30%, rgba(75, 0, 130, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 0, 139, 0.2) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(25, 25, 112, 0.25) 0%, transparent 50%)',
            backgroundSize: '100% 100%',
            animation: 'nebula-drift 20s ease-in-out infinite alternate'
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {isMobile ? (
          // Mobile Layout - Image on right side, compact
          <div className="flex flex-col gap-4">
            {/* Mobile: Title and Image side by side */}
            <div className="flex gap-4 items-start">
              {/* Left: Content */}
              <motion.div 
                className="flex-1 flex flex-col space-y-3 z-10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                {/* Badge */}
                <motion.div 
                  className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <span className="text-purple-400 font-bold text-sm">✨</span>
                  <span className="text-xs font-semibold text-purple-200">Future of Creators</span>
                </motion.div>

                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <h1 className="text-3xl font-black mb-2 leading-tight">
                    <motion.span 
                      className="inline-block"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.35 }}
                      viewport={{ once: true }}
                    >
                      Your Place
                    </motion.span>
                    <br />
                    <motion.span 
                      className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text animate-pulse"
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.45 }}
                      viewport={{ once: true }}
                    >
                      TO MINT
                    </motion.span>
                  </h1>
                  
                  <motion.p 
                    className="text-sm text-slate-300 leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.55 }}
                    viewport={{ once: true }}
                  >
                    Create, tokenize, and monetize your work with NFTs, staking rewards, and airdrops all in one platform.
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Right: Mobile Image - Compact size */}
              <motion.div 
                className="flex-shrink-0"
                initial={{ opacity: 0, x: 20, rotateZ: -10 }}
                whileInView={{ opacity: 1, x: 0, rotateZ: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="flex-shrink-0"
                  style={{
                    transformStyle: 'preserve-3d',
                    animation: 'rotate3d 6s infinite linear'
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ResponsiveImage
                    src="/NFT-Coin.webp"
                    alt="Nuxchain NFT"
                    mobileSize="w-32 h-32"
                    tabletSize="w-32 h-32"
                    desktopSize="w-32 h-32"
                    className="border border-purple-500/30 shadow-lg rounded-2xl"
                    objectFit="cover"
                    priority
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Mobile: Features List - Below */}
            <motion.div 
              className="flex flex-col gap-1"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 text-xs">
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-[10px]">
                  ⚡
                </div>
                <span className="text-slate-200">Lightning-fast & low fees</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 flex items-center justify-center text-[10px]">
                  🔒
                </div>
                <span className="text-slate-200">Secure & decentralized</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-[10px]">
                  ✨
                </div>
                <span className="text-slate-200">Freedom & ownership</span>
              </div>
            </motion.div>

            {/* Mobile: CTA Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <Link to="/tokenization" className="group px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50">
                Start Creating
                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </Link>
              
            </div>
          </div>
        ) : (
          // Desktop Layout - Original two column
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              className="flex flex-col justify-center space-y-5 lg:space-y-6 z-10"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
            >
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <span className="text-purple-400 font-bold">✨</span>
                <span className="text-sm font-semibold text-purple-200">Welcome to the Future of Creators</span>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h1 className="text-5xl lg:text-7xl font-black mb-4 leading-tight">
                  <span className="inline-block">Your Place</span>
                  <br />
                  <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text animate-pulse">
                    TO MINT
                  </span>
                </h1>
                
                <p className="text-lg lg:text-xl text-slate-300 leading-relaxed max-w-lg">
                  Empower creators and communities with a unified DeFi ecosystem. Tokenize your work, monetize with NFTs, secure value with staking, and reward your followers with airdrops.
                </p>
              </motion.div>

              {/* Features List */}
              <motion.div 
                className="flex flex-col gap-2 pt-1"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 text-sm lg:text-base">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs">
                    ⚡
                  </div>
                  <span className="text-slate-200">Lightning-fast transactions & low fees</span>
                </div>
                <div className="flex items-center gap-3 text-sm lg:text-base">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 flex items-center justify-center text-xs">
                    🔒
                  </div>
                  <span className="text-slate-200">Secure & decentralized ecosystem</span>
                </div>
                <div className="flex items-center gap-3 text-sm lg:text-base">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs">
                    ✨
                  </div>
                  <span className="text-slate-200">Freedom, ownership & monetization</span>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 pt-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Link to="/tokenization" className="group px-6 lg:px-8 py-3 lg:py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105">
                  Start Creating Now
                  <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </Link>
                
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              className="relative hidden lg:flex items-center justify-center perspective"
              initial={{ opacity: 0, x: 30, rotateY: -20 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {/* Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl opacity-60 animate-pulse"></div>
              
              {/* Image Container with 3D Animation */}
              <div className="relative z-10 w-full max-w-md" style={{ perspective: '1000px' }}>
                <div 
                  className="aspect-square border-2 border-purple-500/30 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:border-purple-500/60"
                  style={{
                    transformStyle: 'preserve-3d',
                    animation: 'rotate3d 6s infinite linear'
                  }}
                >
                  <ResponsiveImage
                    src="/NFT-Coin.webp"
                    alt="Nuxchain NFT"
                    mobileSize="w-full h-full"
                    tabletSize="md:w-full md:h-full"
                    desktopSize="lg:w-full lg:h-full"
                    className="rounded-3xl"
                    objectFit="cover"
                    priority
                  />
                </div>
                
                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-slate-800/95 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4 shadow-xl max-w-xs animate-float">
                  <p className="text-xs font-semibold text-purple-300 mb-2">✨ Limited Edition</p>
                  <p className="text-sm font-bold text-white">Exclusive NFT Collections</p>
                  <p className="text-xs text-slate-400 mt-1">Mint your first NFT today</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* 3D Rotation Animation */}
      <style>{`
        @keyframes rotate3d {
          0% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          33% {
            transform: rotateX(10deg) rotateY(20deg) rotateZ(5deg);
          }
          66% {
            transform: rotateX(-10deg) rotateY(-20deg) rotateZ(-5deg);
          }
          100% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
        }

        @keyframes nebula-drift {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}

export default HeroSection